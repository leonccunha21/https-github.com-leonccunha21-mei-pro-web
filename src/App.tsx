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
  Opportunity,
  UserRole,
  AppUser,
  Bill,
  InternetUser,
} from './types';
// Nenhum seed automático: contas novas começam com 0 dados. A entrada de dados
// ocorre apenas via importação manual de planilha Excel (ver tela de Configurações).
// "uso particular": cada login (Google) acessa apenas os dados deste dispositivo;
// dados de vendas NÃO são enviados à nuvem (apenas as informações da loja).

import { lazy } from 'react';
import { ErrorBoundary, ErrorBoundaryFallback } from './components/ErrorBoundary';
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
const DRE = lazy(() => import('./components/DRE'));
const BankConciliationPage = lazy(() => import('./components/BankConciliation'));
const BillsPage = lazy(() => import('./components/Bills'));
const InternetSharingPage = lazy(() => import('./components/InternetSharing'));
const PlansPage = lazy(() => import('./components/PlansPage'));
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
  CloudOff,
  Target,
  MessageSquare,
  MessageCircle,
  Brain,
  KanbanSquare,
  Stethoscope,
  Sparkles,
  FileText,
  Building2,
  Wifi,
  Receipt,
  Keyboard,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import appVersion from '../package.json';

import { categorizeProduct } from './lib/categorize';
import { normalizeName, normalizeChannel } from './lib/normalize';
import { roundCurrency } from './lib/currency';
import { localNowISO } from './lib/datetime';
import { canAccess } from './lib/permissions';
import { loadDb, saveDb, clearSupabaseDb, type LocalDb } from './lib/localDb';
import { getBackupSchedule, shouldRunBackup, saveBackupSchedule } from './lib/backupScheduler';
import { isSupabaseConfigured } from './lib/supabase';
import { getSubscription, startTrial, getTrialDaysRemaining, isActive as subIsActive } from './lib/subscription';

// Firebase Auth é importado dinamicamente (sob demanda) para não
// penalizar o carregamento inicial do app.
import type { User } from 'firebase/auth';

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
  const [bills, setBills] = useState<Bill[]>([]);
  const [internetUsers, setInternetUsers] = useState<InternetUser[]>([]);

  const [appUsers, setAppUsers] = useState<AppUser[]>(() => {
    try { return JSON.parse(localStorage.getItem('zm_users') || '[]'); }
    catch { return []; }
  });
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('zm_current_role') as UserRole) || 'admin';
  });

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

  // --- Sincronização na nuvem (Firebase Auth only) ---
  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [trialSub, setTrialSub] = useState<{ trialEnd?: string; status: string } | null>(null);
  const [showPlansFromTrial, setShowPlansFromTrial] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(() => isSupabaseConfigured());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // Atalhos de teclado globais
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts(p => !p);
        return;
      }

      if (e.key === 'Escape') {
        setShowShortcuts(false);
        setShowVendasEstoque(false);
        setMobileMenuOpen(false);
        return;
      }

      if (e.altKey) {
        const map: Record<string, string> = {
          '1': 'dashboard', '2': 'products', '3': 'pos', '4': 'sales',
          '5': 'debtors', '6': 'customers', '7': 'reports', '8': 'bills',
          '9': 'settings',
        };
        const tab = map[e.key];
        if (tab) {
          e.preventDefault();
          setActiveTab(tab as ActiveTab);
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleDarkMode();
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Monitora conectividade (6.8)
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Atalhos de teclado (6.7)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          setActiveTab('sales');
          break;
        case '/':
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>('input[type="text"], input[placeholder*="Buscar"], input[placeholder*="buscar"]');
          searchInput?.focus();
          break;
        case 'e':
          e.preventDefault();
          setActiveTab('settings');
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cloudUser]);

  useEffect(() => {
    const color = storeInfo.primaryColor || '#4f46e5';
    document.documentElement.style.setProperty('--color-primary', color);
  }, [storeInfo.primaryColor]);

  // Load all data. The store is IndexedDB-backed (works on the static site);
  // an optional local server is used only when available.
  // Aplica os dados carregados (IndexedDB/servidor/seed) no estado da aplicação.
  // ---------------------------------------------------------------------------
  // Corrige vendas com data NO FUTURO (ex.: dez/2026 quando hoje é 19/07/2026).
  // Causa raiz: bug de fuso UTC antigo que empurrava a data para o ano seguinte.
  // Qualquer venda com data acima de hoje é travada em "agora" (data atual).
  // Roda em toda carga (local e nuvem), então o erro some definitivamente.
  const normalizeSaleDates = (salesIn: Sale[]): Sale[] => {
    const now = new Date();
    const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();
    let changed = false;
    const out = (salesIn || []).map((sa) => {
      if (!sa || !sa.date) return sa;
      const t = new Date(sa.date).getTime();
      if (!isNaN(t) && t > todayMs) {
        changed = true;
        return { ...sa, date: localNowISO() };
      }
      return sa;
    });
    return changed ? out : salesIn;
  };

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
      s = normalizeSaleDates(dbData.sales!);
      if (s !== dbData.sales) {
        // Datas corrigidas: persiste de volta para não repetir a correção.
        const fixed = { ...(dbData as LocalDb), sales: s };
        setTimeout(() => persist(fixed), 0);
      }
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
    setBills(hasDb && Array.isArray(dbData.bills) ? dbData.bills! : []);
    setInternetUsers(hasDb && Array.isArray(dbData.internetUsers) ? dbData.internetUsers! : []);

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
        let sub = await getSubscription(cloudUser.uid)
        if (!sub) {
          setNeedsSubscription(true)
          setLoading(false)
          return
        }
        if (!subIsActive(sub.status)) {
          setNeedsSubscription(true)
          setLoading(false)
          return
        }
        if (sub.status === 'trialing') {
          const daysLeft = getTrialDaysRemaining(sub.trialEnd)
          if (daysLeft > 0) {
            setTrialSub(sub)
            try { localStorage.setItem('zm_sub_trial', JSON.stringify(sub)); } catch {}
          } else {
            setNeedsSubscription(true)
            try { localStorage.setItem('zm_sub_needed', 'true'); } catch {}
            setLoading(false)
            return
          }
        }
        setNeedsSubscription(false)
        try { localStorage.setItem('zm_sub_needed', 'false'); } catch {}

        const db = await loadDb();
        const res = await applyLoadedDb(db);
        setSupabaseConnected(isSupabaseConfigured());
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
            bills: [],
            internetUsers: [],
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
          opportunities: [],
          bills: [],
          internetUsers: [],
          storeInfo: null,
          initialized: true,
        });
      } finally {
        setSubscriptionChecked(true)
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
    leads: Lead[];
    leadJobs: LeadExtractionJob[];
    whatsappInstances: WhatsAppInstance[];
    aiAgents: AIAgent[];
    opportunities: Opportunity[];
    bills: Bill[];
    internetUsers: InternetUser[];
    initialized?: boolean;
  }>({ products: [], sales: [], categories: [], expenses: [], orders: [], storeInfo: null, customers: [], suppliers: [], purchases: [], cashSessions: [], loans: [], leads: [], leadJobs: [], whatsappInstances: [], aiAgents: [], opportunities: [], bills: [], internetUsers: [] });
  stateRef.current = { products, sales, categories, expenses, orders, storeInfo, customers, suppliers, purchases, cashSessions, loans, whatsappInstances, aiAgents, opportunities, bills, internetUsers, leads, leadJobs };

  const pendingRef = React.useRef<Partial<LocalDb>>({});
  const saveTimer = React.useRef<number | null>(null);

  // --- Nuvem: envia o banco completo, SEM PERDER DADO de nenhum aparelho ---
  // Antes de subir, baixa a nuvem e faz UNIÃO por id (o mais recente vence por
  // id, mas nada é descartado). Assim os dados de OUTROS aparelhos nunca somem.
  // Depois sobe o resultado unificado. A nuvem passa a ter TUDO de todos.
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
      bills: partial.bills ?? prev.bills ?? cur.bills ?? [],
      internetUsers: partial.internetUsers ?? prev.internetUsers ?? cur.internetUsers ?? [],
      initialized: true,
    };
    pendingRef.current = merged;

    // Salva LOCALMENTE AGORA (imediato) — não perde ao recarregar.
    saveDb(merged, (cloudErr) => {
      showToast(`⚠️ Nuvem: ${cloudErr} — dados salvos localmente.`);
    }).catch((e) => {
      console.error('Erro ao salvar banco local:', e);
      showToast('Falha ao salvar os dados. Verifique o armazenamento do navegador.');
    });

    // Debounce só para o timer de "pending" (evita múltiplos saves rápidos)
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      pendingRef.current = {};
    }, 250);
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
        saveDb(db, (cloudErr) => {
          showToast(`⚠️ Nuvem: ${cloudErr} — dados salvos localmente.`);
        }).catch((e) => {
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

  const handleCloudSignIn = async () => {
    try {
      const { googleSignIn } = await import('./lib/firebase');
      await googleSignIn();
      showToast('Login realizado com sucesso!');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Falha ao entrar com o Google');
    }
  };

  const handleCloudSignOut = async () => {
    try {
      const { logoutUser } = await import('./lib/firebase');
      await logoutUser();
    } catch { /* ignore */ }
    setCloudUser(null);
  };

  const saveProductsToStorage = async (updatedProducts: Product[], _changedProduct?: Product, _isDeletedId?: string) => {
    setProducts(updatedProducts);
    persist({ products: updatedProducts });
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
      updatedAt: new Date().toISOString(),
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

  const saveBillsToStorage = (updatedBills: Bill[]) => {
    setBills(updatedBills);
    persist({ bills: updatedBills });
  };

  const saveInternetUsersToStorage = (updatedUsers: InternetUser[]) => {
    setInternetUsers(updatedUsers);
    persist({ internetUsers: updatedUsers });
  };

  const handleStoreInfoChange = (info: StoreInfo) => {
    setStoreInfo(info);
    persist({ storeInfo: info });
    window.dispatchEvent(new Event('storeInfoChanged'));
  };

  const handleAddExpense = (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newExpense: Expense = { ...expense, id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, createdAt: now, updatedAt: now };
    saveExpensesToStorage([newExpense, ...expenses]);
  };

  const handleDeleteExpense = (id: string) => {
    saveExpensesToStorage(expenses.filter(e => e.id !== id));
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    saveExpensesToStorage(expenses.map(e => e.id === updatedExpense.id ? { ...updatedExpense, updatedAt: new Date().toISOString() } : e));
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

  useEffect(() => { localStorage.setItem('zm_users', JSON.stringify(appUsers)); }, [appUsers]);
  useEffect(() => { localStorage.setItem('zm_current_role', currentUserRole); }, [currentUserRole]);

  // --- ACTIONS ---

  // Add Product
  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...newProductData,
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newProduct, ...products];
    saveProductsToStorage(updated, newProduct).catch(() => {});
  };

  // Update Product
  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => p.id === updatedProduct.id ? { ...updatedProduct, updatedAt: new Date().toISOString() } : p);
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

  /**
   * Mescla múltiplos produtos em um único "produto principal".
   * - O produto principal (keepId) recebe a soma dos estoques de todos.
   * - Todas as vendas que referenciam os ids duplicados são reapontadas para keepId.
   * - Os produtos duplicados são arquivados (soft-delete).
   */
  const handleMergeProducts = (keepId: string, duplicateIds: string[], newName: string, newCostPrice: number, newSalePrice: number) => {
    const now = new Date().toISOString();
    const keeper = products.find(p => p.id === keepId);
    if (!keeper) return;

    // Soma estoque de todos os duplicados no produto principal
    const totalStock = products
      .filter(p => p.id === keepId || duplicateIds.includes(p.id))
      .reduce((sum, p) => sum + p.stock, 0);

    const updatedProducts = products.map(p => {
      if (p.id === keepId) {
        return { ...p, name: newName, costPrice: newCostPrice, salePrice: newSalePrice, stock: totalStock, updatedAt: now };
      }
      if (duplicateIds.includes(p.id)) {
        return { ...p, archived: true, archivedAt: now, stock: 0, updatedAt: now };
      }
      return p;
    });

    // Reaponta vendas: troca productId e productName nos itens vinculados
    const duplicateSet = new Set(duplicateIds);
    const updatedSales = sales.map(sale => {
      const hasAffectedItem = sale.items.some(it => duplicateSet.has(it.productId));
      if (!hasAffectedItem) return sale;
      return {
        ...sale,
        items: sale.items.map(it =>
          duplicateSet.has(it.productId)
            ? { ...it, productId: keepId, productName: newName }
            : it
        ),
        updatedAt: now,
      };
    });

    saveProductsToStorage(updatedProducts).catch(() => {});
    saveSalesToStorage(updatedSales).catch(() => {});
  };

  const handleClearAllProducts = () => {
    const updated = products.map(p => ({ ...p, archived: true, archivedAt: new Date().toISOString() }));
    saveProductsToStorage(updated).catch(() => {});
  };

  // Add Category
  const handleAddCategory = (categoryName: string) => {
    const now = new Date().toISOString();
    const newCategory: Category = {
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: categoryName,
      createdAt: now,
      updatedAt: now,
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
    trackingCode?: string;
    saleChannel?: string;
    saleType: 'CPF' | 'CNPJ';
    notes?: string;
    pending?: boolean;
    allowNegativeStock?: boolean;
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
      trackingCode: saleData.trackingCode,
      saleChannel: saleChannelRaw || undefined,
      saleType: saleData.saleType,
      notes: saleData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3. Deduct stock quantities from inventory products
    // Se allowNegativeStock=true o estoque pode ficar negativo (venda sem restrição).
    const changedProducts: Product[] = [];
    const updatedProducts = products.map(p => {
      const soldItem = saleData.items.find(item => item.productId === p.id);
      if (soldItem) {
        const newStock = p.stock - soldItem.quantity;
        const updated = {
          ...p,
          stock: saleData.allowNegativeStock ? newStock : Math.max(0, newStock),
          updatedAt: new Date().toISOString(),
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
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;
    if (sale.status === 'cancelled') return;

    const updatedSales = sales.map(s => {
      if (s.id === saleId) {
        return {
          ...s,
          status: 'cancelled' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    const cancelledSale = sale;

    // Restore stock quantities
    const updatedProducts = products.map(p => {
      const refundedItem = cancelledSale.items.find(item => item.productId === p.id);
      if (refundedItem) {
        return {
          ...p,
          stock: p.stock + refundedItem.quantity,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    saveProductsToStorage(updatedProducts, undefined);
    saveSalesToStorage(updatedSales, { ...cancelledSale, status: 'cancelled', updatedAt: new Date().toISOString() });
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
  const handleImportDatabase = (imported: { products: Product[]; sales: Sale[]; categories: Category[]; expenses?: Expense[]; loans?: Loan[]; orders?: ServiceOrder[]; customers?: Customer[]; suppliers?: Supplier[]; purchases?: Purchase[]; cashSessions?: CashSession[]; bills?: Bill[]; internetUsers?: InternetUser[]; opportunities?: Opportunity[]; leads?: Lead[]; leadJobs?: LeadExtractionJob[]; aiAgents?: AIAgent[]; whatsappInstances?: WhatsAppInstance[] }) => {
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

    // Merge advanced entities by id (não substituir)
    const mergeById = <T extends { id: string }>(existing: T[], incoming?: T[]): T[] => {
      if (!incoming || incoming.length === 0) return existing;
      const map = new Map(existing.map(x => [x.id, x]));
      for (const x of incoming) map.set(x.id, x);
      return Array.from(map.values());
    };
    const mergedOpportunities = mergeById(opportunities, imported.opportunities);
    const mergedLeads = mergeById(leads, imported.leads);
    const mergedLeadJobs = mergeById(leadJobs, imported.leadJobs);
    const mergedAiAgents = mergeById(aiAgents, imported.aiAgents);
    const mergedWhatsappInstances = mergeById(whatsappInstances, imported.whatsappInstances);

    setProducts(mergedProducts);
    setSales(mergedSales);
    setCategories(mergedCategories);
    setExpenses(imported.expenses ? mergeById(expenses, imported.expenses) : expenses);
    setLoans(imported.loans ? mergeById(loans, imported.loans) : loans);
    setOrders(imported.orders ? mergeById(orders, imported.orders) : orders);
    setCustomers(imported.customers ? mergeById(customers, imported.customers) : customers);
    setSuppliers(imported.suppliers ? mergeById(suppliers, imported.suppliers) : suppliers);
    setPurchases(imported.purchases ? mergeById(purchases, imported.purchases) : purchases);
    setCashSessions(imported.cashSessions ? mergeById(cashSessions, imported.cashSessions) : cashSessions);
    setBills(imported.bills ? mergeById(bills, imported.bills) : bills);
    setInternetUsers(imported.internetUsers ? mergeById(internetUsers, imported.internetUsers) : internetUsers);
    setOpportunities(mergedOpportunities);
    setLeads(mergedLeads);
    setLeadJobs(mergedLeadJobs);
    setAiAgents(mergedAiAgents);
    setWhatsappInstances(mergedWhatsappInstances);
    persist({ initialized: true });
  };

  // Reset database to empty
  const handleResetDatabase = async () => {
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
    saveBillsToStorage([]);
    saveInternetUsersToStorage([]);
    setOpportunities([]);
    setLeads([]);
    setLeadJobs([]);
    setWhatsappInstances([]);
    setAiAgents([]);
    setStoreInfo({} as StoreInfo);
    persist({
      bills: [], internetUsers: [], opportunities: [],
      leads: [], leadJobs: [], whatsappInstances: [], aiAgents: [],
      storeInfo: null,
      initialized: true,
    });
    clearSupabaseDb().catch((e) => console.error('Supabase clear error:', e));
    setActiveTab('dashboard');
  };

  // Full backup: serialize the entire operational database (loans, customers,
  // marketplace flags, etc.) to a JSON file so it can be carried to another PC.
  const handleExportBackup = useCallback(() => {
    const db: LocalDb = {
      products, sales, categories, expenses, orders,
      storeInfo, customers, suppliers, purchases, cashSessions, loans,
      leads, leadJobs, whatsappInstances, aiAgents, opportunities,
      bills, internetUsers,
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
  }, [products, sales, categories, expenses, orders, storeInfo, customers, suppliers, purchases, cashSessions, loans, leads, leadJobs, whatsappInstances, aiAgents, opportunities, bills, internetUsers]);

  const handleRunScheduledBackup = useCallback(() => {
    handleExportBackup();
    saveBackupSchedule({ ...getBackupSchedule(), lastBackup: new Date().toISOString() });
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Gestão.PRO', { body: 'Backup automático concluído!' });
    }
  }, [handleExportBackup]);

  // Verifica backup ao abrir o app (funciona em Vercel/serverless onde setInterval não persiste).
  // Também mantém um polling leve de 5 min para quem deixa a aba aberta o dia todo.
  useEffect(() => {
    const check = () => {
      const prefs = getBackupSchedule();
      if (shouldRunBackup(prefs)) handleRunScheduledBackup();
    };
    check(); // verifica imediatamente ao montar
    const interval = setInterval(check, 5 * 60 * 1000); // polling a cada 5 min
    return () => clearInterval(interval);
  }, [handleRunScheduledBackup]);

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
          bills: parsed.bills || [],
          internetUsers: parsed.internetUsers || [],
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
        setOpportunities(db.opportunities);
        setBills(db.bills);
        setInternetUsers(db.internetUsers);

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
            updatedAt: new Date().toISOString(),
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
          createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        updatedProducts = [np, ...updatedProducts];
        byName.set(key, np);
      }
    }

    saveProductsToStorage(updatedProducts, undefined);
    const now = new Date().toISOString();
    savePurchasesToStorage([{ ...purchase, createdAt: purchase.createdAt || now, updatedAt: now }, ...purchases]);
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
  const billsAlertCount = useMemo(() => {
    const threeDays = Date.now() + 259200000;
    return bills.filter(b => b.status !== 'paid' && new Date(b.dueDate).getTime() <= threeDays).length;
  }, [bills]);

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
    const now = Date.now();
    const newProducts: Product[] = missingProducts.map((item, idx) => ({
      id: `p_${now}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      code: `SKU-${now}_${idx}`,
      name: item.name,
      category: suggestCategory(item.name),
      costPrice: item.costPrice,
      salePrice: item.salePrice,
      stock: 0,
      minStock: 5,
      status: 'disponivel',
      createdAt: new Date(now + idx).toISOString()
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
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }>
        <LoginScreen onSignIn={handleCloudSignIn} />
      </React.Suspense>
    );
  }

  if (needsSubscription) {
    return (
      <React.Suspense fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      }>
        <PlansPage uid={cloudUser.uid} email={cloudUser.email || ''} onBack={() => { try { localStorage.removeItem('mei_pro_system_choice'); } catch {}; window.location.href = '/'; }} />
      </React.Suspense>
    );
  }

  const isTrialing = trialSub?.status === 'trialing'
  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-200 antialiased font-sans ${isTrialing ? 'pt-10' : ''}`}>

      {isTrialing && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
            <span>
              Teste grátis — <strong>{getTrialDaysRemaining(trialSub.trialEnd)}</strong> dias restantes
            </span>
            <button
              onClick={() => setShowPlansFromTrial(true)}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors shrink-0"
            >
              Ver planos
            </button>
          </div>
        </div>
      )}

      {/* MOBILE TOP HEADER */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 px-4 py-3 shadow-sm">
        {storeInfo.logoUrl ? (
          <img src={storeInfo.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain shrink-0" />
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <div className="w-4 h-4 border-2 border-white"></div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-sm tracking-tight text-slate-950 dark:text-slate-100 truncate">{storeInfo.name || 'ZM Store'}</h2>
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${supabaseConnected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} title={supabaseConnected ? 'Supabase conectado' : 'Modo local'} />
          </div>
          <span className="text-[9px] text-primary font-bold uppercase tracking-wider">Gestão Comercial</span>
        </div>
        <button
          onClick={() => setShowVendasEstoque(true)}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors cursor-pointer"
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
                  ? 'text-primary'
                  : 'text-slate-400 dark:text-slate-500 active:text-slate-600'
              }`}
            >
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />}
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
                { tab: 'dre', label: 'DRE', icon: FileText },
                { tab: 'cashflow', label: 'Fluxo de Caixa', icon: DollarSign },
                { tab: 'os', label: 'OS / Orçamento', icon: ClipboardList },
                { tab: 'debtors', label: 'Devedores', icon: Users },
                { tab: 'customers', label: 'Clientes', icon: Users },
                { tab: 'cashclosing', label: 'Fechamento', icon: Wallet },
                { tab: 'leads', label: 'Leads', icon: Target },
                { tab: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                { tab: 'ai', label: 'Inteligência Artificial', icon: Brain },
                { tab: 'conciliation', label: 'Conciliação', icon: Building2 },
                { tab: 'bills', label: 'Contas', icon: Receipt },
                { tab: 'internet', label: 'Internet', icon: Wifi },
                { tab: 'manicure', label: 'Manicure PRO', icon: Sparkles },
                { tab: 'mounjaro', label: 'Saúde PRO', icon: Stethoscope },
                { tab: 'settings', label: 'Configurações', icon: SettingsIcon },
              ] as const).map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.tab}
                    onClick={() => {
                     if (item.tab === 'manicure') { setMobileMenuOpen(false); window.location.href = '/manicure'; return; }
                     if (item.tab === 'mounjaro') { setMobileMenuOpen(false); window.location.href = '/mounjaro'; return; }
                     setActiveTab(item.tab); setMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors relative"
                  >
                    <Icon className="h-6 w-6 text-primary" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                    {item.tab === 'bills' && billsAlertCount > 0 && (
                      <span className="absolute top-1 right-1 text-[9px] font-bold px-1 py-0.5 rounded-full bg-rose-500 text-white min-w-[16px] text-center leading-tight">
                        {billsAlertCount > 99 ? '99+' : billsAlertCount}
                      </span>
                    )}
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
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shrink-0">
                <div className="w-4 h-4 border-2 border-white"></div>
              </div>
            )}
            <div className="flex-1">
              <h2 className="font-bold text-base tracking-tight text-slate-950 dark:text-slate-100">{storeInfo.name || 'ZM Store'}</h2>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Gestão Comercial</span>
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
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors cursor-pointer"
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
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Painel Geral
            </button>

            {canAccess('products', currentUserRole) && (<>
            {/* Tab 2: Products */}
            <button
              id="nav-products"
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'products' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Package className="h-4 w-4" />
              Estoque
            </button>
            </>)}
            {canAccess('pdv', currentUserRole) && (<>
            <button
              id="nav-pos"
              onClick={() => setActiveTab('pos')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'pos' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Frente de Caixa
            </button>
            </>)}

            {/* Tab 4: Sales History (com submenu Devedores) */}
            <div>
              <button
                id="nav-sales"
                onClick={() => setActiveTab('sales')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'sales' 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
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
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
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
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="h-4 w-4" />
                Clientes
              </button>
            </div>

            {canAccess('reports', currentUserRole) && (<>
            {/* Tab 5: Reports */}
            <button
              id="nav-reports"
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'reports' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Relatórios
            </button>
            </>)}

            {canAccess('dre', currentUserRole) && (<>
            {/* Tab: DRE */}
            <button
              id="nav-dre"
              onClick={() => setActiveTab('dre')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'dre' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" />
              DRE
            </button>
            </>)}

            {canAccess('cash_flow', currentUserRole) && (<>
            {/* Tab: Fluxo de Caixa */}
            <button
              id="nav-cashflow"
              onClick={() => setActiveTab('cashflow')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'cashflow' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Fluxo de Caixa
            </button>
            </>)}

            {canAccess('cash_closing', currentUserRole) && (<>
            {/* Tab: Fechamento de Caixa */}
            <button
              id="nav-cashclosing"
              onClick={() => setActiveTab('cashclosing')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'cashclosing' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Wallet className="h-4 w-4" />
              Fechamento de Caixa
            </button>
            </>)}

            {canAccess('bills', currentUserRole) && (<>
            {/* Tab: Contas */}
            <button
              id="nav-bills"
              onClick={() => setActiveTab('bills')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'bills'
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Receipt className="h-4 w-4" />
              <span className="flex-1 text-left">Contas</span>
              {billsAlertCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white min-w-[18px] text-center leading-tight">
                  {billsAlertCount > 99 ? '99+' : billsAlertCount}
                </span>
              )}
            </button>
            </>)}

            {canAccess('internet_sharing', currentUserRole) && (<>
            {/* Tab: Internet Compartilhada */}
            <button
              id="nav-internet"
              onClick={() => setActiveTab('internet')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'internet'
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Wifi className="h-4 w-4" />
              Internet
            </button>
            </>)}

            {canAccess('os_orcamento', currentUserRole) && (<>
            {/* Tab 6: OS & Orçamentos */}
            <button
              id="nav-os"
              onClick={() => setActiveTab('os')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'os' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              OS / Orçamento
            </button>
            </>)}

            {canAccess('settings', currentUserRole) && (<>
            {/* Tab: Configurações */}
            <button
              id="nav-settings"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'settings' 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <SettingsIcon className="h-4 w-4" />
              Configurações
            </button>
            </>)}

            {/* Separator: Módulos Avançados */}
            <div className="pt-3 pb-1">
              <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest px-3">Módulos Avançados</span>
            </div>

            {canAccess('leads', currentUserRole) && (<>
            {/* Tab: Leads */}
            <button
              id="nav-leads"
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Target className="h-4 w-4" />
              Leads
            </button>
            </>)}

            {canAccess('funnel', currentUserRole) && (<>
            {/* Tab: Funil de Vendas */}
            <button
              id="nav-funnel"
              onClick={() => setActiveTab('funnel')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'funnel'
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <KanbanSquare className="h-4 w-4" />
              Funil de Vendas
            </button>
            </>)}

            {canAccess('whatsapp', currentUserRole) && (<>
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
            </>)}

            {canAccess('ai', currentUserRole) && (<>
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
            </>)}

            {canAccess('bank_conciliation', currentUserRole) && (<>
            {/* Tab: Conciliação Bancária */}
            <button
              id="nav-conciliation"
              onClick={() => setActiveTab('conciliation')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'conciliation'
                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Conciliação
            </button>
            </>)}

            {/* Subsite Manicure PRO */}
            <button
              onClick={() => setShowChooser(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-fuchsia-700 dark:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/30 bg-fuchsia-50/50 dark:bg-fuchsia-900/20"
            >
              <Sparkles className="h-4 w-4" />
              Manicure PRO
            </button>

            {/* Subsite Saúde PRO */}
            <button
              onClick={() => setShowChooser(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 bg-cyan-50/50 dark:bg-cyan-900/20"
            >
              <Stethoscope className="h-4 w-4" />
              Saúde PRO
            </button>
          </nav>
        </div>

        {/* Local mode indicator + Offline badge */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 space-y-2">
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${
            !isOnline
              ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
              : 'bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
              !isOnline ? 'bg-rose-500' : 'bg-emerald-600'
            }`}>
              {!isOnline ? <CloudOff className="h-4 w-4" /> : <HardDrive className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate leading-snug">
                {!isOnline ? 'Offline' : 'Modo Local'}
              </p>
              <span className={`text-[10px] font-bold flex items-center gap-1 ${
                !isOnline ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  !isOnline ? 'bg-rose-500' : 'bg-emerald-500'
                }`}></span>
                {!isOnline ? 'Sem conexão com a internet' : 'Banco de dados no seu PC'}
              </span>
            </div>
          </div>

        </div>

        {/* Indicador de conexão Supabase */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div className={`w-2 h-2 rounded-full shrink-0 ${supabaseConnected ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                {supabaseConnected ? 'Supabase conectado' : 'Modo local'}
              </p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
                {supabaseConnected ? 'Dados sincronizados na nuvem' : 'Dados salvos apenas neste dispositivo'}
              </p>
            </div>
          </div>
        </div>

        {/* Role Selector */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Função</span>
              <select
                value={currentUserRole}
                onChange={e => setCurrentUserRole(e.target.value as UserRole)}
                className="text-xs bg-transparent border border-slate-200 dark:border-slate-600 rounded px-1 py-0.5 text-slate-700 dark:text-slate-300"
              >
                <option value="admin">Admin</option>
                <option value="gerente">Gerente</option>
                <option value="vendedor">Vendedor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer info box (time, date and version) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 space-y-1.5 hidden md:block m-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary" />
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
                bills={bills}
                onNavigate={(tab) => {
                  if (tab === 'products') setActiveTab('products');
                  if (tab === 'pos') setActiveTab('pos');
                  if (tab === 'sales') setActiveTab('sales');
                  if (tab === 'bills') setActiveTab('bills');
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
                onMergeProducts={handleMergeProducts}
              />
            )}

            {activeTab === 'pos' && (
              <ErrorBoundary
                fallback={ErrorBoundaryFallback}
                onReset={() => {}}
              >
                <Sales 
                  products={products} 
                  customers={customers}
                  onRegisterSale={handleRegisterSale}
                  onNavigate={(tab) => {
                    if (tab === 'products') setActiveTab('products');
                  }}
                />
              </ErrorBoundary>
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

            {activeTab === 'dre' && (
              <DRE
                sales={sales}
                expenses={expenses}
              />
            )}

            {activeTab === 'os' && (
              <OsOrcamento
                products={products}
                storeInfo={storeInfo as StoreInfo}
                orders={orders}
                onOrdersChange={saveOrdersToStorage}
                onConvertToSale={(order) => {
                  const items: SaleItem[] = order.items.map(item => {
                    const product = products.find(p =>
                      p.name.toLowerCase() === item.description.toLowerCase()
                    );
                    return {
                      productId: product?.id || `conv_${item.id}`,
                      productName: item.description,
                      quantity: item.quantity,
                      costPrice: product?.costPrice || 0,
                      salePrice: item.unitPrice,
                      total: item.total,
                    };
                  });
                  const total = items.reduce((a, i) => a + i.total, 0);
                  const totalCost = items.reduce((a, i) => a + i.costPrice * i.quantity, 0);
                  const newSale: Sale = {
                    id: `sale_${Date.now()}`,
                    date: new Date().toISOString(),
                    items,
                    clientName: order.clientName || undefined,
                    clientPhone: order.clientPhone || undefined,
                    paymentMethod: 'money',
                    total,
                    totalCost,
                    profit: total - totalCost,
                    status: 'pending',
                    saleType: 'CPF',
                    notes: `Convertido do orçamento Nº ${order.number}`,
                    createdAt: new Date().toISOString(),
                  };
                  setSales(prev => [newSale, ...prev]);
                  persist({ sales: [newSale, ...sales] });
                  showToast('Orçamento convertido em venda com sucesso!');
                }}
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

            {activeTab === 'conciliation' && (
              <BankConciliationPage
                sales={sales}
                expenses={expenses}
              />
            )}

            {activeTab === 'bills' && (
              <BillsPage
                bills={bills}
                onSaveBills={saveBillsToStorage}
              />
            )}

            {activeTab === 'internet' && (
              <InternetSharingPage
                internetUsers={internetUsers}
                onSaveInternetUsers={saveInternetUsersToStorage}
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
                onRunScheduledBackup={handleRunScheduledBackup}
                onResetDatabase={handleResetDatabase}
                cloudUser={cloudUser}
                onCloudSignIn={handleCloudSignIn}
                onCloudSignOut={handleCloudSignOut}
                appUsers={appUsers}
                currentUserRole={currentUserRole}
                onAppUsersChange={setAppUsers}
                onCurrentUserRoleChange={setCurrentUserRole}
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

      {/* PlansPage overlay from trial banner */}
      {showPlansFromTrial && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-slate-900">
          <React.Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          }>
            <PlansPage uid={cloudUser.uid} email={cloudUser.email || ''} onBack={() => setShowPlansFromTrial(false)} />
          </React.Suspense>
        </div>
      )}

      {/* Toast de erro de persistência (M6) */}
      {toastMsg && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold">
          {toastMsg}
        </div>
      )}

      {/* MODAL: Atalhos de Teclado */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <Keyboard className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Atalhos do Teclado</h2>
              </div>
              <button onClick={() => setShowShortcuts(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { keys: 'Alt + 1-9', desc: 'Navegar entre as abas' },
                { keys: 'Ctrl/Cmd + M', desc: 'Alternar modo escuro' },
                { keys: '?', desc: 'Abrir/fechar esta ajuda' },
                { keys: 'Esc', desc: 'Fechar modais' },
              ].map(item => (
                <div key={item.keys} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold rounded border border-slate-200 dark:border-slate-600">
                    {item.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Toaster position="bottom-right" />
    </div>
  );
}

