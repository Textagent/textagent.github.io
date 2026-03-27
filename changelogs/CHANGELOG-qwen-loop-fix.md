# Qwen Loop Fix — Official Params + Circuit Breaker

- Switched to Qwen 3.5 official generation parameters: `presence_penalty: 2.0` (non-thinking), `1.5` (thinking)
- Set `repetition_penalty: 1.0` per official model card (high values cause unnatural text)
- Kept `no_repeat_ngram_size: 6` as secondary safety net against exact phrase repetition
- Added degenerate output circuit breaker: monitors unique-word ratio in 200-char sliding window every 40 tokens
- Circuit breaker aborts generation when unique ratio drops below 30% (garbage loop detected)
- Added `trimToLastSentence()` cleanup — when circuit breaker fires, output trims to last coherent sentence boundary
- Fixed: Qwen models (0.8B, 2B, 4B) producing garbage/looping text on open-ended prompts

---

## Summary
Qwen local models were entering degenerate text generation loops, producing garbage output. Root cause: incorrect `repetition_penalty` settings (too high, against official recommendations) and no runtime degeneration detection. Fix applies Qwen 3.5 official model card parameters (`presence_penalty: 2.0`) and adds a circuit breaker that monitors output quality during streaming.

---

## 1. Official Qwen 3.5 Generation Parameters
**Files:** `public/ai-worker.js`, `dist/ai-worker.js`
**What:** Replaced `repetition_penalty: 1.3–1.5` with Qwen 3.5 official parameters: `presence_penalty: 2.0` (non-thinking) / `1.5` (thinking), `repetition_penalty: 1.0`. The `presence_penalty` penalizes tokens by *presence* (more effective against thematic loops) vs `repetition_penalty` which penalizes by *frequency* and causes unnatural phrasing when >1.5.
**Impact:** Eliminates the root cause of garbage text loops while maintaining natural output quality.

## 2. Degenerate Output Circuit Breaker
**Files:** `public/ai-worker.js`, `dist/ai-worker.js`
**What:** Added `isDegenerate()` function that monitors unique-word ratio in a 200-char sliding window every 40 tokens. If ratio drops below 30%, sets `_degenAborted` flag to stop token emission. Added `trimToLastSentence()` to gracefully truncate output at the last sentence boundary when circuit breaker fires.
**Impact:** Even if generation params fail to prevent loops, the circuit breaker catches garbage output in real-time and provides a clean truncated response instead of endless gibberish.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `public/ai-worker.js` | +77 −8 | Official params + circuit breaker |
| `dist/ai-worker.js` | +77 −8 | Synced copy |
