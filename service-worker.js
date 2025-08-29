const CACHE_NAME = 'planity-cache-v5'; // Aumenta la versión de la caché
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    // Puedes añadir más recursos estáticos aquí si los tienes
    // Por ejemplo: '/styles/main.css', '/js/app.js', '/images/icon-192x192.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si encontramos una respuesta en la caché, la devolvemos
                if (response) {
                    return response;
                }
                // Si no, intentamos obtenerla de la red
                return fetch(event.request)
                    .then((response) => {
                        // Comprobamos si recibimos una respuesta válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Si la respuesta es válida, la clonamos (ya que un stream de respuesta solo se puede usar una vez)
                        // y la guardamos en la caché antes de devolverla
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    })
                    .catch((error) => {
                        console.error('Fetch failed for:', event.request.url, error);
                        // Puedes devolver una página offline aquí si lo deseas
                        // Por ejemplo: return caches.match('/offline.html');
                    });
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Elimina las cachés antiguas que no están en la lista blanca
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Listener para notificaciones push (opcional, si implementas notificaciones push en el futuro)
self.addEventListener('push', function(event) {
    const data = event.data.json();
    const title = data.title || 'Planity Notification';
    const options = {
        body: data.body || 'You have a new update from Planity!',
        icon: data.icon || '/icon-192x192.png', // Asegúrate de tener un icono
        badge: data.badge || '/badge.png' // Opcional: un icono más pequeño para la barra de estado
    };
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Listener para cuando el usuario hace click en una notificación (opcional)
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Cierra la notificación

    event.waitUntil(
        clients.openWindow('/index.html') // Abre la PWA cuando se hace click
    );
});
