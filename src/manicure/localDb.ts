import { ManicureDb, MensagemTemplate } from './types';
import { loadManicureCloud, saveManicureCloud } from './dbSync';

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

export function templatesPadrao(): MensagemTemplate[] {
  return [
    { id: 'tmp_1dia', nome: 'Lembrete 1 dia antes', tipo: 'lembrete_1dia', ativo: true,
      mensagem: 'Olá {{nome}}, passando para lembrar que seu horário na {{salao}} é amanhã ({{data}}) às {{hora}}. Confirme sua presença! 💅' },
    { id: 'tmp_1hora', nome: 'Lembrete 1 hora antes', tipo: 'lembrete_1hora', ativo: true,
      mensagem: 'Olá {{nome}}, seu horário na {{salao}} é em aproximadamente 1 hora ({{hora}). Te esperamos! ✨' },
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

export async function saveManicureDb(db: ManicureDb): Promise<void> {
  try { await idbPut(db); } catch (e) { console.error('Erro ao salvar Manicure DB:', e); }
  saveManicureCloud(db).catch((e) => console.error('Manicure Supabase sync falhou:', e));
  notifyDbUpdated();
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
