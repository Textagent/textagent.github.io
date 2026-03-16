# STT Card Mode — Show Recording Text Inside the Block

## Summary

When recording via the `{{@STT:}}` card, transcribed text now appears **inside the card's result area** instead of being auto-inserted at the editor cursor. Users can review the transcription before clicking Insert to place it in the document.

## Changes

### js/speechToText.js
- Added **card mode** API: `startForCard(onText, onInterim)` and `stopForCard()`
- When card mode is active, transcription routes to callbacks instead of `insertAtCursor()`
- Captured card mode state at the start of `processAndInsert()` to prevent async race conditions during AI refinement
- **Disabled AI refinement in card mode** to prevent LLM hallucination (e.g., "I'm sorry, I can't assist") — uses basic punctuation only
- Skipped toolbar UI (status bar, cheat sheet, interim text element) in card mode
- Skipped pause-detection auto-paragraph insertion in card mode
- **Improved hallucination filter**: added 20+ AI model patterns (e.g., "I'm an AI", "could you repeat that", "I'm sorry, could you")
- **Improved consensus engine**:
  - Added timestamp-based staleness detection (>1.5s apart = different speech segments, take fresher result)
  - Increased WSA tiebreaker range from ±2 to ±5 points (WSA has native real-time streaming)
- `stopForCard()` now clears pending consensus results and timer to prevent late Worker results
- Added 3-second grace period after Stop to discard late Voxtral results (prevents editor leak)

### js/ai-docgen.js
- Updated STT card Record button to use `startForCard()` with `onText` and `onInterim` callbacks
- `onText` callback accumulates transcription chunks with substring-based deduplication
- `onInterim` callback shows live interim text (dimmed italic) without mic emoji
- Updated Stop button to use `stopForCard()` with proper cleanup (strips interim spans)
- `startForCard()` force-stops any active session before starting (fixes re-recording after Clear)

### css/tts.css
- Added `.stt-interim` styles: dimmed, italic text for live interim transcription
- Dark mode support for `.stt-interim`

## Files Modified
- `js/speechToText.js` — 129 insertions, 10 deletions
- `js/ai-docgen.js` — 79 insertions, 26 deletions (in STT event handlers)
- `css/tts.css` — 12 insertions
