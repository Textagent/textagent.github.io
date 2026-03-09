# Changelog: Centralize Product Metadata

## What changed
- Created `js/product-metadata.js` as a single source of truth for template counts, category names, and formatted summary strings
- Updated `js/help-mode.js`, `js/feature-demos.js`, and `js/templates/documentation.js` to read from `M.PRODUCT` instead of hardcoding stale counts
- Added `product-metadata.js` import in Phase 1 of `src/main.js`
- Fixed README.md — aligned all 4 drifted references to the actual count (103+ templates, 11 categories); removed non-existent "Financial" category

## Why
Template counts and category lists were hardcoded in 5 different places and had already diverged (81+, 96+, 108+ depending on file). A single source of truth prevents this drift.

## Files modified
- `js/product-metadata.js` (NEW)
- `js/help-mode.js`
- `js/feature-demos.js`
- `js/templates/documentation.js`
- `src/main.js`
- `README.md`
