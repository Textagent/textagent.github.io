# DocGen Reject Fix — Restore Full Typed Card on Reject

- Fixed: Rejecting a generated Translate block restored a generic "AI Generate" card instead of the proper Translate card with language dropdown
- Fixed: Rejecting a generated OCR block lost mode pills, camera button, and upload button
- Fixed: Rejecting any specialized block (Translate, OCR, TTS, STT, etc.) always showed a generic "AI Generate" card missing all type-specific UI
- Fixed: Review panel header showed wrong icon and label ("✨ AI Generate") for Translate, OCR, TTS, STT, and Image blocks — now correctly shows "🌐 Translate — Review", "🔍 OCR Scan — Review", etc.
- Reject handler now uses `M.transformDocgenMarkdown(block.fullMatch)` to re-render the exact original block into its full typed card
- `data-ai-index` attribute patched on the restored card and all child elements so button actions remain correctly bound after reject
- Fallback minimal card included in case `transformDocgenMarkdown` produces no output (defensive)

---

## Summary

When users clicked **Reject** on a generated AI block, the review handler rebuilt a hardcoded generic "AI Generate" card for all block types. For `{{@Translate:}}` blocks this dropped the language selection dropdown; for `{{@OCR:}}` blocks it dropped the mode pills, camera, and upload buttons; for other types similar UI was lost. This fix re-renders the original DocGen tag markdown through the existing `transformDocgenMarkdown` renderer, producing a bit-perfect typed card restoration regardless of block type.

---

## 1. Reject Handler — Full Card Restoration
**Files:** `js/ai-docgen-generate.js`
**What:** Replaced the hardcoded "AI Generate" card HTML in the `handleDecision('reject')` branch of `showReviewPanel()` with a call to `M.transformDocgenMarkdown(block.fullMatch)`, which produces the same full card HTML as the initial render. The resulting DOM node is patched to restore the correct `data-ai-index` (since `transformDocgenMarkdown` always counts from index 0), then swapped into the preview pane. `M.bindDocgenPreviewActions()` is called after the swap to re-bind all button handlers.
**Impact:** Translate blocks restore with language dropdown + model selector. OCR blocks restore with mode pills + camera + upload. Agent blocks restore with step inputs + search pills + cloud toggle. All other typed block UIs (TTS, STT, Image, Memory) are likewise correct after reject.

## 2. Review Panel Header Label Fix
**Files:** `js/ai-docgen-generate.js`
**What:** The review panel header `icon` and `typeLabel` variables were previously only checking for `block.type === 'Think'` and defaulting to `✨ / AI Generate` for everything else. Extended the ternary chain to cover all DocGen types: Translate → `🌐`, OCR → `🔍`, TTS → `🔊`, STT → `🎤`, Image → `🖼️`, AI/Think → `✨/🧠`.
**Impact:** The review panel header now correctly shows e.g. "🌐 Translate — Review" or "🔍 OCR Scan — Review" instead of always "✨ AI Generate — Review".

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-docgen-generate.js` | +29 −28 | Bug fix — reject handler + review header label |
