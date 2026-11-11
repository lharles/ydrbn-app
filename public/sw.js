const CACHE_NAME = 'ydrbn-cache-v26';
const APP_SHELL = [
  '/ydrbn-app/',
  '/ydrbn-app/index.html',
  '/ydrbn-app/demo.html',
  '/ydrbn-app/manifest.json',
  '/ydrbn-app/video/guide.mp4',
  '/ydrbn-app/video/atj.mp4',
  '/ydrbn-app/audio/stems/ATJ.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never cache version.json; return clean offline indicator if disconnected
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(
        () =>
          new Response(JSON.stringify({ offline: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
      )
    );
    return;
  }

  // Network-first for HTML navigations & Cargo Bay /content/ manifests (instant cache fallback offline)
  const isHtmlNav =
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('/ydrbn-app/');

  if (isHtmlNav || url.pathname.includes('/content/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => {
            if (cached) return cached;
            if (isHtmlNav) return caches.match('/ydrbn-app/index.html');
            return Response.error();
          })
        )
    );
    return;
  }

  // Cache-first for fonts, audio stems, video, and hashed bundle assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
