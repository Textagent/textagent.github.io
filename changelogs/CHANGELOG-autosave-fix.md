# Auto-Save Field Preservation Fix

- Fixed: `cloudAutoSave` `.set()` now preserves `view`, `salt`, `secure` fields from original Firestore document
- Fixed: Editor link updates no longer wipe `k` (encryption key) causing "Decryption Failed" for read-only viewers
- Fixed: Added null guard on `data.k` in compact share loader — shows clear error instead of raw "Cannot read properties of undefined"
- Firestore update rule expanded to allow `salt` and `secure` fields (enables editor auto-save on secure share docs)
- Firestore rules test updated for new update field set

---

## Summary
Critical bug fix: `cloudAutoSave` uses Firestore `.set()` which completely replaces the document. Previously it only preserved `ekHash`, `eWt`, and `rkHash` — missing `view`, `salt`, and `secure`. This caused the Firestore update to be rejected by security rules (which didn't allow `salt`/`secure` in updates), resulting in the encryption key being lost and read-only links breaking with "Decryption Failed".

---

## 1. Auto-Save Field Preservation
**Files:** `js/cloud-share.js`
**What:** Added preservation of `view`, `salt`, and `secure` fields from the existing Firestore document before `.set()` overwrites it.
**Impact:** Editor link auto-save no longer corrupts secure share documents or wipes view-lock settings.

## 2. Firestore Update Rule
**Files:** `firestore.rules`
**What:** Added `salt` and `secure` to the update rule's `hasOnly()` field list.
**Impact:** Auto-save on secure share documents (which have `salt` and `secure` fields) no longer fails with permission errors.

## 3. Null Guard on Encryption Key
**Files:** `js/cloud-share.js`
**What:** Added `if (!data.k) throw new Error('Missing encryption key')` before calling `base64UrlToKey(data.k)`.
**Impact:** Shows a clear user-facing error message instead of cryptic "Cannot read properties of undefined (reading 'replace')".

## 4. Test Update
**Files:** `tests/firestore/firestore-rules.test.js`
**What:** Updated `UPDATE_FIELDS` to include `salt` and `secure`; relaxed assertion from 2+ matching lists to 1+ since update rule now differs from create rule.
**Impact:** Tests pass with the expanded update rule.

---

## Files Changed (3 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/cloud-share.js` | +4 −1 | Preserve view/salt/secure + null guard |
| `firestore.rules` | +1 −1 | Update rule expanded |
| `tests/firestore/firestore-rules.test.js` | +3 −4 | Updated field expectations |
