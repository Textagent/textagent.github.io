# Annotate DocGen — Pretext Scanline Reflow Engine

- New `{{Annotate:}}` DocGen tag with canvas-based freehand annotation overlay
- New `@text:` source mode renders text on-canvas with Pretext-style scanline reflow
- Scanline engine (`reflowText`, `getFreeIntervals`) samples 1px pixel rows from an offscreen mask canvas to compute per-line free intervals
- Real-time text reflow: as user draws, each stroke updates the mask and text re-routes live around strokes
- `layoutNextLine()` pattern used per-row: per-line width narrows when a stroke occupies that row's x-range
- Offscreen mask canvas approach: strokes drawn at full resolution, scanline reads `getImageData(0, y, width, 1)` — O(width) per row, ~0.5–1.5ms total
- Added `↩ Undo` button with stroke history stack (Ctrl+Z equivalent)
- Added `🗑 Clear` button (no confirm dialog) with undo stack support
- Added `📥 PNG` button — exports composite canvas (strokes + text) as PNG download
- Added `📖 Present` button — calls `M.setViewMode('preview')` to hide editor and enter live reading/drawing mode
- `Present` auto-scrolls annotation card into view after mode switch
- Removed blocking `confirm()` dialog from Clear; instant clear with undo restore
- Canvas auto-resizes to match `ann-source-text-reflow` element height or defaults to 320px
- `redrawAll` handles dual-layer rendering: text layer first, strokes on top
- Fixed: `data-text` attribute stripped by DOMPurify — added `data-text`, `data-reflow` to `ADD_ATTR` whitelist in `renderer.js`
- Fixed: Text now stored as hidden `<span class="ann-reflow-text">` textContent inside the reflow div — textContent always survives DOMPurify regardless of attribute whitelist
- Fixed: `initCanvas` reads from `textSpan.textContent` first (bulletproof), falls back to `dataset.text`
- Fixed: `M.insertAtCursor` replaced with `M.setViewMode('preview')` for the insert action — annotation stays live and drawable instead of becoming a static image
- Fixed: CORS/SecurityError on external images handled with try/catch and fallback to annotation-only export
- Fixed: Image insertion uses `gen-img:ID` registry pattern (same as `draw-docgen.js`) to bypass DOMPurify's stripping of `data:` URLs
- Added `.ann-present-btn` CSS with green gradient, `font-weight: 600`, and hover transform
- Added `.ann-reflow-text` CSS: visually hidden span (position absolute, 1×1px clip) so stored text is invisible but accessible to canvas reader
- New `public/pretext-reflow-demo.html` — 4-tab interactive demo: Float Image, Draw Exclusion, Both Together, How It Works
- Float Image tab: image float left/right with width %, top offset sliders, image picker (picsum.photos), and own-image upload
- Draw Exclusion tab: side-by-side DOM (text buried) vs Pretext (scanline reflow) comparison
- Both Together tab: image float + freehand strokes combined, both exclude text simultaneously
- How It Works tab: annotated `layoutNextLine()` code explanation with image and scanline approach
- New `css/annotate-docgen.css` with full card UI, toolbar, color swatches, size slider, dark mode
- New `js/annotate-docgen.js` (~710 lines): parser, canvas init, scanline engine, stroke management, export, present

---

## Summary

Integrates a real-time, pixel-precise Pretext-style text reflow engine into the `{{Annotate:}}` DocGen tag. Text flows live around freehand annotations using a scanline mask canvas algorithm (O(width) per row, ~0.5–1.5ms/frame). The "Present" button transitions TextAgent to preview-only mode, keeping the annotation card fully drawable while reading. A companion interactive demo (`pretext-reflow-demo.html`) illustrates all three reflow scenarios: image float, freehand, and both combined.

---

## 1. Annotate DocGen Tag — New `{{Annotate:}}` tag

**Files:** `js/annotate-docgen.js`, `css/annotate-docgen.css`
**What:** Full DocGen card with toolbar (pen/highlighter/eraser/line/arrow/rect/circle), color swatches, size slider, canvas overlay over any `@text:`, `@img:`, or `@url:` source. Undo/Clear/PNG/Present buttons in header.
**Impact:** Authors can write `{{Annotate: Title @text: body text}}` in markdown and get a live, interactive annotation canvas with real-time Pretext text reflow.

---

## 2. Scanline Reflow Engine

**Files:** `js/annotate-docgen.js` (`reflowText`, `getFreeIntervals`, `buildMask`)
**What:** Offscreen mask canvas accumulates stroke paths. Per text row, `getImageData(0, y, width, 1)` scans a single pixel row for occupied x-ranges. `getFreeIntervals` returns free segments. `reflowText` packs words into free intervals using `canvas.measureText()` for width arithmetic — exactly the Pretext `layoutNextLine()` pattern.
**Impact:** Text wraps with pixel precision around any freehand shape drawn by the user. Performance: ~0.5–1.5ms per full reflow at typical canvas sizes.

---

## 3. DOMPurify Fix — `data-text` Whitelist + Hidden Span

**Files:** `js/renderer.js`, `js/annotate-docgen.js`, `css/annotate-docgen.css`
**What:** `data-text` and `data-reflow` added to `ADD_ATTR` in `renderer.js`. Additionally, text now stored inside a hidden `<span class="ann-reflow-text">` (position absolute, 1×1px clip) as textContent — survives DOMPurify with zero whitelisting needed. `initCanvas` reads textContent first, `dataset.text` as fallback.
**Impact:** Fixed core bug where `@text:` content was silently dropped by DOMPurify, leaving a blank canvas with no text rendered.

---

## 4. Present Mode — Live Reading + Drawing

**Files:** `js/annotate-docgen.js`, `css/annotate-docgen.css`
**What:** "📖 Present" button replaces "Insert". Calls `M.setViewMode('preview')` to hide the editor and expand preview to full width. Annotation card remains a live canvas — user reads and draws simultaneously. Falls back to manual CSS hide of `.editor-pane` if `M.setViewMode` is unavailable.
**Impact:** Completes the author workflow: write → annotate → present. The annotation is never "frozen" as a static image — it stays interactive.

---

## 5. Pretext Reflow Demo

**Files:** `public/pretext-reflow-demo.html`
**What:** Self-contained 4-tab demo showing: (1) float image with `layoutNextLine()` per-line width narrowing, (2) freehand scanline reflow vs DOM comparison, (3) image + strokes combined, (4) API explainer. Image picker uses picsum.photos; own-image upload supported. Performance metrics shown live.
**Impact:** Demonstrates all three `layoutNextLine()` reflow patterns in an interactive standalone page. Accessible at `/pretext-reflow-demo.html`.

---

## Files Changed (6 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/annotate-docgen.js` | +710 | New module — full Annotate DocGen |
| `css/annotate-docgen.css` | +340 | New stylesheet — card, toolbar, reflow badge |
| `js/renderer.js` | +2 | DOMPurify ADD_ATTR: added `data-text`, `data-reflow` |
| `src/main.js` | +5 | Phase lazy-load registration for annotate-docgen |
| `public/pretext-reflow-demo.html` | +720 | New interactive Pretext reflow demo |
| `public/annotate-example.md` | +12 | Example markdown using `{{Annotate:}}` tag |
