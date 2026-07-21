import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { MounjaroDb } from './types';
import { recordWrites, getDailyWrites } from '../lib/quota';

// Sincronização do subsite Mounjaro PRO com o Firebase/Firestore.
// Modo "usuário": `users/{uid}/mounjaro/data/{colecao}` (isolado por conta).
// Modo "clínica": `clinicas/{clinicaId}/mounjaro/data/{colecao}` (compartilhado com a equipe).
// Config: `users/{uid}/mounjaro/config` ou `clinicas/{clinicaId}/mounjaro/config` (4 segmentos, par).

export type MounjaroScope =
  | { tipo: 'user'; uid: string }
  | { tipo: 'clinica'; clinicaId: string };

// Caminho-base do escopo Mounjaro (4 segmentos, par = coleção válida).
// Adicionamos 'data' para garantir que documentos fiquem em profundidade PAR
// (ex.: users/{uid}/mounjaro/data/clientes/{id} = 6 segmentos).
// O documento 'config' fica em users/{uid}/mounjaro/config (4 segmentos, par).
function scopeBase(scope: MounjaroScope): string {
  return scope.tipo === 'user'
    ? `users/${scope.uid}/mounjaro/data`
    : `clinicas/${scope.clinicaId}/mounjaro/data`;
}

function configDocPath(scope: MounjaroScope): string {
  return scope.tipo === 'user'
    ? `users/${scope.uid}/mounjaro/config`
    : `clinicas/${scope.clinicaId}/mounjaro/config`;
}

const BATCH_SIZE = 500;

function cleanForFirestore<T>(value: T): any {
  if (value === undefined) return null;
  if (value === null) return null;
  // O SDK web do Firestore rejeita NaN/Infinity (diferente do Admin). Se fosse
  // enviado, a escrita do lote inteiro falharia silenciosamente. Convertemos
  // para null para preservar a gravação das demais coleções.
  if (typeof value === 'number' && !Number.isFinite(value)) return null;
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

async function loadCollection<T>(scope: MounjaroScope, name: string): Promise<T[]> {
  const base = scopeBase(scope);
  try {
    const snap = await getDocs(collection(db, base, name));
    const items: T[] = [];
    snap.forEach((d) => items.push(d.data() as T));
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${base}/${name}`);
    return [];
  }
}

async function saveBatch<T extends { id: string }>(scope: MounjaroScope, name: string, items: T[]): Promise<void> {
  const base = scopeBase(scope);
  try {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const chunk = items.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        batch.set(doc(db, base, name, item.id), cleanForFirestore(item));
      }
      await batch.commit();
      recordWrites(chunk.length);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${base}/${name}`);
  }
}

async function clearCollection(scope: MounjaroScope, name: string): Promise<void> {
  const base = scopeBase(scope);
  try {
    const snap = await getDocs(collection(db, base, name));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${base}/${name}`);
  }
}

/** Carrega o banco completo do Mounjaro da nuvem. */
export async function loadMounjaroCloud(scope: MounjaroScope): Promise<Partial<MounjaroDb>> {
  const [clientes, pesagens, doses, pagamentos, fotos, auditoria, configSnap] = await Promise.all([
    loadCollection<MounjaroDb['clientes'][number]>(scope, 'clientes'),
    loadCollection<MounjaroDb['pesagens'][number]>(scope, 'pesagens'),
    loadCollection<MounjaroDb['doses'][number]>(scope, 'doses'),
    loadCollection<MounjaroDb['pagamentos'][number]>(scope, 'pagamentos'),
    loadCollection<MounjaroDb['fotos'][number]>(scope, 'fotos'),
    loadCollection<MounjaroDb['auditoria'][number]>(scope, 'auditoria'),
    getDoc(doc(db, configDocPath(scope))),
  ]);
  const config = configSnap.exists() ? (configSnap.data() as MounjaroDb['config']) : undefined;
  return { clientes, pesagens, doses, pagamentos, fotos, auditoria, config, initialized: true };
}

/** Salva o banco completo do Mounjaro na nuvem (substitui as coleções). */
export async function saveMounjaroCloud(scope: MounjaroScope, data: MounjaroDb): Promise<void> {
  await Promise.all([
    saveBatch(scope, 'clientes', data.clientes || []),
    saveBatch(scope, 'pesagens', data.pesagens || []),
    saveBatch(scope, 'doses', data.doses || []),
    saveBatch(scope, 'pagamentos', data.pagamentos || []),
    saveBatch(scope, 'fotos', data.fotos || []),
    saveBatch(scope, 'auditoria', data.auditoria || []),
  ]);
  // Config em users/{uid}/mounjaro/config (4 segmentos, par).
  await setDoc(doc(db, configDocPath(scope)), cleanForFirestore(data.config || {}));
}

/** Salva apenas uma coleção (uso incremental leve). */
export async function saveMounjaroCollection<T extends { id: string }>(
  scope: MounjaroScope,
  name: 'clientes' | 'pesagens' | 'doses' | 'pagamentos' | 'fotos' | 'auditoria' | 'config',
  items: T[]
): Promise<void> {
  await saveBatch(scope, name, items as any);
}

/** Apaga todos os dados do Mounjaro do escopo na nuvem. */
export async function clearMounjaroCloud(scope: MounjaroScope): Promise<void> {
  await Promise.all([
    clearCollection(scope, 'clientes'),
    clearCollection(scope, 'pesagens'),
    clearCollection(scope, 'doses'),
    clearCollection(scope, 'pagamentos'),
    clearCollection(scope, 'fotos'),
    clearCollection(scope, 'auditoria'),
    clearCollection(scope, 'config'),
  ]);
}

// ---- Gestão de clínicas (espaço compartilhado da equipe) ----

export interface ClinicaDoc {
  id: string;
  nome: string;
  codigo: string;
  donoUid: string;
  criadoEm: string;
}

function gerarCodigoClinica(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/** Cria uma nova clínica e retorna o documento. */
export async function criarClinica(nome: string, donoUid: string): Promise<ClinicaDoc> {
  let codigo = gerarCodigoClinica();
  let docRef = doc(db, 'clinicas', codigo);
  // evita colisão de código
  for (let i = 0; i < 5; i++) {
    const snap = await getDoc(docRef);
    if (!snap.exists()) break;
    codigo = gerarCodigoClinica();
    docRef = doc(db, 'clinicas', codigo);
  }
  const clinica: ClinicaDoc = {
    id: codigo,
    nome: nome.trim() || 'Minha clínica',
    codigo,
    donoUid,
    criadoEm: new Date().toISOString(),
  };
  await setDoc(docRef, clinica);
  return clinica;
}

/** Busca uma clínica pelo código de acesso. */
export async function buscarClinica(codigo: string): Promise<ClinicaDoc | null> {
  const ref = doc(db, 'clinicas', codigo.trim().toUpperCase());
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as ClinicaDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'clinicas/' + codigo);
  }
  return null;
}

// ---- Sincronização em lotes (anti-estouro de cota) ----

const SYNC_BATCH = 100;
const MOUNJARO_SYNC_BUDGET = 5000; // folga diária para o Mounjaro
const MOUNJARO_PROGRESS_PREFIX = 'mounjaro_cloud_progress_';

type MProgress = { done: Record<string, Record<string, true>>; config?: boolean };

function scopeKey(scope: MounjaroScope): string {
  return scope.tipo === 'user' ? `u_${scope.uid}` : `c_${scope.clinicaId}`;
}

function getMProgress(scope: MounjaroScope): MProgress {
  try {
    const raw = localStorage.getItem(MOUNJARO_PROGRESS_PREFIX + scopeKey(scope));
    if (raw) return JSON.parse(raw) as MProgress;
  } catch { /* ignore */ }
  return { done: {} };
}

function setMProgress(scope: MounjaroScope, p: MProgress): void {
  try { localStorage.setItem(MOUNJARO_PROGRESS_PREFIX + scopeKey(scope), JSON.stringify(p)); } catch { /* ignore */ }
}

export function clearMounjaroSyncProgress(scope: MounjaroScope): void {
  try { localStorage.removeItem(MOUNJARO_PROGRESS_PREFIX + scopeKey(scope)); } catch { /* ignore */ }
}

// Campos de data para agrupar por ano por coleção.
const DATE_FIELDS: Partial<Record<keyof MounjaroDb, string>> = {
  clientes: 'createdAt',
  pesagens: 'data',
  doses: 'dataAplicacao',
  pagamentos: 'dataVencimento',
  fotos: 'createdAt',
  auditoria: 'createdAt',
};

function yearOf(item: any, dateField?: string): string {
  const v = dateField ? item?.[dateField] : null;
  if (!v) return '__nodate__';
  const d = typeof v === 'number' ? new Date(v) : new Date(v);
  if (isNaN(d.getTime())) return '__nodate__';
  return String(d.getFullYear());
}

async function writeMItems(scope: MounjaroScope, name: string, items: any[]): Promise<number> {
  if (!items.length) return 0;
  const base = scopeBase(scope);
  let written = 0;
  try {
    for (let i = 0; i < items.length; i += SYNC_BATCH) {
      const chunk = items.slice(i, i + SYNC_BATCH);
      const batch = writeBatch(db);
      for (const item of chunk) batch.set(doc(db, base, name, item.id), cleanForFirestore(item));
      await batch.commit();
      written += chunk.length;
      recordWrites(chunk.length);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${base}/${name}`);
  }
  return written;
}

export interface MounjaroSyncResult {
  uploaded: number;
  finished: boolean;
  stoppedByBudget: boolean;
  nextCollection?: string;
  nextYear?: string;
}

/**
 * Envia o banco Mounjaro para a nuvem em lotes pequenos (100 docs), agrupados
 * por ano, respeitando a cota diária. Se a cota do dia esgota, para e retoma
 * no dia seguinte (progresso salvo em localStorage). Não reenvia anos concluídos.
 */
export async function syncMounjaroThrottled(
  scope: MounjaroScope,
  data: MounjaroDb,
  opts?: { reset?: boolean },
): Promise<MounjaroSyncResult> {
  if (opts?.reset) clearMounjaroSyncProgress(scope);
  const progress = getMProgress(scope);

  const COLLECTIONS: (keyof MounjaroDb)[] = ['clientes', 'pesagens', 'doses', 'pagamentos', 'fotos', 'auditoria'];
  let uploaded = 0;
  let stoppedByBudget = false;
  let nextCollection: string | undefined;
  let nextYear: string | undefined;
  const remainingBudget = () => Math.max(0, MOUNJARO_SYNC_BUDGET - getDailyWrites().count);

  for (const name of COLLECTIONS) {
    if (stoppedByBudget) { nextCollection = name; break; }
    const items = (data[name] as Array<{ id?: string }>) || [];
    const dateField = DATE_FIELDS[name];
    const byYear = new Map<string, any[]>();
    for (const it of items) {
      if (!it || !it.id) continue;
      const y = yearOf(it, dateField);
      if (!byYear.has(y)) byYear.set(y, []);
      byYear.get(y)!.push(it);
    }
    const years = Array.from(byYear.keys()).sort();
    const doneYears = progress.done[name] || {};
    const currentYear = String(new Date().getFullYear());
    for (const year of years) {
      if (stoppedByBudget) { nextYear = year; break; }
      // Ano corrente é sempre reenviado (para capturar edições recentes);
      // anos anteriores são enviados uma vez e marcados como concluídos.
      const isCurrent = year === currentYear;
      if (!isCurrent && doneYears[year]) continue;
      let startIdx = (doneYears as any)['_partial_' + year] || 0;
      let chunk = byYear.get(year)!.slice(startIdx);
      if (remainingBudget() < chunk.length) {
        chunk = chunk.slice(0, remainingBudget());
        stoppedByBudget = true;
      }
      const w = await writeMItems(scope, name, chunk);
      uploaded += w;
      if (stoppedByBudget) {
        const sent = progress.done[name] || {};
        (sent as any)['_partial_' + year] = startIdx + w;
        progress.done[name] = sent;
        nextYear = year;
        break;
      }
      // SÓ marca o ano como concluído se a escrita REALMENTE ocorreu.
      // Se w === 0 (ex.: erro de escrita capturado em writeMItems), NÃO marcamos,
      // para que uma próxima sincronização tente novamente. Marcar mesmo com
      // falha fazia os dados ficarem presos só no local e a nuvem ficava vazia.
      if (!isCurrent && w > 0) {
        doneYears[year] = true;
        delete (doneYears as any)['_partial_' + year];
      }
    }
    progress.done[name] = doneYears;
  }

  // Config (documento único em users/{uid}/mounjaro/config — 4 segmentos, par).
  // Sempre reenviado para garantir que edições recentes não fiquem presas só no
  // local. Não depende de progress.config (que poderia travar em "já enviado").
  if (!stoppedByBudget) {
    if (remainingBudget() >= 1) {
      try {
        await setDoc(doc(db, configDocPath(scope)), cleanForFirestore(data.config || {}));
        recordWrites(1);
        progress.config = true;
        uploaded++;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, configDocPath(scope));
      }
    } else stoppedByBudget = true;
  }

  setMProgress(scope, progress);
  return { uploaded, finished: !stoppedByBudget, stoppedByBudget, nextCollection, nextYear };
}
