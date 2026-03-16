# Changelog — Game Engine Fixes & Templates

## Date: 2026-03-16

### Summary
Fixed broken pre-built games, improved game engine sandboxing, and added 3 new game skill templates for Canvas 2D, Three.js, and P5.js engines.

---

### Bug Fixes

- **Fixed double-escaped unicode in `game-prebuilts.js`**
  All 6 pre-built games (Chess, Snake, Shooter, Pong, Breakout, Maths Quiz) had double-escaped `\\uXXXX` sequences inside template literals, rendering chess pieces as literal text `\u2654` and emojis as `\ud83c\udfc6` instead of actual symbols ♔🏆. Rewrote all games with real unicode characters.

- **Fixed iframe sandbox in `game-docgen.js`**
  Changed `sandbox='allow-scripts'` → `sandbox='allow-scripts allow-same-origin'` so games like Snake can use `localStorage` for high score persistence.

- **Added try/catch around localStorage** in Snake game to prevent silent failures.

- **Added touch support** to Breakout game (`touchmove` for paddle, `touchstart` to launch ball).

- **Fixed duplicate game rendering in template**
  Removed escaped code-block copies of `{{@Game:}}` tags that were both rendering as game widgets, causing each game to appear twice.

### New Features

- **Canvas 2D — Arcade Classics** template (5 games)
  Platformer, Top-Down Shooter, Rhythm Tapper, Tile Match Puzzle, Tower Defense

- **Three.js — 3D Games** template (5 games)
  Endless Road Racer, Sky Flyer, First-Person Maze, Dungeon Crawler, Planet Explorer

- **P5.js — Creative & Art Games** template (5 games)
  Particle Sandbox, Flocking Simulation, Music Visualizer, Generative Art Canvas, Gravity Playground

### Files Changed

| File | Change |
|------|--------|
| `js/game-prebuilts.js` | Rewrote all 6 pre-built games with proper unicode |
| `js/game-docgen.js` | Fixed iframe sandbox permissions |
| `js/templates/games.js` | Fixed duplicates, added 3 new engine-specific templates |
