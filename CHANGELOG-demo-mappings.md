# Fix Demo Mappings — Correct 10 Incorrect Help Mode Demos & Record 6 New Videos

- Remapped "New Document" button from privacy hero demo to formatting toolbar demo
- Remapped "AI Model Selector" button to new dedicated `11_ai_model_selector.webp` demo
- Remapped "Sync Scrolling" button to new dedicated `12_sync_scrolling.webp` demo
- Remapped "Table of Contents" button to new dedicated `13_table_of_contents.webp` demo
- Remapped "Copy Markdown" button from writing modes demo to formatting toolbar demo
- Remapped "Voice Dictation" button to new dedicated `14_voice_dictation.webp` demo
- Remapped "Document Stats" button from writing modes demo to formatting toolbar demo
- Remapped AI Tags (AI, Think, Image) from AI assistant demo to new `15_ai_doc_tags.webp` demo
- Remapped "Fill All AI Blocks" button to new `15_ai_doc_tags.webp` demo
- Remapped "Template Variables" button to new dedicated `16_template_variables.webp` demo
- Recorded 6 new demo videos (total ~26MB) covering previously unmapped features

---

## Summary
Audited all 40+ button-to-demo mappings in Help Mode and fixed 10 that were pointing to the wrong demo video. Recorded 6 new dedicated demo videos to cover features that previously shared generic demos.

---

## 1. Fix Incorrect Demo Mappings
**Files:** `js/help-mode.js`
**What:** Updated the `HELP_DATA` registry to point 10 buttons to their correct demo videos. 4 buttons remapped to existing `10_formatting_toolbar.webp`, 6 buttons mapped to newly recorded demos.
**Impact:** Users clicking "Watch Demo" in Help Mode now see the correct feature demo instead of a generic/unrelated video.

## 2. New Demo Videos
**Files:** `public/assets/demos/11_ai_model_selector.webp`, `12_sync_scrolling.webp`, `13_table_of_contents.webp`, `14_voice_dictation.webp`, `15_ai_doc_tags.webp`, `16_template_variables.webp`
**What:** Recorded 6 new animated WebP demos using automated browser agent: AI model switching, sync scrolling on/off, TOC sidebar navigation, voice dictation UI, AI document tag insertion + Fill, template variable auto-detection.
**Impact:** Every button in Help Mode now has a relevant, dedicated demo video. Total demo count increased from 10 to 16.

---

## Files Changed (7 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/help-mode.js` | +10 −10 | Fix 10 demo path mappings |
| `public/assets/demos/11_ai_model_selector.webp` | +4.7MB | New demo: AI model picker |
| `public/assets/demos/12_sync_scrolling.webp` | +3.5MB | New demo: sync scroll |
| `public/assets/demos/13_table_of_contents.webp` | +4.6MB | New demo: TOC sidebar |
| `public/assets/demos/14_voice_dictation.webp` | +4.7MB | New demo: voice dictation UI |
| `public/assets/demos/15_ai_doc_tags.webp` | +5.4MB | New demo: AI/Think/Image tags |
| `public/assets/demos/16_template_variables.webp` | +3.0MB | New demo: template variables |
