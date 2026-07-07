# Editor Links Can Reclaim Corrupted Share Docs

- The owner's `#s=<id>&ek=<editkey>` editor link now recovers a compact share doc that lost its `k` (encryption key) field, instead of dying on "Decryption Failed"
- If the browser still holds the original session key, the cloud content is recovered intact; otherwise the document is restored from the local autosave copy and re-keyed
- The reclaimed session force-publishes on the next auto-save tick, rewriting `d` + `k` so the share link works again
- Readers without a valid edit key keep the existing error UI

---

## Summary

A previously-fixed auto-save bug could strip the `k` field from compact share docs (see CHANGELOG-cloud-save-key-wipe-fix.md). The self-heal shipped there only worked while the owner's browser still held the editing session in localStorage. This change adds the missing recovery path: the compact-share loader verified the edit key only *after* throwing on a missing `k`, so even the owner's editor link showed the corruption error.

## Fix
**Files:** `js/cloud-share.js`
**What:** In `M.loadSharedMarkdown`'s compact branch, when `data.k` is missing the edit key is now verified FIRST (hash against `data.ekHash`). On success the write token is recovered from `data.eWt` and the cloud session is rebound (`CLOUD_DOC_KEY`/`CLOUD_WT_KEY`/`EDIT_KEY_KEY`). Content recovery is two-tier: try decrypting the cloud `d` with the session key still in localStorage (works when the corrupting browser reclaims); otherwise fall back to the local autosave copy and generate a fresh `CLOUD_KEY_KEY`. The editor opens in edit mode with `lastCloudContent` cleared so the next auto-save republishes `d`+`k`. A toast explains what was recovered (cloud copy, local copy, or nothing — "start typing to re-publish").
**Impact:** Owners can repair a corrupted share link from any browser that has their editor link, not just the one that still holds the localStorage session.
