# Read-Only UI Cleanup — Hide Composer, Agent Panel & Remove Import Button

- Hidden composer FAB and floating panel in read-only mode via CSS (`body.editor-readonly`)
- Hidden agent panel, toggle button, and floating toggle when both read-only AND header-hidden (`body.editor-readonly.header-hidden`)
- Removed redundant Import button from header toolbar, mobile menu, and Quick Action Bar (Upload/drag-and-drop dropzone already covers the same 8 formats)
- Updated Help Mode entry to point at `#qab-more` Upload button instead of removed Import selectors

---

## Summary
Cleaned up the read-only shared document view by hiding the Composer FAB and Agent Panel controls when the user is in read-only mode, and removed the redundant Import button across all three UI surfaces (header, mobile, QAB) since the Upload/drag-and-drop dropzone already provides the same file import functionality.

---

## 1. Composer Hidden in Read-Only
**Files:** `css/composer.css`
**What:** Added CSS rule targeting `body.editor-readonly .composer-fab` and `body.editor-readonly .composer-floating-panel` with `display: none !important`.
**Impact:** Composer FAB and floating panel are fully hidden when viewing shared read-only documents.

## 2. Agent Panel Hidden in Read-Only + Header-Hidden
**Files:** `css/agent-panel.css`
**What:** Added CSS rule targeting `body.editor-readonly.header-hidden .agent-panel-toggle`, `.agent-panel`, and `.agent-panel-floating-toggle` with `display: none !important`.
**Impact:** Agent panel and its toggles are hidden only when BOTH read-only mode and header-hidden state are active. When header is visible in read-only mode, the agent panel remains accessible.

## 3. Import Button Removal
**Files:** `index.html`, `js/app-core.js`, `js/app-init.js`, `js/cloud-share.js`, `js/help-mode.js`, `styles.css`
**What:** Removed `#import-button` (header toolbar), `#mobile-import-button` (mobile menu), and `#qab-import` (QAB) button elements and all associated JavaScript wiring (DOM references, click handlers, read-only interceptor, help mode entry). Updated help-mode.js to map the Upload button (`#qab-more`) to the import/upload help entry.
**Impact:** Users import files via the Upload/dropzone button, which provides the same drag-and-drop and click-to-browse functionality for all 8 supported formats (MD, DOCX, XLSX, CSV, HTML, JSON, XML, PDF).

---

## Files Changed (8 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `css/composer.css` | +6 | Hide composer in read-only |
| `css/agent-panel.css` | +7 | Hide agent panel in read-only + header-hidden |
| `index.html` | −10 | Removed 3 import buttons |
| `js/app-core.js` | −2 | Removed DOM refs |
| `js/app-init.js` | −10 | Removed click handlers |
| `js/cloud-share.js` | ~1 | Removed from selector |
| `js/help-mode.js` | ~3 | Updated help entry |
| `styles.css` | −1 | Removed from read-only styles |
