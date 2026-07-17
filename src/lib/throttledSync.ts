import { db, handleFirestoreError, OperationType } from './firebase';
import { LocalDb } from './localDb';
import { recordWrites, getDailyWrites } from './quota';
import { writeBatch, doc, setDoc } from 'firebase/firestore';

const BATCH_SIZE = 500;

// ---------------------------------------------------------------------------
// SINCRONIZAÇÃO EM LOTES COM ORÇAMENTO DIÁRIO (anti-estouro de cota)
//
// Plano gratuito do Firestore: ~20.000 escritas/dia. Reenviar o banco inteiro
// (milhares de documentos) numa única tacada estoura a cota logo no início.
//
// Estratégia:
//   1. Agrupa os documentos a enviar por ANO (extraindo a data de cada item),
//      processando do ano mais antigo para o mais recente.
//   2. Envia ano a ano, em batches de 500, respeitando um ORÇAMENTO DIÁRIO de
//      escritas. Quando a cota do dia se esgota, PARA e continua no dia seguinte.
//   3. O progresso (anos/coleções já enviados) é persistido em localStorage,
//      então no dia seguinte ele retoma de onde parou, sem reenviar o concluído.
//
// Assim a cota nunca é consumida toda de uma vez: a sincronização inicial fica
// distribuída ao longo de vários dias, sem erro por exceder o limite.
// ---------------------------------------------------------------------------

const SYNC_PROGRESS_PREFIX = 'zm_cloud_progress_';

// Orçamento diário de escritas reservado para a sincronização (deixamos uma
// folga para as escritas normais da interface). Ajuste conforme necessário.
export const SYNC_DAILY_BUDGET = 8000;

type Progress = {
  // Coleção -> ano -> true (ano concluído)
  done: Record<string, Record<string, true>>;
  // storeInfo já enviado?
  storeInfo?: boolean;
};

const SYNC_COLLECTIONS: (keyof LocalDb)[] = [
  'products', 'categories', 'sales', 'orders', 'customers',
  'suppliers', 'purchases', 'cashSessions', 'loans', 'expenses',
  'leads', 'leadJobs', 'whatsappInstances', 'aiAgents',
];

// Campos de data usados para agrupar por ano, por coleção.
const DATE_FIELDS: Partial<Record<keyof LocalDb, string>> = {
  sales: 'date',
  orders: 'date',
  expenses: 'date',
  purchases: 'date',
  customers: 'createdAt',
  suppliers: 'createdAt',
  products: 'createdAt',
  loans: 'loanDate',
  cashSessions: 'openDate',
};

function getYearOf(item: any, dateField?: string): string {
  if (!dateField) return '__nodate__';
  const v = item?.[dateField];
  if (!v) return '__nodate__';
  // Aceita ISO ("2024-...") ou timestamp numérico/Date
  const d = typeof v === 'number' ? new Date(v) : new Date(v);
  if (isNaN(d.getTime())) return '__nodate__';
  return String(d.getFullYear());
}

export function getSyncProgress(userId: string): Progress {
  try {
    const raw = localStorage.getItem(SYNC_PROGRESS_PREFIX + userId);
    if (raw) return JSON.parse(raw) as Progress;
  } catch { /* ignore */ }
  return { done: {} };
}

function setSyncProgress(userId: string, p: Progress): void {
  try {
    localStorage.setItem(SYNC_PROGRESS_PREFIX + userId, JSON.stringify(p));
  } catch { /* ignore */ }
}

export function clearSyncProgress(userId: string): void {
  try {
    localStorage.removeItem(SYNC_PROGRESS_PREFIX + userId);
  } catch { /* ignore */ }
}

// Remove campos undefined (Firestore não aceita) recursivamente.
function cleanForFirestore<T>(value: T): any {
  if (value === undefined || value === null) return null;
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

async function writeItems(
  userId: string,
  name: string,
  items: any[],
): Promise<number> {
  if (!items.length) return 0;
  const path = `users/${userId}/${name}`;
  let written = 0;
  try {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const chunk = items.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        batch.set(doc(db, path, item.id), cleanForFirestore(item));
      }
      await batch.commit();
      written += chunk.length;
      recordWrites(chunk.length);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
  return written;
}

export interface ThrottledSyncResult {
  uploaded: number;
  remaining: number;
  finished: boolean;        // true se concluiu tudo hoje
  stoppedByBudget: boolean; // true se parou por ter atingido o orçamento do dia
  nextYear?: string;        // próximo ano a processar (se parou por orçamento)
}

/**
 * Envia o banco para a nuvem em lotes, ano a ano, respeitando o orçamento
 * diário de escritas. Se a cota do dia se esgotar, para e retoma no dia
 * seguinte (o progresso é salvo em localStorage).
 */
export async function syncToCloudThrottled(
  userId: string,
  dbData: LocalDb,
  opts?: { resetProgress?: boolean },
): Promise<ThrottledSyncResult> {
  if (opts?.resetProgress) clearSyncProgress(userId);
  const progress = getSyncProgress(userId);

  let uploaded = 0;
  let remaining = 0;
  let stoppedByBudget = false;
  let nextYear: string | undefined;

  const remainingBudget = () => {
    const used = getDailyWrites().count;
    return Math.max(0, SYNC_DAILY_BUDGET - used);
  };

  // Processa cada coleção, agrupando por ano.
  for (const name of SYNC_COLLECTIONS) {
    if (stoppedByBudget) break;
    const items = (dbData[name] as Array<{ id?: string }> | undefined) || [];
    const dateField = DATE_FIELDS[name];

    // Agrupa por ano
    const byYear = new Map<string, any[]>();
    for (const item of items) {
      if (!item || !item.id) continue;
      const y = getYearOf(item, dateField);
      if (!byYear.has(y)) byYear.set(y, []);
      byYear.get(y)!.push(item);
    }

    const years = Array.from(byYear.keys()).sort(); // do mais antigo p/ recente
    const doneYears = progress.done[name] || {};

    for (const year of years) {
      if (stoppedByBudget) { nextYear = year; break; }
      if (doneYears[year]) continue; // ano já enviado anteriormente

      // Retoma de onde parou se este ano foi parcialmente enviado outro dia.
      let startIdx = (doneYears as any)['_partial_' + year] || 0;

      let chunk = byYear.get(year)!.slice(startIdx);
      // Se o orçamento restante do dia é menor que o que falta do ano, envia só
      // o que cabe e "pausa" o ano (não marca como concluído) para retomar amanhã.
      if (remainingBudget() < chunk.length) {
        chunk = chunk.slice(0, remainingBudget());
        stoppedByBudget = true;
      }

      const w = await writeItems(userId, name, chunk);
      uploaded += w;

      if (stoppedByBudget) {
        // Ano parcialmente enviado: guarda quantos itens JÁ foram enviados
        // deste ano para retomar do índice correto no dia seguinte.
        const sent = progress.done[name] || {};
        (sent as any)['_partial_' + year] = startIdx + w;
        progress.done[name] = sent;
        nextYear = year;
        break;
      }

      doneYears[year] = true;
      // Limpa eventual parcial anteriormente salva
      delete (doneYears as any)['_partial_' + year];
    }
    progress.done[name] = doneYears;
  }

  // storeInfo (documento único)
  if (!stoppedByBudget && !progress.storeInfo) {
    if (remainingBudget() >= 1) {
      try {
        await setDoc(doc(db, `users/${userId}/config/storeInfo`), cleanForFirestore(dbData.storeInfo ?? {}));
        recordWrites(1);
        progress.storeInfo = true;
        uploaded++;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${userId}/config/storeInfo`);
      }
    } else {
      stoppedByBudget = true;
    }
  }

  setSyncProgress(userId, progress);

  return {
    uploaded,
    remaining: 0,
    finished: !stoppedByBudget,
    stoppedByBudget,
    nextYear,
  };
}
