# Centralized Storage Keys — Refactor

- Created `js/storage-keys.js` as single source of truth for all ~20 localStorage key strings
- Replaced raw `'markdown-viewer-theme'` / `'md-viewer-preview-theme'` / `'mdview-*'` literals across 12 JS files with `M.KEYS.*` constants
- Added `M.KEYS.THEME`, `M.KEYS.PREVIEW_THEME`, `M.KEYS.AUTOSAVE`, `M.KEYS.WORKSPACE`, `M.KEYS.AI_MODEL`, `M.KEYS.AI_CONSENTED_PREFIX`, and 14 more keys
- Updated `src/main.js` to load `storage-keys.js` first in Phase 1 (before `app-core.js`)
- Replaced local constant declarations in `cloud-share.js` (`AUTOSAVE_KEY`, `CLOUD_DOC_KEY`, etc.) and `workspace.js` (`WORKSPACE_KEY`, `FILE_PREFIX`, etc.) with shared references
- Replaced `keyStorageKey` raw strings in `ai-models.js` (10 providers) and `ai-web-search.js` (2 providers) with `M.KEYS.API_KEY_*`
- Fixed: `consentKey` construction in `ai-assistant.js` (3 occurrences) now uses `M.KEYS.AI_CONSENTED_PREFIX`

---

## Summary
Centralized all scattered localStorage key string literals into a single constants file (`js/storage-keys.js`). This eliminates a class of bugs where different files used different key strings for the same setting (e.g., `mdview-preview-theme` vs `md-viewer-preview-theme`). A typo in a key name now produces a load-time `undefined` instead of silently reading the wrong storage slot.

---

## 1. Storage Keys Module
**Files:** `js/storage-keys.js` (NEW), `src/main.js`
**What:** Created an IIFE that attaches `M.KEYS` to `window.MDView` with 20 grouped constants (Theme, Auto-Save, Cloud Sync, Workspace, Editor, AI Assistant, API Keys, Speech, Web Search). Loaded as the first Phase 1 import.
**Impact:** All localStorage key strings now have a single source of truth. Adding a new key requires editing one file.

## 2. Consumer File Updates
**Files:** `app-core.js`, `app-init.js`, `cloud-share.js`, `workspace.js`, `editor-features.js`, `ui-panels.js`, `ai-assistant.js`, `ai-docgen-ui.js`, `speechToText.js`, `ai-models.js`, `ai-web-search.js`
**What:** Replaced every raw `localStorage.getItem('md-viewer-...')` / `localStorage.setItem('mdview-...')` call and every `keyStorageKey: 'md-viewer-...'` property with `M.KEYS.*` references. Removed redundant local constant declarations where they existed.
**Impact:** No behavioral change — all key strings are identical. The only change is that they're now referenced through `M.KEYS.*` instead of inline strings.

---

## Files Changed (13 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/storage-keys.js` | +48 | NEW — centralized key constants |
| `src/main.js` | +1 | Added Phase 1 import |
| `js/app-core.js` | ~1 | Use `M.KEYS.THEME` |
| `js/app-init.js` | ~5 | Use `M.KEYS.THEME`, `PREVIEW_THEME`, `STATS_OPEN` |
| `js/cloud-share.js` | ~7 | Use shared autosave/cloud/file-prefix keys |
| `js/workspace.js` | ~6 | Use shared workspace/sidebar keys |
| `js/editor-features.js` | ~2 | Use `M.KEYS.WORD_WRAP` |
| `js/ui-panels.js` | ~2 | Use `M.KEYS.PREVIEW_THEME` |
| `js/ai-assistant.js` | ~14 | Use AI model/consent/panel-width keys |
| `js/ai-docgen-ui.js` | ~1 | Use `M.KEYS.AI_CONSENTED` |
| `js/speechToText.js` | ~1 | Use `M.KEYS.SPEECH_LANG` |
| `js/ai-models.js` | ~10 | Use `M.KEYS.API_KEY_*` in provider configs |
| `js/ai-web-search.js` | ~6 | Use `M.KEYS.SEARCH_*` and `API_KEY_*` |
