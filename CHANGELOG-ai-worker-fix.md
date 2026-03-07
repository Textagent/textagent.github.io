# AI Worker Fix — CSP & Dynamic Import

- Fixed: CSP `connect-src` missing `https://huggingface.co`, blocking Transformers.js model downloads
- Fixed: Static ES module `import` in `ai-worker.js` silently crashing the worker when CDN is unreachable
- Converted top-level `import` to dynamic `import()` with try/catch for graceful error reporting
- Added network/CSP diagnostic hints in model loading error messages
- Mirrored CSP fix in `nginx.conf` for production

---

## Summary
The AI worker crashed silently on initialization due to two issues introduced by the security hardening commit (`8d92678`): a missing CSP origin and a fragile static import. This fix restores full local AI functionality.

---

## 1. CSP `connect-src` Update
**Files:** `index.html`, `nginx.conf`
**What:** Added `https://huggingface.co` to the `connect-src` directive in both the `<meta>` CSP tag and the nginx production header.
**Impact:** Transformers.js can now download model weight files from HuggingFace Hub without being blocked by CSP.

## 2. Dynamic Import with Error Handling
**Files:** `ai-worker.js`, `public/ai-worker.js`
**What:** Replaced the static `import { ... } from "cdn.jsdelivr.net/..."` with a dynamic `import()` call inside `loadModel()`, wrapped in try/catch. Added diagnostic hints for network and CSP errors.
**Impact:** The worker no longer crashes silently when the CDN is unreachable — it stays alive, reports specific error messages, and can be retried. Users see "Failed to load AI library from CDN" instead of a generic "Model unavailable".

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +1 −1 | Add `huggingface.co` to CSP `connect-src` |
| `nginx.conf` | +1 −1 | Mirror CSP fix for production |
| `ai-worker.js` | +31 −6 | Dynamic import + error diagnostics |
| `public/ai-worker.js` | +31 −6 | Sync with root worker |
