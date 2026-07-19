import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Product, 
  Sale, 
  SaleItem,
  Category,
  Expense,
  ActiveTab, 
  PaymentMethod,
  StoreInfo,
  ServiceOrder,
  Customer,
  Supplier,
  Purchase,
  CashSession,
  Loan,
  Lead,
  LeadExtractionJob,
  WhatsAppInstance,
  AIAgent,
  Opportunity
} from './types';
// Nenhum seed automático: contas novas começam com 0 dados. A entrada de dados
// ocorre apenas via importação manual de planilha Excel (ver tela de Configurações).
// "uso particular": cada login (Google) acessa apenas os dados deste dispositivo;
// dados de vendas NÃO são enviados à nuvem (apenas as informações da loja).

import { lazy } from 'react';
const Dashboard = lazy(() => import('./components/Dashboard'));
const Products = lazy(() => import('./components/Products'));
const Sales = lazy(() => import('./components/Sales'));
const SalesHistory = lazy(() => import('./components/SalesHistory'));
const Reports = lazy(() => import('./components/Reports'));
const Settings = lazy(() => import('./components/Settings'));
const LoginScreen = lazy(() => import('./components/Login'));
const OsOrcamento = lazy(() => import('./components/OsOrcamento'));
const Debtors = lazy(() => import('./components/Debtors'));
const CashFlow = lazy(() => import('./components/CashFlow'));
const Customers = lazy(() => import('./components/Customers'));
const CashClosing = lazy(() => import('./components/CashClosing'));
const LeadsPage = lazy(() => import('./components/Leads'));
const WhatsAppPage = lazy(() => import('./components/WhatsApp'));
const AIModulePage = lazy(() => import('./components/AIModule'));
const FunnelPage = lazy(() => import('./components/Funnel'));
const SystemChooser = lazy(() => import('./components/SystemChooser'));
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  BarChart3, 
  Settings as SettingsIcon,
  ClipboardList,
  Clock,
  HardDrive,
  Loader2,
  Sun,
  Moon,
  PackageSearch,
  Users,
  DollarSign,
  Wallet,
  Cloud,
  CloudOff,
  AlertTriangle,
  Target,
  MessageSquare,
  Brain,
  KanbanSquare,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import appVersion from '../package.json';

import { categorizeProduct } from './lib/categorize';
import { normalizeName, normalizeChannel } from './lib/normalize';
import { roundCurrency } from './lib/currency';
import { localNowISO } from './lib/datetime';
import { loadDb, saveDb, type LocalDb } from './lib/localDb';
import { getDailyWrites, DAILY_WRITE_LIMIT } from './lib/quota';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `há ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d}d`;
}
// Firebase e dbSync são importados dinamicamente (sob demanda) para não
// penalizar o carregamento inicial do app.
import type { User } from 'firebase/auth';

// Sincronização com a nuvem está ATIVADA (Firebase/Firestore).
// Dados são enviados de forma incremental a cada alteração (debounce 2s)
// e baixados automaticamente a cada 30s quando o usuário estiver logado.
const SYNC_ENABLED = true;

// Utility to fix floating point issues (e.g., 0.92999 → 0.93)

export default function App() {
  // State Initialization
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Local mode states
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [showVendasEstoque, setShowVendasEstoque] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  // Novos módulos (CRM, Compras, Fechamento de Caixa)
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [cashSessions, setCashSessions] = useState<CashSession[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  // Extensão Módulos Avançados
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadJobs, setLeadJobs] = useState<LeadExtractionJob[]>([]);
  const [whatsappInstances, setWhatsappInstances] = useState<WhatsAppInstance[]>([]);
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  // Estado de resolução da autenticação (Firebase). Só revela a tela principal
  // após saber se há usuário logado. Usuário não logado => 0 dados.
  const [authReady, setAuthReady] = useState(false);

  // Tela de escolha dos sistemas (Loja vs Mounjaro PRO) ao entrar no site.
  const [showChooser, setShowChooser] = useState(() => {
    try { return !localStorage.getItem('mei_pro_system_choice'); } catch { return true; }
  });

  // Toast de erro de persistência (M6)
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 4000);
  };

  // --- Sincronização na nuvem (Firebase/Firestore) ---
  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudLastSync, setCloudLastSync] = useState<string | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [cloudPending, setCloudPending] = useState(false);
  const [dailyWrites, setDailyWrites] = useState(0);
  const [clearingCloud, setClearingCloud] = useState(false);

  const [storeInfo, setStoreInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem('zm_store_info') || '{}') as { logoUrl?: string; name?: string }; } catch { return {} as { logoUrl?: string; name?: string }; }
  });
  useEffect(() => {
    const handler = () => {
      try { setStoreInfo(JSON.parse(localStorage.getItem('zm_store_info') || '{}')); } catch {}
    };
    window.addEventListener('storeInfoChanged', handler);
    return () => window.removeEventListener('storeInfoChanged', handler);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('darkMode', String(next));
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  // Load all data. The store is IndexedDB-backed (works on the static site);
  // an optional local server is used only when available.
  // Aplica os dados carregados (IndexedDB/servidor/seed) no estado da aplicação.
  // ---------------------------------------------------------------------------
  // MERGE por id entre dados locais e da nuvem.
  // GARANTE FIDELIDADE: o que existe localmente vai para a nuvem exatamente
  // como está, e o que existe só na nuvem (outro aparelho) é preservado.
  // Em conflito de mesmo id, prevalece o registro com timestamp mais recente
  // (updatedAt > createdAt > data do registro). Nunca soma nem "infla" valores.
  // ---------------------------------------------------------------------------
  const tsOf = (x: any): number => {
    const v = x?.updatedAt ?? x?.createdAt ?? x?.date ?? x?.dataVenda ?? x?.loanDate ?? x?.openDate ?? x?.timestamp;
    if (!v) return 0;
    const t = typeof v === 'number' ? v : new Date(v).getTime();
    return isNaN(t) ? 0 : t;
  };

  const mergeById = <T extends { id?: string }>(local: T[] | undefined, cloud: T[] | undefined): T[] => {
    const map = new Map<string, T>();
    for (const it of local || []) if (it?.id) map.set(it.id, it);
    for (const it of cloud || []) {
      if (!it?.id) continue;
      const prev = map.get(it.id);
      // local prevalece se for mais recente (ou empatado); nuvem só se não houver local ou for mais nova
      if (!prev || tsOf(it) > tsOf(prev)) map.set(it.id, it);
    }
    return Array.from(map.values());
  };

  const mergeLocalDb = (local: LocalDb, cloud: Partial<LocalDb>): LocalDb => ({
    products: mergeById(local.products, cloud.products) as LocalDb['products'],
    categories: mergeById(local.categories, cloud.categories) as LocalDb['categories'],
    sales: mergeById(local.sales, cloud.sales) as LocalDb['sales'],
    orders: mergeById(local.orders, cloud.orders) as LocalDb['orders'],
    customers: mergeById(local.customers, cloud.customers) as LocalDb['customers'],
    suppliers: mergeById(local.suppliers, cloud.suppliers) as LocalDb['suppliers'],
    purchases: mergeById(local.purchases, cloud.purchases) as LocalDb['purchases'],
    cashSessions: mergeById(local.cashSessions, cloud.cashSessions) as LocalDb['cashSessions'],
    loans: mergeById(local.loans, cloud.loans) as LocalDb['loans'],
    expenses: mergeById(local.expenses, cloud.expenses) as LocalDb['expenses'],
    leads: mergeById(local.leads, cloud.leads) as LocalDb['leads'],
    leadJobs: mergeById(local.leadJobs, cloud.leadJobs) as LocalDb['leadJobs'],
    whatsappInstances: mergeById(local.whatsappInstances, cloud.whatsappInstances) as LocalDb['whatsappInstances'],
    aiAgents: mergeById(local.aiAgents, cloud.aiAgents) as LocalDb['aiAgents'],
    opportunities: mergeById(local.opportunities, cloud.opportunities) as LocalDb['opportunities'],
    storeInfo: cloud.storeInfo ?? local.storeInfo,
    initialized: true,
  });

  const applyLoadedDb = async (db: Partial<LocalDb> | null): Promise<{
    hasDb: boolean;
    seededProducts: Product[];
    s: Sale[];
    c: Category[];
    e: Expense[];
    seededCustomers: Customer[];
  }> => {
    const hasDb = !!db && db.initialized === true;
    const dbData = (db ?? {}) as Partial<LocalDb>;
    let p: Product[], s: Sale[], e: Expense[], c: Category[];
    if (hasDb && Array.isArray(dbData.products) && Array.isArray(dbData.sales) && Array.isArray(dbData.expenses) && Array.isArray(dbData.categories)) {
      p = dbData.products!;
      s = dbData.sales!;
      e = dbData.expenses!;
      c = dbData.categories!;
    } else {
      // Sem dados locais e sem seed: conta nova começa vazia (0 dados).
      p = []; s = []; e = []; c = [];
    }
    const seededProducts = runStockCleanup(p);
    setProducts(seededProducts);
    setSales(s);
    setExpenses(e);
    setCategories(c);
    setOrders(hasDb && Array.isArray(dbData.orders) ? dbData.orders! : []);
    const loadedCustomers = hasDb && Array.isArray(dbData.customers) ? dbData.customers! : [];
    setCustomers(loadedCustomers);
    setSuppliers(hasDb && Array.isArray(dbData.suppliers) ? dbData.suppliers! : []);
    setPurchases(hasDb && Array.isArray(dbData.purchases) ? dbData.purchases! : []);
    setCashSessions(hasDb && Array.isArray(dbData.cashSessions) ? dbData.cashSessions! : []);
    setLoans(hasDb && Array.isArray(dbData.loans) ? dbData.loans! : []);
    
    setLeads(hasDb && Array.isArray(dbData.leads) ? dbData.leads! : []);
    setLeadJobs(hasDb && Array.isArray(dbData.leadJobs) ? dbData.leadJobs! : []);
    setWhatsappInstances(hasDb && Array.isArray(dbData.whatsappInstances) ? dbData.whatsappInstances! : []);
    setAiAgents(hasDb && Array.isArray(dbData.aiAgents) ? dbData.aiAgents! : []);
    setOpportunities(hasDb && Array.isArray(dbData.opportunities) ? dbData.opportunities! : []);

    if (db && db.storeInfo) setStoreInfo(db.storeInfo);
    const seededCustomers = loadedCustomers.length === 0 ? seedCustomersFromSales(s) : loadedCustomers;
    if (seededCustomers !== loadedCustomers) setCustomers(seededCustomers);
    return { hasDb, seededProducts, s, c, e, seededCustomers };
  };

  useEffect(() => {
    if (!authReady) return;
    if (!cloudUser) { setLoading(false); return; }
    (async () => {
      try {
        const db = await loadDb();
        const res = await applyLoadedDb(db);
        // First run: persist the seeded initial data and mark the DB as initialized
        // so a later "reset to empty" is respected (an empty DB is no longer
        // interpreted as "fresh install, reload defaults").
        if (!res.hasDb) {
          persist({
            products: res.seededProducts,
            sales: res.s,
            categories: res.c,
            expenses: res.e,
            orders: [],
            customers: res.seededCustomers,
            suppliers: [],
            purchases: [],
            cashSessions: [],
            loans: [],
            leads: [],
            leadJobs: [],
            whatsappInstances: [],
            aiAgents: [],
            opportunities: [],
            storeInfo: (db && db.storeInfo) || null,
            initialized: true,
          });
        }
      } catch {
        setProducts([]);
        setSales([]);
        setExpenses([]);
        setCategories([]);
        persist({
          products: [],
          sales: [],
          categories: [],
          expenses: [],
          orders: [],
          customers: [],
          suppliers: [],
          purchases: [],
          cashSessions: [],
          loans: [],
          leads: [],
          leadJobs: [],
          whatsappInstances: [],
          aiAgents: [],
          storeInfo: null,
          initialized: true,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [authReady, cloudUser]);

  // Observa o estado de autenticação do Firebase (nuvem)
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    import('./lib/firebase').then(({ initAuth }) => {
      if (cancelled) return;
      setAuthReady(true);
      unsub = initAuth(
        (user) => setCloudUser(user),
        () => setCloudUser(null)
      );
    }).catch(() => setAuthReady(true));
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, []);





  // Sync state helpers
  // Persist the full local DB to the backend file (debounced merge of partial updates)
  const stateRef = React.useRef<{
    products: Product[];
    sales: Sale[];
    categories: Category[];
    expenses: Expense[];
    orders: ServiceOrder[];
    storeInfo: StoreInfo | null;
    customers: Customer[];
    suppliers: Supplier[];
    purchases: Purchase[];
    cashSessions: CashSession[];
    loans: Loan[];
    whatsappInstances: WhatsAppInstance[];
    aiAgents: AIAgent[];
    opportunities: Opportunity[];
    initialized?: boolean;
  }>({ products: [], sales: [], categories: [], expenses: [], orders: [], storeInfo: null, customers: [], suppliers: [], purchases: [], cashSessions: [], loans: [], whatsappInstances: [], aiAgents: [], opportunities: [] });
  stateRef.current = { products, sales, categories, expenses, orders, storeInfo, customers, suppliers, purchases, cashSessions, loans, whatsappInstances, aiAgents, opportunities };

  const pendingRef = React.useRef<Partial<LocalDb>>({});
  const saveTimer = React.useRef<number | null>(null);

  // Auto-sync para a nuvem (incremental, com debounce)
  const cloudPushTimer = React.useRef<number | null>(null);
  const cloudDirty = React.useRef(false);
  const cloudPushing = React.useRef(false);
  const lastLocalChangeRef = React.useRef(0);

  // -------------------------------------------------------------------------
  // PAUSA DE COTA DO FIREBASE
  //
  // Quando a cota diária estoura, NÃO podemos enviar nem baixar nada da nuvem
  // (escritas E leituras consomem cota). Este bloqueio impede qualquer acesso
  // automático ou manual ao Firestore até a data de liberação (meia-noite de
  // amanhã, por padrão). O usuário só retoma no dia seguinte, manualmente.
  // -------------------------------------------------------------------------
  const QUOTA_PAUSE_KEY = 'zm_quota_paused_until';

  // Calcula a meia-noite (local) do dia seguinte.
  function nextMidnight(): number {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  // Retorna o timestamp até quando a nuvem está pausada. Se nada estiver
  // salvo, assume a meia-noite de amanhã (pausa por segurança até o dia novo).
  function quotaPausedUntil(): number {
    try {
      const raw = localStorage.getItem(QUOTA_PAUSE_KEY);
      if (raw) return Number(raw) || 0;
    } catch { /* ignore */ }
    return nextMidnight();
  }

  function isCloudSyncPaused(): boolean {
    return Date.now() < quotaPausedUntil();
  }

  // Pausa a nuvem até a meia-noite de amanhã (ou até `until` se informado).
  function pauseCloudSync(until?: number): void {
    try {
      localStorage.setItem(QUOTA_PAUSE_KEY, String(until ?? nextMidnight()));
    } catch { /* ignore */ }
  }

  // Libera a nuvem imediatamente (usado pelo botão "Liberar agora").
  function resumeCloudSyncNow(): void {
    try {
      localStorage.removeItem(QUOTA_PAUSE_KEY);
    } catch { /* ignore */ }
  }

  // Pausa por padrão assim que o app sobe, já que a cota costuma estar estourada
  // no fim do dia. O usuário libera manualmente no dia seguinte.
  React.useEffect(() => {
    if (!localStorage.getItem(QUOTA_PAUSE_KEY)) {
      pauseCloudSync();
    }
  }, []);

  // --- Nuvem: envia para o Firestore de forma incremental (economiza cota) ---
  const pushToCloud = (data: LocalDb, opts?: { forceFull?: boolean }) => {
    if (!SYNC_ENABLED || !cloudUser) return Promise.resolve(null);
    if (isCloudSyncPaused()) return Promise.resolve(null); // cota estourada: nada hoje
    setCloudSyncing(true);
    setCloudError(null);
    return import('./lib/dbSync').then(({ saveUserDbIncremental }) =>
      saveUserDbIncremental(cloudUser.uid, data, opts)
    )
      .then((res) => { setCloudLastSync(new Date().toISOString()); return res; })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Falha ao enviar para a nuvem';
        setCloudError(msg);
        throw e;
      })
      .finally(() => {
        setCloudSyncing(false);
        setCloudPending(false);
        setDailyWrites(getDailyWrites().count);
      });
  };

  const persist = (partial: Partial<LocalDb>) => {
    const cur = stateRef.current;
    const prev = pendingRef.current;
    const merged: LocalDb = {
      products: partial.products ?? prev.products ?? cur.products,
      sales: partial.sales ?? prev.sales ?? cur.sales,
      categories: partial.categories ?? prev.categories ?? cur.categories,
      expenses: partial.expenses ?? prev.expenses ?? cur.expenses,
      orders: partial.orders ?? prev.orders ?? cur.orders,
      storeInfo: partial.storeInfo !== undefined ? partial.storeInfo : (prev.storeInfo !== undefined ? prev.storeInfo : cur.storeInfo),
      customers: partial.customers ?? prev.customers ?? cur.customers,
      suppliers: partial.suppliers ?? prev.suppliers ?? cur.suppliers,
      purchases: partial.purchases ?? prev.purchases ?? cur.purchases,
      cashSessions: partial.cashSessions ?? prev.cashSessions ?? cur.cashSessions,
      loans: partial.loans ?? prev.loans ?? cur.loans,
      leads: partial.leads ?? prev.leads ?? cur.leads ?? [],
      leadJobs: partial.leadJobs ?? prev.leadJobs ?? cur.leadJobs ?? [],
      whatsappInstances: partial.whatsappInstances ?? prev.whatsappInstances ?? cur.whatsappInstances ?? [],
      aiAgents: partial.aiAgents ?? prev.aiAgents ?? cur.aiAgents ?? [],
      opportunities: partial.opportunities ?? prev.opportunities ?? cur.opportunities ?? [],
      initialized: true,
    };
    pendingRef.current = merged;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const db = pendingRef.current as LocalDb;
      pendingRef.current = {};
      saveDb(db).catch((e) => {
        console.error('Erro ao salvar banco local:', e);
        showToast('Falha ao salvar os dados. Verifique o armazenamento do navegador.');
      });
    }, 250);
    lastLocalChangeRef.current = Date.now();
  };

  // Flush imediato das alterações pendentes ao ocultar/fechar a aba (M5)
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === 'hidden' && Object.keys(pendingRef.current).length > 0) {
        const db = pendingRef.current as LocalDb;
        pendingRef.current = {};
        if (saveTimer.current) {
          clearTimeout(saveTimer.current);
          saveTimer.current = null;
        }
        saveDb(db).catch((e) => {
          console.error('Erro ao salvar banco local:', e);
          showToast('Falha ao salvar os dados. Verifique o armazenamento do navegador.');
        });
      }
    };
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', flush);
      window.removeEventListener('pagehide', flush);
    };
  }, []);

  // Re-sincroniza o estado quando OUTRA aba atualiza o banco (M3).
  // Só reaplica se não houver gravação pendente local, para não sobrescrever
  // edições em andamento nesta aba.
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel('zmstore-sync');
    ch.onmessage = (ev) => {
      if (ev.data && ev.data.type === 'db-updated' && Object.keys(pendingRef.current).length === 0) {
        loadDb().then(db => { if (db) applyLoadedDb(db); });
      }
    };
    return () => ch.close();
  }, []);

  // Ao entrar na nuvem (login) apenas autentica. NÃO enviamos nem baixamos
  // dados automaticamente no login: o app é por-aparelho (localStorage) e um
  // push automático de um aparelho vazio/divergente apagaria os dados do outro
  // na nuvem (a sincronização incremental remove da nuvem o que não existe
  // localmente). O usuário decide: "Sincronizar Agora" (sobe) ou
  // "Baixar da nuvem" (desce) — ambos explícitos.
  useEffect(() => {
    if (!cloudUser) return;
    setCloudError(null);
    setDailyWrites(getDailyWrites().count);
  }, [cloudUser]);

  const handleCloudSignIn = async () => {
    try {
      const { googleSignIn } = await import('./lib/firebase');
      await googleSignIn();
    } catch (e: unknown) {
      setCloudError(e instanceof Error ? e.message : 'Falha ao entrar com o Google');
    }
  };

  const handleCloudSignOut = async () => {
    try {
      const { logoutUser } = await import('./lib/firebase');
      await logoutUser();
    } catch { /* ignore */ }
    setCloudUser(null);
    setCloudLastSync(null);
    setCloudError(null);
  };

  // Baixa os dados da nuvem para ESTE aparelho, substituindo o conteúdo local.
  // Usado para espelhar no celular o que está no computador. A sincronização
  // incremental em seguida limpa da nuvem o que era exclusivo deste aparelho.
  const handleDownloadFromCloud = async () => {
    if (!SYNC_ENABLED) { showToast('Sincronização desativada (modo local).'); return; }
    if (!cloudUser) return;
    if (!window.confirm('Baixar os dados da nuvem para ESTE aparelho?\n\nIsso substitui os dados locais deste aparelho pelos dados salvos na nuvem (os do computador). Registros que existem apenas aqui serão substituídos.\n\nDica: primeiro clique "Sincronizar Agora" no computador para garantir que a nuvem está com os dados mais recentes.')) return;
    try {
      const { loadUserDb } = await import('./lib/dbSync');
      showToast('Baixando dados da nuvem (mesclando com os locais)...');
      const cloud = await loadUserDb(cloudUser.uid);
      // MERGE por id: preserva dados locais mais recentes e os da nuvem.
      const full = mergeLocalDb(stateRef.current, cloud);
      await applyLoadedDb(full);
      persist(full);
      // Sobe o resultado do merge para a nuvem ficar idêntica ao local.
      pushToCloud(full);
      showToast('Dados sincronizados (nuvem + local mesclados).');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Falha ao baixar da nuvem.');
    }
  };

  // Baixa a nuvem e ESPELHA no aparelho local (a nuvem é a fonte única da
  // verdade). Assim os dois aparelhos ficam sempre IDÊNTICOS. Roda sozinho a
  // cada 30s e ao focar/abrir a aba.
  const pullFromCloud = async () => {
    if (!SYNC_ENABLED || !cloudUser) return;
    if (document.visibilityState !== 'visible') return; // não gasta leitura em aba oculta
    if (cloudPushing.current) return;                   // empurrão em andamento
    if (Object.keys(pendingRef.current).length > 0) return; // edição local em curso
    if (Date.now() - lastLocalChangeRef.current < 3000) return; // acabou de editar aqui
    try {
      const { loadUserDb } = await import('./lib/dbSync');
      const cloud = await loadUserDb(cloudUser.uid);

      // Proteção crítica: se a nuvem está vazia mas temos dados locais,
      // NÃO sobrescrever. Nuvem vazia = ainda não sincronizamos.
      // O usuário deve clicar "Sincronizar Agora" para enviar os dados locais.
      const cloudIsEmpty =
        (!cloud.products || cloud.products.length === 0) &&
        (!cloud.sales || cloud.sales.length === 0) &&
        (!cloud.expenses || cloud.expenses.length === 0) &&
        (!cloud.orders || cloud.orders.length === 0);
      const localHasData =
        (stateRef.current.products && stateRef.current.products.length > 0) ||
        (stateRef.current.sales && stateRef.current.sales.length > 0) ||
        (stateRef.current.expenses && stateRef.current.expenses.length > 0);
      if (cloudIsEmpty && localHasData) return; // nuvem vazia não apaga dados locais

      // MERGE por id (não replace): local prevalece se mais recente; dados
      // exclusivos da nuvem são preservados. Garante fidelidade sem "inflar".
      const merged: LocalDb = mergeLocalDb(stateRef.current, cloud);
      // Comparação estável (ignora `initialized` e ordem de chaves) para saber
      // se realmente há novidade antes de reescrever o estado/localStorage.
      const sig = (db: Partial<LocalDb>) => JSON.stringify([
        db.products, db.categories, db.sales, db.orders, db.customers,
        db.suppliers, db.purchases, db.cashSessions, db.loans, db.expenses, db.storeInfo,
      ]);
      if (sig(merged) === sig(stateRef.current)) return; // nada novo
      await applyLoadedDb(merged);
      persist(merged);
    } catch { /* ignora e tenta de novo no próximo ciclo */ }
  };

  // Sincronização AUTOMÁTICA DESATIVADA por enquanto (envio/baixa só manual).
  // O app fica 100% local; o usuário decide quando enviar ("Sincronizar Agora")
  // ou baixar ("Baixar da nuvem") para não consumir cota nem divergir dados
  // antes de concluir o envio inicial completo.
  const pullFromCloudRef = React.useRef<() => void>(() => {});
  pullFromCloudRef.current = pullFromCloud;

  // Retoma AUTOMÁTICA do envio em lotes DESATIVADA por enquanto (só manual).
  // A retomada de lotes pendentes por cota será feita pelo usuário clicando em
  // "Sincronizar Agora", que chama syncToCloudThrottled e continua de onde parou.
  const resumeThrottledSync = React.useRef<() => void>(() => {});
  resumeThrottledSync.current = async () => {
    if (!SYNC_ENABLED || !cloudUser) return;
    if (cloudPushing.current || cloudSyncing) return;
    try {
      const { getSyncProgress } = await import('./lib/throttledSync');
      const p = getSyncProgress(cloudUser.uid);
      // Há retomada pendente se alguma coleção tem um ano parcialmente enviado
      // ou se o storeInfo ainda não foi enviado.
      const inProgress = Object.values(p.done).some((c) =>
        Object.keys(c).some((k) => k.startsWith('_partial_'))
      ) || p.storeInfo === false;
      if (!inProgress) return;
      setCloudSyncing(true);
      const { syncToCloudThrottled } = await import('./lib/throttledSync');
      const res = await syncToCloudThrottled(cloudUser.uid, stateRef.current as LocalDb);
      setCloudLastSync(new Date().toISOString());
      setCloudSyncing(false);
      setDailyWrites(getDailyWrites().count);
      if (!res.finished) {
        showToast(`📤 Continuando envio: +${res.uploaded} docs hoje. Resta para amanhã.`);
      } else {
        showToast(`✅ Envio à nuvem concluído (+${res.uploaded} docs hoje).`);
      }
    } catch {
      setCloudSyncing(false);
    }
  };

  const handleCloudSyncNow = async () => {
    if (!SYNC_ENABLED || !cloudUser) { showToast('Sincronização desativada (modo local).'); return; }
    if (cloudPushTimer.current) { clearTimeout(cloudPushTimer.current); cloudPushTimer.current = null; }
    const db = stateRef.current as LocalDb;
    showToast('Verificando alterações para sincronizar na nuvem...');
    try {
      // Verifica se a nuvem está vazia para decidir se precisa de reenvio completo
      const { loadUserDb, clearSyncCache } = await import('./lib/dbSync');
      const { syncToCloudThrottled } = await import('./lib/throttledSync');
      const cloudData = await loadUserDb(cloudUser.uid);
      const cloudIsEmpty =
        (!cloudData.products || cloudData.products.length === 0) &&
        (!cloudData.sales || cloudData.sales.length === 0) &&
        (!cloudData.expenses || cloudData.expenses.length === 0);

      const localHasData =
        (db.products && db.products.length > 0) ||
        (db.sales && db.sales.length > 0) ||
        (db.expenses && db.expenses.length > 0);

      // Se a nuvem está vazia mas temos dados locais → cache desatualizado:
      // limpa o progresso e faz o reenvio em LOTES (ano a ano, com orçamento
      // diário) em vez de mandar tudo de uma vez e estourar a cota.
      if (cloudIsEmpty && localHasData) {
        clearSyncCache(cloudUser.uid);
        const { clearSyncProgress } = await import('./lib/throttledSync');
        clearSyncProgress(cloudUser.uid);
        showToast('Nuvem vazia detectada! Enviando os dados em lotes (ano a ano)...');
        setCloudSyncing(true);
        setCloudError(null);
        const res = await syncToCloudThrottled(cloudUser.uid, db, { resetProgress: true });
        setCloudLastSync(new Date().toISOString());
        setCloudSyncing(false);
        setCloudPending(false);
        if (res.finished) {
          showToast(`✅ Envio completo: ${res.uploaded} documentos na nuvem.`);
        } else {
          showToast(`📤 Enviados ${res.uploaded} docs hoje. Cota diária atingida — o resto continua amanhã.`);
        }
        setDailyWrites(getDailyWrites().count);
        return;
      }

      const res = await pushToCloud(db);
      if (res && res.uploaded === 0 && res.deleted === 0) {
        showToast('Nuvem já está atualizada (sem alterações para enviar).');
      } else {
        showToast(`Nuvem sincronizada: ${res.uploaded} enviados, ${res.deleted} removidos.`);
      }
    } catch {
      setCloudSyncing(false);
      showToast('Falha ao sincronizar. Verifique a conexão e a cota do projeto Firebase.');
    }
  };

  // Envia TODOS os dados deste aparelho para a nuvem de uma vez (forceFull),
  // ignorando o cache incremental. Garante que nada fique preso só localmente.
  const handleCloudPushAll = async () => {
    if (!SYNC_ENABLED || !cloudUser) { showToast('Sincronização desativada (modo local).'); return; }
    if (cloudPushTimer.current) { clearTimeout(cloudPushTimer.current); cloudPushTimer.current = null; }
    const db = stateRef.current as LocalDb;
    showToast('Enviando TODOS os dados para a nuvem...');
    try {
      const { clearSyncCache } = await import('./lib/dbSync');
      const { clearSyncProgress } = await import('./lib/throttledSync');
      clearSyncCache(cloudUser.uid);
      clearSyncProgress(cloudUser.uid);
      setCloudSyncing(true);
      setCloudError(null);
      const res = await pushToCloud(db, { forceFull: true });
      setCloudLastSync(new Date().toISOString());
      setCloudSyncing(false);
      setCloudPending(false);
      setDailyWrites(getDailyWrites().count);
      if (res && res.uploaded === 0 && res.deleted === 0) {
        showToast('Nuvem já está atualizada (sem alterações para enviar).');
      } else {
        showToast(`✅ Envio completo: ${res?.uploaded ?? 0} documentos na nuvem.`);
      }
    } catch {
      setCloudSyncing(false);
      showToast('Falha ao enviar tudo. Verifique a conexão e a cota do Firebase.');
    }
  };

  const handleClearCloud = async () => {
    if (!cloudUser || clearingCloud) return;
    if (!window.confirm('Apagar TODOS os dados deste usuário na nuvem? Esta ação não pode ser desfeita. Recomendado antes de reimportar um backup antigo.')) {
      return;
    }
    setClearingCloud(true);
    try {
      const { clearUserDb, clearSyncCache } = await import('./lib/dbSync');
      await clearUserDb(cloudUser.uid);
      clearSyncCache(cloudUser.uid);
      setCloudLastSync(null);
      setCloudError(null);
      showToast('Dados da nuvem apagados. Clique em "Sincronizar Agora" para reenviar tudo do zero.');
    } catch (e: unknown) {
      setCloudError(e instanceof Error ? e.message : 'Falha ao apagar a nuvem');
      showToast('Falha ao apagar os dados da nuvem.');
    } finally {
      setClearingCloud(false);
    }
  };

  const saveProductsToStorage = async (updatedProducts: Product[], _changedProduct?: Product, _isDeletedId?: string) => {
    // Automatically deduplicate on save to guarantee zero duplicate products exist
    const cleaned = runStockCleanup(updatedProducts);
    setProducts(cleaned);
    persist({ products: cleaned });
  };

  const saveSalesToStorage = async (updatedSales: Sale[], _changedSale?: Sale) => {
    setSales(updatedSales);
    persist({ sales: updatedSales });
  };

  // Corrige vendas cuja data está no FUTURO (relógio do PC adiantado ao
  // registrar). Mantém dia/mês e reduz o ano em 1 (ex.: 07/12/2026 -> 07/12/2025),
  // preservando a hora. Retorna a quantidade de vendas corrigidas.
  const fixSaleDates = (): number => {
    const now = new Date();
    let fixed = 0;
    const corrected = sales.map(s => {
      const d = new Date(s.date);
      if (isNaN(d.getTime())) return s;
      if (d > now) {
        d.setFullYear(d.getFullYear() - 1);
        fixed++;
        return { ...s, date: d.getFullYear() + '-' +
          String(d.getMonth() + 1).padStart(2, '0') + '-' +
          String(d.getDate()).padStart(2, '0') + 'T' +
          String(d.getHours()).padStart(2, '0') + ':' +
          String(d.getMinutes()).padStart(2, '0') + ':' +
          String(d.getSeconds()).padStart(2, '0') + '.' +
          String(d.getMilliseconds()).padStart(3, '0') };
      }
      return s;
    });
    if (fixed > 0) saveSalesToStorage(corrected);
    return fixed;
  };

  const updateSalesBulk = (updated: Sale[]) => {
    const map = new Map(updated.map(s => [s.id, s]));
    const updatedSales = sales.map(s => map.get(s.id) ?? s);
    for (const s of updated) {
      if (!sales.some(ex => ex.id === s.id)) updatedSales.push(s);
    }
    saveSalesToStorage(updatedSales);
  };

  const saveExpensesToStorage = (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses);
    persist({ expenses: updatedExpenses });
  };

  const saveCategoriesToStorage = async (updatedCategories: Category[], _changedCategory?: Category) => {
    setCategories(updatedCategories);
    persist({ categories: updatedCategories });
  };

  const saveOrdersToStorage = (updatedOrders: ServiceOrder[]) => {
    setOrders(updatedOrders);
    persist({ orders: updatedOrders });
  };

  const saveCustomersToStorage = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers);
    persist({ customers: updatedCustomers });
  };

  // Converte um Lead em Cliente do CRM (evita duplicar pelo CNPJ/nome).
  const convertLeadToCustomer = (lead: Lead) => {
    const exists = customers.some(c =>
      (lead.cnpj && c.cnpj === lead.cnpj) ||
      (c.name || '').trim().toLowerCase() === (lead.name || '').trim().toLowerCase()
    );
    if (exists) {
      showToast('Este lead já é um cliente cadastrado.');
      setActiveTab('customers');
      return;
    }
    const newCustomer: Customer = {
      id: `c_${Date.now()}`,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      notes: lead.cnpj ? `CNPJ: ${lead.cnpj}` : '',
      createdAt: new Date().toISOString(),
    };
    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    persist({ customers: updated });
    showToast('Lead convertido em cliente!');
    setActiveTab('customers');
  };

  const saveSuppliersToStorage = (updatedSuppliers: Supplier[]) => {
    setSuppliers(updatedSuppliers);
    persist({ suppliers: updatedSuppliers });
  };

  const savePurchasesToStorage = (updatedPurchases: Purchase[]) => {
    setPurchases(updatedPurchases);
    persist({ purchases: updatedPurchases });
  };

  const saveCashSessionsToStorage = (updatedSessions: CashSession[]) => {
    setCashSessions(updatedSessions);
    persist({ cashSessions: updatedSessions });
  };

  const saveLoansToStorage = (updatedLoans: Loan[]) => {
    setLoans(updatedLoans);
    persist({ loans: updatedLoans });
  };

  const handleStoreInfoChange = (info: StoreInfo) => {
    setStoreInfo(info);
    persist({ storeInfo: info });
    window.dispatchEvent(new Event('storeInfoChanged'));
  };

  const handleAddExpense = (expense: Expense) => {
    saveExpensesToStorage([expense, ...expenses]);
  };

  const handleDeleteExpense = (id: string) => {
    saveExpensesToStorage(expenses.filter(e => e.id !== id));
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    saveExpensesToStorage(expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e));
  };

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---

  // Add Product
  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newProduct, ...products];
    saveProductsToStorage(updated, newProduct).catch(() => {});
  };

  // Update Product
  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    saveProductsToStorage(updated, updatedProduct).catch(() => {});
  };

  // Archive Product (soft delete)
  const handleArchiveProduct = (id: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, archived: true, archivedAt: new Date().toISOString() };
      }
      return p;
    });
    saveProductsToStorage(updated, updated.find(p => p.id === id)).catch(() => {});
  };

  // Unarchive Product
  const handleUnarchiveProduct = (id: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, archived: false, archivedAt: undefined };
      }
      return p;
    });
    saveProductsToStorage(updated, updated.find(p => p.id === id)).catch(() => {});
  };

  // Delete Product - alias for archive (kept for compatibility)
  const handleDeleteProduct = handleArchiveProduct;

  const handleClearAllProducts = () => {
    const updated = products.map(p => ({ ...p, archived: true, archivedAt: new Date().toISOString() }));
    saveProductsToStorage(updated).catch(() => {});
  };

  // Add Category
  const handleAddCategory = (categoryName: string) => {
    const newCategory: Category = {
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: categoryName
    };
    const updated = [...categories, newCategory];
    saveCategoriesToStorage(updated, newCategory);
  };

  // Register New Sale (and deduct stock)
  const handleRegisterSale = (saleData: {
    items: SaleItem[];
    clientName?: string;
    clientPhone?: string;
    paymentMethod: PaymentMethod;
    discount: number;
    ecommerceOrderId?: string;
    saleChannel?: string;
    saleType: 'CPF' | 'CNPJ';
    notes?: string;
    pending?: boolean;
  }) => {
    // 1. Calculate costs and prices with floating point fix
    const subtotal = roundCurrency(saleData.items.reduce((acc, item) => acc + item.total, 0));
    const discountAmount = roundCurrency((subtotal * saleData.discount) / 100);
    const finalTotal = Math.max(0, roundCurrency(subtotal - discountAmount));

    const totalCost = roundCurrency(saleData.items.reduce((acc, item) => acc + (item.costPrice * item.quantity), 0));
    const profit = roundCurrency(finalTotal - totalCost);

    // 2. Generate sale object
    // Vendas em marketplace (Shopee, TikTok, OLX, etc.) não são pagas na hora:
    // caem como "pending" no painel de Marketplace até o valor cair na conta.
    const saleChannelRaw = saleData.saleChannel || '';
    const isMarketplaceChannel = (() => {
      const c = normalizeChannel(saleChannelRaw);
      return c !== '' && c !== 'loja fisica';
    })();

    const newSale: Sale = {
      id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: localNowISO(),
      items: saleData.items,
      clientName: saleData.clientName,
      clientPhone: saleData.clientPhone,
      paymentMethod: saleData.paymentMethod,
      total: finalTotal,
      totalCost,
      profit,
      status: (isMarketplaceChannel || saleData.pending) ? 'pending' : 'completed',
      ecommerceOrderId: saleData.ecommerceOrderId,
      saleChannel: saleChannelRaw || undefined,
      saleType: saleData.saleType,
      notes: saleData.notes
    };

    // 3. Deduct stock quantities from inventory products
    const changedProducts: Product[] = [];
    const updatedProducts = products.map(p => {
      const soldItem = saleData.items.find(item => item.productId === p.id);
      if (soldItem) {
        const updated = {
          ...p,
          stock: Math.max(0, p.stock - soldItem.quantity)
        };
        changedProducts.push(updated);
        return updated;
      }
      return p;
    });

    saveProductsToStorage(updatedProducts, undefined);
    saveSalesToStorage([newSale, ...sales], newSale);
  };

  // Cancel/Refund Sale (and restore stock)
  const handleCancelSale = (saleId: string) => {
    const updatedSales = sales.map(s => {
      if (s.id === saleId) {
        return {
          ...s,
          status: 'cancelled' as const
        };
      }
      return s;
    });

    // Find the cancelled sale to get quantities
    const cancelledSale = sales.find(s => s.id === saleId);
    if (!cancelledSale) return;

    // Restore stock quantities
    const updatedProducts = products.map(p => {
      const refundedItem = cancelledSale.items.find(item => item.productId === p.id);
      if (refundedItem) {
        return {
          ...p,
          stock: p.stock + refundedItem.quantity
        };
      }
      return p;
    });

    saveProductsToStorage(updatedProducts, undefined);
    saveSalesToStorage(updatedSales, { ...cancelledSale, status: 'cancelled' });
  };

  // Exclui uma venda definitivamente do banco (não apenas cancela). Não restaura
  // estoque, pois a venda deixa de existir — use o cancelamento para estorno.
  const deleteSale = (saleId: string) => {
    const updatedSales = sales.filter(s => s.id !== saleId);
    saveSalesToStorage(updatedSales);
  };

  // Import whole database from external source (MERGE: preserves existing IDs,
  // links and data; updates products matched by code/SKU or name instead of
  // wiping the store and regenerating IDs, which previously corrupted sales).
  const handleImportDatabase = (imported: { products: Product[]; sales: Sale[]; categories: Category[]; expenses?: Expense[]; loans?: Loan[]; orders?: ServiceOrder[]; customers?: Customer[]; suppliers?: Supplier[]; purchases?: Purchase[]; cashSessions?: CashSession[] }) => {
    // --- Merge products by code (SKU) then by normalized name ---
    const existingByCode = new Map<string, Product>(products.map(p => [(p.code || '').trim().toLowerCase(), p] as [string, Product]));
    const existingByName = new Map<string, Product>(products.map(p => [normalizeName(p.name), p] as [string, Product]));
    const mergedProducts: Product[] = [...products];

    for (const imp of (imported.products || [])) {
      const codeKey = (imp.code || '').trim().toLowerCase();
      const nameKey = normalizeName(imp.name);
      const existing = codeKey ? existingByCode.get(codeKey) : existingByName.get(nameKey);

      if (existing) {
        const idx = mergedProducts.findIndex(p => p.id === existing.id);
        mergedProducts[idx] = {
          ...existing,
          code: imp.code || existing.code,
          name: imp.name || existing.name,
          category: imp.category || existing.category,
          costPrice: imp.costPrice ?? existing.costPrice,
          salePrice: imp.salePrice ?? existing.salePrice,
          stock: imp.stock ?? existing.stock,
          minStock: imp.minStock ?? existing.minStock,
          description: imp.description ?? existing.description,
          status: imp.status || existing.status,
          archived: imp.archived ?? existing.archived
        };
      } else {
        const np: Product = {
          id: imp.id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          code: imp.code || '',
          name: imp.name,
          category: imp.category || 'Geral',
          costPrice: imp.costPrice || 0,
          salePrice: imp.salePrice || 0,
          stock: imp.stock || 0,
          minStock: imp.minStock || 0,
          description: imp.description || '',
          status: imp.status || 'disponivel',
          archived: imp.archived || false,
          createdAt: imp.createdAt || new Date().toISOString()
        };
        mergedProducts.push(np);
        if (np.code) existingByCode.set(np.code.trim().toLowerCase(), np);
        existingByName.set(normalizeName(np.name), np);
      }
    }

    // --- Merge categories (keep existing, add new by name) ---
    const catNames = new Set(categories.map(c => c.name.toLowerCase()));
    const mergedCategories = [...categories];
    for (const c of (imported.categories || [])) {
      if (!catNames.has(c.name.toLowerCase())) {
        mergedCategories.push(c);
        catNames.add(c.name.toLowerCase());
      }
    }

    // --- Merge sales by id (update if same id, else append) ---
    const salesById = new Map<string, Sale>(sales.map(s => [s.id, s] as [string, Sale]));
    for (const s of (imported.sales || [])) {
      salesById.set(s.id, salesById.has(s.id) ? { ...salesById.get(s.id)!, ...s } : s);
    }
    const mergedSales = Array.from(salesById.values());

    saveProductsToStorage(mergedProducts);
    saveSalesToStorage(mergedSales);
    saveCategoriesToStorage(mergedCategories);
    if (imported.expenses) saveExpensesToStorage(imported.expenses);
    if (imported.loans) saveLoansToStorage(imported.loans);
    if (imported.orders) saveOrdersToStorage(imported.orders);
    if (imported.customers) saveCustomersToStorage(imported.customers);
    if (imported.suppliers) saveSuppliersToStorage(imported.suppliers);
    if (imported.purchases) savePurchasesToStorage(imported.purchases);
    if (imported.cashSessions) saveCashSessionsToStorage(imported.cashSessions);
    persist({ initialized: true });
  };

  // Reset database to empty
  const handleResetDatabase = () => {
    saveProductsToStorage([]);
    saveSalesToStorage([]);
    saveCategoriesToStorage([]);
    saveExpensesToStorage([]);
    saveOrdersToStorage([]);
    saveCustomersToStorage([]);
    saveSuppliersToStorage([]);
    savePurchasesToStorage([]);
    saveCashSessionsToStorage([]);
    saveLoansToStorage([]);
    persist({ initialized: true });
    setActiveTab('dashboard');
  };

  // Full backup: serialize the entire operational database (loans, customers,
  // marketplace flags, etc.) to a JSON file so it can be carried to another PC.
  const handleExportBackup = useCallback(() => {
    const db: LocalDb = {
      products, sales, categories, expenses, orders,
      storeInfo, customers, suppliers, purchases, cashSessions, loans,
      leads: [], leadJobs: [], whatsappInstances: [], aiAgents: [], opportunities: [],
      initialized: true,
    };
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zmstore-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [products, sales, categories, expenses, orders, storeInfo, customers, suppliers, purchases, cashSessions, loans]);

  const handleImportBackup = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<LocalDb>;
        if (!Array.isArray(parsed.products) || !Array.isArray(parsed.sales)) {
          throw new Error('invalid');
        }
        if (!window.confirm('Importar este backup? Isso substituirá TODOS os dados atuais deste navegador (empréstimos, vendas, clientes, marketplace, fechamentos, etc.).')) {
          return;
        }
        const db: LocalDb = {
          products: parsed.products || [],
          sales: parsed.sales || [],
          categories: parsed.categories || [],
          expenses: parsed.expenses || [],
          orders: parsed.orders || [],
          storeInfo: parsed.storeInfo ?? null,
          customers: parsed.customers || [],
          suppliers: parsed.suppliers || [],
          purchases: parsed.purchases || [],
          cashSessions: parsed.cashSessions || [],
          loans: parsed.loans || [],
          leads: parsed.leads || [],
          leadJobs: parsed.leadJobs || [],
          whatsappInstances: parsed.whatsappInstances || [],
          aiAgents: parsed.aiAgents || [],
          opportunities: parsed.opportunities || [],
          initialized: true,
        };
        setProducts(db.products);
        setSales(db.sales);
        setCategories(db.categories);
        setExpenses(db.expenses);
        setOrders(db.orders);
        setStoreInfo(db.storeInfo);
        setCustomers(db.customers);
        setSuppliers(db.suppliers);
        setPurchases(db.purchases);
        setCashSessions(db.cashSessions);
        setLoans(db.loans);
        
        setLeads(db.leads);
        setLeadJobs(db.leadJobs);
        setWhatsappInstances(db.whatsappInstances);
        setAiAgents(db.aiAgents);

        persist(db);
      } catch {
        alert('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  }, []);

  // Derive customers from the distinct clientName present in sales (used to
  // seed the CRM on existing databases that predate the Customer module).
  function seedCustomersFromSales(salesToScan: Sale[]): Customer[] {
    const seen = new Set<string>();
    const result: Customer[] = [];
    for (const sale of salesToScan) {
      const name = (sale.clientName || '').trim();
      if (!name) continue;
      const key = normalizeName(name);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({
        id: `c_${Date.now()}_${result.length}`,
        name,
        phone: sale.clientPhone || undefined,
        createdAt: sale.date || new Date().toISOString(),
      });
    }
    return result;
  }

  // Register a purchase: records the buy and increments stock of the matching
  // products (creating them when they don't exist yet) and updates cost price.
  const handleAddPurchase = (purchase: Purchase) => {
    const byName = new Map<string, Product>(products.map(p => [normalizeName(p.name), p] as [string, Product]));
    let updatedProducts = [...products];

    for (const item of purchase.items) {
      const qty = Number(item.quantity) || 0;
      if (qty <= 0) continue;
      const key = normalizeName(item.productName);
      const existing = item.productId
        ? updatedProducts.find(p => p.id === item.productId)
        : byName.get(key);

      if (existing) {
        updatedProducts = updatedProducts.map(p => {
          if (p.id !== existing.id) return p;
          return {
            ...p,
            stock: p.stock + qty,
            costPrice: item.costPrice || p.costPrice,
            salePrice: item.salePrice || p.salePrice,
          };
        });
        if (!item.productId) byName.set(key, updatedProducts.find(p => p.id === existing.id)!);
      } else {
        const np: Product = {
          id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          code: `SKU-${Date.now()}`,
          name: item.productName,
          category: suggestCategory(item.productName),
          costPrice: item.costPrice || 0,
          salePrice: item.salePrice || 0,
          stock: qty,
          minStock: 5,
          status: 'disponivel',
          createdAt: new Date().toISOString()
        };
        updatedProducts = [np, ...updatedProducts];
        byName.set(key, np);
      }
    }

    saveProductsToStorage(updatedProducts, undefined);
    savePurchasesToStorage([purchase, ...purchases]);
  };

  // --- STOCK CLEANUP ---
  function runStockCleanup(productsToClean: Product[]): Product[] {
    if (productsToClean.length === 0) return [];

    // Group products by normalized name (case-insensitive, trimmed, space-normalized, accent-normalized)
    const byNormalizedName = new Map<string, Product[]>();
    for (const p of productsToClean) {
      if (!p.name) continue;
      const key = normalizeName(p.name);
      if (!byNormalizedName.has(key)) {
        byNormalizedName.set(key, []);
      }
      byNormalizedName.get(key)!.push(p);
    }

    let merged: Product[] = [];

    for (const group of byNormalizedName.values()) {
      if (group.length === 1) {
        merged.push(group[0]);
        continue;
      }

      // Group elements sorted by creation date descending to get the most recent one first.
      group.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeB !== timeA) {
          return timeB - timeA; // Descending (most recent first)
        }
        return b.id.localeCompare(a.id); // Tie breaker
      });

      const best = { ...group[0] };

      // Sum stock from duplicates
      let totalStock = 0;
      for (const p of group) {
        totalStock += p.stock || 0;
      }
      best.stock = totalStock;

      // Ensure costPrice comes from a valid one if best is 0, but keep best's details (including the most recent salePrice)
      for (let i = 1; i < group.length; i++) {
        if (best.costPrice === 0 && group[i].costPrice > 0) {
          best.costPrice = group[i].costPrice;
        }
      }

      merged.push(best);
    }

    // Remove empty/placeholder products if they are completely empty
    const cleaned = merged.filter(p => !(p.stock === 0 && p.salePrice === 0 && p.name.trim() === ''));
    return cleaned;
  }

  // --- VERIFICAR VENDAS X ESTOQUE ---
  const missingProducts = useMemo(() => {
    if (!showVendasEstoque) return [];
    const productNamesLower = new Set(products.map(p => p.name.trim().toLowerCase()));
    const completedSales = sales.filter(s => s.status === 'completed');
    const soldMap = new Map<string, { name: string; quantity: number; salePrice: number; costPrice: number }>();
    for (const sale of completedSales) {
      for (const item of sale.items) {
        const key = item.productName.trim().toLowerCase();
        if (productNamesLower.has(key)) continue;
        const existing = soldMap.get(key);
        if (existing) {
          existing.quantity += item.quantity;
          existing.salePrice = Math.max(existing.salePrice, item.salePrice);
          existing.costPrice = Math.max(existing.costPrice, item.costPrice);
        } else {
          soldMap.set(key, {
            name: item.productName.trim(),
            quantity: item.quantity,
            salePrice: item.salePrice,
            costPrice: item.costPrice
          });
        }
      }
    }
    return Array.from(soldMap.values());
  }, [showVendasEstoque, products, sales]);

  const suggestCategory = (name: string): string => categorizeProduct(name);

  const handleAddSingleMissingProduct = (item: { name: string; quantity: number; salePrice: number; costPrice: number }) => {
    const newProduct: Product = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: `SKU-${Date.now()}`,
      name: item.name,
      category: suggestCategory(item.name),
      costPrice: item.costPrice,
      salePrice: item.salePrice,
      stock: 0,
      minStock: 5,
      status: 'disponivel',
      createdAt: new Date().toISOString()
    };
    const updated = [newProduct, ...products];
    saveProductsToStorage(updated, newProduct);
  };

  const handleAddMissingProducts = () => {
    const newProducts: Product[] = missingProducts.map(item => ({
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: `SKU-${Date.now()}_${Math.random().toString(36).substring(2, 4)}`,
      name: item.name,
      category: suggestCategory(item.name),
      costPrice: item.costPrice,
      salePrice: item.salePrice,
      stock: 0,
      minStock: 5,
      status: 'disponivel',
      createdAt: new Date().toISOString()
    }));
    const updated = [...newProducts, ...products];
    saveProductsToStorage(updated);
    setShowVendasEstoque(false);
  };

  const handleExportMissingProducts = async () => {
    const XLSX = await import('xlsx');
    const data = missingProducts.map(item => ({
      'Produto': item.name,
      'Categoria Sugerida': suggestCategory(item.name),
      'Qtd Vendida': item.quantity,
      'Preço Venda': item.salePrice,
      'Custo': item.costPrice
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos Ausentes');
    XLSX.writeFile(wb, 'controle_vendas_estoque.xlsx');
  };

  // --- TELA DE ESCOLHA DOS SISTEMAS (Loja vs Mounjaro PRO) ---
  if (showChooser) {
    return (
      <React.Suspense fallback={null}>
        <SystemChooser onChoose={() => setShowChooser(false)} />
      </React.Suspense>
    );
  }

  // --- LOADING STATE (local backend) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Carregando banco de dados local...</p>
        </div>
      </div>
    );
  }

  // --- AUTH GATE: login obrigatório (uso particular por conta) ---
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Verificando conta...</p>
        </div>
      </div>
    );
  }

  if (!cloudUser) {
    return <LoginScreen onSignIn={handleCloudSignIn} error={cloudError} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-200 antialiased font-sans">

      {/* MOBILE TOP HEADER */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 px-4 py-3 shadow-sm">
        {storeInfo.logoUrl ? (
          <img src={storeInfo.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain shrink-0" />
        ) : (
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-white"></div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm tracking-tight text-slate-950 dark:text-slate-100 truncate">ZM Store</h2>
          <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider">Gestão Comercial</span>
        </div>
        <button
          onClick={() => setShowVendasEstoque(true)}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
          title="Verificar Vendas x Estoque"
          aria-label="Verificar Vendas x Estoque"
        >
          <PackageSearch className="h-5 w-5" />
        </button>
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={darkMode ? 'Modo claro' : 'Modo escuro'}
          aria-label={darkMode ? 'Modo claro' : 'Modo escuro'}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <span className="text-[8px] text-slate-300 font-mono">v{appVersion.version}</span>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 flex items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {([
          { tab: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
          { tab: 'products', label: 'Estoque', icon: Package },
          { tab: 'pos', label: 'Caixa', icon: ShoppingCart },
          { tab: 'sales', label: 'Vendas', icon: History },
          { tab: 'settings', label: 'Menu', icon: SettingsIcon },
        ] as const).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab && !mobileMenuOpen;
          const isMenu = item.tab === 'settings';
          return (
            <button
              key={item.tab}
              onClick={() => isMenu ? setMobileMenuOpen(!mobileMenuOpen) : setActiveTab(item.tab)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-1 transition-all cursor-pointer relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500 active:text-slate-600'
              }`}
            >
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />}
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MOBILE SLIDE-UP MENU for extra tabs */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 inset-x-0 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl p-4 pb-[env(safe-area-inset-bottom)] animate-[slideUp_0.2s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {([
                { tab: 'reports', label: 'Relatórios', icon: BarChart3 },
                { tab: 'cashflow', label: 'Fluxo de Caixa', icon: DollarSign },
                { tab: 'os', label: 'OS / Orçamento', icon: ClipboardList },
                { tab: 'debtors', label: 'Devedores', icon: Users },
                { tab: 'customers', label: 'Clientes', icon: Users },
                { tab: 'cashclosing', label: 'Fechamento', icon: Wallet },
                { tab: 'leads', label: 'Leads', icon: Target },
                { tab: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { tab: 'ai', label: 'Inteligência Artificial', icon: Brain },
                { tab: 'mounjaro', label: 'Mounjaro PRO', icon: Stethoscope },
                { tab: 'settings', label: 'Configurações', icon: SettingsIcon },
              ] as const).map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                     if (item.tab === 'mounjaro') { setMobileMenuOpen(false); window.location.href = '/mounjaro'; return; }
                     setActiveTab(item.tab); setMobileMenuOpen(false);
                   }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
       {/* SIDEBAR NAVIGATION (Desktop) */}
       <aside className="hidden md:flex w-full md:w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shrink-0 border-r border-slate-200 dark:border-slate-700 flex-col justify-between z-10 py-2">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 mb-6">
            {storeInfo.logoUrl ? (
              <img src={storeInfo.logoUrl} alt="Logo" className="w-8 h-8 rounded object-contain shrink-0" />
            ) : (
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shrink-0">
                <div className="w-4 h-4 border-2 border-white"></div>
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-bold text-base tracking-tight text-slate-950 dark:text-slate-100">ZM Store</h2>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Gestão Comercial</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setShowVendasEstoque(true)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
              title="Verificar Vendas x Estoque"
            >
              <PackageSearch className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {/* Tab 1: Dashboard */}
            <button
              id="nav-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Painel Geral
            </button>

            {/* Tab 2: Products */}
            <button
              id="nav-products"
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'products' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Package className="h-4 w-4" />
              Estoque
            </button>

            {/* Tab 3: Sales (POS) */}
            <button
              id="nav-pos"
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'pos' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Frente de Caixa
            </button>

            {/* Tab 4: Sales History (com submenu Devedores) */}
            <div>
              <button
                id="nav-sales"
                onClick={() => setActiveTab('sales')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'sales' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <History className="h-4 w-4" />
                Vendas
              </button>
              <button
                id="nav-debtors"
                onClick={() => setActiveTab('debtors')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-0.5 pl-9 ${
                  activeTab === 'debtors' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="h-4 w-4" />
                Devedores
              </button>
              <button
                id="nav-customers"
                onClick={() => setActiveTab('customers')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-0.5 pl-9 ${
                  activeTab === 'customers' 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="h-4 w-4" />
                Clientes
              </button>
            </div>

            {/* Tab 5: Reports */}
            <button
              id="nav-reports"
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'reports' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </button>

            {/* Tab: Fluxo de Caixa */}
            <button
              id="nav-cashflow"
              onClick={() => setActiveTab('cashflow')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'cashflow' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Fluxo de Caixa
            </button>

            {/* Tab: Fechamento de Caixa */}
            <button
              id="nav-cashclosing"
              onClick={() => setActiveTab('cashclosing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'cashclosing' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Wallet className="h-4 w-4" />
              Fechamento de Caixa
            </button>

            {/* Tab 6: OS & Orçamentos */}
            <button
              id="nav-os"
              onClick={() => setActiveTab('os')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'os' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              OS / Orçamento
            </button>

            {/* Tab: Configurações */}
            <button
              id="nav-settings"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              Configurações
            </button>

            {/* Separator: Módulos Avançados */}
            <div className="pt-3 pb-1">
              <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest px-3">Módulos Avançados</span>
            </div>

            {/* Tab: Leads */}
            <button
              id="nav-leads"
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Target className="h-4 w-4" />
              Leads
            </button>

            {/* Tab: Funil de Vendas */}
            <button
              id="nav-funnel"
              onClick={() => setActiveTab('funnel')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'funnel'
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <KanbanSquare className="h-4 w-4" />
              Funil de Vendas
            </button>

            {/* Tab: WhatsApp */}
            <button
              id="nav-whatsapp"
              onClick={() => setActiveTab('whatsapp')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              WhatsApp
            </button>

            {/* Tab: IA */}
            <button
              id="nav-ai"
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Brain className="h-4 w-4" />
              Inteligência Artificial
            </button>

            {/* Subsite Mounjaro PRO */}
            <button
              onClick={() => { try { localStorage.removeItem('mei_pro_system_choice'); } catch { /* ignore */ } setShowChooser(true); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 bg-cyan-50/50 dark:bg-cyan-900/20"
            >
              <Stethoscope className="h-4 w-4" />
              Mounjaro PRO
            </button>
          </nav>
        </div>

        {/* Local mode indicator */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
          <div className="bg-emerald-50/60 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white">
              <HardDrive className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate leading-snug">Modo Local</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Banco de dados no seu PC
              </span>
            </div>
          </div>
        </div>

        {/* Cloud sync status */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
          <div
            onClick={cloudUser ? handleCloudSyncNow : undefined}
            className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
              !cloudUser
                ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                : cloudError
                ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                : cloudSyncing
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                : cloudPending
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100'
            } ${cloudUser ? 'cursor-pointer' : ''}`}
            title={cloudUser ? 'Clique para sincronizar agora' : 'Entre com o Google em Configurações'}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${
              !cloudUser ? 'bg-slate-400'
                : cloudError ? 'bg-rose-500'
                : cloudSyncing ? 'bg-indigo-600'
                : cloudPending ? 'bg-amber-500'
                : 'bg-emerald-600'
            }`}>
              {!cloudUser ? <CloudOff className="h-4 w-4" />
                : cloudSyncing ? <Loader2 className="h-4 w-4 animate-spin" />
                : cloudError ? <AlertTriangle className="h-4 w-4" />
                : cloudPending ? <Clock className="h-4 w-4" />
                : <Cloud className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate leading-snug">
                {!cloudUser ? 'Nuvem desconectada'
                  : cloudSyncing ? 'Sincronizando…'
                  : cloudError ? 'Erro na nuvem'
                  : cloudPending ? 'Alterações pendentes'
                  : 'Nuvem em dia'}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {!cloudUser ? 'Entre em Configurações'
                  : cloudError ? 'Clique para tentar de novo'
                  : cloudLastSync ? `Última: ${timeAgo(cloudLastSync)}` : 'Não sincronizado ainda'}
              </span>
              {cloudUser && (
                <div className="mt-1.5">
                  <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dailyWrites / DAILY_WRITE_LIMIT > 0.9 ? 'bg-rose-500'
                          : dailyWrites / DAILY_WRITE_LIMIT > 0.7 ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (dailyWrites / DAILY_WRITE_LIMIT) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {dailyWrites.toLocaleString('pt-BR')} / {DAILY_WRITE_LIMIT.toLocaleString('pt-BR')} ops hoje
                  </span>
                </div>
              )}
              {cloudUser && (
                <button
                  onClick={handleCloudPushAll}
                  disabled={cloudSyncing}
                  className="mt-2 w-full text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800 rounded-lg py-1.5 transition-colors disabled:opacity-50"
                >
                  {cloudSyncing ? 'Enviando…' : '☁ Enviar TUDO para a nuvem'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer info box (time, date and version) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 hidden md:block m-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-indigo-600" />
            <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">{currentTime || '12:00'}</span>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <p className="text-[10px] text-slate-300 font-mono mt-1">v{appVersion.version}</p>
        </div>
      </aside>

      {/* MAIN CONTENT DISPLAY */}
      <main className="flex-1 p-3 md:p-8 pb-28 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full bg-slate-50 dark:bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <React.Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            }>
            {activeTab === 'dashboard' && (
              <Dashboard 
                products={products} 
                sales={sales} 
                onNavigate={(tab) => {
                  if (tab === 'products') setActiveTab('products');
                  if (tab === 'pos') setActiveTab('pos');
                  if (tab === 'sales') setActiveTab('sales');
                }}
              />
            )}

            {activeTab === 'products' && (
              <Products 
                products={products}
                categories={categories}
                sales={sales}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onArchiveProduct={handleArchiveProduct}
                onUnarchiveProduct={handleUnarchiveProduct}
                onClearAllProducts={handleClearAllProducts}
                onAddCategory={handleAddCategory}
              />
            )}

            {activeTab === 'pos' && (
              <Sales 
                products={products} 
                customers={customers}
                onRegisterSale={handleRegisterSale}
                onNavigate={(tab) => {
                  if (tab === 'products') setActiveTab('products');
                }}
              />
            )}

            {activeTab === 'sales' && (
              <SalesHistory
                sales={sales}
                products={products}
                onCancelSale={handleCancelSale}
                onDeleteSale={deleteSale}
                onFixDates={fixSaleDates}
                onUpdateSale={(updatedSale) => {
                  const updatedSales = sales.map(s => s.id === updatedSale.id ? updatedSale : s);
                  saveSalesToStorage(updatedSales, updatedSale);
                }}
              />
            )}

            {activeTab === 'reports' && (
              <Reports 
                products={products}
                sales={sales}
                categories={categories}
              />
            )}

            {activeTab === 'os' && (
              <OsOrcamento 
                products={products}
                storeInfo={storeInfo as StoreInfo}
                orders={orders}
                onOrdersChange={saveOrdersToStorage}
              />
            )}

            {activeTab === 'debtors' && (
              <Debtors 
                sales={sales}
                loans={loans}
                onUpdateSale={(updatedSale) => {
                  const updatedSales = sales.map(s => s.id === updatedSale.id ? updatedSale : s);
                  saveSalesToStorage(updatedSales, updatedSale);
                }}
                onUpdateSales={updateSalesBulk}
                onSaveLoans={saveLoansToStorage}
              />
            )}

            {activeTab === 'customers' && (
              <Customers
                customers={customers}
                sales={sales}
                onSaveCustomers={saveCustomersToStorage}
              />
            )}

            {activeTab === 'cashclosing' && (
              <CashClosing
                sales={sales}
                sessions={cashSessions}
                onSaveSessions={saveCashSessionsToStorage}
              />
            )}

            {activeTab === 'cashflow' && (
              <CashFlow
                sales={sales}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                onUpdateExpense={handleUpdateExpense}
              />
            )}

            {activeTab === 'leads' && (
              <LeadsPage
                leads={leads}
                leadJobs={leadJobs}
                onSaveLeads={l => { setLeads(l); persist({ leads: l }); }}
                onSaveLeadJobs={j => { setLeadJobs(j); persist({ leadJobs: j }); }}
                onConvertToCustomer={convertLeadToCustomer}
              />
            )}

            {activeTab === 'whatsapp' && (
              <WhatsAppPage
                instances={whatsappInstances}
                onSaveInstances={i => { setWhatsappInstances(i); persist({ whatsappInstances: i }); }}
              />
            )}

            {activeTab === 'ai' && (
              <AIModulePage
                agents={aiAgents}
                onSaveAgents={a => { setAiAgents(a); persist({ aiAgents: a }); }}
              />
            )}

            {activeTab === 'funnel' && (
              <FunnelPage
                opportunities={opportunities}
                leads={leads}
                onSaveOpportunities={o => { setOpportunities(o); persist({ opportunities: o }); }}
              />
            )}

            {activeTab === 'settings' && (
              <Settings 
                products={products}
                sales={sales}
                categories={categories}
                expenses={expenses}
                loans={loans}
                orders={orders}
                customers={customers}
                suppliers={suppliers}
                purchases={purchases}
                cashSessions={cashSessions}
                storeInfo={storeInfo as StoreInfo}
                onStoreInfoChange={handleStoreInfoChange}
                onImportDatabase={handleImportDatabase}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                onResetDatabase={handleResetDatabase}
                cloudUser={cloudUser}
                cloudSyncing={cloudSyncing}
                cloudLastSync={cloudLastSync}
                cloudError={cloudError}
                cloudPending={cloudPending}
                dailyWrites={dailyWrites}
                dailyWriteLimit={DAILY_WRITE_LIMIT}
                onCloudSignIn={handleCloudSignIn}
                onCloudSignOut={handleCloudSignOut}
                onCloudSyncNow={handleCloudSyncNow}
                onDownloadFromCloud={handleDownloadFromCloud}
                onClearCloud={handleClearCloud}
                clearingCloud={clearingCloud}
                syncEnabled={SYNC_ENABLED}
              />
            )}
            </React.Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* MODAL: Verificar Vendas x Estoque */}
      {showVendasEstoque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <PackageSearch className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Verificar Vendas x Estoque</h2>
              </div>
              <button
                onClick={() => setShowVendasEstoque(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {missingProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Todos os produtos vendidos existem no catálogo!</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Nenhum produto ausente encontrado.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    {missingProducts.length} produto(s) vendido(s) que não existem no catálogo atual:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produto</th>
                          <th className="text-left py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria Sugerida</th>
                          <th className="text-center py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qtd Vendida</th>
                          <th className="text-right py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preço Venda</th>
                          <th className="text-right py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Custo</th>
                          <th className="text-center py-2 px-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {missingProducts.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{item.name}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold text-[10px] uppercase">
                                {suggestCategory(item.name)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-700 dark:text-slate-300">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">R$ {item.salePrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">R$ {item.costPrice.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => handleAddSingleMissingProduct(item)}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                              >
                                Cadastrar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {missingProducts.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
                <button
                  onClick={handleExportMissingProducts}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
                >
                  Exportar Controle
                </button>
                <button
                  onClick={handleAddMissingProducts}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cadastrar Todos ({missingProducts.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast de erro de persistência (M6) */}
      {toastMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold">
          {toastMsg}
        </div>
      )}

      <Toaster position="bottom-right" />
    </div>
  );
}

