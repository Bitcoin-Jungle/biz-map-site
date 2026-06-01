/**
 * sync.ts — IndexedDB-backed cache and incremental sync for BTC Map CR places.
 *
 * LOAD STRATEGY
 * ─────────────
 * 1. INSTANT PINS  (cold start, ~sub-second)
 *    Call fetchSnapshot() from btcmap.ts → ~28k lightweight pins (id/lat/lon/icon).
 *    Filter with inCostaRica(). Render markers immediately with inferCategory(icon).
 *    No IndexedDB involved; purely in-memory for the first paint.
 *
 * 2. FULL DATA  (enrichment + offline cache)
 *    Call syncPlaces() → reads IndexedDB cursor, hits /v4/places with
 *    updated_since on warm cache, does a full fetch on cold cache.
 *    Filters to CR, upserts to IndexedDB, evicts deleted places.
 *    Returns the full cached CR place list for the detail panel and search.
 *    On subsequent calls the incremental diff is tiny (seconds, not MB).
 *
 * 3. DETAIL PANEL  (on pin tap, warm cache miss)
 *    Call fetchPlace(id, DETAIL_FIELDS) from btcmap.ts to hydrate a single
 *    place without waiting for a full sync.
 *
 * CURSOR DISCIPLINE
 * ─────────────────
 * The sync cursor is the max `updated_at` string from the *received* batch,
 * not the client clock. This is safe across timezones and clock skew.
 * Stored as a plain ISO8601 string in the "meta" store under key "cursor".
 */

import { BtcMapPlace } from "../types/btcmap"
import { fetchPlaces, inCostaRica, DETAIL_FIELDS } from "./btcmap"

const DB_NAME = "btcmap-cr"
const DB_VERSION = 1
const STORE_PLACES = "places"
const STORE_META = "meta"

// ─── IndexedDB bootstrap ──────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_PLACES)) {
        db.createObjectStore(STORE_PLACES, { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META)
      }
    }
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    req.onerror = () => reject(req.error)
  })
}

function idbGet<T>(db: IDBDatabase, store: string, key: IDBValidKey): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly")
    const req = tx.objectStore(store).get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error)
  })
}

function idbPut(db: IDBDatabase, store: string, value: unknown, key?: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite")
    const s = tx.objectStore(store)
    if (key !== undefined) s.put(value, key)
    else s.put(value)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function idbDelete(db: IDBDatabase, store: string, key: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite")
    tx.objectStore(store).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function idbGetAll<T>(db: IDBDatabase, store: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly")
    const req = tx.objectStore(store).getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

// Bulk upsert + evict in a single transaction for performance.
function idbBatchUpsertEvict(
  db: IDBDatabase,
  toUpsert: BtcMapPlace[],
  toEvict: number[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PLACES, "readwrite")
    const store = tx.objectStore(STORE_PLACES)
    for (const place of toUpsert) store.put(place)
    for (const id of toEvict) store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Return all CR places currently in the IndexedDB cache.
 * Fast path for rendering on repeat visits before sync completes.
 */
export async function loadCached(): Promise<BtcMapPlace[]> {
  const db = await openDB()
  return idbGetAll<BtcMapPlace>(db, STORE_PLACES)
}

/**
 * Incremental sync against /v4/places.
 *
 * - Cold cache (no cursor): fetches all places, filters to CR, stores them.
 * - Warm cache: fetches only places updated since last cursor, upserts CR
 *   ones, evicts deleted ones.
 * - Cursor is set to max(updated_at) of the received batch — never the clock.
 *
 * Returns the full updated CR place list from IndexedDB after the sync.
 */
export async function syncPlaces(): Promise<BtcMapPlace[]> {
  const db = await openDB()

  // Read the persisted cursor (ISO8601 string or undefined on cold cache).
  const cursor = await idbGet<string>(db, STORE_META, "cursor")

  // Fetch from API — full on cold, incremental on warm.
  const batch = await fetchPlaces(cursor)

  if (batch.length === 0) {
    // Nothing changed since last sync.
    return idbGetAll<BtcMapPlace>(db, STORE_PLACES)
  }

  // Partition: CR places to upsert vs. deleted places to evict.
  const toUpsert: BtcMapPlace[] = []
  const toEvict: number[] = []

  for (const place of batch) {
    if (place.deleted_at) {
      toEvict.push(place.id)
    } else if (inCostaRica(place)) {
      toUpsert.push(place)
    }
    // Non-CR, non-deleted places are ignored — no-op.
  }

  // Persist upserts and evictions.
  await idbBatchUpsertEvict(db, toUpsert, toEvict)

  // Advance cursor to max updated_at in the batch. Use string comparison —
  // ISO8601 sorts lexicographically correctly.
  let newCursor = cursor ?? ""
  for (const place of batch) {
    if (place.updated_at && place.updated_at > newCursor) {
      newCursor = place.updated_at
    }
  }
  if (newCursor && newCursor !== cursor) {
    await idbPut(db, STORE_META, newCursor, "cursor")
  }

  return idbGetAll<BtcMapPlace>(db, STORE_PLACES)
}

/**
 * Return the last-sync cursor (ISO8601 string) stored in IndexedDB, or null.
 * The cursor is the max updated_at from the last completed sync batch.
 */
export async function getLastSync(): Promise<string | null> {
  const db = await openDB()
  const cursor = await idbGet<string>(db, STORE_META, "cursor")
  return cursor ?? null
}

/**
 * Wipe the local cache and cursor. Useful for testing or forced refresh.
 */
export async function clearCache(): Promise<void> {
  const db = await openDB()
  await Promise.all([
    new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PLACES, "readwrite")
      tx.objectStore(STORE_PLACES).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    }),
    idbDelete(db, STORE_META, "cursor"),
  ])
}

// Re-export DETAIL_FIELDS so callers don't need to import from two places.
export { DETAIL_FIELDS }
