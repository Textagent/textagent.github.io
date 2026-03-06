# CHANGELOG — Initial Render Fix

## fix: preview pane not rendering on initial page load

### Problem
The right-side preview pane sometimes did not render correctly when the page first loaded. Content appeared as raw text instead of rendered markdown/AI cards.

### Root Cause
`M.currentViewMode` was initialized to `'split'` in `app-core.js`, but `setViewMode('split')` in `app-init.js` has an early return:
```js
if (mode === M.currentViewMode) return;
```
Since the mode was already `'split'`, the function bailed out immediately and **never called `renderMarkdown()`** on startup.

### Fix
Changed `M.currentViewMode` initial value from `'split'` to `null` so the first `setViewMode('split')` call runs its full initialization path — applying CSS classes, pane widths, and calling `renderMarkdown()`.

### Files Modified
- `js/app-core.js` — changed `currentViewMode` init from `'split'` to `null`
