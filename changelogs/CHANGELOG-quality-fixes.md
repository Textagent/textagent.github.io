# Quality & Config Alignment — 7 Fixes

- Fixed copy-button selector mismatch (`copy-md-button` → `copy-markdown-button`)
- Unified preview-theme storage key to `md-viewer-preview-theme` across `app-init.js` and `ui-panels.js`
- HTML export now self-contained with all CSS inlined + theme attributes preserved
- PDF export reuses shared rendering pipeline (`renderMarkdownToContainer`) instead of re-parsing markdown
- Aligned license to MIT across `package.json`, `LICENSE`, and `README.md`
- Unified changelog path to `changelogs/` in both pre-commit hook and GitHub Actions workflow
- Removed duplicate `public/firestore.rules` and `public/nginx.conf`
- Repaired desktop `prepare.js` (removed stale `script.js` copy) and updated `desktop-app/README.md`
- Added ESLint, Prettier, and Playwright with 4 smoke tests (import, export, share, view-mode)
- Updated README release notes and Features table with export/dev-tooling improvements
- Updated Feature Showcase template with matching export and Dev Tooling rows

---

## Summary
Documents all 7 quality-of-life fixes and config alignment changes made across the codebase, plus the README and Feature Showcase template updates to reflect those improvements.

---

## 1. Copy Button Selector Fix
**Files:** `js/app-init.js`
**What:** Changed `copy-md-button` to `copy-markdown-button` to match `index.html`
**Impact:** Copy button now works — previously wired to a non-existent element

## 2. Preview Theme Key Unification
**Files:** `js/app-init.js`, `js/ui-panels.js`
**What:** Both files now use `md-viewer-preview-theme` consistently
**Impact:** Theme state no longer fragments between header and QAB controls

## 3. Export Pipeline Alignment
**Files:** `js/app-init.js`, `js/pdf-export.js`, `js/renderer.js`
**What:** HTML export collects all page CSS + theme attributes; PDF export calls `renderMarkdownToContainer`
**Impact:** Exported HTML/PDF now matches what users see in the app preview

## 4. Repo Config Drift
**Files:** `package.json`, `LICENSE`, `README.md`, `.githooks/pre-commit`, `.github/workflows/require-changelog.yml`
**What:** License unified to MIT; changelog path unified to `changelogs/`
**Impact:** No more conflicting license declarations or changelog location mismatches

## 5. Duplicate Configs Removed
**Files:** `public/firestore.rules` (deleted), `public/nginx.conf` (deleted)
**What:** Removed duplicate config files that had drifted from root versions
**Impact:** Single source of truth for Firestore rules and nginx config

## 6. Desktop App Drift Repaired
**Files:** `desktop-app/prepare.js`, `desktop-app/README.md`
**What:** Removed stale `script.js` copy; updated README to reflect modular architecture
**Impact:** Desktop build no longer fails looking for non-existent file

## 7. Linting & Tests Added
**Files:** `package.json`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `playwright.config.js`, `tests/smoke/*.spec.js`
**What:** Added ESLint, Prettier, Playwright configs and 4 smoke tests
**Impact:** `npm run lint`, `npm run format:check`, `npm test` now available

## 8. README & Template Updates
**Files:** `README.md`, `js/templates/documentation.js`
**What:** Added 2026-03-09 release notes entry; updated Export row and added Dev Tooling row
**Impact:** Documentation reflects all quality improvements

---

## Files Changed (12 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `README.md` | +5 −2 | Release notes + features table |
| `js/templates/documentation.js` | +3 −2 | Feature Showcase template |
| `js/app-init.js` | ~10 | Copy selector + HTML export + theme key |
| `js/pdf-export.js` | ~20 | Shared rendering pipeline |
| `js/renderer.js` | ~5 | Added `renderMarkdownToContainer` |
| `package.json` | +8 −1 | License + scripts + devDependencies |
| `desktop-app/prepare.js` | −7 | Removed `script.js` copy |
| `desktop-app/README.md` | ~20 | Updated architecture docs |
| `.githooks/pre-commit` | ~10 | Changelog path fix |
| `eslint.config.js` | +45 | New ESLint config |
| `playwright.config.js` | +20 | New Playwright config |
| `tests/smoke/*.spec.js` | +120 | 4 new smoke tests |
