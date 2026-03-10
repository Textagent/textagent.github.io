# Test Fixes: Toolbar Tags Race Condition & TypeScript

## Summary
Fixed 4 failing Playwright tests related to AI tags in `toolbar-tags.spec.js` and resolved TypeScript typing issues.

## 1. Syntax Updates & Deprecations
**Files:** `tests/feature/toolbar-tags.spec.js`
**What:** Updated expected Playwright test substrings to match the new tag format (`{{@AI:}}`, `{{@Image:}}`, `{{@Agent:}}`) and removed the obsolete explicit `Think` tag test.
**Impact:** Test assertions now accurately reflect the application's current UI logic.

## 2. Race Condition Fix
**Files:** `tests/feature/toolbar-tags.spec.js`
**What:** Added explicit waiting for Phase 3 lazy-loaded modules (`M.formattingActions`) before firing `clickAction`.
**Impact:** Solved flaky button clicks that were failing because Playwright's executions were faster than the feature modules mapping to HTML UI.

## 3. TypeScript Defect Fix
**Files:** `tests/feature/toolbar-tags.spec.js`
**What:** Cast `window` to `any` while evaluating in `page.waitForFunction` blocks and added `@param` descriptions to helper functions.
**Impact:** Silences incorrect TypeScript errors while compiling the `// @ts-check` equipped test suite.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `tests/feature/toolbar-tags.spec.js` | +20 −17 | Test Logic & Typing Fixes |
| `README.md` | +2 −1 | Release Notes Update |
