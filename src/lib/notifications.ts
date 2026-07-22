const STORAGE_KEY = 'zm_notification_prefs';

export interface NotificationPrefs {
  debtReminder: boolean;
  lowStockAlert: boolean;
  dailySummary: boolean;
}

export function getPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return { debtReminder: true, lowStockAlert: true, dailySummary: false };
}

export function savePrefs(prefs: NotificationPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function requestPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return Promise.resolve(false);
  if (Notification.permission === 'granted') return Promise.resolve(true);
  if (Notification.permission === 'denied') return Promise.resolve(false);
  return Notification.requestPermission().then(p => p === 'granted');
}

export function sendNotification(title: string, body: string, icon?: string) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      silent: false,
    });
  } catch { /* */ }
}

export async function checkAndNotify(prefs: NotificationPrefs) {
  if (!prefs.debtReminder) return;
  try {
    const { loadDb } = await import('./localDb');
    const db = await loadDb();
    const sales = (db?.sales || []) as any[];
    const pending = sales.filter((s: any) => s.status === 'pending');
    if (pending.length > 0) {
      const total = pending.reduce((a: number, s: any) => a + s.total, 0);
      sendNotification(
        'Contas a Receber',
        `${pending.length} venda(s) pendente(s) — total de R$ ${total.toFixed(2)}`
      );
    }
  } catch { /* */ }
}
