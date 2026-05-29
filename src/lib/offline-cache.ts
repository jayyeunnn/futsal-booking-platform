/**
 * Tiny localStorage-backed cache used as a last-resort fallback for the
 * dashboard bookings page when both the network and the SW cache fail.
 *
 * Key design choices:
 *   - localStorage (not IndexedDB) — payload is small (last N bookings),
 *     and synchronous reads keep first-paint fast.
 *   - Stores a versioned + namespaced JSON envelope so we can evolve the
 *     shape later without colliding with stale entries.
 *   - Per-user namespacing so logout/login won't show the wrong bookings.
 */

const VERSION = 1;
const PREFIX = "jayfield:offline:";

type Envelope<T> = {
  v: number;
  /** ISO timestamp of when the cache entry was written. */
  cachedAt: string;
  data: T;
};

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function key(scope: string, userId?: string | null): string {
  return `${PREFIX}${scope}${userId ? `:${userId}` : ""}`;
}

export function setOfflineCache<T>(
  scope: string,
  data: T,
  userId?: string | null
): void {
  const ls = safeStorage();
  if (!ls) return;
  const env: Envelope<T> = {
    v: VERSION,
    cachedAt: new Date().toISOString(),
    data,
  };
  try {
    ls.setItem(key(scope, userId), JSON.stringify(env));
  } catch {
    // Quota exceeded or serialization failed — silently drop.
  }
}

export function getOfflineCache<T>(
  scope: string,
  userId?: string | null
): { data: T; cachedAt: string } | null {
  const ls = safeStorage();
  if (!ls) return null;
  const raw = ls.getItem(key(scope, userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Envelope<T>;
    if (parsed.v !== VERSION) return null;
    return { data: parsed.data, cachedAt: parsed.cachedAt };
  } catch {
    return null;
  }
}

export function clearOfflineCache(scope: string, userId?: string | null): void {
  const ls = safeStorage();
  if (!ls) return;
  try {
    ls.removeItem(key(scope, userId));
  } catch {
    // ignore
  }
}

/** Wipe every JayField offline cache entry (e.g. on logout). */
export function clearAllOfflineCaches(): void {
  const ls = safeStorage();
  if (!ls) return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < ls.length; i += 1) {
      const k = ls.key(i);
      if (k && k.startsWith(PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => ls.removeItem(k));
  } catch {
    // ignore
  }
}
