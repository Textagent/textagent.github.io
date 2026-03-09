# CHANGELOG — Email to Self

## Date: 2026-03-09

### Summary
Added an "Email to Self" section to the share result modal, allowing users to email themselves the share link and download the raw `.md` file — with zero backend required.

### Changes

#### `js/storage-keys.js`
- Added `EMAIL_SELF: 'textagent-email-self'` constant

#### `js/modal-templates.js`
- Added email input field + send button HTML inside the share result modal (after download credentials section)

#### `js/cloud-share.js`
- Email validation with regex and shake animation on invalid input
- `mailto:` URL composition with document heading as subject and share link in body
- Auto-downloads raw `.md` file for manual attachment
- Persists last-used email in localStorage via `M.KEYS.EMAIL_SELF`
- Visual feedback (checkmark) after successful send

#### `css/modals.css`
- Styled `#share-email-section` with separator, header, and input row
- Added `.shake` animation keyframes for validation error feedback

#### `README.md`
- Added Email to Self entry to Release Notes table
