import { ManicureDb, MensagemTemplate } from './types';
import { loadManicureCloud } from './dbSync';

const DB_NAME = 'manicure_local';
const STORE = 'manicuredb';
const KEY = 'main';
const META_KEY = 'sync_meta';

export interface SyncMeta {
  lastSyncAt: string | null;
  pendingDeletions: Record<string, string[]>;
}

const syncChannel: BroadcastChannel | null =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('manicure-sync') : null;

type Listener = (meta: SyncMeta) => void;
const listeners = new Set<Listener>();

export function subscribeSyncMeta(fn: Listener): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function notifyListeners(meta: SyncMeta): void {
  for (const fn of listeners) fn(meta);
}

function notifyDbUpdated(): void {
  try { syncChannel?.postMessage({ type: 'db-updated', at: Date.now() }); } catch { /* ignore */ }
}

function openDb(version = 2): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB indisponivel')); return; }
    const req = indexedDB.open(DB_NAME, version);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
    };
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

async function metaGet(): Promise<SyncMeta> {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction('meta', 'readonly');
    const req = tx.objectStore('meta').get(META_KEY);
    req.onsuccess = () => resolve(req.result || { lastSyncAt: null, pendingDeletions: {} });
    req.onerror = () => resolve({ lastSyncAt: null, pendingDeletions: {} });
  });
}

async function metaPut(meta: SyncMeta): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meta', 'readwrite');
    tx.objectStore('meta').put(meta, META_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSyncMeta(): Promise<SyncMeta> {
  return metaGet();
}

export async function setLastSyncAt(iso: string): Promise<void> {
  const meta = await metaGet();
  meta.lastSyncAt = iso;
  await metaPut(meta);
  notifyListeners(meta);
}

export async function addPendingDeletion(table: string, id: string): Promise<void> {
  const meta = await metaGet();
  if (!meta.pendingDeletions[table]) meta.pendingDeletions[table] = [];
  if (!meta.pendingDeletions[table].includes(id)) {
    meta.pendingDeletions[table].push(id);
  }
  await metaPut(meta);
  notifyListeners(meta);
}

export async function clearPendingDeletions(table?: string): Promise<void> {
  const meta = await metaGet();
  if (table) {
    delete meta.pendingDeletions[table];
  } else {
    meta.pendingDeletions = {};
  }
  await metaPut(meta);
  notifyListeners(meta);
}

export async function getPendingDeletions(): Promise<Record<string, string[]>> {
  const meta = await metaGet();
  return meta.pendingDeletions;
}

export function defaultConfig(): ManicureDb['config'] {
  return { nomeSalao: 'Meu Salão', profissional: '', telefoneContato: '' };
}

export function templatesPadrao(): MensagemTemplate[] {
  return [
    { id: 'tmp_1dia', nome: 'Lembrete 1 dia antes', tipo: 'lembrete_1dia', ativo: true,
      mensagem: 'Olá {{nome}}, passando para lembrar que seu horário na {{salao}} é amanhã ({{data}}) às {{hora}}. Confirme sua presença! 💅' },
    { id: 'tmp_1hora', nome: 'Lembrete 1 hora antes', tipo: 'lembrete_1hora', ativo: true,
      mensagem: 'Olá {{nome}}, seu horário na {{salao}} é em aproximadamente 1 hora ({{hora}}). Te esperamos! ✨' },
    { id: 'tmp_confirmacao', nome: 'Confirmação de agendamento', tipo: 'confirmacao', ativo: true,
      mensagem: 'Olá {{nome}}, seu agendamento na {{salao}} foi confirmado! 📅 {{data}} às {{hora}}. Qualquer dúvida é só chamar.' },
  ];
}

export function emptyDb(): ManicureDb {
  return {
    clientes: [], servicos: [], agendamentos: [], movimentos: [], produtos: [],
    whatsappInstances: [], mensagemTemplates: templatesPadrao(), mensagensEnviadas: [],
    config: defaultConfig(), initialized: true,
  };
}

export async function loadManicureDb(): Promise<ManicureDb> {
  try {
    const raw = await idbGet();
    if (raw && (raw.clientes?.length || raw.agendamentos?.length || raw.servicos?.length || raw.movimentos?.length || raw.produtos?.length)) {
      return {
        clientes: raw.clientes || [], servicos: raw.servicos || [],
        agendamentos: raw.agendamentos || [], movimentos: raw.movimentos || [],
        produtos: raw.produtos || [],
        whatsappInstances: raw.whatsappInstances || [],
        mensagemTemplates: raw.mensagemTemplates && raw.mensagemTemplates.length > 0 ? raw.mensagemTemplates : templatesPadrao(),
        mensagensEnviadas: raw.mensagensEnviadas || [],
        config: { ...defaultConfig(), ...(raw.config || {}) }, initialized: true,
      };
    }
  } catch { /* ignore */ }

  // Sem cache local (primeira vez ou IndexedDB limpo): carrega da nuvem.
  try {
    const cloud = await loadManicureCloud();
    if (cloud && (cloud.clientes?.length || cloud.agendamentos?.length)) {
      const db: ManicureDb = {
        clientes: cloud.clientes || [], servicos: cloud.servicos || [],
        agendamentos: cloud.agendamentos || [], movimentos: cloud.movimentos || [],
        produtos: cloud.produtos || [],
        whatsappInstances: cloud.whatsappInstances || [],
        mensagemTemplates: cloud.mensagemTemplates && cloud.mensagemTemplates.length > 0 ? cloud.mensagemTemplates : templatesPadrao(),
        mensagensEnviadas: cloud.mensagensEnviadas || [],
        config: { ...defaultConfig(), ...(cloud.config || {}) }, initialized: true,
      };
      try { await idbPut(db); } catch { /* ignore */ }
      return db;
    }
  } catch { /* ignore */ }

  return emptyDb();
}

function stampUpdated<T extends { updatedAt?: string }>(entity: T): T {
  return { ...entity, updatedAt: entity.updatedAt ?? new Date().toISOString() };
}

export async function saveManicureDb(db: ManicureDb): Promise<void> {
  const now = new Date().toISOString();
  const stamped: ManicureDb = {
    ...db,
    clientes: db.clientes.map(c => stampUpdated(c)),
    servicos: db.servicos.map(s => stampUpdated(s)),
    agendamentos: db.agendamentos.map(a => stampUpdated(a)),
    movimentos: db.movimentos.map(m => stampUpdated(m)),
    produtos: db.produtos.map(p => stampUpdated(p)),
    whatsappInstances: db.whatsappInstances.map(w => stampUpdated(w)),
    mensagemTemplates: db.mensagemTemplates.map(t => stampUpdated(t)),
    mensagensEnviadas: db.mensagensEnviadas.map(e => stampUpdated(e)),
    config: { ...db.config },
  };
  try { await idbPut(stamped); } catch (e) { console.error('Erro ao salvar Manicure DB:', e); }

  const { saveManicureCloudIncremental } = await import('./dbSync');
  saveManicureCloudIncremental(stamped).catch((e) => console.error('Manicure Supabase sync falhou:', e));
  notifyDbUpdated();
}

/** Salva APENAS no IndexedDB local, sem disparar sync com a nuvem.
 *  Usado na carga inicial para não sobrescrever deleções pendentes. */
export async function saveManicureDbLocalOnly(db: ManicureDb): Promise<void> {
  try { await idbPut(db); } catch (e) { console.error('Erro ao salvar Manicure DB (local):', e); }
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
