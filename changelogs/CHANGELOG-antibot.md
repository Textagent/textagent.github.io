# Anti-Bot Protection (Honeypot + Time Check)

- Added hidden honeypot input field (bots auto-fill, humans never see it)
- Added time-based check (rejects submissions < 3 seconds after modal opens)
- Both checks enforced client-side and server-side
- Rate limiting (100/day global, 7/day per-recipient) still active

## Files Changed (5 total)

| File | Change |
|------|--------|
| `js/modal-templates.js` | Added honeypot input field |
| `css/modals.css` | Honeypot CSS (hidden from view) |
| `js/cloud-share.js` | Time tracking, honeypot + time validation, send hp/ts |
| `scripts/email-apps-script.js` | Server-side honeypot + time checks |
