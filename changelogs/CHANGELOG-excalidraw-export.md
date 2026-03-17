# Changelog — Excalidraw Export Fix

## Excalidraw Insert / PNG / SVG Export

- Fixed broken Excalidraw diagram export (Insert, PNG, SVG buttons were silently failing)
- **Root cause**: Excalidraw 0.17+ uses `excalidrawAPI` prop callback instead of `ref` — the old `ref` never fired, leaving the API as `null`
- Replaced fragile canvas-scraping export with Excalidraw's native `exportToBlob` (PNG) and `exportToSvg` (SVG) APIs
- Insert now **replaces** the `{{Draw:}}` tag with image markdown and **closes** the whiteboard (instead of appending at cursor)
- Inserted images use compact `gen-img:` registry pattern (same as `{{Image:}}` tag) — no raw base64 blob in the editor
- Added error logging when export requests arrive before API is ready

### Files Modified
- `public/excalidraw-embed.html` — `excalidrawAPI` prop, native export APIs, error logging
- `js/draw-docgen.js` — Insert replaces Draw tag, gen-img registry, iframe cleanup, delayed SVG blob revocation
