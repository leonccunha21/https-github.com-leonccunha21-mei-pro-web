import { ManicureDb } from './types';

const DB_NAME = 'manicure_local';
const STORE = 'manicuredb';
const KEY = 'main';

const syncChannel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('manicure-sync') : null;

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

async function idbGet(): Promise<Partial<ManicureDb> | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve((req.result as Partial<ManicureDb>) || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(value: ManicureDb): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function defaultConfig(): ManicureDb['config'] {
  return { nomeSalao: 'Meu Salão', profissional: '', telefoneContato: '' };
}

export function emptyDb(): ManicureDb {
  return { clientes: [], servicos: [], agendamentos: [], movimentos: [], produtos: [], config: defaultConfig(), initialized: true };
}

export async function loadManicureDb(): Promise<ManicureDb> {
  try {
    const raw = await idbGet();
    if (raw) {
      return {
        clientes: raw.clientes || [], servicos: raw.servicos || [],
        agendamentos: raw.agendamentos || [], movimentos: raw.movimentos || [],
        produtos: raw.produtos || [],
        config: { ...defaultConfig(), ...(raw.config || {}) }, initialized: true,
      };
    }
  } catch { /* ignore */ }
  return emptyDb();
}

export async function saveManicureDb(db: ManicureDb): Promise<void> {
  try { await idbPut(db); } catch (e) { console.error('Erro ao salvar Manicure DB:', e); }
  notifyDbUpdated();
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
