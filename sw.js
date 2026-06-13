// Service worker — Caixa Dentalsaúde
// Estratégia: network-first (mostra sempre a versão mais recente quando há rede;
// usa a cache só como recurso quando está offline). Evita servir versões antigas.
const CACHE = 'caixa-v1';

self.addEventListener('install', e => { self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return; // deixa POST/PATCH (Supabase) passar normalmente
  e.respondWith(
    fetch(req).then(r => {
      try {
        if (r && r.status === 200 && new URL(req.url).origin === location.origin) {
          const cp = r.clone();
          caches.open(CACHE).then(c => c.put(req, cp));
        }
      } catch (_) {}
      return r;
    }).catch(() => caches.match(req))
  );
});
