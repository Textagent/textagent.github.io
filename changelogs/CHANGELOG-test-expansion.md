# Changelog: Test Suite Expansion — 28 New Playwright Tests

## What changed
- Added 5 new Playwright test spec files with 28 test cases covering critical untested areas:
  - `tests/feature/email-share.spec.js` (8 tests) — email-to-self validation, subject fallback, loading state, success/error feedback, localStorage persistence
  - `tests/feature/secure-share.spec.js` (5 tests) — passphrase mismatch/length validation, download-section visibility, filename sanitization, credentials content
  - `tests/smoke/startup-timing.spec.js` (5 tests) — share/template/export/AI work immediately without 5s sleeps, no `M is not defined` page errors
  - `tests/feature/export-integrity.spec.js` (5 tests) — Markdown exact match, HTML inline styles, theme attributes, rendered HTML vs raw markdown
  - `tests/feature/persistence.spec.js` (5 tests) — theme, preview theme, stats pill, word-wrap, and saved email persist across reloads

## Why
Existing tests covered basic happy paths (render, import/export extensions, share modal open/close). These new specs test *behavior* — validation rules, loading states, content integrity, race conditions, and localStorage persistence — to catch regressions in critical user-facing flows.

## Files added
- `tests/feature/email-share.spec.js` (NEW)
- `tests/feature/secure-share.spec.js` (NEW)
- `tests/smoke/startup-timing.spec.js` (NEW)
- `tests/feature/export-integrity.spec.js` (NEW)
- `tests/feature/persistence.spec.js` (NEW)
- `README.md` (updated Dev Tooling row + release notes)
