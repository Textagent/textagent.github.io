# Multi-Tag Template & Variable Resolution

## Changes

### New Template: AI Global Briefing Generator
- Added zero-input template chaining 5 tag types across 6 blocks: `AI → Think → Translate → TTS → Agent`
- Template auto-generates a country briefing with analysis, translated phrases, pronunciation audio, and a 3-step action plan
- No file uploads, voice recording, or API keys required — just set variables and click Run All

### Variable Resolution Fix
- **`templates.js`**: `loadTemplate()` now auto-populates `M._vars.setManual()` with template variable values on load
- **`templates.js`**: `applyTemplateVariables()` syncs parsed variables into `M._vars` when ⚡ Vars is clicked
- **`exec-sandbox.js`**: `ctxResolveReferences()` falls back to `M._vars.get()` when SQLite context returns null — fixes `$(country)` unresolved during Run All

### Display Fix: Metadata Stripping
- **`ai-docgen.js`**: STT card renderer now strips `@var:` and `@input:` from display text
- **`ai-docgen.js`**: TTS and Translate card renderers now strip `@input:` from display text

## Files Modified
- `js/templates/ai.js` — New template (+116 lines)
- `js/templates.js` — Auto-populate M._vars on template load (+13 lines)
- `js/exec-sandbox.js` — Fallback variable resolution (+7 lines)
- `js/ai-docgen.js` — Metadata display stripping (+4 lines)
