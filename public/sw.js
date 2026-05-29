/* JayField Service Worker
 * ----------------------------------------------------
 * Vanilla Cache API implementation (no third-party libs).
 *
 * Strategies:
 *   - Static assets (CSS / JS / fonts / images): stale-while-revalidate
 *   - API GET on whitelisted endpoints: network-first, cache fallback
 *   - HTML navigations: network-first, cache fallback, then offline page
 *
 * Push events drive in-app notifications when the tab is closed.
 *
 * Bump CACHE_VERSION when shipping breaking SW changes; old caches
 * are pruned on activate.
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `jayfield-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `jayfield-runtime-${CACHE_VERSION}`;
const API_CACHE = `jayfield-api-${CACHE_VERSION}`;

// Pages we want available offline straight after install.
const PRECACHE_URLS = [
  "/",
  "/id",
  "/en",
  "/id/offline",
  "/en/offline",
];

// API paths whose GET responses are safe to cache (read-only, user-scoped).
// Auth-sensitive endpoints (e.g. /api/auth/*) are intentionally excluded.
const CACHEABLE_API_PATTERNS = [
  /^\/api\/bookings(?:\?|$)/,
  /^\/api\/bookings\/[^/]+$/,
  /^\/api\/members\/profile/,
  /^\/api\/notifications(?:\?|$)/,
  /^\/api\/locations/,
  /^\/api\/courts/,
  /^\/api\/promos\/active/,
];

const NEVER_CACHE_PATTERNS = [
  /^\/api\/auth\//,
  /^\/api\/admin\//,
  /^\/api\/cron\//,
  /^\/api\/uploadthing/,
  /^\/api\/notifications\/subscribe/,
  /^\/api\/notifications\/[^/]+\/read/,
  /^\/api\/notifications\/read-all/,
  /^\/api\/members\/change-password/,
  /^\/api\/members\/redeem/,
];

/* ---------- install / activate ---------- */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      // Pre-cache best-effort: don't fail the install if any single URL
      // is unavailable (e.g. fresh deploy where pages aren't built yet).
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch(() => {
            /* skip */
          })
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (k) =>
              ![STATIC_CACHE, RUNTIME_CACHE, API_CACHE].includes(k) &&
              k.startsWith("jayfield-")
          )
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

/* ---------- fetch ---------- */

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only handle requests to our own origin.
  if (url.origin !== self.location.origin) return;

  // Hard skip endpoints that should never be cached.
  if (NEVER_CACHE_PATTERNS.some((p) => p.test(url.pathname))) return;

  // HTML navigations -> network-first with offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(handleNavigation(req));
    return;
  }

  // Whitelisted API GETs -> network-first with cache fallback.
  if (
    url.pathname.startsWith("/api/") &&
    CACHEABLE_API_PATTERNS.some((p) => p.test(url.pathname))
  ) {
    event.respondWith(networkFirst(req, API_CACHE));
    return;
  }

  // Other API requests -> network only (don't intercept).
  if (url.pathname.startsWith("/api/")) return;

  // Static assets -> stale-while-revalidate.
  if (isStaticAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }
});

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/_next/image") ||
    /\.(?:js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|gif|svg|webp|avif|ico)$/i.test(
      pathname
    )
  );
}

async function handleNavigation(request) {
  try {
    const fresh = await fetch(request);
    // Cache the latest HTML for next time.
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, fresh.clone()).catch(() => {});
    return fresh;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Pick locale-appropriate offline page based on URL.
    const url = new URL(request.url);
    const isEn = url.pathname.startsWith("/en");
    const offlineUrl = isEn ? "/en/offline" : "/id/offline";
    const offline = await caches.match(offlineUrl);
    if (offline) return offline;

    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({
        success: false,
        error: { code: "OFFLINE", message: "Tidak ada koneksi internet" },
        offline: true,
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => null);
  return cached || networkPromise || fetch(request);
}

/* ---------- push notifications ---------- */

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "JayField",
      body: event.data ? event.data.text() : "",
    };
  }

  const title = payload.title || "JayField";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    data: { url: payload.url || "/", ...(payload.data || {}) },
    tag: payload.tag,
    renotify: Boolean(payload.tag),
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      // Focus an existing tab if any is open at our origin.
      for (const client of all) {
        try {
          const u = new URL(client.url);
          if (u.origin === self.location.origin) {
            await client.focus();
            if ("navigate" in client) {
              await client.navigate(targetUrl);
            }
            return;
          }
        } catch {
          /* ignore */
        }
      }
      // Otherwise open a new window.
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

/* ---------- messaging (skipWaiting) ---------- */

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
