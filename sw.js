const CACHE_NAME = 'robin-agent-v2.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/README.md',
  '/LICENSE',
  
  // Core app logic
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/hooks/useLocalDB.ts',
  '/hooks/useHashNavigation.ts',

  // CDNs
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use {cache: "reload"} to ensure we get fresh files from the network
        const requests = urlsToCache.map(url => new Request(url, {cache: 'reload'}));
        return cache.addAll(requests);
      })
      .catch(err => {
        console.error('ServiceWorker failed to cache during install:', err);
      })
  );
});

/**
 * Strategy: Stale-While-Revalidate
 * Responds from cache immediately if available, then updates the cache from the network.
 */
async function staleWhileRevalidate(request) {
  // 1. Open the cache.
  const cache = await caches.open(CACHE_NAME);
  
  // 2. Look for a cached version of the requested file.
  const cachedResponse = await cache.match(request);

  // 3. Start a "fetch promise". This kicks off a network request in the background.
  const fetchPromise = fetch(request).then(networkResponse => {
    // 4. When the network responds, check if it's a valid response.
    if (networkResponse && networkResponse.status === 200) {
      // 5. If it's valid, update the cache with the new version.
      //    This is the "revalidate" part. The user won't see this new version
      //    until the next load.
      //    We also preserve the existing logic to not cache dynamic esm.sh modules.
      if (!request.url.includes('esm.sh')) {
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  });

  // 6. Return the cached response if it exists, otherwise wait for the network.
  //    This ensures the user gets content as fast as possible while keeping it updated.
  return cachedResponse || fetchPromise;
}

self.addEventListener('fetch', event => {
  // Apply the stale-while-revalidate strategy to all fetch requests.
  // This provides a good balance of speed and freshness.
  event.respondWith(staleWhileRevalidate(event.request));
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});