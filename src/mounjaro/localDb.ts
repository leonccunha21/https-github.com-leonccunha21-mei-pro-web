import { MounjaroDb } from './types';
import { loadMounjaroCloud, saveMounjaroCloud } from './dbSync';
import { isSupabaseConfigured } from '../lib/supabase';

const DB_NAME = 'mounjaro_local';
const STORE = 'mounjarodb';
const KEY = 'main';

const syncChannel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('mounjaro-sync') : null;

function notifyDbUpdated(): void {
  try { syncChannel?.postMessage({ type: 'db-updated', at: Date.now() }); } catch { /* ignore */ }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB indisponivel')); return; }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { const db = req.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(): Promise<Partial<MounjaroDb> | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve((req.result as Partial<MounjaroDb>) || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(value: MounjaroDb): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function defaultConfig(): MounjaroDb['config'] {
  return { nomeClinica: 'Saúde PRO', profissional: '', telefoneContato: '', valorDosePadrao: 0, intervaloPadraoDias: 7 };
}

export function emptyDb(): MounjaroDb {
  return { clientes: [], pesagens: [], doses: [], pagamentos: [], fotos: [], auditoria: [], config: defaultConfig(), initialized: true };
}

export async function loadMounjaroDb(): Promise<MounjaroDb> {
  // Estratégia: IndexedDB é a fonte primária (inclui deleções ainda não enviadas
  // à nuvem). Se a nuvem estiver disponível, faz merge por id — o LOCAL prevalece
  // em conflito (mesma lógica do useEffect de carga do App.tsx). Isso evita que
  // um cliente deletado ressurja após recarregar a página antes do sync terminar.
  let local: Partial<MounjaroDb> | null = null;
  try {
    const raw = await idbGet();
    if (raw && (Array.isArray(raw.clientes) || Array.isArray(raw.doses))) {
      local = raw;
    }
  } catch { /* ignore */ }

  if (!isSupabaseConfigured()) {
    if (local) {
      return {
        clientes: local.clientes || [], pesagens: local.pesagens || [],
        doses: local.doses || [], pagamentos: local.pagamentos || [],
        fotos: local.fotos || [], auditoria: local.auditoria || [],
        config: { ...defaultConfig(), ...(local.config || {}) }, initialized: true,
      };
    }
    return emptyDb();
  }

  // Com Supabase: retorna o local imediatamente (para não bloquear a UI com
  // latência de rede). O App.tsx já faz o merge completo local+nuvem no seu
  // próprio useEffect de carga, então aqui só precisamos garantir que o
  // IndexedDB (que tem as deleções pendentes) seja a base.
  if (local) {
    return {
      clientes: local.clientes || [], pesagens: local.pesagens || [],
      doses: local.doses || [], pagamentos: local.pagamentos || [],
      fotos: local.fotos || [], auditoria: local.auditoria || [],
      config: { ...defaultConfig(), ...(local.config || {}) }, initialized: true,
    };
  }

  // Sem cache local (primeira vez ou IndexedDB limpo): carrega da nuvem.
  try {
    const cloud = await loadMounjaroCloud();
    if (cloud && (cloud.clientes?.length || cloud.doses?.length)) {
      const db: MounjaroDb = {
        clientes: cloud.clientes || [], pesagens: cloud.pesagens || [],
        doses: cloud.doses || [], pagamentos: cloud.pagamentos || [],
        fotos: cloud.fotos || [], auditoria: cloud.auditoria || [],
        config: { ...defaultConfig(), ...(cloud.config || {}) }, initialized: true,
      };
      try { await idbPut(db); } catch { /* ignore */ }
      return db;
    }
  } catch { /* ignore */ }

  return emptyDb();
}

export async function saveMounjaroDb(db: MounjaroDb): Promise<void> {
  try { await idbPut(db); } catch (e) { console.error('Erro ao salvar Mounjaro DB:', e); }
  saveMounjaroCloud(db).catch((e) => console.error('Mounjaro Supabase sync falhou:', e));
  notifyDbUpdated();
}

/** Salva APENAS no IndexedDB local, sem disparar sync com a nuvem.
 *  Usado pelo useEffect de carga para persistir o resultado do merge
 *  sem sobrescrever deleções pendentes de envio à nuvem. */
export async function saveMounjaroDbLocalOnly(db: MounjaroDb): Promise<void> {
  try { await idbPut(db); } catch (e) { console.error('Erro ao salvar Mounjaro DB (local):', e); }
}

export function persistDebounced(
  getDb: () => MounjaroDb,
  setTimer: (t: number | null) => void,
  timerRef: { current: number | null }
) {
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = window.setTimeout(() => {
    saveMounjaroDb(getDb()).catch(() => {});
    setTimer(null);
  }, 250);
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}


