# CHANGELOG — Test Coverage Expansion

## 2026-03-18

### test: 51 new Playwright tests for 8 previously untested features

Added 8 new spec files covering features that had zero test coverage:

- **`tests/feature/help-mode.spec.js`** (7 tests) — toggle, popover display, keyboard shortcuts, Watch Demo button, Escape key exit, click interception
- **`tests/feature/page-view.spec.js`** (7 tests) — enter/exit A4 mode, page frames, page counter, zoom control
- **`tests/feature/table-tools.spec.js`** (6 tests) — container wrapping, toolbar buttons, row badge, editable cells, tiny table skip
- **`tests/feature/api-tag.spec.js`** (7 tests) — `parseApiBlocks`, `parseApiConfig`, fenced block ignore, multiple blocks, card rendering
- **`tests/feature/linux-tag.spec.js`** (8 tests) — terminal/script mode parsing, Stdin extraction, fenced block ignore, Launch/Run card rendering
- **`tests/feature/template-loading.spec.js`** (7 tests) — modal open/close via JS API, category tabs, search filtering, card rendering
- **`tests/feature/inline-rename.spec.js`** (4 tests) — title chip existence, filename display, QAB chip, rename modal
- **`tests/feature/presentation.spec.js`** (5 tests) — PPT mode switching, slide content, view mode bar, split mode return

**Total test count: 521 → 572 (51 new tests)**

**Files added:**
- `tests/feature/help-mode.spec.js`
- `tests/feature/page-view.spec.js`
- `tests/feature/table-tools.spec.js`
- `tests/feature/api-tag.spec.js`
- `tests/feature/linux-tag.spec.js`
- `tests/feature/template-loading.spec.js`
- `tests/feature/inline-rename.spec.js`
- `tests/feature/presentation.spec.js`
