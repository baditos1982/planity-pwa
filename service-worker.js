const CACHE_NAME = 'planity-cache-v2'; // ¡CORREGIDO A V2! Esto forzará la actualización.
const urlsToCache = [
  './', // Cacha la raíz de tu aplicación
  './index.html', // El archivo HTML principal
  './manifest.json', // El manifiesto de la PWA
  './service-worker.js', // El propio service worker también se cachea
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap', // Fuente Inter de Google Fonts
  'https://cdn.jsdelivr.net/npm/chart.js', // Librería Chart.js
  './icons/icon-192x192.png', // Tu icono de 192x192
  './icons/icon-512x512.png'  // Tu icono de 512x512
];

// Evento 'install': Se ejecuta cuando el Service Worker se instala por primera vez.
// Aquí cacheamos todos los archivos esenciales de la aplicación.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME) // Abre el caché con el nombre definido
      .then(cache => {
        console.log('Opened cache'); // Mensaje en consola
        return cache.addAll(urlsToCache); // Añade todos los archivos de la lista al caché
      })
      .catch(error => {
        console.error('Failed to cache during install:', error); // Manejo de errores si falla el cacheo
      })
  );
});

// Evento 'activate': Se ejecuta cuando el Service Worker se activa.
// Aquí limpiamos cachés antiguos para evitar que la aplicación use versiones desactualizadas.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) { // Si el nombre del caché no coincide con el actual
            console.log('Deleting old cache:', cacheName); // Mensaje en consola
            return caches.delete(cacheName); // Elimina el caché antiguo
          }
          return null;
        }).filter(Boolean) // Filtra los nulos para asegurar que solo se resuelvan las promesas de borrado
      );
    })
  );
});

// Evento 'fetch': Se ejecuta cada vez que la PWA hace una petición de red.
// Aquí interceptamos las peticiones para servir los recursos desde el caché o la red.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request) // Intenta encontrar la petición en el caché
      .then(response => {
        // Si hay una coincidencia en el caché, la devuelve.
        if (response) {
          return response;
        }
        // Si no está en el caché, la pide a la red.
        return fetch(event.request);
      })
      .catch(error => {
        console.error('Fetch failed for:', event.request.url, error); // Manejo de errores de red
        // Opcional: Podrías devolver una página offline personalizada si la red falla
        // return caches.match('/offline.html');
      })
  );
});
