# Changelog — Query Rewriting

**Date:** 2026-03-13

## Summary
AI search queries are now automatically rewritten for better web results before being sent to search providers.

## Changes

### `js/ai-chat.js`
- **Enhanced `refineSearchQuery()`** — now rewrites ALL queries (not just follow-ups):
  - **LLM rewriting** (when model is loaded and idle): rewrites conversational queries into concise search terms
  - **Heuristic fallback** (when model is busy/not loaded): strips filler words, preserves quoted phrases and technical terms
- **Added `heuristicQueryOptimize()`** — zero-LLM keyword extraction that strips conversational prefixes ("what is…", "can you tell me about…", "please explain…"), trailing filler, and collapses whitespace
- **Added `updateThinkingBlockQuery()`** — dynamically updates the thinking block's summary to show the rewritten query with a `(rewritten)` badge
- **Updated `fallbackQueryEnrichment()`** — now applies heuristic optimization before prepending topic keywords from conversation history

### `css/ai-panel.css`
- Added `.ai-search-rewritten` badge style (subtle italic label) for the thinking block

## Examples

| User types | Search query sent |
|---|---|
| "What is the best way to learn Python?" | `best way learn Python` |
| "Can you tell me about React hooks?" | `React hooks` |
| "Please explain how transformers work in NLP" | `transformers work NLP` |
| "React hooks" (already optimized) | `React hooks` (unchanged) |
