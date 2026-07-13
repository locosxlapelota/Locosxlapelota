// Incrementá este número (ej: v2, v3, v4) cada vez que subas un cambio grande a GitHub 
// para forzar a los teléfonos a descargar la nueva versión automáticamente.
const CACHE_NAME = 'betnow-shell-v2';
const ARCHIVOS_SHELL = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Al instalar, descargamos el cascarón (shell) visual y forzamos la instalación inmediata
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_SHELL))
  );
  self.skipWaiting(); 
});

// Al activar, barremos por completo cualquier caché vieja que haya quedado en el celular
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // Toma el control de la app al instante sin esperar a reiniciar
});

// Administrador de peticiones
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // REGLA ESTRICTA: Si la petición va a Google Apps Script, va directo a internet en vivo.
  // Jamás se guarda en la memoria del teléfono para evitar partidos o resultados congelados.
  if (url.hostname.includes('script.google.com') || url.hostname.includes('script.googleusercontent.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para el resto de archivos locales (diseño, logos estáticos, interfaz), usamos la caché local.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});