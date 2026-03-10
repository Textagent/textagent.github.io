# CSP Violation Test

- Added `no CSP violations on page load` test to `build-validation.spec.js`
- Test listens for console warnings containing "Content Security Policy" and `net::ERR_BLOCKED_BY_CSP` request failures
- Would have caught the shields.io badge block before deployment

---

## Summary
Added a Playwright test to detect CSP violations at load time, closing the test coverage gap that let the shields.io badge block slip through.

---

## 1. CSP Violation Detection Test
**Files:** `tests/dev/build-validation.spec.js`
**What:** New test registers `console` and `requestfailed` listeners before page reload, collects any CSP-related warnings or blocked requests during a 5-second observation window, then asserts no violations occurred.
**Impact:** Any future CSP misconfiguration (missing domain in `img-src`, `script-src`, `connect-src`, etc.) will be caught automatically by the test suite.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `tests/dev/build-validation.spec.js` | +28 | Test |
