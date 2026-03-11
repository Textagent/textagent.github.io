# CHANGELOG — DocGen Preview Editing & Upload

## Summary

Enhanced DocGen tag preview cards with interactive editing, image uploads, and model readiness checks.

## Changes

### Image Upload (`@upload:` directive)
- Added 📎 upload button to AI, Image, and Agent preview cards
- File picker stores image data (base64, mimeType, name) in memory (`blockUploads` Map)
- Uploaded images display as thumbnails with ✕ remove button
- Inserting/removing uploads syncs `@upload: filename` lines in editor tag text
- `parseDocgenBlocks()` extracts `@upload:` lines from tag text

### Editable Prompt Box (`@prompt:` textarea)
- When `@prompt:` field is present in a tag, the preview card shows an editable `<textarea>`
- Bare text (without `@prompt:`) displays as static italic description — NOT sent to AI
- `@prompt:` content is the actual AI instruction sent to the model
- Debounced sync (300ms) writes edits back to the `@prompt:` line in the editor
- Suppresses re-render during sync to preserve textarea focus
- Light/dark theme support with teal (AI) and purple (Image) focus accents

### Description vs Prompt Separation
- Parser now stores `block.description` (bare text label) and `block.prompt` (`@prompt:` content) separately
- `block.hasPromptField` flag controls textarea vs static text rendering
- `buildPrompt()` only sends `@prompt:` content to the AI model
- Description shows as static italic label above the textarea

### Editable Agent Steps
- Agent step descriptions changed from `<span>` to `<input>` for inline editing
- `updateBlockStepText()` syncs edits to `@step N:` lines in the editor
- Amber accent styling on focus/hover, transparent when idle

### Model Readiness Check (`ensureModelReady()`)
- New helper prevents cryptic "AI model not ready" error
- Handles local model download consent flow
- Handles cloud model API key prompt
- Called before `generateAndReview()` and `generateAgentFlow()`

### Image Card Model Selector
- Image card dropdown now includes both image generation models AND vision/multimodal models
- Separated by `──── Vision ────` divider

## Files Modified
- `js/ai-docgen.js` — parser, card rendering, field sync handlers
- `js/ai-docgen-generate.js` — `ensureModelReady()`, attachments
- `css/ai-docgen.css` — textarea, step input, upload thumbnail styles
