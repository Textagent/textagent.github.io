# Changelog — Startup Sequencing Fix

## Changes

### `src/main.js` — Restructured Boot Phases
- Split module loading into 3 phases:
  - **Phase 1 (Core):** storage-keys, product-metadata, toast, modal-templates, app-core, renderer, workspace
  - **Phase 2 (Critical UI):** ui-panels, editor-features, file-converters, cloud-share, toolbar-overflow → then app-init.js
  - **Phase 3 (Remaining):** AI, templates, tools, help, demos, speech, docgen — loaded immediately after Phase 2
- Removed `requestIdleCallback`/`setTimeout(50)` wrapper that was delaying all non-core modules
- **Impact:** Buttons (view mode, import, export, share, AI, template, model, etc.) now work immediately after page load

### `js/templates/documentation.js` — Fixed `M is not defined` Error
- Replaced bare `M.PRODUCT.summaryParen()` with `window.MDView.PRODUCT.summaryParen()` (lines 34, 477)
- This file has no IIFE wrapper, so `M` was undefined, crashing the entire Phase 3 module chain

### `js/feature-demos.js` — Fixed `M.PRODUCT` Reference
- Replaced `M.PRODUCT.TEMPLATE_COUNT` / `M.PRODUCT.CATEGORY_COUNT` with `window.MDView.PRODUCT.*` (line 14)

## Files Modified
- `src/main.js`
- `js/templates/documentation.js`
- `js/feature-demos.js`

## Verification
- `npm run build` — ✅ (9.3s)
- `npx playwright test tests/smoke` — ✅ 12/12 passed (5.8s)
- Module-by-module debug test — ✅ All 36 modules load with zero page errors
