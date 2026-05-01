const CACHE_NAME = "koreahouse-leave-v1";
const FILES = [
  "./",
  "./index.html",
  "./admin.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)));
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
