# Toast Consolidation — Unified App-Native Notifications

- Replaced ad-hoc `showConversionToast()` in `file-converters.js` with centralized `M.showToast('success')`
- Replaced local `showToast()` helper in `speechToText.js` (3 call sites) with centralized `M.showToast()`
- Removed orphaned `.conversion-toast` CSS and `toastIn`/`toastOut` keyframes from `modals.css`
- Removed orphaned `.speech-toast` CSS and all variants (error, info, dark theme) from `speech.css`

---

## Summary

Consolidated two ad-hoc toast notification implementations into the centralized `M.showToast()` system from `js/toast.js`. This eliminates duplicate toast DOM creation, inconsistent styling, and dead CSS — all notifications now flow through a single, themed, accessible toast component.

---

## 1. File Converters — Remove Ad-Hoc Toast
**Files:** `js/file-converters.js`, `css/modals.css`
**What:** Deleted `showConversionToast()` which manually created `.conversion-toast` DOM elements. Replaced the single call site (successful file conversion) with `M.showToast('✓ Converted … to Markdown', 'success')`. Removed the `.conversion-toast` CSS rule and its `toastIn`/`toastOut` keyframes from `modals.css`.
**Impact:** File conversion success feedback now uses the same themed, animated, accessible toast as every other notification in the app.

## 2. Speech-to-Text — Remove Local Toast Helper
**Files:** `js/speechToText.js`, `css/speech.css`
**What:** Deleted the local `showToast()` function (16 lines) which created `.speech-toast` DOM elements. Replaced 3 call sites (mic denied, network error, start failure) with `M.showToast()`. Removed `.speech-toast`, `.speech-toast-show`, `.speech-toast-error`, `.speech-toast-info`, and dark-theme variants from `speech.css`.
**Impact:** Speech error notifications now match the app-wide toast style instead of appearing as a separate, differently-styled notification.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/file-converters.js` | +1 −8 | Remove ad-hoc toast, use M.showToast |
| `js/speechToText.js` | +3 −19 | Remove local showToast, use M.showToast |
| `css/modals.css` | −30 | Remove .conversion-toast CSS + keyframes |
| `css/speech.css` | −45 | Remove .speech-toast CSS + variants |
