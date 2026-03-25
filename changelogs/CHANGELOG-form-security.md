# Form Sharing Security Hardening

## Overview
Hardened the zero-knowledge dual-key form sharing system with critical security fixes, reliability improvements, and UX enhancements.

## Security Fixes
- **XSS prevention**: Added `escapeHtml()` for all response table cell rendering in `form-engine.js`
- **Encryption enforcement**: Removed insecure `storeResponsePlain()` fallback — all responses now AES-GCM encrypted only
- **rk validation**: SHA-256 hash of response key (`rkHash`) stored in Firestore, validated on load. Invalid `rk` values hide the Responses viewer
- **Read-only interceptor**: Exempted `.form-dg-submit` from the global click blocker so form submission works on creator links

## UX Improvements
- **Dynamic columns**: Response viewer collects column keys from ALL responses (handles schema changes over time)
- **Re-submit prevention**: Submit button disabled + text changes to "⏳ Submitting…" after click
- **Form title in viewer**: Response viewer header shows form title (e.g., "📊 Feedback Survey — Responses 2")
- **Help demo**: Form feature now has a dedicated demo recording (`32_form_sharing.webp`) in the Help system

## Files Modified
- `js/form-engine.js` — XSS escaping, encrypted-only storage, dynamic columns, form title in viewer
- `js/form-docgen.js` — Re-submit prevention
- `js/cloud-share.js` — SHA-256 rkHash storage/validation, submit button exemption
- `js/help-mode.js` — Form help entry with dedicated demo
- `firestore.rules` — rkHash field support in share document schemas
- `public/assets/demos/32_form_sharing.webp` — New demo recording

## Firestore Rules
- Updated to allow optional `rkHash` field in both quick share and secure share schemas
- Rules deployed to `mdview-share` project
