import { MounjaroDb, ClienteMounjaro, PesagemMounjaro, DoseMounjaro, PagamentoMounjaro, FotoEvolucao, RegistroAuditoria } from './types';

// Banco local do subsite Mounjaro. IndexedDB como armazenamento primário
// (igual ao app principal), para funcionar como site estático (Vercel/GitHub).
const DB_NAME = 'mounjaro_local';
const STORE = 'mounjarodb';
const KEY = 'main';

const syncChannel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('mounjaro-sync') : null;

function notifyDbUpdated(): void {
  try {
    syncChannel?.postMessage({ type: 'db-updated', at: Date.now() });
  } catch { /* ignore */ }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB indisponivel'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
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

export function emptyDb(): MounjaroDb {
  return { clientes: [], pesagens: [], doses: [], pagamentos: [], fotos: [], auditoria: [], initialized: true };
}

export async function loadMounjaroDb(): Promise<MounjaroDb> {
  try {
    const local = await idbGet();
    if (local && (Array.isArray(local.clientes) || Array.isArray(local.doses))) {
      return {
        clientes: local.clientes || [],
        pesagens: local.pesagens || [],
        doses: local.doses || [],
        pagamentos: local.pagamentos || [],
        fotos: local.fotos || [],
        auditoria: local.auditoria || [],
        initialized: true,
      };
    }
  } catch { /* ignore */ }
  return emptyDb();
}

export async function saveMounjaroDb(db: MounjaroDb): Promise<void> {
  try {
    await idbPut(db);
  } catch (e) {
    console.error('Erro ao salvar Mounjaro DB:', e);
  }
  notifyDbUpdated();
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

// ---- Helpers de geração de IDs ----
export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Helpers de persistência por entidade ----
export function saveClientes(clientes: ClienteMounjaro[], db: MounjaroDb, persist: () => void) {
  db.clientes = clientes;
  persist();
}
export function savePesagens(p: PesagemMounjaro[], db: MounjaroDb, persist: () => void) {
  db.pesagens = p;
  persist();
}
export function saveDoses(d: DoseMounjaro[], db: MounjaroDb, persist: () => void) {
  db.doses = d;
  persist();
}
export function savePagamentos(p: PagamentoMounjaro[], db: MounjaroDb, persist: () => void) {
  db.pagamentos = p;
  persist();
}
export function saveFotos(f: FotoEvolucao[], db: MounjaroDb, persist: () => void) {
  db.fotos = f;
  persist();
}
