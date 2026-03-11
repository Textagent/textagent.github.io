# Video Playback & Embed Grid — Markdown Media Embedding

- Added video playback in markdown preview via `![alt](video.mp4)` image syntax
- Video.js v10 lazy-loaded from CDN with native `<video>` fallback if CDN unavailable
- YouTube embeds via `![alt](https://youtube.com/watch?v=...)` — renders privacy-enhanced iframe
- Vimeo embeds via `![alt](https://vimeo.com/...)` — renders iframe with DNT
- New `embed` code block for media grids: ` ```embed cols=2 height=400 `
- Embed grid auto-detects video vs YouTube vs website URLs per line
- Website URLs render as rich link preview cards (favicon, title, domain, "Open ↗" button)
- Responsive grid collapses to single column on mobile (≤768px)
- Dark/light mode styling for video containers, embed cells, and link cards
- DOMPurify whitelist expanded for `<video>`, `<source>`, `<iframe>`, video attributes
- CSP updated: `media-src`, `frame-src` (YouTube/Vimeo), `script-src`/`style-src` (Video.js CDN)
- CSP updated: `img-src` (Google Favicons API for link cards)

---

## Summary
Adds two new markdown media capabilities: (1) inline video playback from image syntax `![alt](video.mp4)` detecting `.mp4/.webm/.ogg/.mov` extensions and YouTube/Vimeo URLs, and (2) an `embed` code block for composing responsive grids of videos and website link cards with configurable columns and height.

---

## 1. Video Playback in Image Syntax
**Files:** `js/renderer.js`, `js/video-player.js`
**What:** Override `renderer.image()` in marked.js to detect video file extensions (`.mp4`, `.webm`, `.ogg`, `.ogv`, `.mov`, `.m4v`, `.avi`, `.mkv`), YouTube URLs, and Vimeo URLs. Renders `<video>` elements with controls or privacy-enhanced `<iframe>` embeds. Video.js v10 is lazy-loaded from `vjs.zencdn.net` as an optional enhancement.
**Impact:** Users can embed playable videos inline in their markdown with standard `![alt](url)` syntax. No new syntax to learn.

## 2. Embed Grid Code Block
**Files:** `js/renderer.js`, `js/video-player.js`, `css/video-player.css`
**What:** New `embed` code block language handler. Parses `cols=N` and `height=N` parameters. Each line is `URL "optional title"`. Auto-detects content type per URL: video → `<video>` player, YouTube/Vimeo → `<iframe>`, website → rich link preview card with favicon via Google Favicons API.
**Impact:** Users can create responsive media dashboards mixing videos and website references in configurable grid layouts.

## 3. Link Preview Cards
**Files:** `js/video-player.js`, `css/video-player.css`
**What:** Website URLs in embed grids render as styled link cards rather than broken iframes (most sites block iframe embedding via X-Frame-Options). Cards show favicon, title, domain name, and an "Open ↗" button.
**Impact:** Clean UX for website references — no broken iframe placeholders.

## 4. Security & CSP Updates
**Files:** `index.html`, `js/renderer.js`
**What:** Added `media-src 'self' blob: https: http:` for video playback. Extended `frame-src` with YouTube/Vimeo domains. Added Video.js CDN to `script-src`/`style-src`. Added `img-src` entry for Google Favicons API. Expanded DOMPurify `ADD_TAGS`/`ADD_ATTR` for video/iframe elements.
**Impact:** All new media features work within the Content Security Policy without violations.

---

## Files Changed (5 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/video-player.js` | +393 | New module: video detection, HTML builders, embed grid, link cards |
| `css/video-player.css` | +381 | New stylesheet: video player, embed grid, link card styling |
| `js/renderer.js` | +40 −3 | Image override, embed block handler, DOMPurify config |
| `src/main.js` | +2 | CSS + JS module imports |
| `index.html` | +4 −3 | CSP: media-src, frame-src, img-src, script-src, style-src |
