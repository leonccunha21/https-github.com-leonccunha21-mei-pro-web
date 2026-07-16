import { Product, Sale, Category, Expense, StoreInfo, ServiceOrder, Customer, Supplier, Purchase, CashSession, Loan } from '../types';

export interface LocalDb {
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
}

// Quando publicado como site estático (GitHub Pages) não há servidor; o
// IndexedDB é o armazenamento primário para que os dados (vendas, empréstimos,
// flags de marketplace etc.) sobrevivam aos reloads. O servidor opcional em
// `server.ts` (rota `/api/db`) é usado apenas em ambiente local para
// sincronização best-effort e nunca é obrigatório.
const DB_NAME = 'zmstore_local';
const STORE = 'localdb';
const KEY = 'main';

// Notifica outras abas (mesma origem) quando o banco local é atualizado, para
// manter o estado consistente entre elas (IndexedDB é compartilhado, mas o
// estado em memória de cada aba precisa ser re-sincronizado).
const syncChannel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('zmstore-sync') : null;

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

async function idbGet(): Promise<Partial<LocalDb> | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve((req.result as Partial<LocalDb>) || null);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(value: LocalDb): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
export async function loadDb(): Promise<Partial<LocalDb> | null> {
  // 1. IndexedDB (primary, works on the static site)
  try {
    const local = await idbGet();
    // Só considera o IndexedDB válido se ele realmente tiver dados. Um banco
    // "inicializado" porém vazio (ex.: primeira carga falhou, ou o usuário
    // limpou os dados do site) NÃO deve bloquear o fallback para o servidor,
    // senão o app abre sempre vazio mesmo havendo dados no servidor.
    const localHasData =
      local &&
      (Array.isArray(local.sales) && local.sales.length > 0 ||
        Array.isArray(local.products) && local.products.length > 0);
    if (localHasData) {
      return local;
    }
  } catch { /* ignore */ }

  // 2. Optional local server (only when running with node server.js)
  try {
    const res = await fetch('/api/db');
    if (res.ok) {
      const db = (await res.json()) as Partial<LocalDb>;
      if (Array.isArray(db.sales) || Array.isArray(db.products)) {
        idbPut({ ...(db as LocalDb), initialized: true }).catch(() => {});
        return { ...(db as LocalDb), initialized: true };
      }
    }
  } catch { /* ignore */ }

  return null;
}

export async function saveDb(db: LocalDb): Promise<void> {
  // 1. Always persist locally (IndexedDB)
  try {
    await idbPut(db);
  } catch (e) {
    console.error('Erro ao salvar no IndexedDB:', e);
  }
  // 2. Best-effort server sync (ignored on the static site)
  try {
    await fetch('/api/db', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db),
    });
  } catch { /* ignore */ }
  notifyDbUpdated();
}

export async function resetDb(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* ignore */ }
  try {
    await fetch('/api/db/reset', { method: 'POST' });
  } catch { /* ignore */ }
}
