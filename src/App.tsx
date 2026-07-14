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
  Loan
} from './types';
// Dados de seed (data.json, ~1,7 MB) são carregados sob demanda, apenas na
// primeira execução ou quando o banco local está vazio — evitando parse no startup.
let _seedPromise: Promise<typeof import('./data')> | null = null;
const loadSeed = () => (_seedPromise ??= import('./data'));

import { lazy } from 'react';
const Dashboard = lazy(() => import('./components/Dashboard'));
const Products = lazy(() => import('./components/Products'));
const Sales = lazy(() => import('./components/Sales'));
const SalesHistory = lazy(() => import('./components/SalesHistory'));
const Reports = lazy(() => import('./components/Reports'));
const Settings = lazy(() => import('./components/Settings'));
const OsOrcamento = lazy(() => import('./components/OsOrcamento'));
const Debtors = lazy(() => import('./components/Debtors'));
const CashFlow = lazy(() => import('./components/CashFlow'));
const Customers = lazy(() => import('./components/Customers'));
const CashClosing = lazy(() => import('./components/CashClosing'));
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
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import appVersion from '../package.json';

import { categorizeProduct } from './lib/categorize';
import { normalizeName } from './lib/normalize';
import { roundCurrency } from './lib/currency';
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

// Sincronização com a nuvem está DESATIVADA (modo local). Nenhum dado é enviado
// ou baixado automaticamente. Mantenha `false` até o usuário querer reativar.
const SYNC_ENABLED = false;

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
  const [restoringBackup, setRestoringBackup] = useState(false);
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
      const seed = await loadSeed();
      p = hasDb && Array.isArray(dbData.products) ? dbData.products! : seed.initialProducts;
      s = hasDb && Array.isArray(dbData.sales) ? dbData.sales! : seed.initialSales;
      e = hasDb && Array.isArray(dbData.expenses) ? dbData.expenses! : seed.initialExpenses;
      c = hasDb && Array.isArray(dbData.categories) ? dbData.categories! : seed.initialCategories;
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
    if (db && db.storeInfo) setStoreInfo(db.storeInfo);
    const seededCustomers = loadedCustomers.length === 0 ? seedCustomersFromSales(s) : loadedCustomers;
    if (seededCustomers !== loadedCustomers) setCustomers(seededCustomers);
    return { hasDb, seededProducts, s, c, e, seededCustomers };
  };

  useEffect(() => {
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
            storeInfo: (db && db.storeInfo) || null,
            initialized: true,
          });
        }
      } catch {
        const seed = await loadSeed();
        setProducts(seed.initialProducts);
        setSales(seed.initialSales);
        setExpenses(seed.initialExpenses);
        setCategories(seed.initialCategories);
        persist({
          products: seed.initialProducts,
          sales: seed.initialSales,
          categories: seed.initialCategories,
          expenses: seed.initialExpenses,
          orders: [],
          customers: [],
          suppliers: [],
          purchases: [],
          cashSessions: [],
          loans: [],
          storeInfo: null,
          initialized: true,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Observa o estado de autenticação do Firebase (nuvem)
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    import('./lib/firebase').then(({ initAuth }) => {
      if (cancelled) return;
      unsub = initAuth(
        (user) => setCloudUser(user),
        () => setCloudUser(null)
      );
    });
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
    initialized?: boolean;
  }>({ products: [], sales: [], categories: [], expenses: [], orders: [], storeInfo: null, customers: [], suppliers: [], purchases: [], cashSessions: [], loans: [] });
  stateRef.current = { products, sales, categories, expenses, orders, storeInfo, customers, suppliers, purchases, cashSessions, loans };

  const pendingRef = React.useRef<Partial<LocalDb>>({});
  const saveTimer = React.useRef<number | null>(null);

  // Auto-sync para a nuvem (incremental, com debounce)
  const cloudPushTimer = React.useRef<number | null>(null);
  const cloudDirty = React.useRef(false);
  const cloudPushing = React.useRef(false);
  const lastLocalChangeRef = React.useRef(0);

  // --- Nuvem: envia para o Firestore de forma incremental (economiza cota) ---
  const pushToCloud = (data: LocalDb, opts?: { forceFull?: boolean }) => {
    if (!SYNC_ENABLED || !cloudUser) return Promise.resolve(null);
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

  // Agenda o envio incremental para a nuvem, coalescendo mudanças rápidas
  // (ex.: importação em massa) num único envio ~2s depois da última alteração.
  const scheduleCloudPush = () => {
    if (!SYNC_ENABLED || !cloudUser) return;
    setCloudPending(true);
    if (cloudPushTimer.current) clearTimeout(cloudPushTimer.current);
    cloudPushTimer.current = window.setTimeout(() => {
      cloudPushTimer.current = null;
      if (cloudPushing.current) {
        cloudDirty.current = true; // mudou durante o envio; reenvia em seguida
        return;
      }
      cloudPushing.current = true;
      pushToCloud(stateRef.current)
        .catch(() => { /* erro já tratado dentro de pushToCloud */ })
        .finally(() => {
          cloudPushing.current = false;
          if (cloudDirty.current) {
            cloudDirty.current = false;
            scheduleCloudPush();
          }
        });
    }, 2000);
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
    scheduleCloudPush();
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
    return () => document.removeEventListener('visibilitychange', flush);
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
      showToast('Baixando dados da nuvem...');
      const cloud = await loadUserDb(cloudUser.uid);
      const full: LocalDb = {
        products: cloud.products || [],
        categories: cloud.categories || [],
        sales: cloud.sales || [],
        orders: cloud.orders || [],
        customers: cloud.customers || [],
        suppliers: cloud.suppliers || [],
        purchases: cloud.purchases || [],
        cashSessions: cloud.cashSessions || [],
        loans: cloud.loans || [],
        expenses: cloud.expenses || [],
        storeInfo: cloud.storeInfo ?? null,
        initialized: true,
      };
      await applyLoadedDb(full);
      persist(full);
      showToast('Dados da nuvem carregados. Este aparelho agora está igual ao computador.');
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
      const merged: LocalDb = {
        products: cloud.products || [],
        categories: cloud.categories || [],
        sales: cloud.sales || [],
        orders: cloud.orders || [],
        customers: cloud.customers || [],
        suppliers: cloud.suppliers || [],
        purchases: cloud.purchases || [],
        cashSessions: cloud.cashSessions || [],
        loans: cloud.loans || [],
        expenses: cloud.expenses || [],
        storeInfo: cloud.storeInfo ?? null,
        initialized: true,
      };
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

  // Sincronização automática nos DOIS sentidos: dispara pullFromCloud sozinho
  // a cada 20s, ao focar/abrir a aba e 1,5s após entrar na nuvem.
  const pullFromCloudRef = React.useRef<() => void>(() => {});
  pullFromCloudRef.current = pullFromCloud;
  useEffect(() => {
    if (!SYNC_ENABLED || !cloudUser) return;
    const tick = () => pullFromCloudRef.current();
    const interval = window.setInterval(tick, 30000);
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    const onFocus = () => tick();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    const firstPull = window.setTimeout(tick, 1500); // primeira sincronização
    return () => {
      clearInterval(interval);
      clearTimeout(firstPull);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
    };
  }, [cloudUser]);

  const handleCloudSyncNow = async () => {
    if (!SYNC_ENABLED || !cloudUser) { showToast('Sincronização desativada (modo local).'); return; }
    if (cloudPushTimer.current) { clearTimeout(cloudPushTimer.current); cloudPushTimer.current = null; }
    const db = stateRef.current as LocalDb;
    showToast('Verificando alterações para sincronizar na nuvem...');
    try {
      const res = await pushToCloud(db);
      if (res && res.uploaded === 0 && res.deleted === 0) {
        showToast('Nuvem já está atualizada (sem alterações para enviar).');
      } else {
        showToast(`Nuvem sincronizada: ${res.uploaded} enviados, ${res.deleted} removidos.`);
      }
    } catch {
      showToast('Falha ao sincronizar. Verifique a conexão e a cota do projeto Firebase.');
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

  // Recupera os dados a partir do backup embutido (/seed-backup.json):
  // - produtos/categorias: o backup vence (restaura estoque/minStock corretos),
  //   mas produtos que existem só localmente são mantidos (união por id).
  // - vendas/despesas/etc: o local vence (não perde transações), adicionando
  //   o que existir só no backup.
  // Em seguida reenvia tudo para a nuvem, corrigindo o espelho na nuvem.
  const handleRestoreBackup = async () => {
    if (restoringBackup) return;
    if (!window.confirm('Restaurar a partir do backup embutido (BASE 2)?\n\nProdutos, categorias, vendas e despesas serão SUBSTUÍDOS integralmente pelos dados limpos do backup (remove os dados atuais embaralhados). Configurações da loja e clientes são mantidas.\n\nA nuvem também será redefinida com estes dados limpos.')) {
      return;
    }
    setRestoringBackup(true);
    try {
      const res = await fetch('/seed-backup.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Não foi possível carregar o backup.');
      const backup = (await res.json()) as Partial<LocalDb>;
      const cur = stateRef.current;
      const arr = <T,>(x: T[] | undefined): T[] => (Array.isArray(x) ? x : []);
      const merged: LocalDb = {
        products: arr(backup.products).length ? (backup.products as Product[]) : cur.products,
        categories: arr(backup.categories).length ? (backup.categories as Category[]) : cur.categories,
        sales: arr(backup.sales).length ? (backup.sales as Sale[]) : cur.sales,
        expenses: arr(backup.expenses).length ? (backup.expenses as Expense[]) : cur.expenses,
        orders: cur.orders ?? [],
        storeInfo: cur.storeInfo ?? backup.storeInfo ?? null,
        customers: cur.customers ?? (backup.customers as Customer[] | undefined) ?? [],
        suppliers: cur.suppliers ?? [],
        purchases: cur.purchases ?? [],
        cashSessions: cur.cashSessions ?? [],
        loans: cur.loans ?? [],
        initialized: true,
      };
      persist(merged);
      setProducts(merged.products);
      setSales(merged.sales);
      setCategories(merged.categories);
      setExpenses(merged.expenses);
      if (cloudPushTimer.current) { clearTimeout(cloudPushTimer.current); cloudPushTimer.current = null; }
      if (SYNC_ENABLED && cloudUser) {
        try {
          const { clearUserDb, clearSyncCache } = await import('./lib/dbSync');
          await clearUserDb(cloudUser.uid);
          clearSyncCache(cloudUser.uid);
          await new Promise((r) => setTimeout(r, 400));
        } catch (_) { /* ignore cloud clear failures */ }
        pushToCloud(merged, { forceFull: true });
      }
      showToast(`Backup restaurado: ${merged.products.length} produtos e ${merged.sales.length} vendas.`);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Falha ao restaurar o backup.');
    } finally {
      setRestoringBackup(false);
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
    const newSale: Sale = {
      id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
      items: saleData.items,
      clientName: saleData.clientName,
      clientPhone: saleData.clientPhone,
      paymentMethod: saleData.paymentMethod,
      total: finalTotal,
      totalCost,
      profit,
      status: saleData.pending ? 'pending' : 'completed',
      ecommerceOrderId: saleData.ecommerceOrderId,
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

  // Import whole database from external source (MERGE: preserves existing IDs,
  // links and data; updates products matched by code/SKU or name instead of
  // wiping the store and regenerating IDs, which previously corrupted sales).
  const handleImportDatabase = (imported: { products: Product[]; sales: Sale[]; categories: Category[]; expenses?: Expense[] }) => {
    // --- Merge products by code (SKU) then by normalized name ---
    const existingByCode = new Map<string, Product>(products.map(p => [p.code.trim().toLowerCase(), p] as [string, Product]));
    const existingByName = new Map<string, Product>(products.map(p => [normalizeName(p.name), p] as [string, Product]));
    const mergedProducts: Product[] = [...products];

    for (const imp of imported.products) {
      const codeKey = imp.code.trim().toLowerCase();
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
    for (const c of imported.categories) {
      if (!catNames.has(c.name.toLowerCase())) {
        mergedCategories.push(c);
        catNames.add(c.name.toLowerCase());
      }
    }

    // --- Merge sales by id (update if same id, else append) ---
    const salesById = new Map<string, Sale>(sales.map(s => [s.id, s] as [string, Sale]));
    for (const s of imported.sales) {
      salesById.set(s.id, salesById.has(s.id) ? { ...salesById.get(s.id)!, ...s } : s);
    }
    const mergedSales = Array.from(salesById.values());

    saveProductsToStorage(mergedProducts);
    saveSalesToStorage(mergedSales);
    saveCategoriesToStorage(mergedCategories);
    if (imported.expenses) saveExpensesToStorage(imported.expenses);
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
        >
          <PackageSearch className="h-5 w-5" />
        </button>
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={darkMode ? 'Modo claro' : 'Modo escuro'}
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
                { tab: 'settings', label: 'Configurações', icon: SettingsIcon },
              ] as const).map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => { setActiveTab(item.tab); setMobileMenuOpen(false); }}
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

            {/* Tab 8: Settings */}
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

            {activeTab === 'settings' && (
              <Settings 
                products={products}
                sales={sales}
                categories={categories}
                expenses={expenses}
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
                onRestoreBackup={handleRestoreBackup}
                restoringBackup={restoringBackup}
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

    </div>
  );
}
