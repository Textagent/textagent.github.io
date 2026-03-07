# Security Hardening v2

## Changes

### Content Security Policy (CSP)
- Added `<meta http-equiv="Content-Security-Policy">` in `index.html` with allowlist for all 8 CDN/API origins
- Added matching `Content-Security-Policy` header in `nginx.conf` for Docker deployments

### Firestore Ownership Tokens
- Generate random 32-char write-token on document create in `cloud-share.js`
- Store token in localStorage; require matching token on updates
- Updated `firestore.rules` to enforce token validation with backward compatibility for legacy docs

### API Key Security
- Moved Gemini API key from URL query string to `x-goog-api-key` header in `ai-worker-gemini.js`, `ai-worker-gemini-image.js`, `ai-worker-imagen.js` + `public/` copies

### postMessage Origin Validation
- Added `e.source !== iframe.contentWindow` check in `executable-blocks.js`

### Passphrase Policy
- Increased minimum from 4 to 8 characters in `cloud-share.js`

### Firestore Rules Fix
- Updated `firestore.rules` to allow secure-share documents with `salt` and `secure` fields

### README & Feature Template
- Updated Security row in Features table with all new security measures
- Added "Security hardening v2" release notes entry
- Updated Feature Showcase template security section (11 bullet points)

## Files Modified (13)
- `index.html` — CSP meta tag
- `nginx.conf` — CSP header
- `firestore.rules` — ownership tokens + secure-share fix
- `js/cloud-share.js` — write-token generation, passphrase minimum
- `js/executable-blocks.js` — postMessage origin check
- `ai-worker-gemini.js` — API key to header
- `ai-worker-gemini-image.js` — API key to header
- `ai-worker-imagen.js` — API key to header
- `public/ai-worker-gemini.js` — API key to header
- `public/ai-worker-gemini-image.js` — API key to header
- `public/ai-worker-imagen.js` — API key to header
- `README.md` — security features + release notes
- `js/templates/documentation.js` — security section update
