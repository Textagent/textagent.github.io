# Spaces — Correct Links for Passphrase-Protected Documents

- Space hub cards now link passphrase-protected docs as `#id=<id>&secure=1` (passphrase prompt) instead of `#s=<id>` (which failed with "Decryption Failed — Missing encryption key")
- Secure docs get a lock icon on their hub card
- Legacy safety net: any `#s=` link that lands on a passphrase-protected doc now routes to the passphrase prompt instead of erroring — existing space items keep working without migration
- "Add by link" in the space editor now accepts `#id=…&secure=1` links (previously only `#s=` links and bare IDs)

---

## Summary

Passphrase-protected (secure) shares store no encryption key in Firestore — they must be opened via `#id=<id>&secure=1` so the reader is prompted for the passphrase. The Spaces hub linked every item as `#s=<id>`, sending readers of secure docs into the compact-share loader, which threw "Missing encryption key — document may have been corrupted."

## 1. Secure Flag on Space Items
**Files:** `js/space-manager.js`
**What:** `addItemToSpace` fetches the share doc (world-readable) and stores `secure: true` on the space item when the target is passphrase-protected. Covers all add paths: "Add Current Doc", "Add by link", and the share modal's space picker.
**Impact:** The hub and the space editor render the correct URL format per item.

## 2. Secure-Aware Rendering
**Files:** `js/space-manager.js`
**What:** `renderSpaceHub` and `renderEditorItems` emit `#id=<id>&secure=1` for flagged items (with a `bi-file-earmark-lock` icon on hub cards); compact items keep `#s=` links.

## 3. Reader-Side Fallback for Legacy Links
**Files:** `js/cloud-share.js`
**What:** The compact-share branch of `M.loadSharedMarkdown` detects `secure`+`salt` docs and hands off to the passphrase flow (`pendingSecureDoc` + prompt) instead of throwing. Edit-key context is carried over, so `#s=<id>&ek=…` editor links to secure docs also land in the right flow.
**Impact:** Space items added before this change (no `secure` flag) work without any data migration.

## 4. Add-by-Link Accepts Secure URLs
**Files:** `js/space-manager.js`
**What:** The link parser accepts `#id=<id>` URLs in addition to `#s=` and bare IDs.
