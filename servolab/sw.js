/* ServoLab çevrimdışı önbelleği. Dosyalar değişince CACHE adındaki sürümü artır. */
const CACHE = 'servolab-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', '../assets/favicon.svg', '../assets/icon-180.png', '../assets/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('servolab-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Aynı kökenli GET istekleri: önbellekten ver, arkada tazele. Google Fonts önbelleğe alınmaz (çevrimdışıyken yedek yazı tipleri kullanılır). */
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(r, {ignoreSearch: true}).then(hit => {
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
