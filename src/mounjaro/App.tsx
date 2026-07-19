import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Users, Syringe, Scale, Wallet, ArrowLeft, Sun, Moon, Info,
  Stethoscope, LogOut, Cloud, CloudOff, AlertTriangle, FileText, Bell, Camera, History, Settings,
} from 'lucide-react';
import { MounjaroDb, ClienteMounjaro, PesagemMounjaro, DoseMounjaro, PagamentoMounjaro, FotoEvolucao } from './types';
import { emptyDb, loadMounjaroDb, saveMounjaroDb, defaultConfig } from './localDb';
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

  const persist = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const cur = stateRef.current;
      const data = { ...cur, initialized: true };
      saveMounjaroDb(data).catch(() => {});
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

  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, []);

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
        // 1. Local (IndexedDB)
        const localRaw = await loadMounjaroDb();
        const local = sanitizar(localRaw);
        // 2. Nuvem
        const cloud = await loadMounjaroCloud(scope);
        // 3. Estado em memória (pode ter dados ainda não gravados no local/nuvem)
        const mem = stateRef.current || emptyDb();
        // Merge de 3 fontes por id. Ordem: nuvem primeiro, local por último
        // (prevalece). Assim o que está no dispositivo nunca é apagado por uma
        // nuvem vazia/parcial, e a nuvem só preenche o que falta.
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
        const temDados =
          merged.clientes.length || merged.doses.length || merged.pesagens.length ||
          merged.pagamentos.length || merged.fotos.length || merged.auditoria.length;
        setDb(temDados ? merged : mem);
        // Persiste localmente o resultado do merge (sem disparar sincronização em loop)
        saveMounjaroDb(temDados ? merged : mem).catch(() => {});
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
        clientes: mergePorId(localRaw.clientes, cloud.clientes || []),
        pesagens: mergePorId(localRaw.pesagens, cloud.pesagens || []),
        doses: mergePorId(localRaw.doses, cloud.doses || []),
        pagamentos: mergePorId(localRaw.pagamentos, cloud.pagamentos || []),
        fotos: mergePorId(localRaw.fotos, cloud.fotos || []),
        auditoria: mergePorId(localRaw.auditoria, cloud.auditoria || []),
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
      loadMounjaroCloud(scope).then((cloud) => {
        const localRaw = loadMounjaroDb();
        localRaw.then((local) => {
          const merged: MounjaroDb = {
            clientes: mergePorId(local.clientes, cloud.clientes || []),
            pesagens: mergePorId(local.pesagens, cloud.pesagens || []),
            doses: mergePorId(local.doses, cloud.doses || []),
            pagamentos: mergePorId(local.pagamentos, cloud.pagamentos || []),
            fotos: mergePorId(local.fotos, cloud.fotos || []),
            auditoria: mergePorId(local.auditoria, cloud.auditoria || []),
            config: { ...defaultConfig(), ...(cloud.config || {}), ...(local.config || {}) },
            initialized: true,
          };
          setDb(merged);
          saveMounjaroDb(merged).catch(() => {});
          setLoading(false);
        });
      }).catch(() => setLoading(false));
    }
  };

  // --- Setters por entidade ---
  const setClientes = (clientes: ClienteMounjaro[]) => { setDb((d) => ({ ...d, clientes })); persist(); };
  const setPesagens = (pesagens: PesagemMounjaro[]) => { setDb((d) => ({ ...d, pesagens })); persist(); };
  const setDoses = (doses: DoseMounjaro[]) => { setDb((d) => ({ ...d, doses })); persist(); };
  const setPagamentos = (pagamentos: PagamentoMounjaro[]) => { setDb((d) => ({ ...d, pagamentos })); persist(); };
  const setFotos = (fotos: FotoEvolucao[]) => { setDb((d) => ({ ...d, fotos })); persist(); };
  const setConfig = (config: MounjaroDb['config']) => { setDb((d) => ({ ...d, config })); persist(); };

  // Registro de auditoria: histórico de alterações críticas.
  const nomeUsuario = cloudUser?.displayName || cloudUser?.email || 'usuário';
  const logAuditoria = useCallback(
    (params: { entidade: 'cliente' | 'dose' | 'pagamento' | 'pesagem' | 'foto'; acao: 'criar' | 'editar' | 'excluir'; resumo: string; clienteId?: string; refId?: string }) => {
      setDb((d) => ({ ...d, auditoria: criarRegistroAuditoria({ ...params, usuario: nomeUsuario }, d.auditoria) }));
      persist();
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
        if (!window.confirm('Importar este backup? Isso substituirá todos os dados atuais do Mounjaro PRO neste navegador e na nuvem.')) return;
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
        persist();
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
            <h1 className="text-xl font-bold text-slate-950 dark:text-slate-100 tracking-tight">Mounjaro PRO</h1>
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

  const goHome = () => {
    try { localStorage.removeItem('mei_pro_system_choice'); } catch { /* ignore */ }
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Toaster position="top-center" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <button onClick={goHome} title="Trocar de sistema" className="flex items-center gap-1 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400">
              <ArrowLeft size={20} />
              <span className="hidden sm:inline text-sm font-medium">Trocar</span>
            </button>
            <div className="p-2 rounded-xl bg-cyan-600 text-white">
              <Stethoscope size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight">Mounjaro PRO</h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Controle de tratamento · Tirzepatida</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {clinica ? (
              <span className="hidden md:flex items-center gap-1 text-xs font-medium text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-1 rounded-lg" title={`Espaço compartilhado: ${clinica.nome} (código ${clinica.codigo})`}>
                <Users size={13} /> {clinica.nome}
              </span>
            ) : null}
            <button onClick={() => setShowClinicaModal(true)} title="Espaço da equipe" className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-600 px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg">
              <Users size={14} /> {clinica ? 'Equipe' : 'Entrar na equipe'}
            </button>
            <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400" title={lastSync ? `Sincronizado ${new Date(lastSync).toLocaleString('pt-BR')}` : 'Sincronizando...'}>
              {syncing ? <CloudOff size={14} className="text-amber-500" /> : <Cloud size={14} className="text-emerald-500" />}
            </span>
            <button onClick={exportBackup} className="hidden sm:block text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-600 px-2 py-1">
              Exportar
            </button>
            <button onClick={syncAgora} title="Forçar sincronização com a nuvem" className="hidden sm:block text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-600 px-2 text-center">
              Sincronizar
            </button>
            <button onClick={syncTudoAgora} title="Enviar TODOS os dados à nuvem agora (recupera dados presos)" className="hidden sm:block text-xs font-semibold text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-1 rounded-lg">
              Sincronizar tudo
            </button>
            <label className="hidden sm:block text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-600 px-2 py-1 cursor-pointer">
              Importar
              <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
            </label>
            <button onClick={handleSignOut} title="Sair" className="text-slate-400 hover:text-rose-600 p-1">
              <LogOut size={18} />
            </button>
            <button onClick={toggleDarkMode} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
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
              title="Ativar notificações de lembrete"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Bell size={18} />
            </button>
          </div>
        </div>
        {/* Tabs desktop */}
        <nav className="hidden sm:flex gap-1 px-4 pb-2 max-w-6xl mx-auto overflow-x-auto no-scrollbar">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setActiveTab(n.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === n.id
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {n.icon}{n.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Bottom nav mobile */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
        <div className="flex min-w-max">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setActiveTab(n.id)}
            className={`flex flex-col items-center justify-center py-2 px-4 text-[10px] gap-0.5 min-w-[64px] ${
              activeTab === n.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {n.icon}
            {n.label}
          </button>
        ))}
        </div>
      </nav>

      {clinica && (
        <div className="max-w-6xl mx-auto px-4 pt-3">
          <div className="rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 px-4 py-2.5 text-xs text-cyan-800 dark:text-cyan-200 flex items-center justify-between gap-3">
            <span>
              <b>Espaço compartilhado:</b> {clinica.nome} (código {clinica.codigo}). Os dados aqui são da equipe e ficam separados do seu armazenamento pessoal.
            </span>
            <button onClick={() => setShowClinicaModal(true)} className="shrink-0 font-semibold underline hover:no-underline">Gerenciar / sair</button>
          </div>
        </div>
      )}

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
            {activeTab === 'clientes' && <Clientes clientes={db.clientes} pesagens={db.pesagens} doses={db.doses} pagamentos={db.pagamentos} fotos={db.fotos} auditoria={db.auditoria} setClientes={setClientes} setPesagens={setPesagens} setDoses={setDoses} setPagamentos={setPagamentos} setFotos={setFotos} logAuditoria={logAuditoria} />}
            {activeTab === 'doses' && <Doses clientes={db.clientes} doses={db.doses} pagamentos={db.pagamentos} setDoses={setDoses} setPagamentos={setPagamentos} logAuditoria={logAuditoria} />}
            {activeTab === 'peso' && <Peso clientes={db.clientes} pesagens={db.pesagens} doses={db.doses} setPesagens={setPesagens} logAuditoria={logAuditoria} />}
            {activeTab === 'pagamentos' && <Pagamentos clientes={db.clientes} pagamentos={db.pagamentos} doses={db.doses} setPagamentos={setPagamentos} setDoses={setDoses} logAuditoria={logAuditoria} />}
            {activeTab === 'relatorio' && <Relatorio clientes={db.clientes} pesagens={db.pesagens} doses={db.doses} pagamentos={db.pagamentos} config={db.config} />}
            {activeTab === 'fotos' && <Fotos clientes={db.clientes} fotos={db.fotos} setFotos={setFotos} logAuditoria={logAuditoria} />}
            {activeTab === 'auditoria' && <Auditoria auditoria={db.auditoria} clientes={db.clientes} />}
            {activeTab === 'configuracoes' && <Configuracoes config={db.config} setConfig={setConfig} />}
            {activeTab === 'referencia' && <Referencia />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Aviso de responsabilidade (disclaimer médico) */}
      <footer className="max-w-6xl mx-auto px-4 py-4 text-center text-[11px] leading-snug text-slate-400 dark:text-slate-500">
        Mounjaro PRO é uma ferramenta de organização e acompanhamento. Não substitui avaliação,
        prescrição ou acompanhamento médico profissional. Sempre consulte um médico habilitado.
      </footer>

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
