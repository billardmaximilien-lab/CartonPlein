// ANCIEN service worker (quand le jeu était à la racine du site).
// Il ne sert plus qu'à se désinstaller proprement chez les personnes qui avaient installé
// l'ancienne version, pour qu'elles voient bien la nouvelle page d'accueil.
// Le service worker du jeu vit désormais dans /jouer/sw.js.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('carton-plein-v')).map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then((clients) => clients.forEach((c) => c.navigate(c.url)))
  );
});
