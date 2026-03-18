# Security Hardening — 2026-03-18

## Summary

Comprehensive security hardening across postMessage communication, Firestore rules,
email endpoint protection, and automated security checks.

## Changes

### postMessage Origin Validation
- **`js/draw-docgen.js`** — replaced all `postMessage(..., '*')` calls with `postMessage(..., window.location.origin)`; added `e.origin !== window.location.origin` guard on the `message` event listener; removed Gemini API key forwarding via `postMessage` to the Excalidraw iframe (was a cross-origin credential leak risk)
- **`public/excalidraw-embed.html`** — replaced all `window.parent.postMessage(..., '*')` with origin-scoped `window.parent.postMessage(..., window.location.origin)` (~14 call sites); added `e.origin !== window.location.origin` guard on the `message` listener

### Firestore Rules Hardening
- **`firestore.rules`** — added `validView()` helper function restricting the `view` field to `'ppt'` or `'preview'`; added optional `view` field to `hasOnly()` lists for quick create, secure create, and update rules; `validView()` called in all three rule branches

### Email Endpoint Security
- **`scripts/email-apps-script.js`** — upgraded rate limiting from flat 20/day to dual-tier: 100/day global cap (Gmail free tier) + 7/day per-recipient address; per-recipient key uses email address as identity (no login needed); updated comments and variable names
- **`js/cloud-share.js`** — updated Apps Script endpoint URL to new deployment with Turnstile CAPTCHA verification; set Turnstile site key (`0x4AAAAAAACs...`)

### Automated Security Checks
- **`scripts/security-check.sh`** [NEW] — standalone security scanner with 13 checks across 3 severity tiers (Critical/Important/Best Practice): hardcoded secrets, API keys in postMessage, eval(), document.write(), innerHTML XSS, wildcard postMessage, origin validation, no-cors fetch, sensitive console.log, DOMPurify usage, Firestore rule invariants, sandbox attributes, CAPTCHA presence; color-coded output; blocks commit on critical findings
- **`.githooks/pre-commit`** — integrated `security-check.sh` as first step (runs on staged files, blocks commit on critical issues)

### Firestore Rules Test Suite
- **`tests/firestore/firestore-rules.test.js`** [NEW] — 21 zero-dependency Node.js tests validating Firestore rules structure: field lists, `validView()` helper, security invariants (read/delete/type checks), size limits, write-token ownership, secure share fields, catch-all deny
- **`package.json`** — added `test:firestore` and `security` npm scripts

### Workflow Update
- **`.agents/workflows/commit.md`** — added `npm run test:firestore` step before README update (step 3); renumbered subsequent steps

## Files Modified/Added

| File | Lines Changed (approx) |
|------|----------------------|
| `js/draw-docgen.js` | ~20 |
| `public/excalidraw-embed.html` | ~30 |
| `firestore.rules` | ~25 |
| `scripts/email-apps-script.js` | ~30 |
| `js/cloud-share.js` | ~3 |
| `scripts/security-check.sh` [NEW] | ~200 |
| `.githooks/pre-commit` | ~10 |
| `tests/firestore/firestore-rules.test.js` [NEW] | ~150 |
| `package.json` | ~4 |
| `.agents/workflows/commit.md` | ~10 |
