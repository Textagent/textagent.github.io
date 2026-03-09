# CHANGELOG — Toast Notification System

## What Changed
Replaced all 7 `alert()` calls with a centralized `M.showToast(message, type)` toast notification system. Browser alert dialogs are now replaced by non-blocking, themed toast notifications that auto-dismiss.

## Files Added
- `js/toast.js` — Centralized toast utility (`M.showToast`) with error/warning/info/success types, auto-dismiss, and ARIA attributes
- `css/toast.css` — Styles for `.app-toast` with gradient type variants, slide-up animations, and dark/light theme support

## Files Modified
- `src/main.js` — Import `css/toast.css` and load `js/toast.js` in Phase 1 (before all other modules)
- `js/file-converters.js` — Replaced 2 alerts (unsupported format, conversion failure) with error toasts
- `js/cloud-share.js` — Replaced 1 alert (empty editor share) with warning toast
- `js/pdf-export.js` — Replaced 1 alert (PDF export failure) with error toast
- `js/ui-panels.js` — Replaced 1 alert (no slides found) with warning toast
- `js/app-init.js` — Replaced 2 alerts (copy-to-clipboard failure) with error toasts
- `js/ai-docgen-ui.js` — Backfilled `M._showToast` to delegate to centralized `M.showToast`

## Verification
- `npm run build` — ✅ success
- `npx playwright test` — ✅ 12/12 tests passed
- `grep alert( js/*.js` — ✅ zero remaining alert() calls
