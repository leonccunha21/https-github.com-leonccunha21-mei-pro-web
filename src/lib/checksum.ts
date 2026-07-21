const CHECKSUM_PREFIX = 'zm_checksum_';

function fnv1a(data: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function computeChecksum(collection: unknown[]): string {
  const sorted = [...collection].sort((a, b) => {
    const idA = (a as any).id ?? '';
    const idB = (b as any).id ?? '';
    return idA < idB ? -1 : idA > idB ? 1 : 0;
  });
  return fnv1a(JSON.stringify(sorted));
}

export function saveChecksum(collectionName: string, hash: string): void {
  try {
    localStorage.setItem(CHECKSUM_PREFIX + collectionName, hash);
  } catch { /* ignore */ }
}

export function getSavedChecksum(collectionName: string): string | null {
  try {
    return localStorage.getItem(CHECKSUM_PREFIX + collectionName);
  } catch { return null; }
}

export function getAllChecksums(): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CHECKSUM_PREFIX)) {
        const name = key.slice(CHECKSUM_PREFIX.length);
        const val = localStorage.getItem(key);
        if (val) result[name] = val;
      }
    }
  } catch { /* ignore */ }
  return result;
}

export function verifyChecksum(
  collectionName: string,
  collection: unknown[]
): { ok: boolean; saved: string | null; computed: string } {
  const saved = getSavedChecksum(collectionName);
  const computed = computeChecksum(collection);
  return { ok: saved === computed, saved, computed };
}
