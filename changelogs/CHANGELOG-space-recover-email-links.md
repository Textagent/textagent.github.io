# Space Recovery & Email Link Sharing — Improvements

- Added email + access key recovery mode to the Spaces modal ("By Email" tab)
- Added `recoverSpaceByEmail()` function querying Firestore by hashed email (`eh` field)
- Added recover mode toggle (By Email / By Slug) with live tab switching in `showRecoverView()`
- Recover view now pre-fills saved email from localStorage
- If email matches multiple spaces, all are recovered simultaneously
- Fixed: email send now embeds all share links (view link, editor link, respondent link) directly in the email body content field
- Email body now includes a "Share Links" section with each link labelled: Share Link, Editor Link (if available), Respondent Link (if form), and Password (if secure share)
- Fixed: passphrase warning and editor link warning are included inline in the email body

---

## Summary
Two improvements: (1) Spaces can now be recovered by entering your email + access key — no need to remember the space slug. (2) The "Email to Self" feature now correctly embeds all generated links (editor, respondent, share) directly in the email body, so they appear in every email regardless of how the Google Apps Script templates process the extra fields.

---

## 1. Email-Based Space Recovery
**Files:** `js/space-manager.js`, `js/modal-templates.js`
**What:** Added a new `recoverSpaceByEmail(email, accessKey)` function that queries Firestore for all spaces where the hashed email (`eh`) matches, then validates the access key (`wt`) against each result. The Recover view in the Spaces modal now has two tabs — "By Email" (default) and "By Slug" — with `switchRecoverMode()` handling the display toggle. Email is pre-filled from localStorage if previously saved.
**Impact:** Users who forget their space slug can now recover their space using just the email they registered with and the access key from their confirmation email. This is a much more intuitive flow.

## 2. All Links in Share Email
**Files:** `js/cloud-share.js`
**What:** Before sending the email payload to the Google Apps Script, the code now builds a rich `emailBody` string in markdown format that explicitly includes: the Share Link, the Editor Link (if any), the Respondent Link (if a form), and the passphrase (if a secure share). This replaces sending the raw markdown `content` as the email body.
**Impact:** All share links now reliably appear in the sent email, including the Editor Link which was previously only sent as a separate `editorLink` field that the GAS may not have rendered.

---

## Files Changed (3 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/space-manager.js` | +78 −20 | Added email recovery function, mode toggle, updated recover submit handler |
| `js/modal-templates.js` | +28 −12 | Updated recover view HTML with mode tabs and email input |
| `js/cloud-share.js` | +22 −1 | Fixed email body to include all links explicitly |
