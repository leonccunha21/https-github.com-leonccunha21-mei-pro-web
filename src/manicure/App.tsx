import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, Calendar, DollarSign, Package, Settings as SettingsIcon,
  Scissors, ArrowLeft, Sun, Moon, Sparkles,
} from 'lucide-react';
import { ManicureDb, ClienteManicure, ServicoManicure, AgendamentoManicure, MovimentoCaixa, ProdutoEstoque } from './types';
import { emptyDb, loadManicureDb, saveManicureDb, defaultConfig } from './localDb';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Agendamentos from './pages/Agendamentos';
import Caixa from './pages/Caixa';
import Estoque from './pages/Estoque';
import Servicos from './pages/Servicos';
import Configuracoes from './pages/Configuracoes';

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

export default function ManicureApp() {
  const [db, setDb] = useState<ManicureDb>(emptyDb());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('manicure_darkMode') === 'true');
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stateRef = useRef<ManicureDb>(db);
  stateRef.current = db;

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

  const persist = useCallback((newData?: Partial<ManicureDb>) => {
    const data: ManicureDb = { ...stateRef.current, ...newData, initialized: true };
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      saveManicureDb(data).catch(() => {});
      persistTimer.current = null;
    }, 200);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const loaded = await loadManicureDb();
        setDb(loaded);
      } catch { /* ignore */ }
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

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('manicure_darkMode', String(next));
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  const goHome = () => {
    try { localStorage.removeItem('mei_pro_system_choice'); } catch { /* ignore */ }
    window.location.href = '/';
  };

  const setClientes = (clientes: ClienteManicure[]) => { setDb((d) => ({ ...d, clientes })); persist({ clientes }); };
  const setServicos = (servicos: ServicoManicure[]) => { setDb((d) => ({ ...d, servicos })); persist({ servicos }); };
  const setAgendamentos = (agendamentos: AgendamentoManicure[]) => { setDb((d) => ({ ...d, agendamentos })); persist({ agendamentos }); };
  const setMovimentos = (movimentos: MovimentoCaixa[]) => { setDb((d) => ({ ...d, movimentos })); persist({ movimentos }); };
  const setProdutos = (produtos: ProdutoEstoque[]) => { setDb((d) => ({ ...d, produtos })); persist({ produtos }); };
  const setConfig = (config: ManicureDb['config']) => { setDb((d) => ({ ...d, config })); persist({ config }); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Toaster position="top-center" />

      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <button onClick={goHome} title="Trocar de sistema" className="flex items-center gap-1 text-slate-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400">
              <ArrowLeft size={20} />
              <span className="hidden sm:inline text-sm font-medium">Trocar</span>
            </button>
            <div className="p-2 rounded-xl bg-fuchsia-600 text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight">Manicure PRO</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Gestão de salão · agendamentos, caixa, clientes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
        <nav className="hidden sm:flex gap-1 px-4 pb-2 max-w-6xl mx-auto overflow-x-auto no-scrollbar">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveTab(n.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === n.id
                  ? 'bg-fuchsia-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {n.icon}{n.label}
            </button>
          ))}
        </nav>
      </header>

      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
        <div className="flex min-w-max">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setActiveTab(n.id)}
            className={`flex flex-col items-center justify-center py-2 px-4 text-[10px] gap-0.5 min-w-[64px] ${
              activeTab === n.id ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {n.icon}
            {n.label}
          </button>
        ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-5 pb-24 sm:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && <Dashboard db={db} onNavigate={setActiveTab} />}
            {activeTab === 'clientes' && <Clientes clientes={db.clientes} agendamentos={db.agendamentos} setClientes={setClientes} />}
            {activeTab === 'agendamentos' && <Agendamentos agendamentos={db.agendamentos} clientes={db.clientes} servicos={db.servicos} setAgendamentos={setAgendamentos} setMovimentos={setMovimentos} movimentos={db.movimentos} />}
            {activeTab === 'servicos' && <Servicos servicos={db.servicos} setServicos={setServicos} />}
            {activeTab === 'caixa' && <Caixa movimentos={db.movimentos} />}
            {activeTab === 'estoque' && <Estoque produtos={db.produtos} setProdutos={setProdutos} />}
            {activeTab === 'configuracoes' && <Configuracoes config={db.config} setConfig={setConfig} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
