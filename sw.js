/**
 * Service Worker – ANVI STAY PWA
 * Provides offline caching and app-like experience
 */

const CACHE_NAME = 'anvi-stay-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/admin-login.css',
    '/js/app.js',
    '/logo.png',
    '/manifest.json',
    '/pages/header.html',
    '/pages/landing.html',
    '/pages/preloader.html',
    '/pages/about.html',
    '/pages/terms.html',
    '/pages/privacy.html',
    '/pages/tos.html',
    '/pages/tenant.html',
    '/pages/admin-login.html',
    '/pages/landlord.html',
    '/pages/overlays.html',
    '/pages/toast.html',
];

// Install – cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate – clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch – network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and API calls
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone & cache successful responses
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Offline fallback – serve from cache
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached;
                    // Return offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});
