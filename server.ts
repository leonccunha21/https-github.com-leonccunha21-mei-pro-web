import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

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
app.use(express.json({ limit: '100mb' }));

app.get('/api/db', (_req, res) => {
  res.json(readDb());
});

app.put('/api/db', (req, res) => {
  const body = (req.body || {}) as LocalDb;
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

app.use(cors);

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
