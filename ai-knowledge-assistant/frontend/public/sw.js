// AI Knowledge Assistant High-Performance Service Worker
const CACHE_NAME = 'ai-knowledge-pwa-v4';
const OFFLINE_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-icon.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle GET requests
  if (request.method !== 'GET') return;

  // 2. Bypass external services (Clerk auth, Google translate, backend APIs, etc.)
  if (
    url.hostname.includes('clerk') ||
    url.pathname.includes('clerk') ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic')
  ) {
    return;
  }

  // 3. Navigation (Pages) -> Always Network First, fallback to cached page or offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offlinePage = await caches.match(OFFLINE_URL);
          return offlinePage || new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // 4. Static Assets (Images, Icons, CSS/JS chunks) -> Stale While Revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const resCopy = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, resCopy));
            }
            return networkRes;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // 5. Default -> Network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
