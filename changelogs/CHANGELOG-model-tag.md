# CHANGELOG — @model Tag Field

## Summary
Added `@model:` metadata field to all AI DocGen tag types, persisting the selected model in the document text. Dropdown shows all registered models; changing it syncs back to `@model:` in the editor.

## Changes

### @model: Tag Field
- New `@model:` field parsed from tag text in `parseDocgenBlocks()` — validated against `AI_MODELS` registry
- Model dropdown pre-selects the `@model:` value on render; shows ALL models for every card type
- Changing the dropdown writes `@model: <id>` back to the editor text (follows existing `@lang:` sync pattern)
- Intelligent defaults per tag type: OCR→`granite-docling`, TTS→`kokoro-tts`, STT→`voxtral-stt`, Image→`imagen-ultra`, AI/Agent/Translate→current model or fallback

### Tag Insertion Defaults
- `insertDocgenTag()` now includes `@model:` with appropriate default for each tag type
- AI and Agent tags use the currently selected model as default; Image defaults to `imagen-ultra`

### Model Options Refactor
- Replaced static `textModelOptionsHtml`/`imageModelOptionsHtml` with per-block `buildModelOptionsHtml()` function
- Each card's dropdown is built with the correct pre-selected model based on `@model:` value
- `isSttModel` models now excluded from text model dropdowns alongside `isTtsModel`

### Display Text Stripping
- `@model:` stripped from visible card text in all renderers: OCR, TTS, STT, Translate, AI/generic

## Files Modified
- `js/ai-docgen.js` — Parser, tag insertion, card rendering, dropdown sync, display stripping
