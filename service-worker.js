const CACHE_NAME = 'actualites-locales-v1';
const assets = [
    'https://jhd71.github.io/Actualites-Locales/',
    'https://jhd71.github.io/Actualites-Locales/index.html',
    'https://jhd71.github.io/Actualites-Locales/manifest.json',
    'https://jhd71.github.io/Actualites-Locales/icon-192x192.png',
    'https://jhd71.github.io/Actualites-Locales/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(assets);
            })
    );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return cacheName !== CACHE_NAME;
                }).map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Retourne la réponse du cache si elle existe
                if (response) {
                    return response;
                }

                // Clone la requête
                return fetch(event.request).then(
                    (response) => {
                        if(!response || response.status !== 200) {
                            return response;
                        }

                        // Clone la réponse
                        const responseToCache = response.clone();

                        // Met en cache la nouvelle ressource
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});
