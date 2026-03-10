# Flaky Assertions and Typing Fixes

## Summary
Fixed false-passes and flaky tests in `editor.spec.js` caused by missing elements being masked by improper testing patterns, and silenced JSDoc typing errors in `context-memory.spec.js` and `editor.spec.js`.

## 1. DOM Assertion Stability
**When:** The editor is evaluating emojis and GitHub callouts.
**What:** Replaced hardcoded `waitForTimeout(500)` combined with `.innerHTML()` parsing for native Playwright `.toBeVisible()` and `.toContainText()` matchers.
**Impact:** Solves race conditions caused by MathJax and Joypixels fetching fonts and stylesheets asynchronously over the network, which previously led tests to evaluate incomplete views.

## 2. JSDoc Typing Adjustments
**What:** Applied `/** @type {any[]} */` and `/** @type {any} */` casts to `errors` arrays and `window` assignments within Playwright `page.on` listeners and `page.evaluate` blocks.
**Impact:** Prevents TypeScript's strict type checker from discarding Playwright scripts due to missing explicit variable typing.

---

## Files Changed

| File | Type |
|------|------|
| `tests/feature/editor.spec.js` | Test Assertion Fixes |
| `tests/feature/context-memory.spec.js` | Test Typing Fixes |
