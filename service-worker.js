const CACHE_NAME = 'actualites-locales-v1.0.0'; // Versioning plus précis
const assets = [
    'https://jhd71.github.io/Actualites-Locales/',
    'https://jhd71.github.io/Actualites-Locales/index.html',
    'https://jhd71.github.io/Actualites-Locales/manifest.json',
    'https://jhd71.github.io/Actualites-Locales/icon-192x192.png',
    'https://jhd71.github.io/Actualites-Locales/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker en cours d\'installation...'); 
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Mise en cache des ressources...');
                return cache.addAll(assets);
            })
    );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activé.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return cacheName !== CACHE_NAME;
                }).map((cacheName) => {
                    console.log('Suppression de l\'ancien cache :', cacheName);
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
                    console.log('Réponse servie depuis le cache :', event.request.url);
                    return response;
                }

                console.log('Récupération de la ressource depuis le réseau :', event.request.url);

                // Clone la requête
                return fetch(event.request).then(
                    (response) => {
                        // Vérifie si la réponse est valide
                        if(!response || response.status !== 200) {
                            console.log('Réponse invalide, non mise en cache :', response);
                            return response;
                        }

                        // Clone la réponse
                        const responseToCache = response.clone();

                        // Met en cache la nouvelle ressource
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                                console.log('Ressource mise en cache :', event.request.url);
                            });

                        return response;
                    }
                ).catch(error => { 
                    console.error('Erreur de réseau :', error);
                    // Retourne une réponse par défaut du cache (si disponible) ou une page d'erreur hors ligne
                    return caches.match('/Actualites-Locales/offline.html') 
                           || new Response('Vous êtes hors ligne', { headers: { 'Content-Type': 'text/plain' } }); 
                });
            })
    );
});
