# Secure Session Editing — Edit Key System

- Added cryptographic Edit Key (`ek`) system for secure collaborative editing of shared documents
- Editor links (`&ek=<token>`) grant write access without exposing the raw Firestore write-token
- Edit key generated as 24-char random token, hashed via SHA-256, stored as `ekHash` in Firestore
- Write-token encrypted with edit key via AES-GCM, stored as `eWt` — decrypted client-side on verification
- Both Quick Share and Secure Share (passphrase) paths generate and return editor links
- Editor link verification in compact share (`#s=`) and secure share (`#id=&secure=1`) loading paths
- Edit mode bypasses form/quiz access gate — editors can modify form/quiz content directly
- Editor link opens in split/edit view with cloud auto-save enabled (not read-only)
- "Editor Link" section added to share result modal with purple "Editor access available" badge
- Copy Editor Link button wired with clipboard feedback
- "Copy Both Links" renamed to "Copy All Links" — now includes editor link alongside creator and respondent links
- "Copy Credentials" and "Download Credentials" include editor link with ⚠️ warning for secure shares
- Email to Self payload includes `editorLink` field when available
- Fixed: `cloudAutoSave` preserved `ekHash`, `eWt`, and `rkHash` fields on re-save (`.set()` was wiping them)
- Fixed: Secure share path now passes `ekHash`/`eWt` through `pendingSecureDoc` to `unlockSecureDoc`
- Fixed: `clearCloudSession` and `resetCloudForFileSwitch` now clear `EDIT_KEY` from localStorage
- Firestore rules updated to allow `ekHash` (string) and `eWt` (string) fields in create and update operations

---

## Summary
Implements a zero-knowledge Edit Key system that lets document creators grant write access to trusted collaborators via a separate editor link. The edit key is never stored in plaintext — only its SHA-256 hash and the AES-GCM-encrypted write-token are stored in Firestore. This preserves the existing security model while enabling multi-user editing of shared sessions.

---

## 1. Cryptographic Edit Key Helpers
**Files:** `js/cloud-share.js`
**What:** Added `generateEditKey()` (24-char random), `hashEditKey()` (SHA-256), `encryptWriteToken()` (PBKDF2 + AES-GCM), and `decryptWriteToken()` functions using Web Crypto API.
**Impact:** Enables secure, verifiable edit access without exposing raw write-tokens in URLs.

## 2. Share Flow — Edit Key Generation
**Files:** `js/cloud-share.js`
**What:** `createCompactShare()`, `doQuickShare()`, and `doSecureShare()` now generate edit keys, store `ekHash` + `eWt` in Firestore, and return `ekString` in the result.
**Impact:** Every shared document automatically gets an editor link. No opt-in required.

## 3. Load Flow — Edit Key Verification
**Files:** `js/cloud-share.js`
**What:** Both compact (`#s=`) and secure (`#id=&secure=1`) share loading paths now parse `ek` from URL, verify `SHA-256(ek) === ekHash`, decrypt `eWt` to recover the write-token, and establish a cloud editing session.
**Impact:** Recipients with the editor link get full edit access with auto-save to the same document. Invalid keys fall back to read-only.

## 4. Cloud Auto-Save Preservation
**Files:** `js/cloud-share.js`
**What:** `cloudAutoSave()` now reads existing `ekHash`, `eWt`, and `rkHash` from Firestore before `.set()` to prevent wiping edit key data on re-save.
**Impact:** Editor links continue working after the first auto-save — previously `.set()` would overwrite the entire document and lose these fields.

## 5. Share Result Modal — Editor Link UI
**Files:** `js/modal-templates.js`, `js/cloud-share.js`, `css/modals.css`
**What:** Added "Editor Link" section with input field, copy button, and purple badge. Updated `showShareResult()` to accept and display `ekString`. Wired copy-editor-link button. Added `.share-editor-section` CSS.
**Impact:** Creators see and can copy the editor link directly from the share result modal.

## 6. Copy All / Email / Download Credentials
**Files:** `js/cloud-share.js`, `js/modal-templates.js`
**What:** "Copy Both Links" → "Copy All Links" with editor link included. Copy Credentials and Download Credentials (.txt) include editor link with security warning. Email payload includes `editorLink` field.
**Impact:** All distribution channels (copy, download, email) include the editor link when available.

## 7. Firestore Rules
**Files:** `firestore.rules`
**What:** Added `ekHash` and `eWt` to allowed fields in create (quick + secure) and update rule branches.
**Impact:** Firestore accepts documents containing edit key data. Without this, shares would fail with "Missing or insufficient permissions".

## 8. Storage Key
**Files:** `js/storage-keys.js`
**What:** Added `EDIT_KEY` constant for localStorage persistence.
**Impact:** Edit key stored locally during editing session, cleared on session reset.

---

## Files Changed (5 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/cloud-share.js` | +248 −33 | Core edit key logic: generation, verification, auto-save preservation, UI wiring |
| `js/modal-templates.js` | +16 −2 | Editor Link HTML section + Copy All Links label |
| `css/modals.css` | +11 | `.share-editor-section` styles |
| `firestore.rules` | +8 −4 | Allow `ekHash` and `eWt` fields |
| `js/storage-keys.js` | +3 | `EDIT_KEY` constant |
