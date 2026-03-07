# AI Block Independence & Generation Improvements

- Made all AI block operations fully independent — generate, accept, reject, regenerate on each block without affecting others
- Replaced global `isDocgenRunning` boolean with per-block `activeBlockOps` Set for concurrent generation
- Changed `replaceBlockInEditor` to `replaceBlockByTag` — uses exact tag text matching instead of fragile index-based replacement
- On reject: rebuilds only the specific placeholder card inline instead of calling `M.renderMarkdown()` which wiped other review panels
- On accept: renders accepted content inline via `marked.parse()` and cancels debounced re-render if other reviews are active
- On regenerate: replaces review card with "Regenerating..." placeholder inline instead of full preview re-render
- Added visual loading state (pulsing teal glow + "Generating..." label) on placeholder cards during generation
- Added CSS `ai-card-loading` animation with `@keyframes ai-card-pulse` for the loading indicator
- Improved Think prompt to suppress raw reasoning chains — model outputs only polished content
- Added `cleanGeneratedOutput()` to strip `<thinking>` tags, "Thinking Process:" headers, and repetitive reasoning loops
- Added inline local model download prompt with "Download" / "Cancel" buttons instead of redirecting to AI panel
- Exposed `M.initLocalAiWorker` from `ai-assistant.js` for direct download triggering from docgen
- Fixed: shared documents now open in split view instead of preview-only mode (all 6 `setViewMode('preview')` calls in `cloud-share.js` changed to `split`)
- Fixed: Fill All skip logic rewritten with simple `skipCount` counter — rejected blocks are skipped, accepted blocks shift indices correctly

---

## Summary
Comprehensive refactor of the AI document generation system to make all block operations fully independent. Previously, generating or reviewing one block would interfere with others through global state, full preview re-renders, and index-based replacement. Now each block operates in isolation with per-block state tracking, text-based replacement, and inline DOM updates.

---

## 1. Independent Block Operations
**Files:** `js/ai-docgen.js`
**What:** Replaced the global `isDocgenRunning` boolean with `activeBlockOps` (a `Set`) that tracks which block indices are currently generating. Each block can now generate, be reviewed, accepted, rejected, or regenerated independently.
**Impact:** Users can click ▶ on multiple blocks simultaneously, review them in parallel, and make decisions on each without affecting others.

## 2. Text-Based Block Replacement
**Files:** `js/ai-docgen.js`
**What:** Renamed `replaceBlockInEditor(blockIndex, replacement)` to `replaceBlockByTag(fullMatchText, replacement)`. Instead of parsing blocks by index (which shifts when other blocks are accepted), it finds the exact `{{AI: ...}}` tag text in the editor and replaces it.
**Impact:** Accepting block 0 no longer breaks block 1's replacement — the tag text is a stable identifier.

## 3. Inline DOM Updates (No Full Re-render)
**Files:** `js/ai-docgen.js`
**What:** Accept, reject, and regenerate all update only their specific DOM element instead of calling `M.renderMarkdown()`. Accept renders content via `marked.parse()`. Reject rebuilds the placeholder card. Regenerate shows a "Regenerating..." card with loading animation.
**Impact:** Other concurrent review panels are preserved. No more lost review panels when accepting or rejecting a block.

## 4. Generation Loading State
**Files:** `js/ai-docgen.js`, `css/ai-docgen.css`
**What:** Added `ai-card-loading` CSS class with pulsing teal glow animation. When ▶ is clicked, the card pulses and shows "Generating..." until complete.
**Impact:** Clear visual feedback that generation is in progress on a specific block.

## 5. Think Mode Output Cleanup
**Files:** `js/ai-docgen.js`
**What:** Improved the Think prompt to explicitly suppress reasoning chains. Added `cleanGeneratedOutput()` that strips `<thinking>` tags, "Thinking Process:" sections, and repetitive "Wait, looking at the instruction" loops.
**Impact:** Think mode now outputs clean markdown content without dumping raw reasoning chains.

## 6. Inline Local Model Download
**Files:** `js/ai-docgen.js`, `js/ai-assistant.js`
**What:** When a local model (e.g., Qwen) isn't loaded, shows an inline dialog with "Download (~500 MB)" and "Cancel" buttons instead of a toast saying "click the AI button". Exposed `M.initLocalAiWorker` for direct download triggering.
**Impact:** Users can download the model directly from the generation flow without navigating to the AI panel.

## 7. Split View Default for Shared Documents
**Files:** `js/cloud-share.js`
**What:** Changed all 6 instances of `M.setViewMode('preview')` to `M.setViewMode('split')`.
**Impact:** Shared documents now open in split view (editor + preview) instead of preview-only mode.

## 8. Fill All Skip Logic Fix
**Files:** `js/ai-docgen.js`
**What:** Rewrote Fill All with a simple `skipCount` counter. Rejected blocks increment the counter; accepted blocks are removed from text so remaining blocks naturally shift down.
**Impact:** Rejecting one block during Fill All correctly skips to the next block instead of re-prompting or stopping.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/ai-docgen.js` | +180 −60 | Independent block ops, loading state, think cleanup, inline download |
| `css/ai-docgen.css` | +27 −0 | Loading animation keyframes and styles |
| `js/ai-assistant.js` | +1 −0 | Exposed `initAiWorker` as `M.initLocalAiWorker` |
| `js/cloud-share.js` | +6 −6 | Split view default for shared documents |
