# Cloud Auto-Save — Stop Wiping the Encryption Key of Compact Shares

- Fixed: cloud auto-save deleted the `k` (AES key) field from compact share docs whenever it ran while the URL hash lacked `s=` — breaking every `#s=` / `#space=…&s=…` link to that doc with "Decryption Failed / Missing encryption key"
- Fixed: the decision to store the key in the doc is now based on the doc's own schema (`secure` flag) instead of the current URL hash
- Self-heal: docs that already lost `k` to this bug get it re-added on the owner's next cloud save, restoring broken share links
- Guard: passphrase-protected (`secure`) docs can never receive a `k` field, even if a save fires from a `#s=` hash
- Fixed: editing a passphrase-protected doc via its editor link corrupted it — auto-save encrypted content with an unrelated session key, so the passphrase could never decrypt it again; the unlock flow now stores the passphrase-derived key for saves to use
- Fixed: after saving a passphrase-protected doc, the URL was rewritten to a `#s=` link that can't decrypt it; it now keeps the `#id=…&secure=1&ek=…` format so reloads stay functional
- Hardened: if the pre-save schema read fails, the save is skipped and retried on the next tick instead of blindly full-replacing the doc

---

## Summary

`cloudAutoSave()` updates an existing share with a full-replace `.set()`. It only included `k` when `window.location.hash` contained `s=`, and its preserve-fields block copied `ekHash`/`eWt`/`rkHash`/`view`/`salt`/`secure` — but not `k`. A stale editing session (localStorage keeps `CLOUD_DOC_KEY`/`CLOUD_KEY_KEY`/`CLOUD_WT_TOKEN` after an `&ek=` editor-link visit) plus one edit made from a hash without `s=` (e.g. reopening the app plain) therefore rewrote the doc without its encryption key. Readers then hit `if (!data.k) throw` in the compact-share loader.

## Fix
**Files:** `js/cloud-share.js`
**What:** When the existing doc is readable, `updateData.k` is now set from the doc's schema: passphrase docs (`secure: true`) never store a key; all other docs always get the session key written back (`d` was just encrypted with it, so they must match). The URL-hash heuristic remains only as a fallback when the pre-save read fails. Because the corrupting save re-encrypted `d` with the original key, this also self-heals docs that already lost `k`: the owner's next save from the same browser writes the key back and the share link works again.
**Impact:** Editing a shared doc can no longer sever its share links; previously broken links (e.g. `#space=…&s=…` docs showing "Decryption Failed — Missing encryption key") repair themselves on the owner's next edit.
