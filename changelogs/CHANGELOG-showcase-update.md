# Feature Showcase Template — Comprehensive Update

- Updated Features at a Glance table with 7 new rows: Media Embedding, TTS, Game Builder, Finance Dashboard, Disk Workspace, Email to Self, Context Memory
- Updated AI Document Tags row to include all 10 tag types (`@AI`, `@Think`, `@Image`, `@Memory`, `@Agent`, `@OCR`, `@TTS`, `@STT`, `@Translate`, `@Game`) with `@model:`, `@upload:`, `@prompt:` fields
- Updated Voice Dictation row with dual-engine details (Voxtral Mini 3B + Whisper V3 Turbo)
- Added Text-to-Speech row (Kokoro TTS 82M, Web Speech API fallback, ⬇ Save WAV)
- Updated Code row to include `html-autorun` for widgets/quizzes
- Updated Dev Tooling row — test count 191 → 484
- Added 9 new dedicated sections: Media Embedding, Text-to-Speech (TTS), OCR — Image to Text, STT Tag, Translation, Game Builder, Finance Dashboard, Disk-Backed Workspace, Email to Self
- Updated AI Document Tags table — added OCR, TTS, STT, Translate, Game tag rows (4 → 9 tags)
- Updated metadata fields description with `@model:`, `@upload:`, `@prompt:`, `@engine:`, `@lang:`, `@prebuilt:`
- Updated AI Assistant model table — added Kokoro TTS (82M), Voxtral STT (3B), Granite Docling (258M), Florence-2 (230M)
- Updated Voice Dictation section intro with dual-engine description
- Added 14 new task list checklist items for all new features

---

## Summary
Comprehensive update to the in-app Feature Showcase template to include all features added since March 10–13. The template now matches the README's Features at a Glance table with 28 rows covering every feature, 9 new dedicated sections with examples and tips, and a complete 40+ item task checklist.

---

## 1. Features at a Glance Table Update
**Files:** `js/templates/documentation.js`
**What:** Replaced the 21-row features table with 28 rows, adding Media Embedding, TTS, Game Builder, Finance Dashboard, Disk Workspace, Email to Self, and Context Memory rows. Updated existing rows for AI Document Tags (10 tag types), Voice Dictation (dual-engine), Code (html-autorun), Dev Tooling (484 tests).
**Impact:** Users see a complete, accurate feature summary when loading the Feature Showcase.

## 2. New Dedicated Sections
**Files:** `js/templates/documentation.js`
**What:** Added 9 new `## ` sections before the Security section: Media Embedding, Text-to-Speech (TTS), OCR — Image to Text, STT Tag — In-Preview Dictation, Translation, Game Builder, Finance Dashboard, Disk-Backed Workspace, Email to Self. Each section includes feature description, bullet lists, tables, tips, and usage instructions.
**Impact:** Every major feature now has its own explorable section in the showcase.

## 3. Updated Existing Sections
**Files:** `js/templates/documentation.js`
**What:** AI Document Tags table expanded from 4 to 9 tag rows. AI Assistant model table gained 4 new models (Kokoro, Voxtral, Granite Docling, Florence-2). Voice Dictation intro rewritten for dual-engine. Metadata fields description updated.
**Impact:** Existing sections accurately reflect current capabilities.

## 4. Task List Checklist
**Files:** `js/templates/documentation.js`
**What:** Added 14 new checked items: media embedding, TTS, OCR, STT, translate, games, finance, disk workspace, email, context memory, run-all, @model, model loading UX, dual-engine voice.
**Impact:** Complete checklist of all implemented features.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/templates/documentation.js` | +111 −14 | Feature Showcase template content |
