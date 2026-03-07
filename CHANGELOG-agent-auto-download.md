# CHANGELOG — Agent Flow Auto-Download

## Bug Fix / Enhancement

### Agent Flow: Auto-Download with Inline Progress Bar
- **Problem**: When running an Agent Flow with a local model (e.g., Qwen 3.5) that hadn't been downloaded yet, the flow would fail with ❌ on the first step, requiring the user to manually open the AI panel, download the model, and re-run.
- **Fix**: `generateAgentFlow()` now detects "AI model not ready" errors and:
  1. Shows an **inline download progress bar** directly on the Agent pipeline card (no separate modal, AI panel doesn't need to be open)
  2. Triggers `initLocalAiWorker()` to begin the model download
  3. Polls `isCurrentModelReady()` every 2 seconds (up to 5 minutes)
  4. Animated progress bar fills asymptotically toward 95%, then snaps to 100% when ready
  5. **Automatically retries the step** once the model is loaded — the flow does not fail
  6. If the download times out after 5 minutes, shows a clear error message
- For cloud models without an API key, shows the API key modal with a prompt to re-run

## Files Modified
- `js/ai-docgen.js` — `generateAgentFlow()` catch block replaced with auto-download + poll + retry logic
- `css/ai-docgen.css` — New `.ai-agent-download-bar` styles (progress bar, hint text, light/dark theme)

## Also Included (from previous pending changes)
- WriteAgent product rename across desktop-app configs, changelogs, worker files
- `js/ai-assistant.js` — AI panel integration updates
- `js/templates/coding.js` — Coding templates restructured
- Firestore rules sync
- Package.json updates
