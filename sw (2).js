var CACHE = 'budget-v8';
var ASSETS = [
  '/budget-pwa/',
  '/budget-pwa/index.html',
  '/budget-pwa/manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Network first — всегда берём свежую версию
self.addEventListener('fetch', function(e) {
  if(e.request.url.includes('script.google.com') ||
     e.request.url.includes('anthropic.com') ||
     e.request.url.includes('googleapis.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(function(resp) {
        var clone = resp.clone();
        caches.open(CACHE).then(function(cache){
          cache.put(e.request, clone);
        });
        return resp;
      })
      .catch(function() {
        return caches.match(e.request);
      })
  );
});
