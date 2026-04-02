# Share Link Loader Fix v2 — Debug & Service Worker Cache

- Fixed: hash detection now uses URLSearchParams instead of indexOf (prevents false positives)
- Fixed: Service Worker was caching old index.html (cache-first) — bumped to textagent-v2/cdn-v2
- Fixed: HTML navigation now uses network-first strategy so new deployments take effect immediately
- Added: document.documentElement.style.overflow = 'hidden' during share load to prevent any scroll flash
- Fixed: hideShareLoader() now also restores document overflow when dismissing
