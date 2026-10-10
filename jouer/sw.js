// Service worker du jeu (dossier /jouer/) : permet de jouer hors-ligne et d'installer l'appli.
// Incrémente CACHE_VERSION à chaque mise à jour du jeu pour rafraîchir le cache.
const CACHE_VERSION = 'carton-plein-jeu-v2.2.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  '../assets/fonts/fonts.css',
  '../assets/fonts/bebas-neue.woff2',
  '../assets/fonts/work-sans-400.woff2',
  '../assets/fonts/work-sans-600.woff2',
  '../assets/fonts/work-sans-700.woff2',
  '../assets/fonts/dancing-script-700.woff2',
  '../assets/fonts/lora-500.woff2',
  '../assets/fonts/lora-700.woff2',
  '../assets/fonts/lora-500-italic.woff2',
  '../assets/fonts/space-mono-400.woff2',
  '../assets/fonts/space-mono-700.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k.startsWith('carton-plein') && k !== CACHE_VERSION).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// HTML : réseau d'abord (mises à jour), sinon cache (hors-ligne). Le reste : cache d'abord.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isHTML) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
  } else {
    e.respondWith(caches.match(req).then((r) => r || fetch(req)));
  }
});
