# Cloudflare Turnstile CSP Fix — Enable CAPTCHA verification for Email-to-Self

- Added `https://challenges.cloudflare.com` to CSP `script-src` to allow Turnstile API script loading
- Added `https://challenges.cloudflare.com` to CSP `frame-src` to allow Turnstile challenge iframe
- Added `https://challenges.cloudflare.com` to CSP `style-src` to allow Turnstile widget styles
- Added `https://challenges.cloudflare.com` to CSP `img-src` to allow Turnstile widget images
- Fixed: Changed referrer policy from `no-referrer` to `strict-origin-when-cross-origin` to allow Turnstile hostname verification

---

## Summary
The Cloudflare Turnstile CAPTCHA widget was blocked by the Content Security Policy and failed hostname verification due to the `no-referrer` policy. This fix updates the CSP to allow all Turnstile resources and changes the referrer policy to enable proper verification while maintaining privacy.

---

## 1. CSP Directive Updates for Turnstile
**Files:** `index.html`
**What:** Added `https://challenges.cloudflare.com` to four CSP directives: `script-src`, `style-src`, `img-src`, and `frame-src`. The Turnstile widget loads a script, renders an iframe with styles/images, all from `challenges.cloudflare.com`.
**Impact:** Turnstile CAPTCHA widget can now fully load and render on the page without CSP violations.

## 2. Referrer Policy Change
**Files:** `index.html`
**What:** Changed `<meta name="referrer">` from `no-referrer` to `strict-origin-when-cross-origin`. The previous policy stripped all referrer information, preventing Cloudflare from verifying the hostname the widget runs on.
**Impact:** Turnstile can now validate that the widget is running on an authorized hostname (`textagent.github.io`). The new policy still protects user privacy — it only sends the origin (not the full path) for cross-origin requests.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +3 −3 | CSP + referrer policy update for Turnstile |
