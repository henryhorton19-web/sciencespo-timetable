const CACHE_NAME = 'spo-v6';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './data-schedule.js',
  './data-courses.js',
  './app.js',
  './vendor/fuse.min.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isNetworkFirst = event.request.mode === 'navigate' || 
                         url.pathname.endsWith('/app.js') || 
                         url.pathname.endsWith('/data-schedule.js') || 
                         url.pathname.endsWith('/data-courses.js') ||
                         url.pathname.endsWith('/styles.css') ||
                         url.pathname.endsWith('/index.html') ||
                         url.pathname.endsWith('/');

  if (isNetworkFirst) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim())
  );
});
