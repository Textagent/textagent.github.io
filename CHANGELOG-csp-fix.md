# CSP Fix for GitHub Badges

- Added `https://img.shields.io` to `img-src` in `index.html` CSP to allow README badges to load
- Added `https://img.shields.io` to `img-src` in `nginx.conf` CSP
- Replaced outdated `markdownview.github.io` domain with `textagent.github.io` in CSP directives

---

## Summary
Updated the Content-Security-Policy to allow loading external images from shields.io so that license and version badges render correctly in the application UI without being blocked by the browser.

---

## 1. Content Security Policy Update
**Files:** `index.html`, `nginx.conf`
**What:** Appended `https://img.shields.io` to the `img-src` directive in the CSP meta tag and nginx config header. Also updated an outdated legacy domain (`markdownview.github.io`) to the current `textagent.github.io` domain.
**Impact:** Fixes the browser security block errors preventing shields.io badge SVGs from loading, ensuring the app displays markdown badges correctly in both development and production.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +1 −1 | Config |
| `nginx.conf` | +1 −1 | Config |
