# Reading Companion — Non-Modal, Draggable, Multi-Thread Annotation Q&A

- The annotation "Ask AI" thread panel is now **non-modal** — no full-screen backdrop, so the document stays fully readable and scrollable while a conversation is open
- **Multiple threads open in parallel** — each annotation gets its own panel; opening a second no longer closes the first. New panels cascade (28px offset) and a click brings a panel to the front
- **Draggable** — float panels move by their header (new grip handle); a single shared drag controller avoids per-panel listener accumulation
- **Right-side Threads dock** — a panel can dock into a right rail that the document column reflows away from (mirrors the AI-panel reflow), so you can read in the main column and ask in the rail in parallel. Dock shows a live thread count; collapses when empty
- **Dock ↔ float** — any thread toggles between a floating window and a docked card via a header button
- Per-conversation state (streaming, web-search toggle, attachments, model) is now stored **per panel** instead of in module globals, so parallel threads don't clobber each other

---

## Summary

The annotation Q&A panel was a single, anchored modal: it blocked the text behind it, only one could be open at a time, and it couldn't be moved — fighting the reader's task during dense research. This reworks it into a "reading companion": non-modal floating panels you can drag, several at once, plus an optional right-side dock the document reflows around so reading and asking happen in parallel.

---

## 1. Per-Panel State (multi-thread foundation)
**Files:** `js/ai-tags.js`
**What:** Replaced the module-level singletons (`activeThreadPanel`, `threadPanelTagData`, `threadPanelStreaming`, `threadSearchEnabled`, `threadAttachments`) with state stored on each panel element (`panel._tagData`, `_streaming`, `_search`, `_attachments`, `_docked`) and an `openPanels` registry keyed by tag id. `sendThreadMessage(textarea, panel)` and the toolbar handlers now operate on the specific panel.
**Impact:** Many annotation conversations can stream concurrently without interfering. (Note: they share the globally-selected AI model — switching a panel's model switches the active model, since the local inference backend runs one model at a time.)

## 2. Non-Modal Floating Panels + Drag
**Files:** `js/ai-tags.js`, `css/ai-tags.css`
**What:** Removed the `createOverlay()` modal backdrop from the Q&A path (kept only for the legacy non-Q&A info popup). Added a header drag grip, cascade positioning, z-index bring-to-front, and a single shared `mousemove`/`mouseup` drag controller (bound once, not per panel) with an idempotent `makeDraggable` guard.
**Impact:** The document stays readable; panels can be repositioned out of the way; opening a second annotation keeps the first.

## 3. Right-Side Threads Dock
**Files:** `js/ai-tags.js`, `css/ai-tags.css`
**What:** A lazily-created `aside.ai-tag-thread-dock` holds docked panels as stacked cards. `body.ai-tag-dock-open .app-container { width: calc(100% - var(--ai-tag-dock-width)) }` reflows the document so the dock never overlaps text. Header dock-toggle moves a panel between floating and docked; the dock shows a live count and collapses/hides when empty. Full-width on mobile (no reflow).
**Impact:** Read in the main column, ask in the rail — true parallel reading and questioning.

---

## Testing

- Verified live in the browser preview: two annotations → two parallel panels (0 modal overlays); cascade + z-index bring-to-front; header drag moves a panel; dock toggles in/out and reflows the document; close cleans up and restores width.
- Vite build clean; smoke suite 22/22 pass.
- ESLint: no new errors on `ai-tags.js` (the pre-existing `no-useless-assignment` warnings are untouched code).
