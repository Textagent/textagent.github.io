# CHANGELOG — Email Endpoint Security (Turnstile CAPTCHA)

## Summary

Secured the Google Apps Script email endpoint with **Cloudflare Turnstile CAPTCHA** and server-side rate limiting. Previously, the endpoint was publicly accessible with no authentication, allowing anyone to send spam or phishing emails from the owner's Google account.

## Changes

### Security

- **Cloudflare Turnstile CAPTCHA** — invisible CAPTCHA widget blocks bots from abusing the email endpoint
- **Server-side token verification** — Apps Script validates the CAPTCHA token with Cloudflare's `/siteverify` API before sending any email
- **Daily rate limiting** — max 20 emails/day via `PropertiesService` in the Apps Script
- **New deployment URL** — old (unsecured) endpoint replaced with new Turnstile-secured deployment

### Files Modified

- `js/modal-templates.js` — Added `#turnstile-container` and `#turnstile-error` elements in the email section
- `index.html` — Added Cloudflare Turnstile script (async/defer, explicit render mode)
- `js/cloud-share.js` — CAPTCHA validation before email send, token in POST body, widget init/reset
- `scripts/email-apps-script.js` — Server-side Turnstile verification, rate limiting, updated deployment

### Files Modified (Tests)

- `tests/feature/email-share.spec.js` — Turnstile mock via `addInitScript`, new test: "send is blocked when CAPTCHA is not completed"

### Test Results

- Email-to-Self tests: **9/9 passed**
- Persistence tests: **5/5 passed** (unaffected)
