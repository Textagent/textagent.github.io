# Fix: Find & Replace — Replace / Replace All not working

## Root Cause

Two bugs in `js/editor-features.js`:

1. **Wrong element IDs in `wireFind('find-')`** — The prefix-based ID construction produced IDs like `find-find-input` and `find-replace-all` instead of the actual HTML IDs (`find-input`, `replace-all`). No click handlers were ever attached to the legacy find bar's Replace and Replace All buttons.

2. **`getActiveFindEls()` always resolved to QAB elements** — It checked `qab.style.display !== 'none'`, but the QAB container always has `display: flex`. So `performFind()`, `replaceOne()`, and `replaceAll()` read from the empty QAB inputs while the user was typing into the legacy find bar.

## Fix

- Replaced `wireFind(prefix)` with `wireFindSet(ids)` that takes explicit ID maps for each set of elements.
- Changed `getActiveFindEls()` to check `qabFindSection.style.display === 'flex'` — only true when the QAB find section is explicitly opened.

3. **`selectMatch()` stole focus from find input** — It called `markdownEditor.focus()` on every keystroke via `performFind()` → `selectMatch()`, pulling focus from the find input back to the editor. Added `focusEditor` parameter; `performFind` passes `false` to keep focus in the find input during live typing.

## Visual Highlight Overlay

Added backdrop overlay technique for highlighting find matches in the editor textarea:
- Mirror div (`.find-highlight-backdrop`) behind textarea with identical font/padding
- Orange `<mark>` highlights for all matches, brighter orange for current match
- Scroll sync between textarea and backdrop
- Textarea becomes transparent during find-active to show highlights through
- Dark mode support with adjusted opacity

- Fixed backdrop overlay: set critical CSS (position, font, padding) inline via JS
- Added `.editor-find-wrapper` container wrapping textarea + backdrop for reliable absolute positioning
- Backdrop copies computed font/padding from textarea to guarantee pixel-perfect alignment
- Added regex tooltip with examples on both `.*` toggle buttons

## Line Number Gutter

- Line numbers appear on the left side of the editor when Find is active
- Current match's line number highlighted in orange/bold
- Gutter scroll syncs with textarea
- Gutter hidden when find bar closes
- Fixed gutter alignment: use computed fontSize/lineHeight from textarea
- Removed backdrop overlay (caused overlapping text) — now uses native selection highlight
- Fixed scroll-to-match: uses native scroll-to-caret instead of manual line calculation
- Added bright orange ::selection highlight for current match during find
- Fixed scroll timing: 50ms delay before refocusing find input
