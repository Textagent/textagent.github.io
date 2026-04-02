# Share Link Loading Overlay — Eliminate Flash of Bare UI

- Added full-screen loading overlay (`#share-loading-overlay`) that shows instantly when a share URL is detected
- Overlay activates before any JS or CSS loads via inline `<script>` hash detection in `<head>`
- Overlay shows TextAgent logo, animated spinner, and "Loading shared content…" label
- Overlay is theme-aware: dark background (`#0d1117`) in dark mode, `#f6f8fa` in light mode
- Overlay fades out smoothly (0.35s opacity transition) once content is ready
- Added `hideShareLoader()` helper in `cloud-share.js`, called at every terminal path (success and error)
- Fixed: Space hub (`#space=`) path was writing an intermediate "Loading Space…" div to the preview; now stays hidden behind the overlay
- Fixed: Compact share (`#s=`), secure share (`#id=`), and legacy share (`#id=&k=`) paths all properly dismiss the overlay
- Removed intermediate "Decrypting…" / "Loading…" divs from within the preview panel (they were visible during the lag)
- Added 15-second safety net auto-dismiss in case of network failure or JS errors during load

---

## Summary
When users opened a shared link like `#space=ai-articles&s=tcujtr979xk`, they saw three ugly stages: an empty screen, then a flash of the bare editor HTML, then the final content. This adds a polished full-screen loading splash that hides all of that until the content is ready to display.

---

## 1. Share Link Loading Overlay (index.html)
**Files:** `index.html`
**What:** Added `#share-loading-overlay` div with inline CSS (logo, spinner, label) positioned `fixed; inset: 0; z-index: 99999`. An inline `<script>` in `<head>` detects the hash params (`s=`, `id=`, `d=`, `space=`) and sets `window.__showShareLoader = true`. A second inline `<script>` immediately after the overlay element activates it with the `slo-active` class. A 15-second safety timeout auto-dismisses the overlay if loading fails.
**Impact:** Users see a branded, polished loading screen instead of a blank or partially-rendered UI during the Firebase fetch and decryption phase.

## 2. Share Loader Dismissal (cloud-share.js)
**Files:** `js/cloud-share.js`
**What:** Added `hideShareLoader()` private function that adds `slo-fade-out` class (triggers CSS opacity transition) then removes both classes after 380ms. Called at every exit point of `M.loadSharedMarkdown`: success paths for Space hub, compact share, secure share, and legacy share; all error/catch blocks; and the access-denied gate for forms.
**Impact:** Loader always dismisses cleanly whether content loads successfully, fails to load, or is blocked by the form access gate.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +90 −1 | Added overlay HTML + CSS + activation scripts |
| `js/cloud-share.js` | +22 −8 | Added hideShareLoader helper + dismiss calls |
