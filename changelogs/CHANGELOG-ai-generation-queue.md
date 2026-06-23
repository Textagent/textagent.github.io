# AI Generation Queue — Concurrent Requests Wait Instead of Failing

- Fixed: asking a question in a second annotation thread (or any second AI request) while one was still generating failed with "Another AI generation is already in progress."
- Added a serial generation **queue**: concurrent `requestAiTask` calls now run in submission order (FIFO) instead of being rejected. The backend still runs one generation at a time, but callers wait their turn automatically.
- Single authoritative hook — wraps `M.requestAiTask`, so every caller benefits (annotation thread panels, `{{@...}}` DocGen tags, Agent Flow, AI Chat) with no per-call-site changes.
- Annotation thread panels show a "⏳ Queued (#N)…" state while waiting, then switch to streaming when their turn starts.
- Exposed `M.aiQueueLength()` for UI hints.

---

## Summary

The local/cloud AI backend is single-flight (one generation at a time, gated by `aiIsGenerating`). With the new parallel annotation threads, a second concurrent question was rejected outright. This adds a queue wrapper around `requestAiTask` so concurrent requests serialize and all complete in order, and surfaces a "Queued" state in the thread panels.

---

## 1. Serial Queue Wrapper
**Files:** `js/ai-assistant.js`
**What:** A new wrapper around `M.requestAiTask` maintains a FIFO queue; `drain()` runs the next job only after the previous settles (resolve or reject). Optional `onQueued(position)` / `onQueueStart()` callbacks let callers reflect their wait. Layered after the connector-context wrapper so it covers all call sites.
**Impact:** Concurrent AI requests no longer fail — they run in sequence.

## 2. Thread Panel Queued State
**Files:** `js/ai-tags.js`
**What:** `sendThreadMessage` passes `onQueued`/`onQueueStart`; the AI bubble shows "⏳ Queued (#N)…" while waiting and clears to the streaming state when it begins.
**Impact:** A queued thread reads as "waiting", not stuck or errored.

---

## Testing
- Playwright (1280×800): 3 concurrent calls against a single-flight stub that rejects when busy → all 3 fulfilled, FIFO order preserved (was: 2 rejections). The shipped wrapper verified to never reject queued calls with "already in progress".
- Smoke suite green (one unrelated view-mode flake passes in isolation); build clean.
