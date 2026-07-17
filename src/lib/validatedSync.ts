import type { LocalDb } from './localDb';
import { saveUserDbIncremental } from './dbSync';

/**
 * Generic validation for a collection.
 * Ensures each item has a non‑empty string `id` and that IDs are unique.
 * Throws an Error describing the problem.
 */
function validateCollection<T extends { id: unknown }>(
  name: string,
  items: T[] | undefined,
): void {
  if (!items) return;
  const ids = new Set<string>();
  for (const [index, item] of items.entries()) {
    const id = (item as any).id;
    if (typeof id !== 'string' || id.trim() === '') {
      throw new Error(`Validation failed in collection "${name}": item at index ${index} missing a valid string 'id'.`);
    }
    if (ids.has(id)) {
      throw new Error(`Validation failed in collection "${name}": duplicate id "${id}" found.`);
    }
    ids.add(id);
  }
}

/**
 * Validate the entire local database before syncing to Firestore.
 * If validation passes, performs a full incremental sync (forceFull) to minimize quota usage.
 * Returns the result of the sync operation.
 */
export async function validateAndSync(
  userId: string,
  localDb: LocalDb,
): Promise<{ uploaded: number; deleted: number }> {
  // Validate each collection defined in the sync cache.
  const collections: (keyof LocalDb)[] = [
    'products',
    'categories',
    'sales',
    'orders',
    'customers',
    'suppliers',
    'purchases',
    'cashSessions',
    'loans',
    'expenses',
  ];

  for (const col of collections) {
    // @ts-ignore – the property exists on LocalDb
    validateCollection(col, (localDb as any)[col]);
  }

  // All validations passed – push to the cloud.
  // Using the incremental sync with forceFull to write only changed docs.
  const result = await saveUserDbIncremental(userId, localDb, { forceFull: true });
  return result;
}
