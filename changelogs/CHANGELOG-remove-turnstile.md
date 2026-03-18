# Remove Cloudflare Turnstile CAPTCHA

- Removed Turnstile CAPTCHA from email-to-self flow
- Removed Turnstile script tag and onload callback from `index.html`
- Removed Turnstile widget container from `modal-templates.js`
- Removed all Turnstile init/retry/validation code from `cloud-share.js`
- Removed Turnstile server-side verification from `scripts/email-apps-script.js`
- Rate limiting (100/day global, 7/day per-recipient) remains as abuse protection

---

## Summary
Removed the Cloudflare Turnstile CAPTCHA integration entirely. The email endpoint is still protected by server-side rate limiting.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/cloud-share.js` | −80 | Removed all Turnstile code |
| `js/modal-templates.js` | −2 | Removed widget container divs |
| `index.html` | −8 | Removed script tag + callback |
| `scripts/email-apps-script.js` | −25 | Removed server-side verification |
