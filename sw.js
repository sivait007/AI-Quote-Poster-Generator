const CACHE_NAME = 'posterly-v2'; // Bump version to invalidate old cache

// Assets to pre-cache on installation for a reliable offline experience
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/icon.svg',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/@google/genai@^1.29.1',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0',
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm',
  'https://fonts.googleapis.com/css2?family=Caveat&family=Inter:wght@400;500;700&family=Lobster&family=Merriweather:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Sans+Devanagari&family=Noto+Sans+Tamil&family=Pacifico&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:wght@400;700&family=Roboto+Mono&display=swap'
];

// On install, pre-cache the app shell and core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Pre-caching core assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()) // Force the waiting service worker to become the active one.
  );
});

// On activation, clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open clients immediately
  );
});

// On fetch, apply intelligent caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g., POST)
  if (request.method !== 'GET') {
    return;
  }
  
  // Strategy 1: Network only for Gemini API calls. Never cache these.
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Strategy 2: Cache First for Google Fonts and other immutable assets.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then(networkResponse => {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, cacheCopy);
          });
          return networkResponse;
        });
      })
    );
    return;
  }
  
  // Strategy 3: Stale-While-Revalidate for app assets (CSS, JS, local images)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        // Check for valid response to cache
        if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
        }
        return networkResponse;
      }).catch(err => {
        console.error('[SW] Fetch failed:', err);
        // Here you could return a fallback page if you had one in cache
      });

      // Return cached response immediately if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
