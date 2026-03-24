# Fix: Find & Replace — Replace / Replace All not working

## Root Cause

Two bugs in `js/editor-features.js`:

1. **Wrong element IDs in `wireFind('find-')`** — The prefix-based ID construction produced IDs like `find-find-input` and `find-replace-all` instead of the actual HTML IDs (`find-input`, `replace-all`). No click handlers were ever attached to the legacy find bar's Replace and Replace All buttons.

2. **`getActiveFindEls()` always resolved to QAB elements** — It checked `qab.style.display !== 'none'`, but the QAB container always has `display: flex`. So `performFind()`, `replaceOne()`, and `replaceAll()` read from the empty QAB inputs while the user was typing into the legacy find bar.

## Fix

- Replaced `wireFind(prefix)` with `wireFindSet(ids)` that takes explicit ID maps for each set of elements.
- Changed `getActiveFindEls()` to check `qabFindSection.style.display === 'flex'` — only true when the QAB find section is explicitly opened.

3. **`selectMatch()` stole focus from find input** — It called `markdownEditor.focus()` on every keystroke via `performFind()` → `selectMatch()`, pulling focus from the find input back to the editor. Added `focusEditor` parameter; `performFind` passes `false` to keep focus in the find input during live typing.
