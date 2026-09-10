const CACHE_NAME = 'spo-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './data-schedule.js',
  './data-courses.js',
  './app.js',
  './vendor/fuse.min.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
