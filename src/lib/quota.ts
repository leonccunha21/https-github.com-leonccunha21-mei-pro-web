// Contador de cotas do Firestore (plano gratuito Spark: ~20.000 escritas e
// ~20.000 exclusões por dia). Contabilizamos escritas + exclusões como
// "operações" e comparamos com o limite diário para alertar o usuário.
// Módulo leve e sem dependência do Firebase, para poder ser importado
// estaticamente pela UI sem pesar o bundle inicial.

export const DAILY_WRITE_LIMIT = 20000;
const WRITE_COUNTER_KEY = 'zm_fw_writes';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

export interface DailyWrites {
  date: string;
  count: number;
  limit: number;
  ratio: number;
}

export function getDailyWrites(): DailyWrites {
  const limit = DAILY_WRITE_LIMIT;
  try {
    const raw = localStorage.getItem(WRITE_COUNTER_KEY);
    if (raw) {
      const o = JSON.parse(raw) as { date: string; count: number };
      if (o.date === todayStr()) {
        return { date: o.date, count: o.count || 0, limit, ratio: limit > 0 ? (o.count || 0) / limit : 0 };
      }
    }
  } catch { /* ignore */ }
  return { date: todayStr(), count: 0, limit, ratio: 0 };
}

export function recordWrites(n: number): void {
  if (n <= 0) return;
  try {
    const cur = getDailyWrites();
    const next = { date: todayStr(), count: cur.date === todayStr() ? cur.count + n : n };
    localStorage.setItem(WRITE_COUNTER_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}
