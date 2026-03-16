# Changelog — Japanese Quiz Games & Game Gen Improvements

## 🎮 Japanese Quiz Prebuilt Games

- Added **Hiragana Quiz** (`@prebuilt: hiragana`) — simple 12-kana falling-block quiz game (あ–し), catch the correct hiragana matching the romaji prompt, score 10 to win, 3 lives
- Added **Kana Master** (`@prebuilt: kanamaster`) — full 46-kana version with combo system, level progression (speed increases every 5 points), particle effects, screen shake on damage, gradient paddle with glow, rounded blocks, star background, timer bar, win at 46 points
- `game-prebuilts.js` — two new `window.__GAME_PREBUILTS` entries
- `games.js` — two new cards (🇯🇵 Hiragana Quiz, 🎌 Kana Master) in "Games for Kids" template; updated prebuilt reference table
- `documentation.js` — updated prebuilt game lists and template count (6 → 8) in Feature Showcase

## 🛠 Game Generation Improvements

- **Rewritten engine prompts** — Canvas 2D, Three.js, and P5.js system prompts rewritten with strict "CRITICAL RULES" format emphasizing completeness (no TODOs, no empty functions), 8000-character budget, and "output ONLY raw HTML" instruction
- **CDN URL normalizer** — new `normalizeGameCdnUrls()` function in `game-docgen.js` rewrites AI-generated CDN URLs (unpkg.com, threejs.org, jsdelivr.net) to CSP-approved cdnjs.cloudflare.com sources for Three.js and P5.js
- **Model ready check** — `ensureModelReady()` async function verifies AI model is loaded before game generation; triggers loading if needed with progress feedback
- **UI reorder** — moved description text above skill pills for better card layout

## 🔧 OpenRouter Worker Retry Logic

- Added `MAX_RETRIES` (2) with exponential backoff for transient HTTP errors (500, 502, 503, 429)
- Retry loop in `generate()` function catches fetch failures and retries with delay
- Improved error handling and status code classification

## 🛡 CSP Update

- Added `https://unpkg.com` and `https://threejs.org` to `script-src` CSP directive in `index.html` for AI-generated game scripts that reference these CDN hosts

## Files Changed

- `index.html` — CSP script-src update
- `js/game-docgen.js` — prompt rewrites, CDN normalizer, model-ready check, UI reorder
- `js/game-prebuilts.js` — hiragana + kanamaster prebuilt game HTML
- `js/templates/games.js` — two new game cards, updated reference table
- `js/templates/documentation.js` — updated prebuilt lists and count
- `public/ai-worker-openrouter.js` — retry logic with backoff
