// ============================================
// sw.js — TextAgent Service Worker (PWA Offline Support)
// ============================================
// Strategy: Cache app shell for offline use, network-first for everything else.
// CDN libraries are cached on first fetch for full offline capability.

const CACHE_NAME = 'textagent-v2';

// Core app shell files to precache on install
const APP_SHELL = [
    '/',
    '/styles.css',
    '/assets/icon.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-512x512.png',
    '/manifest.json'
];

// CDN libraries to cache on first fetch (runtime caching)
const CDN_CACHE_NAME = 'textagent-cdn-v2';
const CDN_HOSTS = [
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net',
    'esm.sh',
    'esm.run',
    'www.gstatic.com',
    'vjs.zencdn.net',
    'unpkg.com'
];

// Hosts that should NEVER be cached (APIs, dynamic data)
const NO_CACHE_HOSTS = [
    'firestore.googleapis.com',
    'generativelanguage.googleapis.com',
    'api.groq.com',
    'openrouter.ai',
    'huggingface.co',
    'cdn-lfs.hf.co',
    'cdn-lfs-us-1.hf.co',
    'r.jina.ai',
    's.jina.ai',
    'judge0-ce.p.rapidapi.com',
    'ce.judge0.com',
    's.tradingview.com',
    'challenges.cloudflare.com'
];

// ---- Install: precache app shell ----
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

// ---- Activate: clean old caches ----
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME && key !== CDN_CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// ---- Fetch: serve from cache or network ----
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Skip non-http(s) requests (e.g. chrome-extension://)
    if (!url.protocol.startsWith('http')) return;

    // Never cache API/dynamic hosts — always go to network
    if (NO_CACHE_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith('.' + host))) {
        return;
    }

    // CDN resources: network-first, cache as fallback
    if (CDN_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith('.' + host))) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CDN_CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // App shell (same-origin): network-first for HTML nav (to always get fresh index.html),
    // cache-first for JS/CSS/images (stable assets).
    if (url.origin === self.location.origin) {
        // Always network-first for HTML navigation so new deployments take effect immediately
        if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
            event.respondWith(
                fetch(event.request)
                    .then((response) => {
                        if (response.ok) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                        }
                        return response;
                    })
                    .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
            );
            return;
        }

        // Cache-first for JS/CSS/images (stable versioned assets)
        event.respondWith(
            caches.match(event.request)
                .then((cached) => {
                    if (cached) return cached;

                    return fetch(event.request).then((response) => {
                        if (response.ok && shouldCacheResponse(url)) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                        }
                        return response;
                    });
                })
                .catch(() => new Response('Offline', { status: 503, statusText: 'Offline' }))
        );
        return;
    }
});

// Determine if a same-origin response should be runtime-cached
function shouldCacheResponse(url) {
    const path = url.pathname;
    return path.endsWith('.js') ||
           path.endsWith('.css') ||
           path.endsWith('.html') ||
           path.endsWith('.png') ||
           path.endsWith('.jpg') ||
           path.endsWith('.svg') ||
           path.endsWith('.woff2') ||
           path.endsWith('.json');
}
