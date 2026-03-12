# Baseline Test Suite — 6 Spec Files + Build Config

- Added `tests/regression/regression.spec.js` — 208 lines, regression tests for core features (view modes, sync scroll, formatting, templates, render pipeline, dark mode, edge cases)
- Added `tests/performance/render-stress.spec.js` — 166 lines, stress tests for heavy Markdown rendering (large documents, complex tables, mermaid diagrams, code blocks)
- Added `tests/quality/code-smell.spec.js` — 250 lines, code smell detection (console.log count, large functions, magic numbers, global variables, duplicate strings)
- Added `tests/quality/consistency.spec.js` — 174 lines, cross-module consistency checks (naming conventions, error handling patterns, event listener cleanup)
- Added `tests/quality/security.spec.js` — 119 lines, security baseline (CSP headers, DOMPurify, XSS sanitization, API key exposure)
- Added `tests/quality/seo-meta.spec.js` — 86 lines, SEO and accessibility checks (meta tags, semantic HTML, heading hierarchy, alt attributes)
- `index.html`: conversion overlay markup removed from static HTML, now injected by `js/modal-templates.js` at runtime
- `package.json`: added `test:regression` script, added `tests/regression` to the `test:all` runner

---

## Summary

Adds 6 baseline test spec files (1,003 lines) covering regression, performance stress, code smell, consistency, security, and SEO/accessibility. Also cleans up `index.html` and updates `package.json` test scripts.

---

## 1. Baseline Test Files
**Files:** `tests/regression/regression.spec.js`, `tests/performance/render-stress.spec.js`, `tests/quality/code-smell.spec.js`, `tests/quality/consistency.spec.js`, `tests/quality/security.spec.js`, `tests/quality/seo-meta.spec.js`
**What:** Foundational tests covering core application behavior, render performance under stress, code quality patterns, cross-module consistency, security baselines, and SEO.
**Impact:** Establishes a solid baseline test suite for ongoing regressions and code quality.

## 2. Conversion Overlay Cleanup
**Files:** `index.html`
**What:** Removed static `#conversion-overlay` markup; it is now injected at runtime by `js/modal-templates.js`.
**Impact:** Reduces static HTML size and centralizes modal management in JavaScript.

## 3. Test Script Updates
**Files:** `package.json`
**What:** Added `test:regression` script pointing to `tests/regression/`; added `tests/regression` to the `test:all` aggregate runner.
**Impact:** Regression tests now run as part of the full test suite.

---

## Files Changed (8 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `tests/regression/regression.spec.js` | +208 | New test suite |
| `tests/performance/render-stress.spec.js` | +166 | New test suite |
| `tests/quality/code-smell.spec.js` | +250 | New test suite |
| `tests/quality/consistency.spec.js` | +174 | New test suite |
| `tests/quality/security.spec.js` | +119 | New test suite |
| `tests/quality/seo-meta.spec.js` | +86 | New test suite |
| `index.html` | +1 −8 | Overlay cleanup |
| `package.json` | +2 −1 | Script updates |
