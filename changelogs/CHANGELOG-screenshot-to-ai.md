# Screenshot to AI — Capture Page or Screen and Chat with AI

**Date**: 2026-03-31

- New `📷` camera button injected into the AI chat input bar for screen/page capture
- Dropdown menu with three capture modes: Capture Page, Capture Screen, Upload Image
- Capture Page uses `html2canvas` to snapshot the current document; AI panel is hidden during capture for a clean shot
- Capture Screen uses `getDisplayMedia` (browser screen-share picker) with live frame extraction from a hidden `<video>` element
- Fixed black-screen capture bug: video element must be in DOM for GPU decoder to render real frames
- Fixed black-screen capture bug: wait for `timeupdate` event instead of single `requestAnimationFrame` before grabbing frame
- Fixed black-screen capture bug: canvas dimensions read from both `track.getSettings()` and `video.videoWidth/videoHeight` with explicit `> 0` guard
- Captured image injected into `pendingAttachments` via `_ai.addFilesToPending()` and AI panel opened automatically
- Auto-send fires after 900ms (covers panel open animation + async attachment processing) with a nested 150ms inner gap
- Auto-send only pre-fills input if it is currently empty (preserves existing user text)
- Self-healing button injection: `injectButtonIfMissing()` runs at module load, on AI-panel toggle clicks, and via 2-second fallback poll
- Dropdown toggle uses inline `style.display` (not CSS classes) so it works even with stale cached `ai-panel.css`
- All dropdown menu items use inline styles so the UI is fully CSS-cache independent
- Flash overlay shown during capture via `showFlash()` / `hideFlash()` with `ai-screenshot-flash` element
- Vision model warning toast if selected model does not support image input (non-blocking)
- Module registered in `src/main.js` inside a `try/catch` wrapper to prevent initialization failures
- Styles for wrapper, dropdown, and flash overlay added to `css/ai-panel.css`
- Camera button HTML added to AI panel template in `js/modal-templates.js`

---

## Summary

Adds a **Screenshot to AI** feature: users click the 📷 camera button in the AI chat input bar, choose to capture the current page, share a specific screen/window, or upload an image, and the captured frame is automatically attached to the AI chat and sent for analysis.

---

## 1. Self-Healing Camera Button Injection
**Files:** `js/ai-screenshot.js`, `js/modal-templates.js`
**What:** The camera button is included in the AI panel HTML template. In addition, `injectButtonIfMissing()` dynamically injects the button at runtime whenever `#ai-file-input` is found but `#ai-screenshot-btn` is missing — handling stale browser caches. It runs at module load, on AI-toggle click events (capture phase listener), and via a 2-second `setTimeout` fallback.
**Impact:** The button appears reliably regardless of caching behaviour.

## 2. CSS-Independent Dropdown
**Files:** `js/ai-screenshot.js`
**What:** The dropdown menu and all its items use inline `style` attributes instead of relying on `.active` CSS class toggling. The `show`/`hide` is managed by directly setting `menu.style.display`.
**Impact:** The dropdown works correctly even when `ai-panel.css` is served from a stale browser cache that predates this feature.

## 3. Capture Page (html2canvas)
**Files:** `js/ai-screenshot.js`
**What:** `capturePageScreenshot()` temporarily removes the AI panel from the DOM, waits 300ms for the close animation, runs `html2canvas` on `document.body` with `useCORS: true` and `scale: min(devicePixelRatio, 2)`, then restores the panel. Excluded elements: `#ai-panel`, `#ai-panel-overlay`, `.toast-container`, `#ai-screenshot-flash`.
**Impact:** Produces a clean, full-page screenshot without the AI panel visible in the image.

## 4. Capture Screen — Black Screen Fix
**Files:** `js/ai-screenshot.js`
**What:** `captureScreenScreenshot()` calls `getDisplayMedia`, appends the `<video>` element to DOM (hidden, `1×1px`, fixed off-screen), waits for `onloadedmetadata` + `video.play()`, then waits for the `timeupdate` event (fires only when real pixel data flows), then waits 2 additional `requestAnimationFrame` ticks, captures the frame to a canvas, stops tracks, and removes the video element.
**Impact:** Eliminates completely black screenshots caused by capturing before the GPU video decoder had rendered any frames. `timeupdate` is the browser-guaranteed signal that real frame data is available.

## 5. Auto-Send Timing Fix
**Files:** `js/ai-screenshot.js`
**What:** Changed auto-send `setTimeout` from 400ms to 900ms, with an inner 150ms gap before clicking the send button. Added a guard that skips pre-filling the input if the user has already typed something.
**Impact:** Ensures the attachment is fully processed by `addFilesToPending` before the send button fires; prevents clobbering existing chat input.

## 6. Module Registration
**Files:** `src/main.js`
**What:** `await import('../js/ai-screenshot.js')` wrapped in `try/catch` in the Phase 3d module loading block.
**Impact:** A failure in `ai-screenshot.js` (e.g., missing vendor dependency) does not crash the rest of the application startup.

## 7. Styles
**Files:** `css/ai-panel.css`
**What:** Added styles for `.ai-screenshot-wrapper`, `.ai-screenshot-btn`, `.ai-screenshot-menu`, `.ai-screenshot-item`, and `.ai-screenshot-flash` (full-screen flash overlay with `bi-camera` icon and message text).
**Impact:** Provides the visual design for the camera button, dropdown, and capture feedback overlay.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-screenshot.js` | +300 | New module — full screenshot capture pipeline |
| `css/ai-panel.css` | +148 | New styles for button, dropdown, and flash overlay |
| `js/modal-templates.js` | +24 | Camera button HTML in AI panel input template |
| `src/main.js` | +6 | Module registration with try/catch |
