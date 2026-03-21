# Changelog: Compact Share Links

## Summary
Share links reduced from ~111 characters to ~36 characters by replacing the old `#id=...&k=...` URL format with a compact `#s=<shortId>` format that stores the encryption key server-side in Firestore.

## Changes

### `firestore.rules`
- Added `k` (encryption key) to allowed fields in both `create` and `update` rules for the `shares` collection

### `js/cloud-share.js`
- Added `generateShortId()` — creates 8-char alphanumeric IDs from epoch_base36 + random chars
- Added `createCompactShare()` — reusable function: encrypt → generate short ID → store key+data in Firestore with collision retry
- Updated `doQuickShare()` to use `createCompactShare()` producing `#s=<id>` URLs
- Added `#s=` compact share branch to `loadSharedMarkdown()` (fetches key from Firestore)
- Updated `cloudAutoSave()` to use compact format and include `k` field
- Updated hash detection at 3 locations (lines 142, 196, 1041) to recognize `s=`
- Updated share result modal description for non-secure shares

### `js/llm-memory.js`
- LLM Memory export now uses `M.createCompactShare()` for compact links instead of manually creating Firestore documents

## Backward Compatibility
- Old `#id=...&k=...` links continue to work (legacy branch preserved in `loadSharedMarkdown`)
- Secure (passphrase) shares remain completely unaffected — separate code path

## Security Note
Quick shares now store the encryption key in Firestore. Passphrase-protected secure shares remain fully zero-knowledge.
