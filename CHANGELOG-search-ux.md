# Search UX — Two-Phase Rewriting → Searching Indicator

- Added two-phase search UX: shows "✨ Rewriting query…" phase before "🌐 Searching the web…" when model is ready
- `createSearchThinkingBlock()` now accepts `isRewriting` flag for distinct icon (`bi-stars`) and status text during rewrite phase
- `updateThinkingBlockQuery()` transitions inner status text from "Rewriting…" to "Searching the web…" after query rewrite completes
- Fixed: null-safe guard added around `summary` and `statusDiv` element lookups in `updateThinkingBlockQuery()`
- `sendMessage()` detects whether the model is ready and not busy to decide initial thinking block phase

---

## Summary
Improves the AI chat search UX with a two-phase thinking indicator. When web search is enabled and the model is ready, the thinking block first shows "✨ Rewriting query…" with a stars icon, then transitions to "🌐 Searching…" once the refined query is computed. This gives users clear feedback about what the AI is doing at each stage.

---

## 1. Two-Phase Search Thinking Block
**Files:** `js/ai-chat.js`
**What:** `createSearchThinkingBlock(query, isRewriting)` now accepts an `isRewriting` boolean. When true, renders a `bi-stars` icon with "Rewriting query…" status text; when false, renders the existing `bi-globe-americas` icon with "Searching the web…" text.
**Impact:** Users see a distinct visual phase when the AI is rewriting their query before searching, making the search pipeline more transparent.

## 2. Smooth Phase Transition
**Files:** `js/ai-chat.js`
**What:** `updateThinkingBlockQuery(rewrittenQuery)` now also updates the inner `.ai-thinking-searching` status div text from "Rewriting…" to "Searching the web…", in addition to updating the summary header. Added null-safety guards on both DOM lookups.
**Impact:** The thinking block smoothly transitions from the rewrite phase to the search phase without stale status text.

## 3. Smart Phase Detection
**Files:** `js/ai-chat.js`
**What:** In `sendMessage()`, a `willRewrite` flag is computed from `M.isCurrentModelReady()` and `!M.isAiGenerating()` to decide whether the initial thinking block should show the rewriting phase.
**Impact:** When the model is unavailable or busy, the block skips directly to the "Searching…" phase, avoiding a misleading "Rewriting…" indicator.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-chat.js` | +28 −11 | Two-phase search UX with rewrite indicator |
