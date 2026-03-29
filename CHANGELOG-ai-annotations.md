# AI Annotations & Ask AI — Study Copy Workflow

- New `ai-tags.js` module (1129 lines) — full AI annotation system: highlight, note, question, bookmark, and define tags via right-click context menu on selected text
- New `ai-tags.css` (540 lines) — annotation pills, thread panel, sliding popover, color-coded tag types, dark mode
- Annotation pills render inline in preview with color-coded icons (⭐ highlight, 📝 note, ❓ question, 🔖 bookmark, 📖 define)
- Thread panel (sliding popover) for Ask AI deep-dives: multi-turn QA with document context, web search, and model selector
- Study Copy workflow: shared doc viewers can create a local annotatable copy via "Create Study Copy" button
- `requestAiTask` timeout fix: tiered safety timeout — 180s initial for local models (Qwen 4B), 60s for cloud; inter-token timeout stays at 60s
- Fixed: global worker listener cross-talk — `requestAiTask` messages now tracked in `_taskMessageIds` Set; global handlers in `initAiWorker` and `initCloudWorker` skip messages belonging to active `requestAiTask` calls
- Fixed: tag insertion breaking markdown syntax — new `findBlockEnd()` function finds structural block boundaries (paragraphs, lists, tables, headings) and inserts tags after the block ends, never splitting a block
- Smart newline padding on tag insertion — exactly one blank line before/after the tag comment, adaptive to existing whitespace
- Context menu actions: Highlight, Sticky Note, Ask AI, Bookmark, Define (with AI-generated definitions)
- `transformAiTagMarkdown` pre-parse transform replaces `<!-- @ai-tag: ... -->` comments with clickable pill `<span>` elements before marked.parse()
- `bindAiTagPreviewActions` post-render binding for pill clicks (open thread panel) and popover interactions
- DOMPurify allowlist expanded with `data-tag-id`, `data-tag-type`, `data-tag-color`, `data-tag-count`, `data-tag-anchor`, `data-tag-label`, `data-tag-data`
- `renderer.js` updated with AI tag transform chain position and DOMPurify attribute additions
- `ai-actions.js` extended with 5 new annotation context menu items
- `modal-templates.js` updated with Study Copy modal HTML
- `cloud-share.js` updated with Study Copy creation flow (local fork of shared doc)
- `src/main.js` updated to load `ai-tags.js` and `ai-tags.css` in Phase 3

---

## Summary

Adds a complete AI annotation system for highlighting, noting, questioning, bookmarking, and defining passages in documents. Includes a sliding thread panel for multi-turn AI Q&A on selected text. Fixes two critical bugs: (1) `requestAiTask` timing out for local models due to a 60s hard timeout on first token, and (2) AI tag insertion breaking markdown syntax by splitting structural blocks.

---

## 1. AI Annotation System
**Files:** `js/ai-tags.js`, `css/ai-tags.css`
**What:** New module implementing 5 annotation types (highlight, note, question, bookmark, define) stored as HTML comments in the markdown source. Tags are serialized as `<!-- @ai-tag: id="..." type="..." ... -->` and transformed into clickable pills in the preview via `transformAiTagMarkdown`. A sliding thread panel allows multi-turn AI Q&A conversations anchored to specific passages.
**Impact:** Users can annotate any document with AI-powered insights, creating a rich study/review workflow. The thread panel supports web search, model selection, and full conversation history.

## 2. Study Copy Workflow
**Files:** `js/cloud-share.js`, `js/modal-templates.js`
**What:** When viewing a shared (read-only) document, users can create a local "Study Copy" — a full fork stored in localStorage that supports all annotation features. The workflow is gated behind a confirmation modal explaining the copy process.
**Impact:** Enables annotation on shared documents without modifying the original, supporting a teacher→student or author→reviewer workflow.

## 3. requestAiTask Timeout Fix
**Files:** `js/ai-assistant.js`
**What:** The `requestAiTask` function had a 60-second hard timeout for the first token. Local models like Qwen 4B can take >60s to produce their first token due to model prefill with large document contexts. Fixed with a tiered timeout: 180s initial for local models, 60s for cloud models, and 60s inter-token timeout once streaming begins. Also fixed cross-talk between the global worker listener and `requestAiTask`'s dedicated listener by tracking active task message IDs in a `_taskMessageIds` Set.
**Impact:** Ask AI (annotation thread) no longer times out when using local models. Global listener no longer double-handles `requestAiTask` responses, preventing phantom chat bubbles and generation lock issues.

## 4. Tag Insertion Fix
**Files:** `js/ai-tags.js`
**What:** The old insertion logic used naive paragraph boundary detection (`content.indexOf('\n\n', anchorIndex)`) which could split lists, tables, and multi-line paragraphs. Rewrote with new `findBlockEnd()` function that walks forward from the anchor line to find the end of the structural block (contiguous non-blank lines), then inserts the tag comment at the block boundary with smart newline padding.
**Impact:** AI annotation tags no longer break markdown syntax — lists, tables, headings, and blockquotes remain intact after tag insertion.

## 5. Renderer & Context Menu Integration
**Files:** `js/renderer.js`, `js/ai-actions.js`, `src/main.js`
**What:** `renderer.js` extended with `transformAiTagMarkdown` call in the render pipeline and `bindAiTagPreviewActions` in post-render binding. DOMPurify allowlist expanded with 7 new `data-tag-*` attributes. `ai-actions.js` extended with 5 context menu items (Highlight, Sticky Note, Ask AI, Bookmark, Define). `main.js` updated to load `ai-tags.js` and `ai-tags.css` as Phase 3 lazy modules.
**Impact:** Full end-to-end integration: right-click → annotate → pill renders in preview → click pill → thread panel opens.

---

## Files Changed (8 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-tags.js` | +1129 | New: AI annotation module |
| `css/ai-tags.css` | +540 | New: annotation styling |
| `js/ai-assistant.js` | +34 | Fix: tiered timeout + message isolation |
| `js/ai-actions.js` | +114 −30 | Add: 5 context menu actions |
| `js/cloud-share.js` | +58 −5 | Add: Study Copy flow |
| `js/modal-templates.js` | +43 −5 | Add: Study Copy modal |
| `js/renderer.js` | +14 −4 | Add: AI tag pipeline |
| `src/main.js` | +4 | Add: module loading |
