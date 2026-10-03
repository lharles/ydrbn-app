const CACHE_NAME = 'ydrbn-cache-v1';

const ASSETS_TO_CACHE = [
  '/ydrbn-app/',
  '/ydrbn-app/index.html',
  '/ydrbn-app/manifest.json',
  '/ydrbn-app/icon-192.png',
  '/ydrbn-app/icon-512.png'
];

// Install Event: Cache the essential shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event: Clean up old cache versions if we update the app
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache-First strategy for instant offline loads
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If found in cache, return it instantly
      if (cachedResponse) {
        return cachedResponse;
      }
      // Otherwise, fetch from the network
      return fetch(event.request).then((networkResponse) => {
        // Cache new successful requests dynamically (like JS/CSS bundles)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});