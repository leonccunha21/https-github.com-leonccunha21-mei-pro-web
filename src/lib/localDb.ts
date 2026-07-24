import { Product, Sale, Category, Expense, StoreInfo, ServiceOrder, Customer, Supplier, Purchase, CashSession, Loan, Lead, LeadExtractionJob, WhatsAppInstance, AIAgent, Opportunity, Bill, InternetUser } from '../types';
import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from './supabase';

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
  bills: Bill[];
  internetUsers: InternetUser[];
  initialized?: boolean;
}

// IndexedDB — armazenamento offline primário
const DB_NAME = 'zmstore_local';
const STORE = 'localdb';
const KEY = 'main';

// Notifica outras abas quando o banco local é atualizado
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
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(KEY);
      tx.oncomplete = () => db.close();
      tx.onerror = () => { db.close(); reject(tx.error); };
      req.onsuccess = () => resolve((req.result as Partial<LocalDb>) || null);
    });
  } catch (e) {
    db.close();
    throw e;
  }
}

async function idbPut(value: LocalDb): Promise<void> {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, KEY);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  } catch (e) {
    db.close();
    throw e;
  }
}

function dedupeById<T extends { id?: string }>(items?: T[]): T[] | undefined {
  if (!items || !Array.isArray(items)) return items;
  const seen = new Map<string, T>();
  for (const it of items) {
    if (it && it.id) seen.set(it.id, it);
    else seen.set('__no_id_' + seen.size, it);
  }
  return Array.from(seen.values());
}

// ============================================================
// Supabase sync — push completo do LocalDb para o Supabase
// ============================================================

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (!value) return fallback
  if (typeof value === 'string') {
    try { return JSON.parse(value) as T } catch { return fallback }
  }
  return value as T
}

/** Tabela -> campo JSONB que precisa de serialização */
const JSONB_FIELDS: Record<string, string[]> = {
  products: ['priceHistory'],
  sales: ['items'],
  service_orders: ['items'],
  purchases: ['items'],
  cash_sessions: ['withdrawals'],
  internet_users: ['payments'],
};

function prepareForSupabase(table: string, row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const jsonbFields = JSONB_FIELDS[table] || [];
  for (const [key, val] of Object.entries(row)) {
    if (val === undefined) continue;
    if (jsonbFields.includes(key)) {
      out[key] = val === null ? '[]' : JSON.stringify(val);
    } else {
      out[key] = val;
    }
  }
  return out;
}

async function upsertBatch(table: string, rows: Record<string, unknown>[]): Promise<void> {
  if (!rows.length || !isSupabaseConfigured()) return;
  const PAGE = 200; // Supabase REST tem limite de payload por request
  for (let i = 0; i < rows.length; i += PAGE) {
    const batch = rows.slice(i, i + PAGE).map(r => prepareForSupabase(table, r));
    const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
    if (error) {
      console.error(`Supabase upsert ${table} [${i}-${i + PAGE}]:`, error.message);
      // Marca falha para que a UI possa alertar o utilizador
      try { localStorage.setItem('zm_supabase_last_error', JSON.stringify({ table, msg: error.message, at: new Date().toISOString() })); } catch { /* ignore */ }
      throw new Error(`Falha ao salvar "${table}" na nuvem: ${error.message}`);
    }
  }
}

async function upsertSingleton(table: string, row: Record<string, unknown>): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const prepared = prepareForSupabase(table, row);
  const { error } = await supabase.from(table).upsert({ ...prepared, id: 'singleton' }, { onConflict: 'id' });
  if (error) console.error(`Supabase upsert ${table}:`, error.message);
}

/** Serializa todo o LocalDb para o Supabase. Lança erro se algum upsert falhar. */
async function syncToSupabase(db: LocalDb): Promise<void> {
  if (!isSupabaseConfigured()) return;

  await Promise.all([
    upsertBatch('products', db.products as unknown as Record<string, unknown>[]),
    upsertBatch('sales', db.sales as unknown as Record<string, unknown>[]),
    upsertBatch('categories', db.categories as unknown as Record<string, unknown>[]),
    upsertBatch('expenses', db.expenses as unknown as Record<string, unknown>[]),
    upsertBatch('service_orders', db.orders as unknown as Record<string, unknown>[]),
    upsertBatch('customers', db.customers as unknown as Record<string, unknown>[]),
    upsertBatch('suppliers', db.suppliers as unknown as Record<string, unknown>[]),
    upsertBatch('purchases', db.purchases as unknown as Record<string, unknown>[]),
    upsertBatch('cash_sessions', db.cashSessions as unknown as Record<string, unknown>[]),
    upsertBatch('loans', db.loans as unknown as Record<string, unknown>[]),
    upsertBatch('leads', db.leads as unknown as Record<string, unknown>[]),
    upsertBatch('opportunities', db.opportunities as unknown as Record<string, unknown>[]),
    upsertBatch('bills', db.bills as unknown as Record<string, unknown>[]),
    upsertBatch('internet_users', db.internetUsers as unknown as Record<string, unknown>[]),
  ]);
  if (db.storeInfo) {
    await upsertSingleton('store_info', db.storeInfo as unknown as Record<string, unknown>);
  }
}

// ============================================================
// Supabase fetch — buscar dados do Supabase para hidratar o IndexedDB
// ============================================================

async function restFetch<T>(table: string): Promise<{ data: T[] | null; error: any }> {
  // Supabase Free limita 1000 rows por request — busca em páginas de 1000
  const PAGE = 1000;
  const all: T[] = [];
  try {
    for (let offset = 0; ; offset += PAGE) {
      const url = `${supabaseUrl}/rest/v1/${table}?select=*&limit=${PAGE}&offset=${offset}`;
      const res = await fetch(url, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        const body = await res.text();
        return { data: null, error: new Error(`HTTP ${res.status}: ${body}`) };
      }
      const page: T[] = await res.json();
      all.push(...page);
      if (page.length < PAGE) break; // última página
    }
    return { data: all, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function restFetchSingle<T>(table: string, column: string, value: string): Promise<{ data: T | null; error: any }> {
  const url = `${supabaseUrl}/rest/v1/${table}?${column}=eq.${encodeURIComponent(value)}&select=*&limit=1`;
  try {
    const res = await fetch(url, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      const body = await res.text();
      return { data: null, error: new Error(`HTTP ${res.status}: ${body}`) };
    }
    const arr = await res.json();
    return { data: arr?.[0] ?? null, error: null };
  } catch (e) {
    return { data: null, error: e };
  }
}

async function fetchFromSupabase(): Promise<LocalDb | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const fetches: (() => Promise<{ data: any; error: any }>)[] = [
      () => restFetch<any[]>('products'),
      () => restFetch<any[]>('sales'),
      () => restFetch<any[]>('categories'),
      () => restFetch<any[]>('expenses'),
      () => restFetch<any[]>('service_orders'),
      () => restFetch<any[]>('customers'),
      () => restFetch<any[]>('suppliers'),
      () => restFetch<any[]>('purchases'),
      () => restFetch<any[]>('cash_sessions'),
      () => restFetch<any[]>('loans'),
      () => restFetch<any[]>('leads'),
      () => restFetch<any[]>('opportunities'),
      () => restFetch<any[]>('bills'),
      () => restFetch<any[]>('internet_users'),
      () => restFetchSingle<any>('store_info', 'id', 'singleton'),
    ];

    const results: { data: any; error: any }[] = [];
    const CONCURRENCY = 5;
    for (let i = 0; i < fetches.length; i += CONCURRENCY) {
      const batch = await Promise.all(fetches.slice(i, i + CONCURRENCY).map(f => f()));
      results.push(...batch);
    }

    const [
      products, sales, categories, expenses, serviceOrders,
      customers, suppliers, purchases, cashSessions, loans,
      leads, opportunities, bills, internetUsers, storeInfo,
    ] = results;

    const hasError = [products, sales, categories, expenses, serviceOrders,
      customers, suppliers, purchases, cashSessions, loans,
      leads, opportunities, bills, internetUsers].some(r => r.error);

    if (hasError) return null;

    return {
      initialized: true,
      products: (products.data || []).map((r: any) => ({
        ...r,
        priceHistory: parseJsonField(r.priceHistory, []),
      })),
      sales: (sales.data || []).map((r: any) => ({
        ...r,
        items: parseJsonField(r.items, []),
      })),
      categories: (categories.data as unknown as Category[]) || [],
      expenses: (expenses.data as unknown as Expense[]) || [],
      orders: (serviceOrders.data || []).map((r: any) => ({
        ...r,
        items: parseJsonField(r.items, []),
      })),
      customers: (customers.data as unknown as Customer[]) || [],
      suppliers: (suppliers.data as unknown as Supplier[]) || [],
      purchases: (purchases.data || []).map((r: any) => ({
        ...r,
        items: parseJsonField(r.items, []),
      })),
      cashSessions: (cashSessions.data || []).map((r: any) => ({
        ...r,
        withdrawals: parseJsonField(r.withdrawals, []),
      })),
      loans: (loans.data as unknown as Loan[]) || [],
      leads: (leads.data as unknown as Lead[]) || [],
      leadJobs: [],
      whatsappInstances: [],
      aiAgents: [],
      opportunities: (opportunities.data as unknown as Opportunity[]) || [],
      bills: (bills.data as unknown as Bill[]) || [],
      internetUsers: (internetUsers.data || []).map((r: any) => ({
        ...r,
        payments: parseJsonField(r.payments, []),
      })),
      storeInfo: storeInfo.data || null,
    };
  } catch (e) {
    console.error('Supabase fetch error:', e);
    return null;
  }
}

// ============================================================
// API pública
// ============================================================

export async function loadDb(): Promise<Partial<LocalDb> | null> {
  // 1. Tenta buscar do Supabase (nuvem, acesso multi-dispositivo)
  const cloud = await fetchFromSupabase();
  if (cloud && (Array.isArray(cloud.sales) || Array.isArray(cloud.products))) {
    // Salva no IndexedDB como cache offline
    try { await idbPut(cloud as LocalDb); } catch { /* ignore */ }
    return {
      ...cloud,
      products: dedupeById(cloud.products) as LocalDb['products'],
      sales: dedupeById(cloud.sales) as LocalDb['sales'],
      categories: dedupeById(cloud.categories) as LocalDb['categories'],
      expenses: dedupeById(cloud.expenses) as LocalDb['expenses'],
      orders: dedupeById(cloud.orders) as LocalDb['orders'],
      customers: dedupeById(cloud.customers) as LocalDb['customers'],
      suppliers: dedupeById(cloud.suppliers) as LocalDb['suppliers'],
      purchases: dedupeById(cloud.purchases) as LocalDb['purchases'],
      cashSessions: dedupeById(cloud.cashSessions) as LocalDb['cashSessions'],
      loans: dedupeById(cloud.loans) as LocalDb['loans'],
      leads: dedupeById(cloud.leads) as LocalDb['leads'],
      opportunities: dedupeById(cloud.opportunities) as LocalDb['opportunities'],
      bills: dedupeById(cloud.bills) as LocalDb['bills'],
      internetUsers: dedupeById(cloud.internetUsers) as LocalDb['internetUsers'],
    };
  }

  // 2. Fallback: IndexedDB (offline)
  try {
    const local = await idbGet();
    if (local && (Array.isArray(local.sales) || Array.isArray(local.products))) {
      return {
        ...local,
        products: dedupeById(local.products) as LocalDb['products'],
        sales: dedupeById(local.sales) as LocalDb['sales'],
        categories: dedupeById(local.categories) as LocalDb['categories'],
        expenses: dedupeById(local.expenses) as LocalDb['expenses'],
        orders: dedupeById(local.orders) as LocalDb['orders'],
        customers: dedupeById(local.customers) as LocalDb['customers'],
        suppliers: dedupeById(local.suppliers) as LocalDb['suppliers'],
        purchases: dedupeById(local.purchases) as LocalDb['purchases'],
        cashSessions: dedupeById(local.cashSessions) as LocalDb['cashSessions'],
        loans: dedupeById(local.loans) as LocalDb['loans'],
        leads: dedupeById(local.leads) as LocalDb['leads'],
        leadJobs: dedupeById(local.leadJobs) as LocalDb['leadJobs'],
        whatsappInstances: dedupeById(local.whatsappInstances) as LocalDb['whatsappInstances'],
        aiAgents: dedupeById(local.aiAgents) as LocalDb['aiAgents'],
        opportunities: dedupeById(local.opportunities) as LocalDb['opportunities'],
        bills: dedupeById(local.bills) as LocalDb['bills'],
        internetUsers: dedupeById(local.internetUsers) as LocalDb['internetUsers'],
      };
    }
  } catch { /* ignore */ }

  return null;
}

export async function saveDb(db: LocalDb, onCloudError?: (msg: string) => void): Promise<void> {
  // 1. Sempre salva localmente (IndexedDB) — rápido, offline-first
  try {
    await idbPut(db);
  } catch (e) {
    console.error('Erro ao salvar no IndexedDB:', e);
  }

  // 2. Sync best-effort para Supabase (nuvem)
  syncToSupabase(db).catch((e: unknown) => {
    const msg = e instanceof Error ? e.message : 'Erro desconhecido ao sincronizar com a nuvem.';
    console.error('Supabase sync falhou:', msg);
    if (onCloudError) onCloudError(msg);
  });
  notifyDbUpdated();
}

/** Best-effort: limpa dados do Supabase (útil após reset local). */
export async function clearSupabaseDb(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const tables = [
    'products', 'sales', 'categories', 'expenses', 'service_orders',
    'customers', 'suppliers', 'purchases', 'cash_sessions', 'loans',
    'leads', 'opportunities', 'bills', 'internet_users', 'store_info',
  ];
  await Promise.all(tables.map(t =>
    supabase.from(t).delete().neq('id', '').then(({ error }) => {
      if (error) console.warn(`Supabase clear ${t}: ${error.message}`);
    })
  ));
}

export async function resetDb(): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(KEY);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  } catch { /* ignore */ }
  try {
    await fetch('/api/db/reset', { method: 'POST' });
  } catch { /* ignore */ }
}
