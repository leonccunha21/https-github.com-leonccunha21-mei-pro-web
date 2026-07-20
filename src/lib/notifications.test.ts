import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { getPrefs, savePrefs } from './notifications';

const store: Record<string, string> = {};
before(() => {
  globalThis.localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { for (const k in store) delete store[k]; },
    length: 0,
    key: () => null,
  } as any;
});

test('getPrefs: returns defaults when no stored prefs', () => {
  delete store.zm_notification_prefs;
  const prefs = getPrefs();
  assert.equal(prefs.debtReminder, true);
  assert.equal(prefs.lowStockAlert, true);
  assert.equal(prefs.dailySummary, false);
});

test('savePrefs and getPrefs round-trip', () => {
  savePrefs({ debtReminder: false, lowStockAlert: false, dailySummary: true });
  const prefs = getPrefs();
  assert.equal(prefs.debtReminder, false);
  assert.equal(prefs.lowStockAlert, false);
  assert.equal(prefs.dailySummary, true);
  savePrefs({ debtReminder: true, lowStockAlert: true, dailySummary: false });
});

test('getPrefs: returns defaults on corrupted localStorage', () => {
  store.zm_notification_prefs = 'not-json';
  const prefs = getPrefs();
  assert.equal(prefs.debtReminder, true);
});
