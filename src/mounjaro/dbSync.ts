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
import { recordWrites } from '../lib/quota';

// Sincronização do subsite Mounjaro PRO com o Firebase/Firestore.
// Modo "usuário": `users/{uid}/mounjaro/{colecao}` (isolado por conta).
// Modo "clínica": `clinicas/{clinicaId}/mounjaro/{colecao}` (compartilhado com a equipe).

export type MounjaroScope =
  | { tipo: 'user'; uid: string }
  | { tipo: 'clinica'; clinicaId: string };

function scopePath(scope: MounjaroScope, name: string): string {
  return scope.tipo === 'user'
    ? `users/${scope.uid}/mounjaro/${name}`
    : `clinicas/${scope.clinicaId}/mounjaro/${name}`;
}

const BATCH_SIZE = 500;

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

async function loadCollection<T>(scope: MounjaroScope, name: string): Promise<T[]> {
  const path = scopePath(scope, name);
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

async function saveBatch<T extends { id: string }>(scope: MounjaroScope, name: string, items: T[]): Promise<void> {
  const path = scopePath(scope, name);
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

async function clearCollection(scope: MounjaroScope, name: string): Promise<void> {
  const path = scopePath(scope, name);
  try {
    const snap = await getDocs(collection(db, path));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/** Carrega o banco completo do Mounjaro da nuvem. */
export async function loadMounjaroCloud(scope: MounjaroScope): Promise<Partial<MounjaroDb>> {
  const [clientes, pesagens, doses, pagamentos, fotos, auditoria, config] = await Promise.all([
    loadCollection<MounjaroDb['clientes'][number]>(scope, 'clientes'),
    loadCollection<MounjaroDb['pesagens'][number]>(scope, 'pesagens'),
    loadCollection<MounjaroDb['doses'][number]>(scope, 'doses'),
    loadCollection<MounjaroDb['pagamentos'][number]>(scope, 'pagamentos'),
    loadCollection<MounjaroDb['fotos'][number]>(scope, 'fotos'),
    loadCollection<MounjaroDb['auditoria'][number]>(scope, 'auditoria'),
    loadCollection<MounjaroDb['config']>(scope, 'config'),
  ]);
  return { clientes, pesagens, doses, pagamentos, fotos, auditoria, config: config[0], initialized: true };
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
    saveBatch(scope, 'config', [{ ...(data.config || {}), id: 'main' }]),
  ]);
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
