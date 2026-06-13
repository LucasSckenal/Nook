/* Nook service worker — cache leve para abrir rápido e funcionar offline.
   Estratégia: stale-while-revalidate para assets, network-first para páginas. */

const CACHE = "nook-v1";
const ASSET_PATTERNS = [/\/room\//, /\/Icones\//, /\/icons\//, /\/_next\/static\//];

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;

  const isAsset = ASSET_PATTERNS.some((p) => p.test(url.pathname));

  if (isAsset) {
    // stale-while-revalidate: serve do cache, atualiza por trás
    e.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(e.request);
        const fresh = fetch(e.request)
          .then((res) => {
            if (res.ok) cache.put(e.request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached ?? fresh;
      })
    );
    return;
  }

  // páginas: rede primeiro, cache como rede de segurança
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok && url.pathname === "/") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((c) => c ?? caches.match("/")))
  );
});
