# Manual Save Button + Faster Cloud Auto-Save

- Cloud auto-save now syncs every 10 seconds (was 60 seconds)
- New Save button in the desktop toolbar and mobile menu — flushes the local autosave debounce and forces an immediate cloud sync
- Fixed a race where keystrokes typed while a cloud save was in flight could be dropped from sync until the next edit

---

## Summary

Edits now reach Firestore within ~10 seconds instead of up to a minute, and users can force a save instantly with a dedicated button instead of waiting for the timer.

## 1. Faster Auto-Save
**Files:** `js/cloud-share.js`
**What:** `CLOUD_SAVE_INTERVAL` lowered from 60000 to 10000. The interval is a no-op unless the editor is dirty, so idle cost is unchanged.
**Impact:** Shared docs stay much closer to the editor state; the window in which a closed tab loses unsynced edits shrinks 6×.

## 2. Manual Save Button
**Files:** `index.html`, `js/cloud-share.js`
**What:** `#save-now-btn` (desktop toolbar) and `#mobile-save-btn` (mobile menu) call the new `M.saveNow()` — it flushes the pending local autosave and awaits `cloudAutoSave()` directly. No-ops in read-only/shared view (and the read-only click interceptor now covers both buttons with the explanatory toast).
**Impact:** Users get an explicit "save now" affordance; no more waiting for the next tick before closing the tab.

## 3. In-Flight Save Race Fix
**Files:** `js/cloud-share.js`
**What:** `cloudAutoSave` now only clears the dirty flag when the editor content still matches what it just uploaded; if the user typed during the upload, the flag stays set and the next tick syncs the newer content.
**Impact:** Prevents silently unsynced trailing edits.
