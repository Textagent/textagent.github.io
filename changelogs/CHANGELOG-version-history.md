# Local Version History — Automatic Snapshots, Diff & Restore

- Added **automatic local version history** for every workspace file — snapshots are captured as you edit and stored in an IndexedDB ring buffer, entirely client-side (no server, no new dependencies)
- **Capture policy:** first save of a file, then every ≥3 minutes of editing, or immediately when ≥400 characters change; identical content is never re-snapshotted
- **Ring caps:** 50 snapshots per file, 400 across all files (oldest pruned automatically) so storage stays bounded
- **History panel** (right-click a file in the sidebar → History): timeline of snapshots with timestamps, sizes and char deltas; selecting one shows a GitHub-style **line diff vs the current document** (hand-rolled LCS with prefix/suffix trim and a size guard for huge docs)
- **Restore** any version with one click — a safety snapshot of the current content is taken first, so restores are themselves undoable; restore routes through the existing save paths so disk-workspace and single-linked files get written too
- **Copy** any version to the clipboard without restoring
- New `M.versionHistory` API: `onSave`, `open`, `close`, `snapshotNow(label)`
- Hooks added at the two authoritative save choke points: `saveToLocalStorage` (keystroke autosave, cloud-share.js) and `setFileContent` (file-switch saves, workspace.js)

---

## Summary

TextAgent autosaved by overwriting — Ctrl+Z died with the session, and one bad paste or AI-accept could silently destroy hours of work. This adds the classic "must-have" of serious editors: automatic local version history with visual diff and one-click restore. Fully client-side (IndexedDB), zero new dependencies (the line diff is ~90 lines of hand-rolled LCS, matching the project's zero-dep ethos), bounded storage via a two-level ring buffer.

---

## 1. Snapshot Engine
**Files:** `js/version-history.js` (new)
**What:** IndexedDB store (`textagent-history/snapshots`, indexed by fileId and ts). `onSave(fileId, content)` is called from both save paths; a per-file in-memory cache decides whether a snapshot is due (first-save / 3-min interval / 400-char delta / content-identical dedupe). Two-level pruning keeps ≤50 per file and ≤400 globally.
**Impact:** Every meaningful edit state is recoverable without the user doing anything.

## 2. History Panel + Diff + Restore
**Files:** `js/version-history.js`, `css/version-history.css` (new), `index.html`, `js/workspace.js`
**What:** `ws-ctx-history` context-menu item opens a modal: snapshot timeline on the left, diff-vs-current on the right (LCS line diff with common prefix/suffix trimming and a 4M-cell guard that degrades to a replace block). Restore takes a safety snapshot first, then writes via `wsSaveCurrent()` for the active file (covering disk-folder and single-linked-file write-back) or directly to localStorage + disk APIs for non-active files.
**Impact:** Visual, trustworthy recovery — you see exactly what changed before restoring.

## 3. Save-path Hooks
**Files:** `js/cloud-share.js`, `js/workspace.js`, `src/main.js`
**What:** One-line `M.versionHistory.onSave(...)` calls after the localStorage writes in `saveToLocalStorage()` and `setFileContent()`; module + CSS imported in main.js phase 3. All calls guarded so the app works identically if the module fails to load.
**Impact:** Zero behavior change to existing save flows; history is purely additive.

---

## Testing
- New Playwright spec `tests/feature/version-history.spec.js` (7 tests): API surface, IDB snapshot storage, diff correctness (adds/dels/sames), panel open/close, full restore round-trip incl. safety snapshot, context-menu item, dedupe of identical content.
- Verified visually at 1280×800 via Playwright screenshot: timeline, delta badges, GitHub-style diff (+2 −1), Copy/Restore actions, light theme.
- Smoke suite 22/22; build clean; adversarial multi-agent review run on the diff before merge.
