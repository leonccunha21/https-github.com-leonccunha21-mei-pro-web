import { Product, Sale, Category, Expense, StoreInfo, ServiceOrder, Customer, Supplier, Purchase, CashSession, Loan, Lead, LeadExtractionJob, WhatsAppInstance, AIAgent, Opportunity } from '../types';

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
  leads: Lead[];
  leadJobs: LeadExtractionJob[];
  whatsappInstances: WhatsAppInstance[];
  aiAgents: AIAgent[];
  opportunities: Opportunity[];
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
  // FONTE ÚNICA DE VERDADE: IndexedDB do navegador.
  // O arquivo data/local-db.json (servidor) NUNCA é lido como fonte de dados,
  // apenas espelhado na escrita (saveDb) como backup. Isso evita que dados
  // antigos/estranhos do JSON contaminem o app (ex.: vendas de testes que
  // aparecem nos cálculos mas não na lista de vendas).
  try {
    const local = await idbGet();
    if (local && (Array.isArray(local.sales) || Array.isArray(local.products))) {
      return local;
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
