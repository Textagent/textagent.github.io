# Persistent Storage for Cached AI Models

## Summary

Added `navigator.storage.persist()` request when downloading local AI models, preventing the browser from silently evicting cached model files under storage pressure.

## Changes

### Modified: `js/ai-assistant.js`
- Made consent download handler `async`
- Added `navigator.storage.persist()` call before `initAiWorker()`
- Wrapped in try/catch — non-critical, download proceeds regardless
- Logs result to console (`💾 Persistent storage granted` / `⚠️ ... not granted`)

## Impact

- **Chrome**: Auto-grants persistent storage for frequently-visited sites and installed PWAs
- **Firefox**: May show a one-time user prompt
- **Safari**: Supports the API; behavior varies
- Prevents browsers from garbage-collecting cached models (80 MB – 2.7 GB) when disk space is low

| File | Changes |
|------|---------|
| `js/ai-assistant.js` | +11 −1 |
