import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, Syringe, Scale, Wallet, Sun, Moon, Info,
  Stethoscope, LogOut, Cloud, CloudOff, AlertTriangle, FileText, Bell, Camera, History, Settings,
  ShoppingBag, Sparkles,
} from 'lucide-react';
import { MounjaroDb, ClienteMounjaro, PesagemMounjaro, DoseMounjaro, PagamentoMounjaro, FotoEvolucao } from './types';
import { emptyDb, loadMounjaroDb, saveMounjaroDb, saveMounjaroDbLocalOnly, defaultConfig } from './localDb';
import { loadMounjaroCloud, saveMounjaroCloud, clearMounjaroSyncProgress, MounjaroScope, ClinicaDoc, criarClinica, buscarClinica } from './dbSync';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Doses from './pages/Doses';
import Peso from './pages/Peso';
import Pagamentos from './pages/Pagamentos';
import Referencia from './pages/Referencia';
import Relatorio from './pages/Relatorio';
import Fotos from './pages/Fotos';
import Auditoria from './pages/Auditoria';
import Configuracoes from './pages/Configuracoes';
import { initAuth, googleSignIn, logoutUser } from '../lib/firebase';
import { criarRegistroAuditoria } from './lib';
import type { User } from 'firebase/auth';

export type Tab = 'dashboard' | 'clientes' | 'doses' | 'peso' | 'pagamentos' | 'relatorio' | 'fotos' | 'auditoria' | 'configuracoes' | 'referencia';

// Extrai uma mensagem legível de qualquer erro (incluindo o objeto JSON
// serializado por handleFirestoreError) para exibir ao usuário no toast.
function errMsg(e: unknown): string {
  if (!e) return 'erro desconhecido';
  if (typeof e === 'string') {
    try { const o = JSON.parse(e); return o?.error || e; } catch { return e; }
  }
  if (e instanceof Error) return e.message;
  return String(e);
}

const NAV: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
  { id: 'clientes', label: 'Clientes', icon: <Users size={20} /> },
  { id: 'doses', label: 'Doses', icon: <Syringe size={20} /> },
  { id: 'peso', label: 'Peso', icon: <Scale size={20} /> },
  { id: 'pagamentos', label: 'Pagamentos', icon: <Wallet size={20} /> },
  { id: 'relatorio', label: 'Relatório', icon: <FileText size={20} /> },
  { id: 'fotos', label: 'Fotos', icon: <Camera size={20} /> },
  { id: 'auditoria', label: 'Auditoria', icon: <History size={20} /> },
  { id: 'configuracoes', label: 'Ajustes', icon: <Settings size={20} /> },
  { id: 'referencia', label: 'Referência', icon: <Info size={20} /> },
];

export default function MounjaroApp() {
  const [db, setDb] = useState<MounjaroDb>(emptyDb());
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('mounjaro_darkMode') === 'true');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clinica, setClinica] = useState<ClinicaDoc | null>(() => {
    const raw = localStorage.getItem('mounjaro_clinica');
    return raw ? (JSON.parse(raw) as ClinicaDoc) : null;
  });
  const [showClinicaModal, setShowClinicaModal] = useState(false);

  const timerRef = useRef<number | null>(null);
  const [timerState, setTimerState] = useState<number | null>(null);

  const stateRef = useRef<MounjaroDb>(db);
  stateRef.current = db;

  // --- Persistência local (IndexedDB) + nuvem (Firebase) ---
  const getScope = useCallback((): MounjaroScope | null => {
    if (!cloudUser) return null;
    return clinica
      ? { tipo: 'clinica', clinicaId: clinica.id }
      : { tipo: 'user', uid: cloudUser.uid };
  }, [cloudUser, clinica]);

  const syncAgora = useCallback(() => {
    const scope = getScope();
    if (!scope) return;
    setSyncing(true);
    import('./dbSync').then(({ syncMounjaroThrottled }) =>
      syncMounjaroThrottled(scope, { ...stateRef.current, initialized: true })
    ).then((res) => {
      setLastSync(new Date().toISOString());
      if (res.finished) toast.success(`Sincronizado: ${res.uploaded} registros enviados à nuvem.`);
      else toast(`Enviados ${res.uploaded} hoje. Cota diária atingida — o resto continua amanhã.`);
    }).catch((e) => {
      console.error('Falha ao sincronizar Mounjaro:', e);
      toast.error('Falha ao sincronizar com a nuvem: ' + errMsg(e));
    }).finally(() => setSyncing(false));
  }, [getScope]);

  // Sincronização COMPLETA: reenvia TODOS os dados de uma vez (ignora o progresso
  // de lotes). Usado para garantir que nada fique preso só no dispositivo.
  const syncTudoAgora = useCallback(() => {
    const scope = getScope();
    if (!scope) return;
    setSyncing(true);
    import('./dbSync').then(({ saveMounjaroCloud, clearMounjaroSyncProgress }) => {
      clearMounjaroSyncProgress(scope);
      return saveMounjaroCloud(scope, { ...stateRef.current, initialized: true });
    }).then(() => {
      setLastSync(new Date().toISOString());
      toast.success('Todos os dados foram enviados à nuvem com sucesso.');
    }).catch((e) => {
      console.error('Falha ao sincronizar Mounjaro:', e);
      toast.error('Falha ao sincronizar com a nuvem: ' + errMsg(e));
    }).finally(() => setSyncing(false));
  }, [getScope]);

  // persist aceita os dados explicitamente (evita stale closure do stateRef após setDb)
  const persist = useCallback((newData?: Partial<MounjaroDb>) => {
    // Salva LOCALMENTE de forma IMEDIATA (sem debounce) para não perder
    // dados ao recarregar a página. O envio à nuvem continua com debounce.
    const data: MounjaroDb = { ...stateRef.current, ...newData, initialized: true };
    saveMounjaroDb(data).catch(() => {});

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      // Sincroniza com a nuvem em lotes (se logado) — respeita a cota diária.
      const scope = getScope();
      if (scope) {
        setSyncing(true);
        import('./dbSync').then(({ syncMounjaroThrottled }) => syncMounjaroThrottled(scope, data))
          .then((res) => {
            setLastSync(new Date().toISOString());
            if (!res.finished) console.warn('Sincronização Mounjaro pausou por cota diária; retoma amanhã.');
          })
          .catch((e) => { console.error('Falha ao sincronizar Mounjaro:', e); toast.error('Falha ao sincronizar com a nuvem: ' + errMsg(e)); })
          .finally(() => setSyncing(false));
      }
      timerRef.current = null;
      setTimerState(null);
    }, 400);
    setTimerState(timerRef.current);
  }, [getScope]);

  // BUG-14 fix: deps corretas para aplicar dark mode na montagem E em mudanças externas.
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

  // Observa autenticação
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let cancelled = false;
    import('../lib/firebase').then(({ initAuth }) => {
      if (cancelled) return;
      setAuthReady(true);
      unsub = initAuth(
        (user) => setCloudUser(user),
        () => setCloudUser(null)
      );
    }).catch(() => setAuthReady(true));
    return () => { cancelled = true; if (unsub) unsub(); };
  }, []);

  // Só considera "vazio" (e reseta) se TODAS as coleções estiverem vazias.
  // Nunca apaga dados parciais (ex.: só doses/pesagens sem clientes), para
  // evitar perda acidental de pagamentos/doses/fotos já registrados.
  const sanitizar = useCallback((dbIn: MounjaroDb): MounjaroDb => {
    const temAlgumDado =
      dbIn.clientes.length || dbIn.doses.length || dbIn.pesagens.length ||
      dbIn.pagamentos.length || dbIn.fotos.length || dbIn.auditoria.length;
    if (temAlgumDado) return { ...dbIn, initialized: true };
    return { ...emptyDb(), initialized: true };
  }, []);

  // Merge por id: o SEGUNDO argumento prevalece em conflito de id.
  // Usamos (nuvem, local) para que o LOCAL (mais atual no dispositivo) prevaleça
  // sobre a nuvem — assim uma nuvem vazia/parcial nunca apaga o que está salvo
  // no navegador. A nuvem só contribui com ids que o local ainda não tem.
  const mergePorId = <T extends { id: string }>(a: T[], b: T[]): T[] => {
    const map = new Map<string, T>();
    for (const x of a) map.set(x.id, x);
    for (const x of b) map.set(x.id, x); // b (local) prevalece em conflito de id
    return Array.from(map.values());
  };

  // Carrega dados (local + nuvem) quando o usuário está logado
  useEffect(() => {
    if (!authReady) return;
    if (!cloudUser) { setLoading(false); return; }
    const scope = getScope();
    if (!scope) { setLoading(false); return; }
    (async () => {
      try {
        // 1. IndexedDB local — fonte de verdade primária (inclui deleções locais).
        const localRaw = await loadMounjaroDb();
        const local = sanitizar(localRaw);
        const localTemDados = !!(local.clientes.length || local.doses.length || local.pesagens.length ||
          local.pagamentos.length || local.fotos.length || local.auditoria.length);
        // 2. Nuvem
        const cloud = await loadMounjaroCloud(scope);
        // 3. Estado em memória (pode ter dados ainda não gravados no local/nuvem)
        const mem = stateRef.current || emptyDb();
        // Merge: local PREVALECE. A nuvem só contribui com IDs que o local não tem
        // (novos registros criados em outro dispositivo). Nunca sobrescreve deleções locais.
        const merged: MounjaroDb = {
          clientes: mergePorId(mergePorId(cloud.clientes || [], mem.clientes), local.clientes),
          pesagens: mergePorId(mergePorId(cloud.pesagens || [], mem.pesagens), local.pesagens),
          doses: mergePorId(mergePorId(cloud.doses || [], mem.doses), local.doses),
          pagamentos: mergePorId(mergePorId(cloud.pagamentos || [], mem.pagamentos), local.pagamentos),
          fotos: mergePorId(mergePorId(cloud.fotos || [], mem.fotos), local.fotos),
          auditoria: mergePorId(mergePorId(cloud.auditoria || [], mem.auditoria), local.auditoria),
          config: { ...defaultConfig(), ...(cloud.config || {}), ...(mem.config || {}), ...(local.config || {}) },
          initialized: true,
        };
        // Só sobrescreve o estado se houver dados; caso contrário mantém o que já está em memória.
        const temDados = !!(merged.clientes.length || merged.doses.length || merged.pesagens.length ||
          merged.pagamentos.length || merged.fotos.length || merged.auditoria.length);
        setDb(temDados ? merged : mem);
        // FIX bug deleção: só persiste o merged no IndexedDB se o local estava vazio
        // (primeira carga / IDB limpo). Se o local já tinha dados, o IDB já está
        // correto (inclui as deleções) — NÃO sobreescrever evita que a nuvem
        // ressuscite registros deletados localmente.
        if (!localTemDados && temDados) {
          saveMounjaroDbLocalOnly(merged).catch(() => {});
        }
        setLastSync(new Date().toISOString());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [authReady, cloudUser, getScope, sanitizar]);

  // Re-sync entre abas
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel('mounjaro-sync');
    ch.onmessage = (ev) => {
      if (ev.data?.type === 'db-updated' && timerRef.current === null) {
        loadMounjaroDb().then(setDb);
      }
    };
    return () => ch.close();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('mounjaro_darkMode', String(next));
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (e: unknown) {
      setCloudError(e instanceof Error ? e.message : 'Falha ao entrar com o Google');
    }
  };

  const handleSignOut = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    setCloudUser(null);
    setLastSync(null);
    setCloudError(null);
  };

  // --- Gestão de clínica (espaço compartilhado da equipe) ---
  const [clinicaLoading, setClinicaLoading] = useState(false);

  const entrarClinica = async (codigo: string) => {
    if (!cloudUser) return;
    setClinicaLoading(true);
    try {
      const doc = await buscarClinica(codigo);
      if (!doc) { toast.error('Clínica não encontrada para este código.'); return; }
      setClinica(doc);
      localStorage.setItem('mounjaro_clinica', JSON.stringify(doc));
      toast.success(`Entrou na clínica "${doc.nome}".`);
      setShowClinicaModal(false);
      // recarrega dados da nova clínica
      setLoading(true);
      const cloud = await loadMounjaroCloud({ tipo: 'clinica', clinicaId: doc.id });
      const localRaw = await loadMounjaroDb();
      const merged: MounjaroDb = {
          clientes: mergePorId(cloud.clientes || [], localRaw.clientes),
          pesagens: mergePorId(cloud.pesagens || [], localRaw.pesagens),
          doses: mergePorId(cloud.doses || [], localRaw.doses),
          pagamentos: mergePorId(cloud.pagamentos || [], localRaw.pagamentos),
          fotos: mergePorId(cloud.fotos || [], localRaw.fotos),
          auditoria: mergePorId(cloud.auditoria || [], localRaw.auditoria),
          config: { ...defaultConfig(), ...(cloud.config || {}), ...(localRaw.config || {}) },
          initialized: true,
        };
      setDb(merged);
      saveMounjaroDb(merged).catch(() => {});
      setLoading(false);
    } catch (e) {
      toast.error('Erro ao entrar na clínica.');
    } finally {
      setClinicaLoading(false);
    }
  };

  const criarNovaClinica = async (nome: string) => {
    if (!cloudUser) return;
    setClinicaLoading(true);
    try {
      const doc = await criarClinica(nome, cloudUser.uid);
      setClinica(doc);
      localStorage.setItem('mounjaro_clinica', JSON.stringify(doc));
      toast.success(`Clínica "${doc.nome}" criada. Código: ${doc.codigo}`);
      setShowClinicaModal(false);
    } catch (e) {
      toast.error('Erro ao criar clínica.');
    } finally {
      setClinicaLoading(false);
    }
  };

  const sairClinica = () => {
    setClinica(null);
    localStorage.removeItem('mounjaro_clinica');
    toast('Saiu do espaço compartilhado. Voltou ao seu armazenamento pessoal.');
    if (cloudUser) {
      setLoading(true);
      const scope: MounjaroScope = { tipo: 'user', uid: cloudUser.uid };
      (async () => {
        try {
          const [cloud, local] = await Promise.all([loadMounjaroCloud(scope), loadMounjaroDb()]);
          const merged: MounjaroDb = {
            clientes: mergePorId(cloud.clientes || [], local.clientes),
            pesagens: mergePorId(cloud.pesagens || [], local.pesagens),
            doses: mergePorId(cloud.doses || [], local.doses),
            pagamentos: mergePorId(cloud.pagamentos || [], local.pagamentos),
            fotos: mergePorId(cloud.fotos || [], local.fotos),
            auditoria: mergePorId(cloud.auditoria || [], local.auditoria),
            config: { ...defaultConfig(), ...(cloud.config || {}), ...(local.config || {}) },
            initialized: true,
          };
          // local prevalece — mesma lógica do useEffect de carga: não sobrescreve IDB
          // com o merged (que pode ter dados da nuvem mais antigos do que o local)
          setDb(merged);
          saveMounjaroDbLocalOnly(merged).catch(() => {});
        } catch { /* ignora — mantém o estado atual */ }
        finally { setLoading(false); }
      })();
    }
  };

  // --- Setters por entidade ---
  // Passa os dados explicitamente ao persist para evitar stale closure do stateRef
  const setClientes = (clientes: ClienteMounjaro[]) => { setDb((d) => ({ ...d, clientes })); persist({ clientes }); };
  const setPesagens = (pesagens: PesagemMounjaro[]) => { setDb((d) => ({ ...d, pesagens })); persist({ pesagens }); };
  const setDoses = (doses: DoseMounjaro[]) => { setDb((d) => ({ ...d, doses })); persist({ doses }); };
  const setPagamentos = (pagamentos: PagamentoMounjaro[]) => { setDb((d) => ({ ...d, pagamentos })); persist({ pagamentos }); };
  const setFotos = (fotos: FotoEvolucao[]) => { setDb((d) => ({ ...d, fotos })); persist({ fotos }); };
  const setConfig = (config: MounjaroDb['config']) => { setDb((d) => ({ ...d, config })); persist({ config }); };

  // Setter atômico: atualiza MÚLTIPLAS entidades de uma vez em um único persist.
  // Usado pela exclusão de cliente (que filtra clientes + pesagens + doses + pagamentos + fotos).
  const setDbAtomico = (patch: Partial<MounjaroDb>) => {
    setDb((d) => ({ ...d, ...patch }));
    persist(patch);
  };

  // Registro de auditoria: histórico de alterações críticas.
  const nomeUsuario = cloudUser?.displayName || cloudUser?.email || 'usuário';
  const logAuditoria = useCallback(
    (params: { entidade: 'cliente' | 'dose' | 'pagamento' | 'pesagem' | 'foto'; acao: 'criar' | 'editar' | 'excluir'; resumo: string; clienteId?: string; refId?: string }) => {
      const auditoria = criarRegistroAuditoria({ ...params, usuario: nomeUsuario }, stateRef.current.auditoria);
      setDb((d) => ({ ...d, auditoria }));
      persist({ auditoria });
    },
    [nomeUsuario, persist]
  );

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ ...db, initialized: true }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mounjaro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exportado.');
  };

  const importBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<MounjaroDb>;
        if (!window.confirm('Importar este backup? Isso substituirá todos os dados atuais do Saúde PRO neste navegador e na nuvem.')) return;
        const merged: MounjaroDb = {
          clientes: parsed.clientes || [],
          pesagens: parsed.pesagens || [],
          doses: parsed.doses || [],
          pagamentos: parsed.pagamentos || [],
          fotos: parsed.fotos || [],
          auditoria: parsed.auditoria || [],
          config: { ...defaultConfig(), ...(parsed.config || {}) },
          initialized: true,
        };
        setDb(merged);
        persist(merged);
        toast.success('Backup importado e sincronizado.');
      } catch {
        toast.error('Arquivo de backup inválido.');
      }
    };
    reader.readAsText(file);
  };

  // --- Telas de loading / auth ---
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600" />
      </div>
    );
  }

  if (!cloudUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center gap-6">
          <div className="w-14 h-14 bg-cyan-600 rounded-2xl flex items-center justify-center text-white">
            <Stethoscope className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">Saúde PRO</h1>
              <p className="text-xs text-cyan-600 font-bold uppercase tracking-wider mt-0.5">Controle de Tratamento</p>
          </div>
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Faça login com sua conta Google para acessar e sincronizar seus dados na nuvem.
          </div>
          {cloudError && (
            <div className="w-full text-center text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg py-2 px-3">
              {cloudError}
            </div>
          )}
          <button
            onClick={handleSignIn}
            className="w-full py-3 px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </button>
          <button onClick={() => { localStorage.removeItem('mei_pro_system_choice'); window.location.href = '/'; }}
            className="text-xs text-slate-400 hover:text-cyan-600">
            ← Voltar à escolha de sistema
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600" />
      </div>
    );
  }

  const MOBILE_MAIN: { id: Tab | 'menu'; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
    { id: 'clientes', label: 'Clientes', icon: <Users size={20} /> },
    { id: 'doses', label: 'Doses', icon: <Syringe size={20} /> },
    { id: 'peso', label: 'Peso', icon: <Scale size={20} /> },
    { id: 'menu', label: 'Menu', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col md:flex-row text-slate-900 dark:text-slate-100">
      <Toaster position="top-center" />

      {/* MOBILE TOP HEADER */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 px-4 py-3 shadow-sm">
        <div className="p-1.5 rounded-lg bg-cyan-600 text-white shrink-0">
          <Stethoscope size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm tracking-tight leading-tight">Saúde PRO</h2>
          <span className="text-[9px] text-cyan-600 font-bold uppercase tracking-wider">Controle de Tratamento</span>
        </div>
        <button onClick={toggleDarkMode} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 shrink-0 border-r border-slate-200 dark:border-slate-700 flex-col justify-between z-10 py-2">
        <div>
          <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-cyan-600 text-white shrink-0">
              <Stethoscope size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base tracking-tight leading-tight">Saúde PRO</h2>
              <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider">Controle de Tratamento</span>
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
                    ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
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
              onClick={() => window.location.href = '/manicure'}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-fuchsia-700 dark:text-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/30 bg-fuchsia-50/50 dark:bg-fuchsia-900/20"
            >
              <Sparkles size={16} />
              Manicure PRO
            </button>
          </div>
        </div>

        {/* Sidebar footer: sync + tools */}
        <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
          {clinica ? (
            <div className="px-3 py-2 rounded-lg bg-cyan-50/50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800">
              <p className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 truncate">{clinica.nome}</p>
              <p className="text-[9px] text-cyan-500">Espaço compartilhado</p>
            </div>
          ) : null}
          <div className="flex items-center gap-2 px-1">
            <span className="flex items-center gap-1 text-[10px] text-slate-400" title={lastSync ? `Sincronizado ${new Date(lastSync).toLocaleString('pt-BR')}` : 'Sincronizando...'}>
              {syncing ? <CloudOff size={12} className="text-amber-500" /> : <Cloud size={12} className="text-emerald-500" />}
              {syncing ? 'Sincronizando...' : 'Conectado'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 px-1">
            <button onClick={syncAgora} className="text-[10px] font-medium text-slate-500 hover:text-cyan-600 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
              Sincronizar
            </button>
            <button onClick={syncTudoAgora} className="text-[10px] font-semibold text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 px-2 py-1 rounded hover:bg-cyan-50 dark:hover:bg-cyan-950/40">
              Sincronizar tudo
            </button>
            <button onClick={exportBackup} className="text-[10px] font-medium text-slate-500 hover:text-cyan-600 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
              Exportar
            </button>
            <label className="text-[10px] font-medium text-slate-500 hover:text-cyan-600 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              Importar
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
            </label>
            <button onClick={() => setShowClinicaModal(true)} className="text-[10px] font-medium text-slate-500 hover:text-cyan-600 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
              {clinica ? 'Equipe' : 'Equipe'}
            </button>
            <button
              onClick={async () => {
                try {
                  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
                    await Notification.requestPermission();
                    toast.success('Notificações ativadas!');
                  } else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
                    toast.error('Notificações bloqueadas no navegador.');
                  } else {
                    toast('Notificações já estão ativas.');
                  }
                } catch { /* ignore */ }
              }}
              className="text-[10px] font-medium text-slate-500 hover:text-cyan-600 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Notificação
            </button>
            <button onClick={handleSignOut} className="text-[10px] font-medium text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40">
              Sair
            </button>
          </div>
          <p className="text-[9px] text-slate-400 px-1">Saúde PRO v1.0</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-h-0">
        {clinica && (
          <div className="max-w-6xl w-full mx-auto px-4 pt-3">
            <div className="rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 px-4 py-2.5 text-xs text-cyan-800 dark:text-cyan-200 flex items-center justify-between gap-3">
              <span>
                <b>Espaço compartilhado:</b> {clinica.nome} (código {clinica.codigo}). Os dados aqui são da equipe e ficam separados do seu armazenamento pessoal.
              </span>
              <button onClick={() => setShowClinicaModal(true)} className="shrink-0 font-semibold underline hover:no-underline">Gerenciar / sair</button>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && <Dashboard db={db} onNavigate={setActiveTab} />}
              {activeTab === 'clientes' && <Clientes clientes={db.clientes} pesagens={db.pesagens} doses={db.doses} pagamentos={db.pagamentos} fotos={db.fotos} auditoria={db.auditoria} setClientes={setClientes} setPesagens={setPesagens} setDoses={setDoses} setPagamentos={setPagamentos} setFotos={setFotos} setDbAtomico={setDbAtomico} logAuditoria={logAuditoria} />}
              {activeTab === 'doses' && <Doses clientes={db.clientes} doses={db.doses} pagamentos={db.pagamentos} setDoses={setDoses} setPagamentos={setPagamentos} setDbAtomico={setDbAtomico} logAuditoria={logAuditoria} />}
              {activeTab === 'peso' && <Peso clientes={db.clientes} pesagens={db.pesagens} doses={db.doses} setPesagens={setPesagens} logAuditoria={logAuditoria} />}
              {activeTab === 'pagamentos' && <Pagamentos clientes={db.clientes} pagamentos={db.pagamentos} doses={db.doses} setPagamentos={setPagamentos} setDoses={setDoses} setDbAtomico={setDbAtomico} logAuditoria={logAuditoria} />}
              {activeTab === 'relatorio' && <Relatorio clientes={db.clientes} pesagens={db.pesagens} doses={db.doses} pagamentos={db.pagamentos} config={db.config} />}
              {activeTab === 'fotos' && <Fotos clientes={db.clientes} fotos={db.fotos} setFotos={setFotos} logAuditoria={logAuditoria} />}
              {activeTab === 'auditoria' && <Auditoria auditoria={db.auditoria} clientes={db.clientes} />}
              {activeTab === 'configuracoes' && <Configuracoes config={db.config} setConfig={setConfig} />}
              {activeTab === 'referencia' && <Referencia />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Aviso de responsabilidade (disclaimer médico) */}
        <footer className="max-w-6xl w-full mx-auto px-4 py-4 text-center text-[11px] leading-snug text-slate-400 dark:text-slate-500">
          Saúde PRO é uma ferramenta de organização e acompanhamento. Não substitui avaliação,
          prescrição ou acompanhamento médico profissional. Sempre consulte um médico habilitado.
        </footer>
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
                isActive ? 'text-cyan-600' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-600 rounded-full" />}
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
                        ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400'
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
                  onClick={() => window.location.href = '/manicure'}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-fuchsia-50/50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-400 text-xs font-bold uppercase tracking-wider"
                >
                  <Sparkles size={18} />
                  Manicure PRO
                </button>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-2">
                <button onClick={syncAgora} className="text-xs font-medium text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Cloud size={14} className="inline mr-1" />Sincronizar
                </button>
                <button onClick={syncTudoAgora} className="text-xs font-medium text-cyan-700 dark:text-cyan-400 px-3 py-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60">
                  <Cloud size={14} className="inline mr-1" />Sinc. tudo
                </button>
                <button onClick={exportBackup} className="text-xs font-medium text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700">
                  Exportar
                </button>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-center">
                  Importar
                  <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
                </label>
                <button onClick={() => setShowClinicaModal(true)} className="text-xs font-medium text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Users size={14} className="inline mr-1" />{clinica ? 'Equipe' : 'Equipe'}
                </button>
                <button
                  onClick={async () => {
                    try {
                      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
                        await Notification.requestPermission();
                        toast.success('Notificações ativadas!');
                      } else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
                        toast.error('Notificações bloqueadas no navegador.');
                      } else {
                        toast('Notificações já estão ativas.');
                      }
                    } catch { /* ignore */ }
                  }}
                  className="text-xs font-medium text-slate-600 dark:text-slate-300 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Bell size={14} className="inline mr-1" />Notificação
                </button>
                <button onClick={handleSignOut} className="text-xs font-medium text-rose-600 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 col-span-2">
                  <LogOut size={14} className="inline mr-1" />Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Espaço da equipe (clínica compartilhada) */}
      <ClinicaModal
        open={showClinicaModal}
        clinica={clinica}
        onClose={() => setShowClinicaModal(false)}
        onEntrar={entrarClinica}
        onCriar={criarNovaClinica}
        onSair={sairClinica}
        loading={clinicaLoading}
      />
    </div>
  );
}

function ClinicaModal({
  open, clinica, onClose, onEntrar, onCriar, onSair, loading,
}: {
  open: boolean;
  clinica: ClinicaDoc | null;
  onClose: () => void;
  onEntrar: (codigo: string) => void;
  onCriar: (nome: string) => void;
  onSair: () => void;
  loading: boolean;
}) {
  const [modo, setModo] = useState<'menu' | 'entrar' | 'criar'>(clinica ? 'menu' : 'menu');
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('');

  useEffect(() => { if (open) { setModo('menu'); setCodigo(''); setNome(''); } }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><Users size={20} className="text-cyan-600" /> Espaço da equipe</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {modo === 'menu' && (
          <div className="space-y-3">
            {clinica ? (
              <div className="rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 p-4">
                <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">{clinica.nome}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Código de acesso: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{clinica.codigo}</span></p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Compartilhe este código com a equipe para que todos vejam os mesmos dados.</p>
                <button onClick={onSair} className="mt-3 w-full text-sm font-medium text-rose-600 border border-rose-200 dark:border-rose-800 rounded-lg py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                  Sair deste espaço
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Você está no armazenamento pessoal. Crie um espaço de equipe ou entre com um código para compartilhar os dados com colegas.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {!clinica && (
                <button onClick={() => setModo('criar')} className="text-sm font-semibold text-white bg-cyan-600 rounded-lg py-2.5 hover:bg-cyan-700">
                  Criar espaço
                </button>
              )}
              <button onClick={() => setModo('entrar')} className={`text-sm font-semibold rounded-lg py-2.5 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 ${clinica ? 'col-span-2' : ''}`}>
                Entrar com código
              </button>
            </div>
          </div>
        )}

        {modo === 'entrar' && (
          <div className="space-y-3">
            <label className="text-sm text-slate-600 dark:text-slate-300">Código da clínica</label>
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm uppercase tracking-widest outline-none focus:ring-2 focus:ring-cyan-500"
              maxLength={6}
            />
            <div className="flex gap-2">
              <button onClick={() => setModo('menu')} className="flex-1 text-sm py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">Voltar</button>
              <button onClick={() => onEntrar(codigo)} disabled={loading || codigo.length < 4} className="flex-1 text-sm font-semibold text-white bg-cyan-600 rounded-lg py-2.5 hover:bg-cyan-700 disabled:opacity-50">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </div>
        )}

        {modo === 'criar' && (
          <div className="space-y-3">
            <label className="text-sm text-slate-600 dark:text-slate-300">Nome do espaço (clínica)</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Clínica Saúde+"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setModo('menu')} className="flex-1 text-sm py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">Voltar</button>
              <button onClick={() => onCriar(nome)} disabled={loading} className="flex-1 text-sm font-semibold text-white bg-cyan-600 rounded-lg py-2.5 hover:bg-cyan-700 disabled:opacity-50">
                {loading ? 'Criando...' : 'Criar'}
              </button>
            </div>
            <p className="text-xs text-slate-400">Um código será gerado automaticamente para você compartilhar com a equipe.</p>
          </div>
        )}
      </div>
    </div>
  );
}
