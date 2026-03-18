# CHANGELOG — Test API Fixes

## 2026-03-18

### fix: update context-memory and email-share tests for current API

- **`tests/feature/context-memory.spec.js`** — updated `Think` tag tests to use `AI` with `@think: Yes`; changed `search` field assertions to `searchProviders` array format; fixed multi-source `@use:` test to use `AI` block
- **`tests/feature/email-share.spec.js`** — removed Turnstile CAPTCHA mock (no longer needed after honeypot migration)
