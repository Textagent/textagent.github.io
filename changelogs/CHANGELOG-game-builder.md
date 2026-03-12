# CHANGELOG — Game Builder Tag

## feat: Game Builder — AI-generated & pre-built games in markdown

### What Changed
Added a new `{{@Game:}}` tag for building and running interactive games inside markdown documents. Games can be AI-generated from prompts or loaded instantly from a pre-built library. Users can also import their own HTML game code.

### Key Features
- **`{{@Game:}}` tag**: Inline game card with engine selector (Three.js, Canvas 2D, P5.js), model dropdown, Generate/Play/Export/Import/Fullscreen/Remove buttons
- **`@prebuilt:` field**: Auto-load pre-built games (chess, snake, shooter, pong, breakout, maths) — plays instantly, no AI needed
- **📋 Import button**: Paste external HTML game code or upload `.html` files; pre-fills with existing game source for viewing/editing
- **Pre-built library**: 6 complete games in `game-prebuilts.js` — Chess, Snake, Space Shooter, Pong, Breakout, Maths Quiz (kids)
- **Games template**: "Games for Kids" template in Games category with all 6 pre-built games and tag syntax reference
- **Single-line field parsing**: All `@field:` tags work on one line: `{{@Game: @engine: canvas2d @prebuilt: chess @prompt: Chess}}`
- **AI generation**: Describe any game with `@prompt:`, select engine + model, click Generate
- **Export**: Download generated/imported games as standalone HTML files

### Files Added
- `js/game-docgen.js` — Core module: tag parsing, card rendering, AI generation, iframe playback, import modal
- `css/game-docgen.css` — Styles for game cards, engine pills, import modal, dark mode
- `js/game-prebuilts.js` — Pre-built game HTML library (6 games)
- `js/templates/games.js` — Games template category
- `tests/feature/game-tag.spec.js` — Playwright tests for game tag

### Files Modified
- `index.html` — 🎮 Game toolbar button in AI Tags dropdown
- `js/renderer.js` — `transformGameMarkdown` + `bindGamePreviewActions` pipeline hooks; `srcdoc` added to DOMPurify allowlist
- `src/main.js` — CSS import + dynamic imports for `game-prebuilts.js` and `game-docgen.js`
- `js/templates.js` — Games category in concatenation, icon, and label maps
- `js/modal-templates.js` — Games category pill in template picker
- `tests/feature/toolbar-tags.spec.js` — Game toolbar button test
