const STORAGE_KEY = 'zm_backup_schedule';

export interface BackupSchedulePrefs {
  frequency: 'never' | 'daily' | 'weekly';
  lastBackup: string | null; // ISO date
  hour: number; // 0-23
}

export function getBackupSchedule(): BackupSchedulePrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return { frequency: 'never', lastBackup: null, hour: 22 };
}

export function saveBackupSchedule(prefs: BackupSchedulePrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function shouldRunBackup(prefs: BackupSchedulePrefs): boolean {
  if (prefs.frequency === 'never') return false;
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const todayHour = now.getHours();
  if (todayHour < prefs.hour) return false;
  if (prefs.lastBackup?.startsWith(today)) return false;
  if (prefs.frequency === 'weekly') {
    if (prefs.lastBackup) {
      const last = new Date(prefs.lastBackup);
      const daysSince = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())) / 86400000);
      if (daysSince < 7) return false;
    }
  }
  return true;
}
