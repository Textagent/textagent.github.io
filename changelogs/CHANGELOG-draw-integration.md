# Draw DocGen Integration — Excalidraw + Mermaid Whiteboard

- Added `{{Draw:}}` tag rendering pipeline to `renderer.js` via `transformDrawMarkdown` and `bindDrawPreviewActions`
- Added 🎨 Draw toolbar button in `index.html` with Excalidraw/Mermaid insert action
- Added `excalidraw.com` to CSP `frame-src` directive for iframe embedding
- Added `draw-docgen.css` (309 lines) — full card UI, tool pills, Mermaid editor, dark mode
- Added `draw-docgen.js` lazy-loaded module in `main.js` (Phase 3j)
- Added DOMPurify attribute allowlist entries: `data-draw-index`, `data-draw-tool`, `data-tool`, `data-skill`, `spellcheck`, `rows`

---

## Summary
Integrates the Draw DocGen component (`{{Draw:}}` tag) into the rendering pipeline, toolbar, and module loader — completing the Excalidraw + Mermaid whiteboard feature end-to-end.

---

## 1. CSP Update
**Files:** `index.html`
**What:** Added `https://excalidraw.com` to the `frame-src` CSP directive so Excalidraw iframes load without being blocked.
**Impact:** Excalidraw whiteboard renders inside `{{Draw:}}` cards without CSP violations.

## 2. Draw Toolbar Button
**Files:** `index.html`
**What:** Added a new "Draw" toolbar group with a 🎨 Draw button (`data-action="draw-tag"`) between Git and Coding groups, with purple-accented label.
**Impact:** Users can insert `{{Draw:}}` tags from the formatting toolbar with one click.

## 3. Renderer Pipeline Integration
**Files:** `js/renderer.js`
**What:** Chained `transformDrawMarkdown` after `transformGitMarkdown` in the rendering pipeline; added `bindDrawPreviewActions` call after preview render; expanded DOMPurify `ADD_ATTR` with draw-specific data attributes (`data-draw-index`, `data-draw-tool`, `data-tool`, `data-skill`, `spellcheck`, `rows`).
**Impact:** `{{Draw:}}` tags are parsed into interactive preview cards and their actions (open Excalidraw, render Mermaid) are bound after render.

## 4. Draw DocGen Stylesheet
**Files:** `css/draw-docgen.css` [NEW]
**What:** 309-line standalone stylesheet with card container, header, buttons, Excalidraw iframe preview, tool pills (Excalidraw/Mermaid toggle), inline Mermaid editor with live preview, fullscreen support, and complete dark mode coverage.
**Impact:** Draw cards have polished purple-accented UI matching the existing DocGen card design language.

## 5. Module Import
**Files:** `src/main.js`
**What:** Added `import '../css/draw-docgen.css'` for styling and `await import('../js/draw-docgen.js')` as Phase 3j in the lazy module loader.
**Impact:** Draw module loads after Git module, keeping it standalone and removable.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +7 −1 | CSP `frame-src` + toolbar Draw button |
| `js/renderer.js` | +8 −3 | Draw pipeline + DOMPurify attrs |
| `src/main.js` | +4 | CSS import + JS module import |
| `css/draw-docgen.css` | +309 | New standalone stylesheet |
