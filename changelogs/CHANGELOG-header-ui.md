# Changelog — Header UI & Shared View Pill

## Three-Level Header Visibility Toggle

- Added three-level header visibility system (Full → Compact → Hidden):
  - **Level 0 (Full)**: Default — app-header + dropzone visible
  - **Level 1 (Compact)**: Quick Action Bar visible, header hidden (existing behavior)
  - **Level 2 (Hidden)**: Everything hidden, floating "TextAgent" restore pill at top-center
- Floating restore pill (`header-restore-pill`) appears at 35% opacity, fully visible on hover
- QAB header toggle now transitions from level 1 → 2 (hide everything) instead of restoring full header
- Header level persists across page reloads via `localStorage` (`ta-header-level`)

### Files Modified
- `css/header.css` — added `.header-restore-pill` styles and `body.header-hidden` rules
- `index.html` — added `#header-restore-pill` button element
- `js/app-init.js` — rewired header toggle logic with `setHeaderLevel()` function and localStorage persistence

## Shared View Pill Repositioned to Bottom-Right

- Moved the "Read-only" shared-view pill from top-right to bottom-right corner
- Updated entrance animation direction (`translateY(10px)` instead of `-10px`) for upward slide-in

### Files Modified
- `css/modals.css` — changed `top: 10px; right: 16px` → `bottom: 10px; right: 16px`
- `styles.css` — same positional change
