# Podcast Generation System & TTS Worker Fixes

- Added `{{@Podcast:}}` tag for AI-powered podcast generation from any document content
- Built multi-speaker script generation with configurable styles (debate, interview, chat, lecture, storytelling)
- Integrated Kokoro TTS multi-speaker synthesis with voice pre-fetching and per-chunk progress
- Created podcast marketplace UI with pre-built podcast templates and search/filter
- Added podcast template system with 15+ curated templates across tech, science, business categories
- Built WAV audio creation from Float32Array TTS output with download support
- Added real-time podcast generation progress UI with phase indicators (research → script → audio → done)
- Extracted `processMultiSegments()` as standalone async function in TTS worker for reliable synthesis
- Fixed: TTS worker message delivery bug — bundled segments with `init` message to process in same handler execution
- Fixed: Service worker cache-first strategy serving stale `tts-worker.js` — added cache-busting `?v=` param
- Fixed: Worker files now excluded from service worker `shouldCacheResponse()` caching
- Bumped service worker cache version from `v2` → `v3` to force cache invalidation
- Added `worker.onerror` handler on main thread to catch worker-level errors
- Added TTS worker version identifier (`TTS_WORKER_VERSION`) with startup logging
- Added `_pendingMultiSegments` backup mechanism in `status: ready` handler
- Added per-chunk 90s timeout via `Promise.race` to prevent infinite synthesis hangs
- Added event loop yields (`setTimeout(0)`) between WASM calls so `postMessage` flushes
- Added voice pre-fetch phase before synthesis to separate network vs WASM issues
- Added heartbeat logger (10s interval) during multi-speaker synthesis
- Added detailed timestamped logging across `textToSpeech.js`, `tts-worker.js`, `podcast-docgen.js`
- Added help mode entries for podcast generation feature
- Added podcast renderer integration in `renderer.js` for `{{@Podcast:}}` tag processing

---

## Summary
Complete podcast generation system: users write `{{@Podcast: topic}}` in any document and get an AI-generated multi-speaker podcast with web research, script writing, and Kokoro TTS audio synthesis. Also fixed a critical TTS worker bug where the service worker's cache-first strategy served stale worker code, and the Web Worker silently dropped `speak-multi` messages sent after the async `init` handler completed.

---

## 1. Podcast Document Generator (`{{@Podcast:}}` Tag)
**Files:** `js/podcast-docgen.js`, `css/podcast-docgen.css`
**What:** New IIFE component that intercepts `{{@Podcast: topic}}` tags in rendered markdown. Performs 3-phase generation: (1) web search research via Jina API, (2) AI script generation with `[Speaker]` markers, (3) Kokoro TTS multi-speaker audio synthesis. Includes `parseScript()` for speaker segmentation, `createWavBlob()` for audio encoding, and real-time progress UI with phase indicators.
**Impact:** Users can generate full podcast episodes from any topic directly in their documents — no external tools needed.

## 2. Podcast Marketplace
**Files:** `js/podcast-marketplace.js`, `css/podcast-marketplace.css`, `js/templates/podcasts.js`
**What:** Built a browsable marketplace UI with 15+ curated podcast templates across categories (Tech, Science, Business, Creative, Education). Includes search/filter, category tabs, template cards with metadata (duration, speakers, style), and one-click generation. Templates define speaker count, style, custom prompts, and voice assignments.
**Impact:** Users can browse and generate podcasts from pre-built templates without writing prompts.

## 3. TTS Worker Multi-Speaker Fix (Critical Bug)
**Files:** `js/tts-worker.js`, `js/textToSpeech.js`
**What:** The Web Worker silently dropped `speak-multi` messages sent after the async `init` handler completed. Root cause: service worker served cached `tts-worker.js` via cache-first strategy, AND the worker couldn't reliably process a second `postMessage` after `init`. Fix: (1) extracted `processMultiSegments()` as standalone function, (2) bundled segments with `init` message via `pendingSegments` field, (3) worker processes segments inline at end of init handler, (4) added cache-busting `?v=` param to worker URL, (5) added `_pendingMultiSegments` backup dispatch from `status: ready` handler.
**Impact:** Podcast TTS synthesis now works reliably — previously it hung forever after model loaded.

## 4. Service Worker Cache Fix
**Files:** `sw.js`
**What:** Bumped `CACHE_NAME` from `textagent-v2` to `textagent-v3` to invalidate stale caches. Added exclusion for `*worker*` files in `shouldCacheResponse()` so worker JS is always fetched fresh. This prevents the cache-first strategy from serving outdated worker code.
**Impact:** Future worker code changes take effect immediately without manual cache clearing.

## 5. TTS Synthesis Robustness
**Files:** `js/tts-worker.js`, `js/textToSpeech.js`
**What:** Added per-chunk 90s timeout (`Promise.race`), event loop yields between WASM calls (`await setTimeout(0)`), voice pre-fetch phase, heartbeat logger, `worker.onerror` handler, and version stamping. Failed chunks are skipped gracefully instead of aborting the entire podcast.
**Impact:** Audio synthesis is more resilient — provides real-time progress, detects hangs, and degrades gracefully on failures.

## 6. Integration & UI Updates
**Files:** `index.html`, `js/renderer.js`, `js/templates.js`, `js/modal-templates.js`, `js/help-mode.js`, `src/main.js`
**What:** Added podcast module imports in `main.js`, podcast tag processing in `renderer.js`, marketplace modal in `modal-templates.js`, help entries in `help-mode.js`, and toolbar button in `templates.js`. Updated `index.html` with podcast CSS imports.
**Impact:** Podcast features are fully integrated into the TextAgent UI with discoverable entry points.

---

## Files Changed (14 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/podcast-docgen.js` | +1046 | New: podcast generation engine |
| `js/podcast-marketplace.js` | +923 | New: marketplace UI |
| `css/podcast-marketplace.css` | +730 | New: marketplace styles |
| `css/podcast-docgen.css` | +406 | New: podcast player styles |
| `js/templates/podcasts.js` | +279 | New: podcast templates |
| `js/textToSpeech.js` | +205 −30 | Multi-speaker fix, worker caching, error handling |
| `js/tts-worker.js` | +203 −0 | processMultiSegments, bundled init, version stamp |
| `index.html` | +30 −23 | CSS imports, podcast integration |
| `js/renderer.js` | +12 −1 | Podcast tag processing |
| `js/help-mode.js` | +11 | Podcast help entries |
| `src/main.js` | +9 | Module imports |
| `js/templates.js` | +4 −1 | Toolbar button |
| `sw.js` | +3 −1 | Cache version bump, worker exclusion |
| `js/modal-templates.js` | +1 | Marketplace modal |
