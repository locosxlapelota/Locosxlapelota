// Service Worker mínimo — necesario para que Chrome considere la app "instalable".
// No cachea datos en vivo (partidos, pozos, posiciones) a propósito: esa info
// siempre tiene que venir fresca del backend de Apps Script.
const CACHE_NAME = 'betnow-shell-v1';
const ARCHIVOS_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Nunca cachear llamadas al backend de Apps Script (partidos, pozos, envío
  // de pronóstico): esos datos siempre deben pedirse en vivo, nunca offline.
  if (url.hostname.includes('script.google.com') || url.hostname.includes('script.googleusercontent.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para el resto (el shell de la app), cache-first con fallback a red.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
