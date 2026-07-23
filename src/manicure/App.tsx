import { useState, useEffect, useRef, useCallback, lazy, type ReactNode, Suspense } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, Calendar, DollarSign, Package, Settings as SettingsIcon,
  Scissors, Sun, Moon, Sparkles, X, ShoppingBag, Stethoscope,
} from 'lucide-react';
import { getTrialDaysRemaining, getSubscription, startTrial, isActive as subIsActive } from '../lib/subscription';

const PlansPage = lazy(() => import('../components/PlansPage'));
import { ManicureDb, ClienteManicure, ServicoManicure, AgendamentoManicure, MovimentoCaixa, ProdutoEstoque, MensagemTemplate, MensagemEnviada, ManicureWhatsAppInstance } from './types';
import { emptyDb, loadManicureDb, saveManicureDb, saveManicureDbLocalOnly, defaultConfig, addPendingDeletion, getSyncMeta, subscribeSyncMeta, loadManicureCloudCached } from './localDb';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Agendamentos from './pages/Agendamentos';
import Caixa from './pages/Caixa';
import Estoque from './pages/Estoque';
import Servicos from './pages/Servicos';
import Configuracoes from './pages/Configuracoes';
import { useAppointmentScheduler } from './hooks/useAppointmentScheduler';

export type Tab = 'dashboard' | 'clientes' | 'agendamentos' | 'servicos' | 'caixa' | 'estoque' | 'configuracoes';

const NAV: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
  { id: 'clientes', label: 'Clientes', icon: <Users size={20} /> },
  { id: 'agendamentos', label: 'Agenda', icon: <Calendar size={20} /> },
  { id: 'servicos', label: 'Serviços', icon: <Scissors size={20} /> },
  { id: 'caixa', label: 'Caixa', icon: <DollarSign size={20} /> },
  { id: 'estoque', label: 'Estoque', icon: <Package size={20} /> },
  { id: 'configuracoes', label: 'Ajustes', icon: <SettingsIcon size={20} /> },
];

const MOBILE_MAIN: { id: Tab | 'menu'; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
  { id: 'clientes', label: 'Clientes', icon: <Users size={20} /> },
  { id: 'agendamentos', label: 'Agenda', icon: <Calendar size={20} /> },
  { id: 'caixa', label: 'Caixa', icon: <DollarSign size={20} /> },
  { id: 'menu', label: 'Menu', icon: <SettingsIcon size={20} /> },
];

export default function ManicureApp() {
  const [db, setDb] = useState<ManicureDb>(emptyDb());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('manicure_darkMode') === 'true');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');
  const [needsSubscription, setNeedsSubscription] = useState(() => {
    try { return localStorage.getItem('zm_sub_needed') === 'true'; } catch { return false; }
  });
  const [trialSub, setTrialSub] = useState<{ trialEnd?: string; status: string } | null>(() => {
    try { const raw = localStorage.getItem('zm_sub_trial'); return raw ? JSON.parse(raw) : null; } catch { return null; }
  });

  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stateRef = useRef<ManicureDb>(db);
  stateRef.current = db;

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

  // Subscription check independente (não depende do localStorage do app principal)
  useEffect(() => {
    const uid = (() => { try { return localStorage.getItem('zm_sub_uid'); } catch { return null; } })();
    const email = (() => { try { return localStorage.getItem('zm_sub_email'); } catch { return ''; } })();
    if (!uid) {
      setNeedsSubscription(false);
      return;
    }
    getSubscription(uid).then((sub) => {
      if (!sub) {
        startTrial(uid, email).then((created) => {
          if (created) {
            setTrialSub(created);
            try { localStorage.setItem('zm_sub_trial', JSON.stringify(created)); } catch {}
            try { localStorage.setItem('zm_sub_needed', 'false'); } catch {}
          }
        });
        return;
      }
      if (!subIsActive(sub.status)) {
        setNeedsSubscription(true);
        try { localStorage.setItem('zm_sub_needed', 'true'); } catch {}
        return;
      }
      if (sub.status === 'trialing') {
        const daysLeft = getTrialDaysRemaining(sub.trialEnd);
        if (daysLeft > 0) {
          setTrialSub(sub);
          try { localStorage.setItem('zm_sub_trial', JSON.stringify(sub)); } catch {}
          try { localStorage.setItem('zm_sub_needed', 'false'); } catch {}
        } else {
          setNeedsSubscription(true);
          try { localStorage.setItem('zm_sub_needed', 'true'); } catch {}
          return;
        }
      }
      setNeedsSubscription(false);
      try { localStorage.setItem('zm_sub_needed', 'false'); } catch {}
    }).catch(() => {
      // Se falhar, usa o cache do localStorage
      const cached = (() => { try { const raw = localStorage.getItem('zm_sub_trial'); return raw ? JSON.parse(raw) : null; } catch { return null; } })();
      if (cached?.status === 'trialing' && getTrialDaysRemaining(cached.trialEnd) > 0) {
        setTrialSub(cached);
        setNeedsSubscription(false);
      }
    });
  }, []);

  // Sync status
  useEffect(() => {
    getSyncMeta().then(m => setSyncStatus(m.lastSyncAt ? 'synced' : 'pending'));
    return subscribeSyncMeta((m) => {
      setSyncStatus(m.pendingDeletions && Object.values(m.pendingDeletions).some(v => v.length > 0) ? 'pending' : 'synced');
    });
  }, []);

  const persist = useCallback((newData?: Partial<ManicureDb>) => {
    const prev = stateRef.current;
    const data: ManicureDb = { ...prev, ...newData, initialized: true };

    // Detecta deleções e adiciona à fila de sync
    if (newData) {
      for (const [key, newArr] of Object.entries(newData)) {
        if (!Array.isArray(newArr)) continue;
        const oldArr = (prev as any)[key] as any[] | undefined;
        if (!oldArr) continue;
        const tableMap: Record<string, string> = {
          clientes: 'manicure_clientes', servicos: 'manicure_servicos',
          agendamentos: 'manicure_agendamentos', movimentos: 'manicure_movimentos',
          produtos: 'manicure_produtos', whatsappInstances: 'manicure_whatsapp_instances',
          mensagemTemplates: 'manicure_mensagem_templates', mensagensEnviadas: 'manicure_mensagens_enviadas',
        };
        const table = tableMap[key];
        if (!table) continue;
        const newIds = new Set(newArr.map((x: any) => x.id));
        for (const old of oldArr) {
          if (!newIds.has(old.id)) {
            addPendingDeletion(table, old.id);
          }
        }
      }
    }

    // Salva imediatamente (sem debounce) para não perder dados ao fechar aba
    saveManicureDb(data).catch((e) => {
      console.error('Falha ao salvar Manicure DB:', e);
      toast.error('Erro ao salvar dados localmente. Verifique o armazenamento.');
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const local = await loadManicureDb();
        const localTemDados = !!(local.clientes.length || local.agendamentos.length ||
          local.servicos.length || local.movimentos.length || local.produtos.length);
        const cloud = await loadManicureCloudCached();
        if (cloud && (cloud.clientes?.length || cloud.agendamentos?.length)) {
          // Merge com resolução baseada em updatedAt — o registro mais recente vence
          const mergeById = <T extends { id: string; updatedAt?: string; createdAt?: string }>(a: T[], b: T[]): T[] => {
            const map = new Map<string, T>();
            const ts = (x: T) => x.updatedAt ?? x.createdAt ?? '';
            for (const x of a) map.set(x.id, x);
            for (const x of b) {
              const existing = map.get(x.id);
              if (!existing || ts(x) >= ts(existing)) {
                map.set(x.id, x);
              }
            }
            return Array.from(map.values());
          };
          const merged: ManicureDb = {
            ...local,
            clientes: mergeById(cloud.clientes || [], local.clientes),
            servicos: mergeById(cloud.servicos || [], local.servicos),
            agendamentos: mergeById(cloud.agendamentos || [], local.agendamentos),
            movimentos: mergeById(cloud.movimentos || [], local.movimentos),
            produtos: mergeById(cloud.produtos || [], local.produtos),
            whatsappInstances: mergeById(cloud.whatsappInstances || [], local.whatsappInstances),
            mensagemTemplates: mergeById(cloud.mensagemTemplates || [], local.mensagemTemplates),
            mensagensEnviadas: mergeById(cloud.mensagensEnviadas || [], local.mensagensEnviadas),
            config: { ...defaultConfig(), ...(cloud.config || {}), ...(local.config || {}) },
          };
          setDb(merged);
          // Só persiste no IDB se o local estava vazio (primeira carga).
          if (!localTemDados) saveManicureDbLocalOnly(merged).catch(() => {});
        } else {
          setDb(local);
        }
      } catch { setDb(await loadManicureDb()); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel('manicure-sync');
    ch.onmessage = (ev) => {
      if (ev.data?.type === 'db-updated') {
        loadManicureDb().then(setDb);
      }
    };
    return () => ch.close();
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadManicureCloudCached().then((cloud) => {
          if (cloud && (cloud.clientes?.length || cloud.agendamentos?.length)) {
            const mergeByIdTs = <T extends { id: string; updatedAt?: string; createdAt?: string }>(a: T[], b: T[]): T[] => {
              const map = new Map<string, T>();
              const ts = (x: T) => x.updatedAt ?? x.createdAt ?? '';
              for (const x of a) map.set(x.id, x);
              for (const x of b) {
                const existing = map.get(x.id);
                if (!existing || ts(x) >= ts(existing)) {
                  map.set(x.id, x);
                }
              }
              return Array.from(map.values());
            };
            const cur = stateRef.current;
            const merged: ManicureDb = {
              ...cur,
              clientes: mergeByIdTs(cloud.clientes || [], cur.clientes),
              servicos: mergeByIdTs(cloud.servicos || [], cur.servicos),
              agendamentos: mergeByIdTs(cloud.agendamentos || [], cur.agendamentos),
              movimentos: mergeByIdTs(cloud.movimentos || [], cur.movimentos),
              produtos: mergeByIdTs(cloud.produtos || [], cur.produtos),
              whatsappInstances: mergeByIdTs(cloud.whatsappInstances || [], cur.whatsappInstances),
              mensagemTemplates: mergeByIdTs(cloud.mensagemTemplates || [], cur.mensagemTemplates),
              mensagensEnviadas: mergeByIdTs(cloud.mensagensEnviadas || [], cur.mensagensEnviadas),
              config: { ...defaultConfig(), ...(cloud.config || {}), ...(cur.config || {}) },
            };
            setDb(merged);
          }
        }).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('manicure_darkMode', String(next));
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  const setClientes = (clientes: ClienteManicure[]) => { setDb((d) => ({ ...d, clientes })); persist({ clientes }); };
  const setServicos = (servicos: ServicoManicure[]) => { setDb((d) => ({ ...d, servicos })); persist({ servicos }); };
  const setAgendamentos = (agendamentos: AgendamentoManicure[]) => { setDb((d) => ({ ...d, agendamentos })); persist({ agendamentos }); };
  const setMovimentos = (movimentos: MovimentoCaixa[]) => { setDb((d) => ({ ...d, movimentos })); persist({ movimentos }); };
  const setProdutos = (produtos: ProdutoEstoque[]) => { setDb((d) => ({ ...d, produtos })); persist({ produtos }); };
  const setWhatsAppInstances = (whatsappInstances: ManicureWhatsAppInstance[]) => { setDb((d) => ({ ...d, whatsappInstances })); persist({ whatsappInstances }); };
  const setMensagemTemplates = (mensagemTemplates: MensagemTemplate[]) => { setDb((d) => ({ ...d, mensagemTemplates })); persist({ mensagemTemplates }); };
  const addMensagemEnviada = (m: MensagemEnviada) => {
    setDb((d) => {
      const updated = [...d.mensagensEnviadas, m];
      persist({ mensagensEnviadas: updated });
      return { ...d, mensagensEnviadas: updated };
    });
  };
  const setConfig = (config: ManicureDb['config']) => { setDb((d) => ({ ...d, config })); persist({ config }); };

  useAppointmentScheduler({
    agendamentos: db.agendamentos, templates: db.mensagemTemplates,
    mensagensEnviadas: db.mensagensEnviadas, config: db.config,
    instances: db.whatsappInstances, onAddMensagem: addMensagemEnviada,
  });

  if (needsSubscription) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-600" />
        </div>
      }>
        <PlansPage
          uid={(() => { try { return localStorage.getItem('zm_sub_uid') || ''; } catch { return ''; } })()}
          email={(() => { try { return localStorage.getItem('zm_sub_email') || ''; } catch { return ''; } })()}
          onBack={() => { try { localStorage.removeItem('mei_pro_system_choice'); } catch {}; window.location.href = '/'; }}
        />
      </Suspense>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-600" />
      </div>
    );
  }

  const isTrialing = trialSub?.status === 'trialing';

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row text-slate-900 dark:text-slate-100 ${isTrialing ? 'pt-10' : ''}`}>
      <Toaster position="top-center" />

      {isTrialing && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-2">
            <span>
              Teste grátis — <strong>{getTrialDaysRemaining(trialSub.trialEnd)}</strong> dias restantes
            </span>
            <button
              onClick={() => setNeedsSubscription(true)}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors shrink-0"
            >
              Ver planos
            </button>
          </div>
        </div>
      )}

      {/* MOBILE TOP HEADER */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 px-4 py-3 shadow-sm">
        <div className="p-1.5 rounded-lg bg-fuchsia-600 text-white shrink-0">
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm tracking-tight leading-tight">Manicure PRO</h2>
          <span className="text-[9px] text-fuchsia-600 font-bold uppercase tracking-wider">Gestão de Salão</span>
        </div>
        <button onClick={toggleDarkMode} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 shrink-0 border-r border-slate-200 dark:border-slate-700 flex-col justify-between z-10 py-2">
        <div>
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-fuchsia-600 text-white shrink-0">
              <Sparkles size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base tracking-tight leading-tight">Manicure PRO</h2>
              <span className="text-[10px] text-fuchsia-600 font-bold uppercase tracking-wider">Gestão de Salão</span>
            </div>
            <button onClick={toggleDarkMode} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <nav className="px-3 space-y-0.5">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveTab(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === n.id
                    ? 'bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          </nav>

          {/* System switching */}
          <div className="border-t border-slate-100 dark:border-slate-700 mt-4 pt-4 px-3 space-y-0.5">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Outros Sistemas</p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/20"
            >
              <ShoppingBag size={16} />
              ZM Store
            </button>
            <button
              onClick={() => window.location.href = '/mounjaro'}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 bg-cyan-50/50 dark:bg-cyan-900/20"
            >
              <Stethoscope size={16} />
              Saúde PRO
            </button>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 space-y-1">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Manicure PRO v2.24.7</p>
          <div className="flex items-center gap-1.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${
              syncStatus === 'synced' ? 'bg-emerald-500' :
              syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' :
              'bg-amber-500'
            }`} />
            <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {syncStatus === 'synced' ? 'Sincronizado' :
               syncStatus === 'syncing' ? 'Sincronizando...' :
               'Alterações pendentes'}
            </span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && <Dashboard db={db} onNavigate={setActiveTab} setAgendamentos={setAgendamentos} setMovimentos={setMovimentos} onAddMensagem={addMensagemEnviada} />}
              {activeTab === 'clientes' && <Clientes clientes={db.clientes} agendamentos={db.agendamentos} setClientes={setClientes} />}
              {activeTab === 'agendamentos' && <Agendamentos agendamentos={db.agendamentos} clientes={db.clientes} servicos={db.servicos} setAgendamentos={setAgendamentos} setClientes={setClientes} setMovimentos={setMovimentos} movimentos={db.movimentos} instances={db.whatsappInstances} templates={db.mensagemTemplates} mensagensEnviadas={db.mensagensEnviadas} onAddMensagem={addMensagemEnviada} config={db.config} />}
              {activeTab === 'servicos' && <Servicos servicos={db.servicos} setServicos={setServicos} />}
              {activeTab === 'caixa' && <Caixa movimentos={db.movimentos} setMovimentos={setMovimentos} />}
              {activeTab === 'estoque' && <Estoque produtos={db.produtos} setProdutos={setProdutos} />}
              {activeTab === 'configuracoes' && <Configuracoes instances={db.whatsappInstances} templates={db.mensagemTemplates} mensagensEnviadas={db.mensagensEnviadas} config={db.config} setConfig={setConfig} onSaveInstances={setWhatsAppInstances} onSaveTemplates={setMensagemTemplates} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 flex items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {MOBILE_MAIN.map((item) => {
          const isMenu = item.id === 'menu';
          const isActive = activeTab === item.id && !mobileMenuOpen;
          return (
            <button
              key={item.id}
              onClick={() => isMenu ? setMobileMenuOpen(!mobileMenuOpen) : setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-1 transition-all ${
                isActive ? 'text-fuchsia-600' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-fuchsia-600 rounded-full" />}
              {item.icon}
              <span className="text-[10px] font-bold leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MOBILE SLIDE-UP MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 inset-x-0 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl p-4 pb-[env(safe-area-inset-bottom)] animate-[slideUp_0.2s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {NAV.map((item) => {
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors relative ${
                      activeTab === item.id
                        ? 'bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400'
                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.icon}
                    <span className="text-[11px] font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-slate-100 dark:border-slate-700 mt-4 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 px-1">Outros Sistemas</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider"
                >
                  <ShoppingBag size={18} />
                  ZM Store
                </button>
                <button
                  onClick={() => window.location.href = '/mounjaro'}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-cyan-50/50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider"
                >
                  <Stethoscope size={18} />
                  Saúde PRO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
