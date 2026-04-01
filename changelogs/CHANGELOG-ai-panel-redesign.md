# AI Panel UI Redesign — Centered Chat, Unified Attach Button & Compact Header

- Welcome message + input box + model selector now centered together (Claude-like initial state)
- Input transitions to bottom-pinned layout once a conversation begins
- Quick actions hidden in initial welcome state for a cleaner first impression
- Merged separate "Attach File" (paperclip) and "Screenshot" (camera) buttons into a single "+" button
- Unified dropdown menu with 4 options: Attach File, Capture Page, Capture Screen, Upload Image
- "+" icon rotates 45° to "×" when menu is open
- Merged AI panel header and status bar into a single compact header
- Status text (e.g. "● Qwen 3.5 4B · Local (WEBGPU)") now shown inline below the title within the header
- Download progress bar still uses standalone bar during active downloads
- Fixed: Download progress bar stuck at 96% after model loaded (was never removed in new inline status flow)
- Fixed: Reverted accidental duplicate CSS rules in styles.css from browser subagent
- Fixed: API key error link now targets inline header status instead of removed standalone bar

---

## Summary
Comprehensive UI redesign of the AI Assistant panel to create a more modern, Claude-like experience. Three major changes: centered initial state, unified attachment button, and compact merged header — reducing visual clutter and reclaiming vertical space.

---

## 1. Centered Initial State (Claude-like Welcome)
**Files:** `css/ai-panel.css`
**What:** Added CSS rules using `.ai-panel:has(.ai-welcome-message)` to split flex space equally between `.ai-chat-area` (flex: 1 1 0, justify-content: flex-end) and `.ai-input-area` (flex: 1 1 0, justify-content: flex-start). Both push their content toward each other, creating a centered cluster. Quick actions are hidden via `display: none`. Model selector is shown below the input with `order: 1`. Added smooth `transition` on input area properties. Mobile overrides added for safe-area insets and full-width input.
**Impact:** Users see a clean, modern welcome screen with the greeting, input box, and model selector centered together — similar to Claude and ChatGPT's initial states. Once a message is sent, the layout transitions smoothly to the traditional bottom-pinned chat layout.

## 2. Unified Attach + Screenshot Button
**Files:** `js/modal-templates.js`, `js/ai-chat.js`, `js/ai-screenshot.js`, `css/ai-panel.css`
**What:** Replaced two separate buttons (paperclip for files, camera for screenshots) with a single `+` button (`bi-plus-lg`) wrapped in `.ai-attach-wrapper`. The button toggles a unified `#ai-attach-menu` dropdown containing all four options: Attach File, Capture Page, Capture Screen, Upload Image. Updated `ai-chat.js` to toggle the menu on click and handle the "Attach File" item. Updated `ai-screenshot.js` to reference `#ai-attach-menu` instead of old `#ai-screenshot-menu`, and simplified the self-heal injection. Removed the old `-45deg` paperclip rotation from CSS and added a `45deg` rotation when menu is active.
**Impact:** Cleaner input bar with one button instead of two. All attachment/capture options accessible from a single, intuitive menu. The "+" → "×" rotation provides clear visual feedback.

## 3. Merged Header + Status Bar
**Files:** `js/modal-templates.js`, `js/ai-assistant.js`, `css/ai-panel.css`
**What:** Added `.ai-panel-title-group` and `.ai-panel-title-row` containers inside the header to create a two-line layout. Added `#ai-header-status` div for inline status text. Modified `addAiStatusBar()` in `ai-assistant.js` to inject text into this inline container instead of creating a standalone `<div>`. The standalone `.ai-status-bar` is now `display: none` by default, with `.downloading` overriding to `display: flex` for active download progress. When status transitions to `ready` or `error`, all standalone bars are removed.
**Impact:** The header and status bar are merged into a single compact bar, saving ~30px of vertical space. Model status is visible at a glance without a separate row.

## 4. Bug Fix: Download Progress Bar Stuck
**Files:** `js/ai-assistant.js`
**What:** The original fix only removed `.ai-status-bar:not(.downloading)`, so the download progress bar (which has `.downloading` class) was never cleaned up when the model finished loading. Updated to remove all standalone bars when status becomes `ready` or `error`, while preserving them during `loading` updates.
**Impact:** Download progress bar now properly disappears when model loading completes.

---

## Files Changed (5 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `css/ai-panel.css` | +136 −3 | Centered state, unified button, merged header CSS |
| `js/ai-assistant.js` | +16 −14 | Inline status bar, download bar cleanup fix |
| `js/ai-chat.js` | +29 −5 | Unified attach menu toggle + file picker handler |
| `js/ai-screenshot.js` | +24 −42 | Updated for merged menu, simplified self-heal |
| `js/modal-templates.js` | +18 −13 | Unified attach button HTML, header restructure |
