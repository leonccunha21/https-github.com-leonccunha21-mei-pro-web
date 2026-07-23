import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'local-db.json');
const PORT = Number(process.env.PORT) || 4000;

interface LocalDb {
  products?: any[];
  sales?: any[];
  categories?: any[];
  expenses?: any[];
  orders?: any[];
  storeInfo?: any;
  customers?: any[];
  suppliers?: any[];
  purchases?: any[];
  cashSessions?: any[];
  loans?: any[];
}

function ensureDb(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
}

function readDb(): LocalDb {
  ensureDb();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as LocalDb;
  } catch (e) {
    console.error('Erro ao ler/parsear o banco de dados (data/local-db.json):', e);
    const backup = `${DATA_FILE}.corrupt.${Date.now()}`;
    try {
      fs.copyFileSync(DATA_FILE, backup);
      console.error(`Backup do arquivo corrompido salvo em ${backup}`);
    } catch { /* ignore */ }
    return {};
  }
}

function writeDb(db: LocalDb): void {
  ensureDb();
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmp, DATA_FILE);
}

const app = express();

// ---------------------------------------------------------------------------
// Stripe + Supabase admin (assinaturas)
// ---------------------------------------------------------------------------
const stripeKey = process.env.STRIPE_SECRET_KEY || ''
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
const stripe = stripeKey ? new Stripe(stripeKey) : null

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

async function getSubscriptionByUid(uid: string) {
  if (!supabaseAdmin) return null
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle()
  return data
}

async function upsertSubscription(uid: string, email: string, stripeCustomerId: string, stripeSubscriptionId: string, status: string, planId: string, currentPeriodEnd: string | null) {
  if (!supabaseAdmin) return
  await supabaseAdmin.from('subscriptions').upsert({
    user_id: uid,
    email,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
    status,
    plan_id: planId,
    current_period_end: currentPeriodEnd,
  }, { onConflict: 'user_id' })
}

const processedEvents = new Set<string>();

// Webhook precisa do body raw (sem JSON parser)
// Registrado ANTES do express.json() para capturar o body cru
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !stripeWebhookSecret) {
    return res.status(500).json({ error: 'Stripe não configurado' })
  }
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret)
  } catch (err: any) {
    console.error('Stripe webhook signature error:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  // BUG-FIX: webhook idempotency
  if (processedEvents.has(event.id)) {
    return res.json({ received: true, note: 'Idempotency skip' })
  }
  processedEvents.add(event.id)
  if (processedEvents.size > 2000) processedEvents.clear()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const uid = session.metadata?.uid
        const email = session.customer_email || session.metadata?.email || ''
        const subId = session.subscription as string
        const customerId = session.customer as string
        if (uid && subId) {
          const rawSub: any = await stripe.subscriptions.retrieve(subId)
          await upsertSubscription(
            uid, email, customerId, subId, rawSub.status,
            rawSub.items?.data?.[0]?.price?.id || 'monthly',
            rawSub.current_period_end ? new Date(rawSub.current_period_end * 1000).toISOString() : null
          )
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const rawSub: any = event.data.object
        const customerId = rawSub.customer as string
        if (!supabaseAdmin) break
        const { data: existing } = await supabaseAdmin
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()
        if (existing?.user_id) {
          await supabaseAdmin.from('subscriptions').update({
            status: rawSub.status,
            stripe_subscription_id: rawSub.id,
            plan_id: rawSub.items?.data?.[0]?.price?.id || 'monthly',
            current_period_end: rawSub.current_period_end ? new Date(rawSub.current_period_end * 1000).toISOString() : null,
            cancel_at_period_end: rawSub.cancel_at_period_end,
          }).eq('user_id', existing.user_id)
        }
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        if (!supabaseAdmin) break
        await supabaseAdmin.from('subscriptions').update({ status: 'past_due' }).eq('stripe_customer_id', customerId)
        break
      }
    }
    res.json({ received: true })
  } catch (err: any) {
    console.error('Stripe webhook handler error:', err.message)
    res.status(500).json({ error: 'Internal error' })
  }
});

// --- JSON parser para todas as outras rotas (deve vir DEPOIS do webhook) ---
app.use(express.json({ limit: '100mb' }));

// --- CORS global (deve vir antes de todas as rotas da API) ---
app.use(cors);

// --- Auth middleware: valida token Supabase (JWT) ---
async function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Rotas públicas que não precisam de autenticação
  const publicPaths = [
    '/api/health',
    '/api/supabase-status',
    '/api/stripe/webhook',
    '/api/create-checkout',
    '/api/create-portal',
    '/api/subscription',
  ];
  if (publicPaths.some(p => req.path.startsWith(p))) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação ausente' });
  }

  const token = authHeader.substring(7);
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase não configurado' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Erro ao validar token' });
  }
}

app.use('/api', requireAuth);

// Test Supabase connection status
app.get('/api/supabase-status', async (_req, res) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        status: 'supabase-not-configured',
        message: 'SUPABASE_URL e SUPABASE_ANON_KEY nao estao configuradas no .env.local',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productsError && productsError.code === 'PGRST116') {
      return res.json({
        status: 'supabase-ready',
        message: 'Supabase client inicializado. Tabelas podem nao existir ainda.',
        credentials: {
          url: supabaseUrl.substring(0, 50) + '...',
          hasKey: true,
        }
      });
    }

    return res.json({
      status: 'supabase-connected',
      message: 'Conexao com Supabase estabelecida com sucesso',
      products: products || [],
      credentials: {
        url: supabaseUrl.substring(0, 50) + '...',
        hasKey: true,
      }
    });

  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
    return res.status(500).json({
      status: 'supabase-error',
      message: 'Falha ao conectar com Supabase',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
});

app.get('/api/db', (_req, res) => {
  res.json(readDb());
});

let dbLock = Promise.resolve();

app.put('/api/db', async (req, res) => {
  const body = (req.body || {}) as LocalDb;
  
  let release!: () => void;
  const lockPromise = new Promise<void>(resolve => { release = resolve; });
  const previousLock = dbLock;
  dbLock = previousLock.then(() => lockPromise);
  
  await previousLock;

  try {
    const current = readDb();
    const merged: LocalDb = {
    products: body.products ?? current.products ?? [],
    sales: body.sales ?? current.sales ?? [],
    categories: body.categories ?? current.categories ?? [],
    expenses: body.expenses ?? current.expenses ?? [],
    orders: body.orders ?? current.orders ?? [],
    storeInfo: body.storeInfo !== undefined ? body.storeInfo : current.storeInfo ?? null,
    customers: body.customers ?? current.customers ?? [],
    suppliers: body.suppliers ?? current.suppliers ?? [],
    purchases: body.purchases ?? current.purchases ?? [],
    cashSessions: body.cashSessions ?? current.cashSessions ?? [],
    loans: body.loans ?? current.loans ?? [],
  };
    writeDb(merged);
    res.json({ ok: true });
  } finally {
    release();
  }
});

app.post('/api/db/reset', (_req, res) => {
  writeDb({ products: [], sales: [], categories: [], expenses: [], orders: [], storeInfo: null, customers: [], suppliers: [], purchases: [], cashSessions: [], loans: [] });
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Módulo VPS (stub): simula Evolution API, scrapers e RAG em memória,
// para testar a integração end-to-end sem uma VPS real.
// ---------------------------------------------------------------------------
type WInstance = { id: string; name: string; status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING'; qrCode?: string };
type WMessage = { id: string; instanceId: string; from: string; name?: string; preview: string; body?: string; timestamp: number; unread?: number };
type ScrapeJob = { jobId: string; keyword: string; location: string; source?: string; status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'; totalFound: number };
type RagDoc = { id: string; agentId: string; filename: string; chunks: number; createdAt: string };

const wInstances = new Map<string, WInstance>();
const wMessages = new Map<string, WMessage[]>();
const scrapeJobs = new Map<string, ScrapeJob>();
const ragDocs = new Map<string, RagDoc[]>();

// QR Code fake (SVG inline) apenas para demonstração visual.
const DEMO_QR = 'data:image/svg+xml;base64,' + Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#fff"/><rect x="20" y="20" width="60" height="60" fill="#000"/><rect x="120" y="20" width="60" height="60" fill="#000"/><rect x="20" y="120" width="60" height="60" fill="#000"/><rect x="90" y="90" width="20" height="20" fill="#000"/></svg>'
).toString('base64');

function cors(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
}

app.get('/api/health', (_req, res) => res.json({ ok: true, version: 'stub-1.0.0' }));

// --- WhatsApp (Evolution API simulada) ---
app.post('/api/whatsapp/connect', (req, res) => {
  const name = (req.body?.name as string) || 'Instância';
  const id = `wa_${randomUUID()}`;
  wInstances.set(id, { id, name, status: 'CONNECTING' });
  wMessages.set(id, [
    { id: 'm1', instanceId: id, from: '+5511999990001', name: 'Cliente Demo', preview: 'Olá, tudo bem?', body: 'Olá, tudo bem?', timestamp: Date.now(), unread: 2 },
    { id: 'm2', instanceId: id, from: '+5511999990002', name: 'Maria Silva', preview: 'Qual o prazo de entrega?', body: 'Qual o prazo de entrega?', timestamp: Date.now() - 60000, unread: 0 },
  ]);
  // Simula a conexão estabilizar após um instante.
  setTimeout(() => {
    const inst = wInstances.get(id);
    if (inst) { inst.status = 'CONNECTED'; inst.qrCode = undefined; }
  }, 1500);
  res.json({ instanceId: id, qrCode: DEMO_QR });
});

app.post('/api/whatsapp/:id/disconnect', (req, res) => {
  const inst = wInstances.get(req.params.id);
  if (inst) inst.status = 'DISCONNECTED';
  res.json({ ok: true });
});

app.get('/api/whatsapp/instances', (_req, res) => {
  res.json([...wInstances.values()]);
});

app.get('/api/whatsapp/:id/messages', (req, res) => {
  res.json(wMessages.get(req.params.id) || []);
});

app.post('/api/whatsapp/:id/send', (req, res) => {
  const { to, text } = req.body || {};
  const id = req.params.id;
  const list = wMessages.get(id) || [];
  list.unshift({ id: `m_${Date.now()}`, instanceId: id, from: 'você', preview: text, body: text, timestamp: Date.now() });
  wMessages.set(id, list);
  res.json({ ok: true });
});

// --- Rastreio Correios ---
app.get('/api/tracking/:code', async (req, res) => {
  const code = req.params.code.toUpperCase().trim();
  if (!code || code.length < 8) {
    return res.json({ code, status: null, events: [] });
  }
  try {
    const response = await fetch(`https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(code)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Tenta extrair o último evento da página
    const events: { date: string; location: string; status: string }[] = [];
    $('ul.linha_do_tempo li').each((_i, el) => {
      const date = $(el).find('.data').text().trim();
      const location = $(el).find('.local').text().trim();
      const status = $(el).find('.status').text().trim();
      if (status) events.push({ date, location, status });
    });

    // Fallback: procura em outra estrutura comum
    if (events.length === 0) {
      $('.tb-rodape, .tb-corpo, .evento, .card-body').each((_i, el) => {
        const text = $(el).text().trim();
        if (text) {
          const lower = text.toLowerCase();
          if (lower.includes('entregue')) events.push({ date: '', location: '', status: 'Entregue' });
          else if (lower.includes('trânsito') || lower.includes('transito')) events.push({ date: '', location: '', status: 'Em trânsito' });
          else if (lower.includes('saiu')) events.push({ date: '', location: '', status: 'Saiu para entrega' });
        }
      });
    }

    if (events.length === 0) {
      return res.json({ code, status: null, events: [] });
    }

    const last = events[events.length - 1];
    let statusKey = 'em_transito';
    const lower = last.status.toLowerCase();
    if (lower.includes('entregue')) statusKey = 'entregue';
    else if (lower.includes('saiu') && lower.includes('entrega')) statusKey = 'saiu_entrega';
    else if (lower.includes('aguardando') || lower.includes('retirada')) statusKey = 'aguardando_retirada';
    else if (lower.includes('encaminhado')) statusKey = 'encaminhado';
    else if (lower.includes('postado')) statusKey = 'postado';
    else if (lower.includes('trânsito') || lower.includes('transito')) statusKey = 'em_trânsito';

    res.json({ code, status: statusKey, events });
  } catch (e: any) {
    console.error('Erro ao consultar rastreio:', e.message);
    res.json({ code, status: null, events: [] });
  }
});

// --- Scrapers (varredura de leads) ---
const SAMPLE_SOURCES = ['Google Maps', 'Instagram', 'Bing Maps'];
app.post('/api/scrape', (req, res) => {
  const { keyword, location } = req.body || {};
  const jobId = `job_${randomUUID()}`;
  const job: ScrapeJob = { jobId, keyword: keyword || '', location: location || '', status: 'RUNNING', totalFound: 0 };
  scrapeJobs.set(jobId, job);
  // Simula a finalização do job populando leads em alguns segundos.
  setTimeout(() => {
    const j = scrapeJobs.get(jobId);
    if (j) { j.status = 'COMPLETED'; j.totalFound = 3 + Math.floor(Math.random() * 5); }
  }, 2500);
  res.json({ jobId, totalFound: 0 });
});

app.get('/api/scrape/:id', (req, res) => {
  const job = scrapeJobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'job não encontrado' });
  res.json({ status: job.status, totalFound: job.totalFound });
});

app.get('/api/scrape/:id/leads', (req, res) => {
  const job = scrapeJobs.get(req.params.id);
  if (!job || job.status !== 'COMPLETED') return res.json([]);
  const leads = Array.from({ length: job.totalFound }).map((_, i) => ({
    id: `lead_${req.params.id}_${i}`,
    name: `${job.keyword} ${SAMPLE_SOURCES[i % SAMPLE_SOURCES.length]} #${i + 1}`,
    phone: `+55119${String(1000000 + i * 137).slice(0, 8)}`,
    source: ['GOOGLE_MAPS', 'INSTAGRAM', 'SPREADSHEET'][i % 3],
    createdAt: new Date().toISOString(),
  }));
  res.json(leads);
});

// --- RAG (base de conhecimento) ---
app.post('/api/rag/documents', (req, res) => {
  const { agentId, filename, data } = req.body || {};
  const doc: RagDoc = {
    id: `doc_${randomUUID()}`,
    agentId: agentId || '',
    filename: filename || 'documento',
    chunks: data ? Math.max(1, Math.floor((data.length || 1000) / 500)) : 1,
    createdAt: new Date().toISOString(),
  };
  const list = ragDocs.get(doc.agentId) || [];
  list.push(doc);
  ragDocs.set(doc.agentId, list);
  res.json(doc);
});

app.get('/api/rag/documents', (req, res) => {
  const agentId = (req.query.agentId as string) || '';
  res.json(ragDocs.get(agentId) || []);
});

app.post('/api/rag/ask', (req, res) => {
  const { question } = req.body || {};
  res.json({ answer: `[RAG stub] Não há backend real conectado. Pergunta recebida: "${question}". Implemente o pipeline PostgreSQL + pgvector na VPS para respostas baseadas em documentos.` });
});

// ---------------------------------------------------------------------------
// Stripe API (checkout, portal, subscription status)
// ---------------------------------------------------------------------------

app.post('/api/create-checkout', async (req, res) => {
  if (!stripe) return res.status(500).json({ error: 'Stripe não configurado' })
  const { uid, email, priceId } = req.body || {}
  if (!uid || !email || !priceId) return res.status(400).json({ error: 'uid, email e priceId são obrigatórios' })

  try {
    // Busca ou cria cliente Stripe
    let customerId: string
    const existing = await getSubscriptionByUid(uid)
    if (existing?.stripe_customer_id) {
      customerId = existing.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({ email, metadata: { uid } })
      customerId = customer.id
    }

    const coupon = (req.body?.coupon as string)?.trim() || ''

    const sessionParams: any = {
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { uid, email },
      subscription_data: {
        metadata: { uid },
      },
      success_url: `${req.headers.origin || process.env.APP_URL || 'http://localhost:5173'}/?checkout=success`,
      cancel_url: `${req.headers.origin || process.env.APP_URL || 'http://localhost:5173'}/?checkout=canceled`,
    }
    if (coupon) {
      sessionParams.discounts = [{ coupon }]
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    res.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/create-portal', async (req, res) => {
  if (!stripe) return res.status(500).json({ error: 'Stripe não configurado' })
  const { uid } = req.body || {}
  if (!uid) return res.status(400).json({ error: 'uid é obrigatório' })

  try {
    const existing = await getSubscriptionByUid(uid)
    const customerId = existing?.stripe_customer_id
    if (!customerId) return res.status(404).json({ error: 'Cliente não encontrado' })

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.origin || process.env.APP_URL || 'http://localhost:5173'}/`,
    })

    res.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe portal error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/subscription', async (req, res) => {
  const uid = req.query.uid as string
  if (!uid) return res.status(400).json({ error: 'uid é obrigatório' })

  try {
    const existing = await getSubscriptionByUid(uid)
    if (!existing) return res.json(null)
    // BUG-FIX: mapSubRow converte snake_case → camelCase conforme interface Subscription
    res.json(mapSubRow(existing))
  } catch (err: any) {
    console.error('Subscription fetch error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

function mapSubRow(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    stripeSubscriptionId: row.stripe_subscription_id ?? undefined,
    status: row.status,
    planId: row.plan_id,
    trialEnd: row.trial_end ?? undefined,
    currentPeriodEnd: row.current_period_end ?? undefined,
    cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
  }
}

app.post('/api/subscription', async (req, res) => {
  const { uid, email } = req.body || {}
  if (!uid || !email) return res.status(400).json({ error: 'uid e email são obrigatórios' })
  if (!supabaseAdmin) return res.status(500).json({ error: 'Supabase não configurado' })

  try {
    const existing = await getSubscriptionByUid(uid)
    // BUG-FIX: se já existe, retorna mapeado (camelCase) igual ao GET /api/subscription
    if (existing) return res.json(mapSubRow(existing))

    const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: uid, email,
        status: 'trialing',
        plan_id: 'trial',
        trial_end: trialEnd,
        current_period_end: trialEnd,
      })
      .select()
      .maybeSingle()

    if (error) throw error
    // BUG-FIX: retorna mapeado (camelCase)
    res.json(data ? mapSubRow(data) : null)
  } catch (err: any) {
    console.error('Start trial error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

const distDir = path.resolve(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Servidor local (banco de dados em ${DATA_FILE}) rodando em http://localhost:${PORT}`);
});