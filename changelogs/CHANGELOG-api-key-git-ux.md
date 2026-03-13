# CHANGELOG — API Key Re-entry & Git UX

## 🔑 API Key Re-entry Fix

**Problem:** After entering an incorrect API key for a cloud model, users had no way to re-enter it — clicking the same model in the dropdown silently returned.

**Changes:**
- **ai-assistant.js**: Dropdown re-click now re-shows the API key modal if the current cloud model has no valid key or isn't loaded. Error status bar includes a clickable "Change API Key" link for auth/validation failures.
- **ai-docgen-generate.js**: Added 🔑 key icon button on cloud model cards in the DocGen "Select AI Model" slide panel with "Key Set" / "Key Required" status badges. Clicking the key icon opens the API key modal directly.
- **css/ai-docgen.css**: Styled `.ai-setup-key-btn` with blue accent, round shape, hover glow, and scale effect.

## 🐙 Git Analysis UX Improvements

- **git-docgen.js**: Centered confirmation dialog when clicking the 🐙 Git toolbar button — warns that Git analysis needs a large context window and local models may not work well for bigger repos; user must click "Continue" to insert the tag. Auto-opens API key modal when Git analysis fails with API key or "model not ready" errors.

## Files Modified
- `js/ai-assistant.js` — dropdown re-click fix, error bar "Change API Key" link
- `js/ai-docgen-generate.js` — cloud model key button + badges in setup panel
- `css/ai-docgen.css` — key button styling
- `js/git-docgen.js` — confirmation dialog on Git button, auto-open key modal on failure
