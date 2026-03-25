# Fix AI Text Repetition (Qwen 0.8B)

## Overview
Fixed repetitive/looping text generation when using `{{@AI:}}` tags with the Qwen 3.5 0.8B model. Stories and other generated content would enter infinite repetition loops due to missing anti-repetition parameters.

## Root Cause
The main `ai-worker.js` lacked `repetition_penalty` and `no_repeat_ngram_size` in its generation config, while all other workers (Florence, Docling, GLM-OCR) already used `repetition_penalty: 1.2–1.5`. Small models like Qwen 0.8B are especially prone to degenerate repetition without these parameters.

## Changes
- **`public/ai-worker.js`** — Added anti-repetition parameters to both generation paths (multimodal + text-only):
  - Non-thinking mode: `repetition_penalty: 1.3`, `no_repeat_ngram_size: 5`
  - Thinking mode: `repetition_penalty: 1.2`, `no_repeat_ngram_size: 4` (lower to avoid disrupting reasoning chains)

## Files Modified
- `public/ai-worker.js` — Generation config for both multimodal and text-only paths
