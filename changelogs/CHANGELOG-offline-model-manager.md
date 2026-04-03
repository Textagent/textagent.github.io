# Offline Model Manager — ZIP Export/Import for Offline AI Models

- Added Model Manager tab to the AI model selector dropdown (Models | Manager)
- Export button bundles all cached model files into a single ZIP and downloads it (STORE mode, no compression — ONNX files don't compress)
- Import button accepts a ZIP file (or raw files), extracts entries, and restores them into browser Cache API
- Delete button clears cached model from browser to free storage
- Per-model status badges: "In browser cache", "Downloaded to disk", "Not downloaded"
- Cache size detection and display for each local model
- Tab switching UI with sticky tab bar and active state styling
- Created `ai-model-storage.js` module with HuggingFace API integration for file listing
- Built-in CRC32 + ZIP file creator (STORE mode) — zero external dependencies
- Manifest-based file tracking maps flat downloaded filenames to original cache URLs
- Refactored button labels from Download/Upload to Export/Import with updated icons (`bi-box-arrow-down` / `bi-box-arrow-in-up`)
- Fixed: `M._ai = {}` in ai-assistant.js was wiping modelStorage namespace → changed to `if (!M._ai) M._ai = {}`
- Fixed: CSS was initially placed in `styles.css` (not loaded by Vite) → moved to `css/ai-panel.css`
- Works in all modern browsers — no File System Access API dependency
- Added Science template category button to template modal

---

## Summary
Added a Model Manager tab to the AI model selector that lets users export cached local AI models as a single ZIP file and import them back into the browser cache. This enables offline model usage by providing a portable backup that survives browser cache evictions. Also added a Science template category.

---

## 1. Model Storage Module — ZIP Export/Import
**Files:** `js/ai-model-storage.js`
**What:** Rewrote the download/upload pipeline to use ZIP archives. Export reads all model files from Cache API, bundles them with a `__manifest.json` into a single ZIP (STORE mode via built-in CRC32 + ZIP creator — ONNX files don't benefit from compression). Import accepts a ZIP file, extracts entries, maps filenames back to cache URLs via the manifest, and restores them into `transformers-cache`. Also supports legacy raw file selection.
**Impact:** Users get a single portable `.zip` file per model instead of dozens of individual file downloads. Re-importing is a one-click ZIP selection instead of manually selecting many files.

## 2. Tabbed Model Selector UI
**Files:** `js/modal-templates.js`, `js/ai-assistant.js`, `css/ai-panel.css`
**What:** Added a two-tab interface (Models | Manager) to the model dropdown. The Models tab shows the existing model list; the Manager tab shows per-model storage cards with Export, Import, and Delete buttons. Refactored button labels and icons from Download/Upload to Export/Import (`bi-box-arrow-down` / `bi-box-arrow-in-up`). Includes sticky tab bar, status badges (cached/downloaded/none), size display, and progress indicators.
**Impact:** Users can manage all local models from within the existing model selector without any additional UI surfaces.

## 3. Module Integration
**Files:** `src/main.js`, `js/ai-assistant.js`
**What:** Added `ai-model-storage.js` to the Vite module load chain (Phase 3d, before ai-assistant.js). Fixed `M._ai = {}` overwrite bug that was destroying the modelStorage namespace by changing to `if (!M._ai) M._ai = {}`.
**Impact:** The storage module loads before the AI assistant, ensuring the Manager tab can access export/import APIs on first render.

## 4. Science Template Category
**Files:** `js/modal-templates.js`
**What:** Added a "Science" category button to the template modal category filter bar.
**Impact:** Science-related templates are now discoverable via their own dedicated category pill.

---

## Files Changed (7 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-model-storage.js` | +465 −340 | Rewritten: ZIP export/import, CRC32, STORE-mode ZIP creator |
| `js/ai-assistant.js` | +208 −14 | Manager tab builder, Export/Import labels, M._ai fix |
| `css/ai-panel.css` | +345 | Model Manager tab styles |
| `js/modal-templates.js` | +13 −2 | Tabbed dropdown + Science category |
| `src/main.js` | +1 | Module load entry |
| `changelogs/CHANGELOG-offline-model-manager.md` | +60 | This changelog |
