# Tab Title Fix — Use File Name as Browser Tab

- Fixed: browser tab showing garbled content-derived name (e.g. "htmlau") instead of actual file name
- Auto-naming from content now only applies to files still named "Untitled.md" (or "Untitled N.md")
- Files with a real name (disk files, user-named files) always use their filename as the tab title
- Fixed: fenced code block language tags (e.g. `html-autorun`) no longer leak into auto-derived names
- Auto-naming now scans for the first meaningful heading/line after stripping code blocks

---

## Summary
The workspace auto-naming feature was overriding the browser tab title with a truncated, letter-only snippet of the document content. For documents starting with `\`\`\`html-autorun` blocks, this produced names like "htmlau". The fix scopes auto-naming exclusively to genuinely untitled files and ensures real file names are always respected.

---

## 1. Tab Title Uses Actual File Name
**Files:** `js/workspace.js`
**What:** Added an early-exit guard in `autoNameFromContent()` that checks whether the file's current name matches the "Untitled" pattern (`/^untitled(\s*\d*)?\.md$/i`). If the file already has a real name, the function returns immediately without modifying the title.
**Impact:** The browser tab and header chip now always reflect the real workspace file name for any named file.

## 2. Code Block Language Tags Stripped from Auto-Name
**Files:** `js/workspace.js`
**What:** Before extracting the auto-name candidate, fenced code blocks (` ```lang ... ``` `) are stripped from the content string. The first non-empty heading or line is then extracted from the remaining text.
**Impact:** Prevents block language identifiers like `html-autorun`, `python`, or `bash` from becoming the file/tab name.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/workspace.js` | +15 −10 | Bug fix — auto-naming scoped to untitled files only |
