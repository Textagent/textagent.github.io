# View-Locked Sharing & Shared Versions Tracking

- View-locked share links: sharer can select PPT or Preview mode when generating a share link; recipients are restricted to that view mode
- View lock stored in Firestore document (tamper-proof — stripping `&view=ppt` from URL doesn't bypass the lock)
- `setViewMode()` guard in `ui-panels.js` blocks mode switching when view-locked shared links are active
- View mode buttons visually disabled (`.view-lock-disabled` class) for non-matching modes on locked documents
- Share view-lock pill selector (Default / Preview / PPT) added to share options modal
- Hint text dynamically shows/hides based on view selection
- Shared versions tracking: each share is recorded in localStorage keyed by parent cloud doc ID
- "Previously Shared" section in share options modal shows all past shares with timestamp, view mode badge, secure badge, Copy and Delete buttons

---

## Summary

Adds view-locked sharing and shared versions tracking. Sharers can lock a document to PPT or Preview mode. Recipients see only the locked view and cannot switch modes. The lock is stored server-side in Firestore for tamper-proofing. A "Previously Shared" section in the share modal lets users manage their share history.

---

## 1. View-Locked Share Links
**Files:** `js/cloud-share.js`, `js/ui-panels.js`, `css/view-mode.css`
**What:** Added `M.sharedViewLock` property, `view` parameter parsing from URL hash, `applyViewLockUI()` function to disable non-matching view buttons, and `setViewMode()` guard to block mode changes when a view lock is active. View lock stored in Firestore `view` field for tamper-proofing.
**Impact:** Recipients of view-locked links see only the intended view (PPT or Preview) and cannot switch to other modes. Even stripping the URL parameter doesn't bypass the lock since it's stored server-side.

## 2. Share View-Lock Pill Selector
**Files:** `js/modal-templates.js`, `js/cloud-share.js`, `css/modals.css`
**What:** Added "Open in view mode" section with three pill buttons (Default, Preview, PPT) to the share options modal. Selection is appended as `&view=<mode>` to generated URLs and stored in the Firestore document.
**Impact:** Users can choose a view mode when generating a shareable link, with a dynamic hint text that appears when a non-default view is selected.

## 3. Shared Versions Tracking
**Files:** `js/cloud-share.js`, `js/modal-templates.js`, `css/modals.css`
**What:** Added `getSharedVersions()`, `saveSharedVersion()`, `deleteSharedVersion()` helper functions. Modified `doQuickShare()` and `doSecureShare()` to return `{url, id}` objects. Added `renderSharedVersions()` to dynamically build version cards with timestamp, view-mode badges (PPT/Preview), secure badge, and Copy/Delete buttons. Added "Previously Shared" container in share modal HTML.
**Impact:** After the first share, a "Previously Shared" section appears in the share modal showing all previous shares for the current document, with quick copy and remove actions.

---

## Files Changed (5 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/cloud-share.js` | +200 −12 | View lock logic, shared versions tracking, Firestore storage |
| `js/modal-templates.js` | +17 | View-lock pills + shared versions container HTML |
| `css/modals.css` | +159 | View-lock pill styles + shared versions list styles |
| `css/view-mode.css` | +14 | `.view-lock-disabled` button styles |
| `js/ui-panels.js` | +2 | `setViewMode()` guard for view lock |
