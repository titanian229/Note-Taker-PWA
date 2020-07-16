const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/style.css',
    '/assets/note.js',
    '/assets/icon192.png',
    '/assets/icon512.png',
    '/assets/landscape-photo-of-mountain-fullq.jpg',
    '/note.html',
    '/manifest.webmanifest',
];

const cacheName = 'static-cache-v2';

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log(`Installed!`)
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches
                .open(cacheName)
                .then((cache) => {
                    return fetch(event.request)
                        .then((response) => {
                            // If the response was good, clone it and store it in the cache.
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone());
                            }

                            return response;
                        })
                        .catch((err) => {
                            // Network request failed, try to get it from the cache.
                            return cache.match(event.request);
                        });
                })
                .catch((err) => console.log(err))
        );

        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});
