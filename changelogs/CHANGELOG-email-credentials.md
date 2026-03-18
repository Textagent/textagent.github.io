# Email Credentials & Passphrase→Password Rename

## Summary
- Secure share email now includes the password in the email body (link + password in styled HTML)
- Added "Copy Credentials" button in share result modal (copies link + password to clipboard)
- Renamed all user-facing "Passphrase" text to "Password" across the entire codebase
- Updated Google Apps Script endpoint URL to new deployment
- Email body message changed from "You sent yourself" to generic "A document was shared with you"

## Files Modified
- `js/cloud-share.js` — added password to email payload, wired Copy Credentials button, updated EMAIL_SCRIPT_URL, renamed user-facing passphrase→password strings
- `js/modal-templates.js` — added Copy Credentials button in share result modal, renamed labels/placeholders to "Password"
- `scripts/email-apps-script.js` — included password section in HTML/plain-text email body, renamed variables, updated email copy
- `css/modals.css` — added `.share-credentials-actions` and `.share-btn-copy-all` styles
- `styles.css` — mirrored same CSS additions
- `js/help-mode.js` — renamed passphrase→password in tooltip
- `js/templates/documentation.js` — renamed in 4 template strings
- `tests/feature/secure-share.spec.js` — updated test assertions
- `README.md` — renamed in feature table, descriptions, changelog entries
- `changelogs/CHANGELOG.md` — renamed in historical entries
