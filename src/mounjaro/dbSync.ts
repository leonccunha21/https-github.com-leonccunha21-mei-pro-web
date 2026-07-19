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
// Os dados ficam em `users/{uid}/mounjaro/{clientes,pesagens,doses,pagamentos}`
// (coleção dedicada, isolada do banco da loja).

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

async function loadCollection<T>(userId: string, name: string): Promise<T[]> {
  const path = `users/${userId}/mounjaro/${name}`;
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

async function saveBatch<T extends { id: string }>(userId: string, name: string, items: T[]): Promise<void> {
  const path = `users/${userId}/mounjaro/${name}`;
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
  const path = `users/${userId}/mounjaro/${name}`;
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
export async function loadMounjaroCloud(userId: string): Promise<Partial<MounjaroDb>> {
  const [clientes, pesagens, doses, pagamentos, fotos, auditoria] = await Promise.all([
    loadCollection<MounjaroDb['clientes'][number]>(userId, 'clientes'),
    loadCollection<MounjaroDb['pesagens'][number]>(userId, 'pesagens'),
    loadCollection<MounjaroDb['doses'][number]>(userId, 'doses'),
    loadCollection<MounjaroDb['pagamentos'][number]>(userId, 'pagamentos'),
    loadCollection<MounjaroDb['fotos'][number]>(userId, 'fotos'),
    loadCollection<MounjaroDb['auditoria'][number]>(userId, 'auditoria'),
  ]);
  return { clientes, pesagens, doses, pagamentos, fotos, auditoria, initialized: true };
}

/** Salva o banco completo do Mounjaro na nuvem (substitui as coleções). */
export async function saveMounjaroCloud(userId: string, data: MounjaroDb): Promise<void> {
  await Promise.all([
    saveBatch(userId, 'clientes', data.clientes || []),
    saveBatch(userId, 'pesagens', data.pesagens || []),
    saveBatch(userId, 'doses', data.doses || []),
    saveBatch(userId, 'pagamentos', data.pagamentos || []),
    saveBatch(userId, 'fotos', data.fotos || []),
    saveBatch(userId, 'auditoria', data.auditoria || []),
  ]);
}

/** Salva apenas uma coleção (uso incremental leve). */
export async function saveMounjaroCollection<T extends { id: string }>(
  userId: string,
  name: 'clientes' | 'pesagens' | 'doses' | 'pagamentos' | 'fotos' | 'auditoria',
  items: T[]
): Promise<void> {
  await saveBatch(userId, name, items as any);
}

/** Apaga todos os dados do Mounjaro do usuário na nuvem. */
export async function clearMounjaroCloud(userId: string): Promise<void> {
  await Promise.all([
    clearCollection(userId, 'clientes'),
    clearCollection(userId, 'pesagens'),
    clearCollection(userId, 'doses'),
    clearCollection(userId, 'pagamentos'),
    clearCollection(userId, 'fotos'),
    clearCollection(userId, 'auditoria'),
  ]);
}
