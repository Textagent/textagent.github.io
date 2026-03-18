# Inline File Rename & Demo Showcase — Feature Update

- Added clickable document title chip in the header bar showing the active file name
- Clicking the title chip opens the rename modal with the name pre-selected (without `.md`)
- Added the same title chip to the Quick Action Bar (collapsed header) for visibility
- Both chips stay in sync and update on file switch, rename, or create
- Pencil ✏️ icon appears on hover to signal editability
- Title chip hides on narrow screens (`≤1199px`) in the full header but always shows in QAB
- Added 6 new demo recordings: Game Builder, Finance Dashboard, TTS, OCR, Draw/Excalidraw, Media Embedding
- Updated Feature Showcase template with new demo sections and expanded feature descriptions
- Demo badges now only render on the Feature Showcase template (guard prevents false-positive keyword matches on user documents)
- Updated product metadata: 136 templates across 14 categories (was 103 / 11)
- Updated Features at a Glance table with correct template/category counts
- Fixed: `updatePageTitle` now strips directory prefix before display (uses `split('/').pop()`)

---

## Summary
Adds a discoverable inline file rename option via a clickable document title chip in the header (and QAB), and adds 6 new demo recordings to the Feature Showcase template with updated metadata counts.

---

## 1. Inline Document Title & Rename
**Files:** `index.html`, `styles.css`, `js/workspace.js`
**What:** Added a `doc-title-chip` element to both the main header (between GitHub icon and stats) and the Quick Action Bar. The chip displays the active file name (without `.md`), updates dynamically on file switch/rename/create, and opens the existing rename modal on click. CSS provides hover effects (border highlight, pencil icon reveal) with responsive hiding at narrow widths.
**Impact:** Users can now see and rename files directly from the editor header without needing to open the sidebar or use the right-click context menu.

## 2. New Demo Recordings
**Files:** `js/feature-demos.js`, `public/assets/demos/26-31_*.webp`
**What:** Added 6 new demo entries for Game Builder, Finance Dashboard, Text-to-Speech, OCR, Draw/Excalidraw, and Media Embedding. Added a guard so demo badges only render on the Feature Showcase template (checks for `# 🚀 Welcome to TextAgent` heading).
**Impact:** Feature Showcase template now has comprehensive demo coverage for all major features; user documents no longer get spurious demo badges.

## 3. Product Metadata & Template Updates
**Files:** `js/product-metadata.js`, `js/templates/documentation.js`, `README.md`
**What:** Updated `PRODUCT.TEMPLATE_COUNT` from 103→136 and `CATEGORY_COUNT` from 11→14, added Finance, Games, and Skills categories. Updated the Feature Showcase template with new feature sections (Draw, Page View, View-Locked Sharing, Turnstile CAPTCHA) and corrected dev tooling stats (521 tests, Firestore validation, security scanner).
**Impact:** Template gallery and README accurately reflect the current template/category counts and feature set.

---

## Files Changed (13 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +10 | Added doc-title-chip to header + QAB |
| `styles.css` | +75 | Doc-title-chip styling + responsive rules |
| `js/workspace.js` | +62 −1 | Title chip DOM refs, updatePageTitle sync, click-to-rename handlers |
| `js/feature-demos.js` | +13 | 6 new demo entries + guard for Feature Showcase template |
| `js/product-metadata.js` | +4 −3 | Template count 136, category count 14, new categories |
| `js/templates/documentation.js` | +24 −1 | New feature sections, updated dev tooling stats |
| `README.md` | +67 −2 | 7 new feature demo sections, updated counts |
| `public/assets/demos/26_game_builder.webp` | new | Game Builder demo recording |
| `public/assets/demos/27_finance_dashboard.webp` | new | Finance Dashboard demo recording |
| `public/assets/demos/28_text_to_speech.webp` | new | Text-to-Speech demo recording |
| `public/assets/demos/29_ocr_tag.webp` | new | OCR tag demo recording |
| `public/assets/demos/30_draw_excalidraw.webp` | new | Draw/Excalidraw demo recording |
| `public/assets/demos/31_media_embedding.webp` | new | Media Embedding demo recording |
