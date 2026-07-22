// Helpers de data no fuso horário LOCAL (evita o bug de UTC do toISOString(),
// que jogava vendas cadastradas à noite para o "dia seguinte" em fusos como o
// do Brasil, embaralhando a ordenação do histórico).

// Retorna a data/hora atual como ISO *sem* o sufixo "Z", para que `new Date()`
// a interprete no fuso local do navegador (e não como UTC).
export function localNowISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `.${String(d.getMilliseconds()).padStart(3, '0')}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

// Data de hoje no formato "YYYY-MM-DD" (fuso local).
export function todayLocalISODate(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Verifica se a data da venda (qualquer formato aceito pelo app) cai no mesmo
// dia calendário que `dayStr` ("YYYY-MM-DD", fuso local).
export function isSameLocalDay(dateStr: string, dayStr: string): boolean {
  if (!dateStr) return false;
  const m1 = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  let y: number, mo: number, da: number;
  if (m1) {
    y = +m1[1]; mo = +m1[2] - 1; da = +m1[3];
  } else {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    y = d.getFullYear(); mo = d.getMonth(); da = d.getDate();
  }
  const [ty, tmo, tda] = dayStr.split('-').map(Number);
  return y === ty && mo + 1 === tmo && da === tda;
}
