# Turnstile Widget Retry Fix — Ensure CAPTCHA renders reliably

- Fixed: Turnstile widget never rendering when the async/defer script loads after the share modal opens
- Added `initTurnstileWithRetry()` polling mechanism (retries every 500ms, up to 10 times)
- Added `onload=onTurnstileLoad` callback to Turnstile script URL for immediate notification
- Added `turnstile-ready` custom event listener to auto-render widget when script loads
- Added `turnstileModalOpen` state tracking to coordinate script loading with modal visibility

---

## Summary
The Turnstile CAPTCHA widget was not rendering because the async/defer script hadn't loaded when `initTurnstile()` was called. The function silently returned with no retry mechanism. This fix ensures reliable widget rendering through polling retries and an onload callback.

---

## 1. Retry Logic
**Files:** `js/cloud-share.js`
**What:** Added `initTurnstileWithRetry()` that polls every 500ms (up to 10 attempts) until the `turnstile` global is available, then renders the widget.
**Impact:** Widget reliably renders regardless of script load timing.

## 2. Onload Callback
**Files:** `index.html`, `js/cloud-share.js`
**What:** Added `onload=onTurnstileLoad` parameter to script URL; callback dispatches `turnstile-ready` event; cloud-share.js listens and auto-inits if modal is open.
**Impact:** Belt-and-suspenders approach — widget renders as soon as script loads.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/cloud-share.js` | +30 −8 | Retry logic + event listener |
| `index.html` | +6 −1 | Onload callback + event dispatch |
