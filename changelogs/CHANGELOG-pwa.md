# PWA Support — Progressive Web App

- Added `manifest.json` with app metadata (name, description, theme colors, display: standalone)
- Added 5 PWA icon sizes (72, 128, 192, 384, 512px) in `assets/icons/`, generated from `assets/icon.png`
- Added `sw.js` service worker with versioned cache (`textagent-v1`):
  - **Cache-first** for same-origin app shell (HTML, CSS, JS, images)
  - **Network-first with runtime caching** for CDN libraries (cdnjs, jsdelivr, esm.sh, unpkg, gstatic)
  - **No-cache passthrough** for API/dynamic hosts (Firebase, Groq, Gemini, OpenRouter, HuggingFace, Jina, Judge0)
  - Offline navigation fallback returns cached `index.html`
- Updated `index.html` `<head>`:
  - `<link rel="manifest">` pointing to `/manifest.json`
  - `<meta name="theme-color" content="#58a6ff">`
  - Apple PWA meta tags (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`)
  - `<link rel="apple-touch-icon">` for iOS home screen icon
- Added SW registration script before `</body>` with console logging
- Added hidden "Install" button (`#pwa-install-btn`) in header toolbar (after theme toggle)
- Added `beforeinstallprompt` handler in `app-init.js`:
  - Captures deferred prompt, shows Install button when installable
  - Triggers native install dialog on click
  - Auto-hides after install or dismissal
  - `appinstalled` event listener for cleanup

---

## Files Changed (5 total)

| File | Type | Description |
|------|:----:|-------------|
| `manifest.json` | NEW | PWA web app manifest with icons, screenshots, theme |
| `sw.js` | NEW | Service worker with dual-cache strategy |
| `assets/icons/icon-*.png` | NEW | 5 resized PWA icons |
| `index.html` | MOD | Manifest link, meta tags, SW registration, Install button |
| `js/app-init.js` | MOD | beforeinstallprompt handler, Install button UX |
