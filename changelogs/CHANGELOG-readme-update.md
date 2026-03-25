# README Update — Features, Counts, Release Notes Fixes

- Updated template count from 106+/107 to 109+ across 6 README locations
- Updated category count from 12 to 13 (added Games category) across 6 locations
- Updated Playwright test count from 329 to 484
- Added `model tag` and `game tag` to Dev Tooling test categories
- Added missing `{{@TTS:}}` tag to AI Document Tags feature row (Kokoro per-card playback, ▶ Play / ⬇ Save WAV)
- Added missing `{{@Translate:}}` tag to AI Document Tags feature row (language selector, TTS pronunciation, cloud routing)
- Added Granite Docling 258M and Florence-2 230M as named OCR engine choices in AI Document Tags
- Added `@lang` to metadata fields list in AI Document Tags
- Added `textagent` HuggingFace org hosting note to AI Assistant row
- Fixed TTS HuggingFace link from `onnx-community/` to `textagent/` org
- Added AI Model Manager template mention to Extras row
- Populated commit hashes in Release Notes Commits column for 16 entries (2026-03-10 through 2026-03-13)
- Fixed: 36 Release Notes rows (2026-03-04 and older) had feature text in wrong column due to missing empty Commits separator

---

## Summary
Comprehensive README update to reflect all features added in the last 2 days and fix structural issues in the Release Notes table.

---

## 1. Features at a Glance — Missing Tags & Counts
**Files:** `README.md`
**What:** Added `{{@TTS:}}` and `{{@Translate:}}` tags to the AI Document Tags row, named OCR engines (Granite Docling / Florence-2), updated template count (109+), category count (13), and test count (484). Added textagent HuggingFace org reference and fixed TTS model link.
**Impact:** The features table now accurately reflects all implemented DocGen tag types and current project metrics.

## 2. Release Notes — Commit Hashes
**Files:** `README.md`
**What:** Replaced `—` placeholders with actual git commit hashes (`2e0e2ec`, `9106fd1`, `ef63c42`, `e46a70d`, `dbb571c`, `9d8059a`, `f7ca256`, `0f58296`, `591467b`, `7b9f846`, `1ec8b90`, `8442426`, `30520b9`, `79ed005`, `b7ca695`, `cce3dce`, `ce6051d`) for 16 release note entries.
**Impact:** Release notes now link to specific commits for traceability.

## 3. Release Notes — Column Alignment Fix
**Files:** `README.md`
**What:** Added missing empty `| |` Commits column separator to 36 rows (2026-03-04 through 2024-04-09) where the feature description was rendered in the Commits column.
**Impact:** The 3-column table (Date | Commits | Feature) now renders correctly for all entries.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `README.md` | ~80 | Features table, release notes fixes |
