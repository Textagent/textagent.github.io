# CHANGELOG — Email to Self (Direct Send)

## Date: 2026-03-09

### Summary
Upgraded "Email to Self" from `mailto:` links to actual email delivery via Google Apps Script. Users enter their email, click Send, and receive the share link + `.md` file as an attachment directly in their inbox.

### Changes

#### `scripts/email-apps-script.js` [NEW]
- Google Apps Script for deployment at script.google.com
- `doPost()` receives JSON `{email, title, content, shareLink}`
- Sends HTML email with styled template + plain text fallback
- Attaches full `.md` file as email attachment
- Returns JSON `{success: true/false}`

#### `js/cloud-share.js`
- Replaced `mailto:` + `.md` download with `fetch()` POST to Apps Script endpoint
- Added loading state (hourglass icon + disabled button)
- Added success feedback (`✅ Email sent!`) and error feedback (`❌ message`)
- Async handler with try/catch error handling

#### `js/modal-templates.js`
- Updated helper text: "Sends the share link and .md file directly to your inbox"
- Added `#share-email-status` div for success/error messages

#### `css/modals.css`
- Added `.share-email-status` styling with `:empty` hide
- Added `.share-email-success` (green) and `.share-email-error` (red) variants
- Dark mode support for success color

#### `README.md`
- Updated Email to Self release note to reflect direct send via Apps Script
