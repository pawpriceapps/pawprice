const CACHE_NAME = 'pawprice-v2';
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', event => {
  // Take control immediately — don't wait for old SW to finish
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => {
      // Take control of all open clients immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  // Never cache JS/CSS bundles — always fetch fresh from network
  if (event.request.url.includes('/static/js/') || 
      event.request.url.includes('/static/css/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Listen for SKIP_WAITING message from index.js
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
