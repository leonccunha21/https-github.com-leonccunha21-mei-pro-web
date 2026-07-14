import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { LocalDb } from './localDb';
import { recordWrites } from './quota';

const BATCH_SIZE = 500;

async function loadCollection<T>(userId: string, name: string): Promise<T[]> {
  const path = `users/${userId}/${name}`;
  try {
    const snap = await getDocs(collection(db, path));
    const items: T[] = [];
    snap.forEach((d) => items.push(d.data() as T));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

// Firestore não aceita valores `undefined`. Removemos campos undefined
// recursivamente (mantendo `null`) antes de gravar.
function cleanForFirestore<T>(value: T): any {
  if (value === undefined) return null;
  if (value === null) return null;
  if (Array.isArray(value)) return value.map((v) => cleanForFirestore(v));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) out[k] = cleanForFirestore(v);
    }
    return out;
  }
  return value;
}

async function saveBatch<T extends { id: string }>(userId: string, name: string, items: T[]): Promise<void> {
  const path = `users/${userId}/${name}`;
  try {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const chunk = items.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        batch.set(doc(db, path, item.id), cleanForFirestore(item));
      }
      await batch.commit();
      recordWrites(chunk.length);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

async function clearCollection(userId: string, name: string): Promise<void> {
  const path = `users/${userId}/${name}`;
  try {
    const snap = await getDocs(collection(db, path));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/** Store info (single document) */
export async function loadUserStoreInfo(userId: string) {
  const path = `users/${userId}/config/storeInfo`;
  try {
    const snap = await getDoc(doc(db, path));
    return snap.exists() ? (snap.data() as LocalDb['storeInfo']) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveUserStoreInfo(userId: string, info: LocalDb['storeInfo']): Promise<void> {
  const path = `users/${userId}/config/storeInfo`;
  try {
    await setDoc(doc(db, path), cleanForFirestore(info ?? {}));
    recordWrites(1);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/** Load the full cloud database for the signed-in user. */
export async function loadUserDb(userId: string): Promise<Partial<LocalDb>> {
  const [products, categories, sales, orders, customers, suppliers, purchases, cashSessions, loans, expenses] =
    await Promise.all([
      loadCollection<NonNullable<LocalDb['products']>[number]>(userId, 'products'),
      loadCollection<NonNullable<LocalDb['categories']>[number]>(userId, 'categories'),
      loadCollection<NonNullable<LocalDb['sales']>[number]>(userId, 'sales'),
      loadCollection<NonNullable<LocalDb['orders']>[number]>(userId, 'orders'),
      loadCollection<NonNullable<LocalDb['customers']>[number]>(userId, 'customers'),
      loadCollection<NonNullable<LocalDb['suppliers']>[number]>(userId, 'suppliers'),
      loadCollection<NonNullable<LocalDb['purchases']>[number]>(userId, 'purchases'),
      loadCollection<NonNullable<LocalDb['cashSessions']>[number]>(userId, 'cashSessions'),
      loadCollection<NonNullable<LocalDb['loans']>[number]>(userId, 'loans'),
      loadCollection<NonNullable<LocalDb['expenses']>[number]>(userId, 'expenses'),
    ]);
  const storeInfo = await loadUserStoreInfo(userId);

  return {
    products,
    categories,
    sales,
    orders,
    customers,
    suppliers,
    purchases,
    cashSessions,
    loans,
    expenses,
    storeInfo: storeInfo ?? undefined,
  };
}

/** Push the full local database to the cloud (best-effort, batched). */
export async function saveUserDb(userId: string, dbData: LocalDb): Promise<void> {
  await Promise.all([
    saveBatch(userId, 'products', dbData.products || []),
    saveBatch(userId, 'categories', dbData.categories || []),
    saveBatch(userId, 'sales', dbData.sales || []),
    saveBatch(userId, 'orders', dbData.orders || []),
    saveBatch(userId, 'customers', dbData.customers || []),
    saveBatch(userId, 'suppliers', dbData.suppliers || []),
    saveBatch(userId, 'purchases', dbData.purchases || []),
    saveBatch(userId, 'cashSessions', dbData.cashSessions || []),
    saveBatch(userId, 'loans', dbData.loans || []),
    saveBatch(userId, 'expenses', dbData.expenses || []),
    saveUserStoreInfo(userId, dbData.storeInfo),
  ]);
}

// ---------------------------------------------------------------------------
// Sincronização INCREMENTAL (economia de cota do Firestore)
//
// O plano gratuito do Firebase limita escritas/deletes por dia. Reenviar o
// banco inteiro a cada clique consome milhares de escritas e estoura a cota.
// Para evitar isso, mantemos em cache (localStorage) um hash de cada documento
// já enviado. Na próxima sincronização, só são gravados os documentos cujo
// conteúdo mudou (e apagados os que foram removidos localmente). Assim, uma
// venda nova custa 1 escrita, não 5.000.
// ---------------------------------------------------------------------------

const SYNC_CACHE_PREFIX = 'zm_cloud_cache_';

const SYNC_COLLECTIONS: (keyof LocalDb)[] = [
  'products', 'categories', 'sales', 'orders', 'customers',
  'suppliers', 'purchases', 'cashSessions', 'loans', 'expenses',
];

type SyncCache = Record<string, Record<string, string>>;

// Hash FNV-1a 32-bit do conteúdo "limpo" que será gravado no Firestore.
function docHash(value: unknown): string {
  const s = JSON.stringify(cleanForFirestore(value));
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function getSyncCache(userId: string): SyncCache {
  try {
    const raw = localStorage.getItem(SYNC_CACHE_PREFIX + userId);
    return raw ? (JSON.parse(raw) as SyncCache) : {};
  } catch {
    return {};
  }
}

function setSyncCache(userId: string, cache: SyncCache): void {
  try {
    localStorage.setItem(SYNC_CACHE_PREFIX + userId, JSON.stringify(cache));
  } catch { /* armazenamento cheio: ignora (próxima sync reenvia tudo) */ }
}

/** Apaga o cache de sincronização (usar após limpar a nuvem ou forçar reenvio). */
export function clearSyncCache(userId: string): void {
  try {
    localStorage.removeItem(SYNC_CACHE_PREFIX + userId);
  } catch { /* ignore */ }
}

async function deleteBatch(userId: string, name: string, ids: string[]): Promise<void> {
  const path = `users/${userId}/${name}`;
  try {
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const chunk = ids.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      for (const id of chunk) batch.delete(doc(db, path, id));
      await batch.commit();
      recordWrites(chunk.length);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export interface SyncResult {
  uploaded: number;
  deleted: number;
  skipped: number;
}

/**
 * Envia para a nuvem apenas as diferenças em relação à última sincronização.
 * Com `forceFull`, ignora o cache e reenvia tudo (usado em restauração).
 */
export async function saveUserDbIncremental(
  userId: string,
  dbData: LocalDb,
  opts?: { forceFull?: boolean }
): Promise<SyncResult> {
  const cache = opts?.forceFull ? {} : getSyncCache(userId);
  const newCache: SyncCache = {};
  let uploaded = 0;
  let deleted = 0;
  let skipped = 0;

  for (const name of SYNC_COLLECTIONS) {
    const items = (dbData[name] as Array<{ id?: string }> | undefined) || [];
    const prev = cache[name] || {};
    const cur: Record<string, string> = {};
    const toUpload: unknown[] = [];

    for (const item of items) {
      if (!item || !item.id) continue;
      const h = docHash(item);
      cur[item.id] = h;
      if (prev[item.id] !== h) toUpload.push(item);
      else skipped++;
    }

    const removed = Object.keys(prev).filter(id => !(id in cur));
    newCache[name] = cur;

    if (toUpload.length) {
      await saveBatch(userId, name, toUpload as Array<{ id: string }>);
      uploaded += toUpload.length;
    }
    if (removed.length) {
      await deleteBatch(userId, name, removed);
      deleted += removed.length;
    }
  }

  // storeInfo é um documento único (config/storeInfo)
  const infoPrev = (cache['__storeInfo'] && cache['__storeInfo']['_']) || '';
  const infoHash = docHash(dbData.storeInfo ?? {});
  if (infoPrev !== infoHash || opts?.forceFull) {
    await saveUserStoreInfo(userId, dbData.storeInfo);
    uploaded++;
  }
  newCache['__storeInfo'] = { _: infoHash };

  setSyncCache(userId, newCache);
  return { uploaded, deleted, skipped };
}

// Granular helpers (mantidos para compatibilidade / sincronizações pontuais)
export const saveUserProduct = (userId: string, p: NonNullable<LocalDb['products']>[number]) =>
  saveBatch(userId, 'products', [p]);
export const saveUserSale = (userId: string, s: NonNullable<LocalDb['sales']>[number]) =>
  saveBatch(userId, 'sales', [s]);
export const saveUserCategory = (userId: string, c: NonNullable<LocalDb['categories']>[number]) =>
  saveBatch(userId, 'categories', [c]);
export const saveUserOrder = (userId: string, o: NonNullable<LocalDb['orders']>[number]) =>
  saveBatch(userId, 'orders', [o]);
export const clearUserProducts = (userId: string) => clearCollection(userId, 'products');

/** Remove todos os documentos do banco do usuário na nuvem (coleções + storeInfo). */
export async function clearUserDb(userId: string): Promise<void> {
  const cols = [
    'products', 'categories', 'sales', 'orders', 'customers',
    'suppliers', 'purchases', 'cashSessions', 'loans', 'expenses',
  ];
  await Promise.all(cols.map((c) => clearCollection(userId, c)));
  try {
    await deleteDoc(doc(db, `users/${userId}/config/storeInfo`));
  } catch { /* ignore */ }
}
export const clearUserCategories = (userId: string) => clearCollection(userId, 'categories');
export const clearUserSales = (userId: string) => clearCollection(userId, 'sales');
export const clearUserOrders = (userId: string) => clearCollection(userId, 'orders');
