# fix: Vendor just-bash browser bundle — resolve esm.sh 404 & node:* runtime errors

- Replaced broken `esm.sh` CDN import with self-hosted vendored bundle
- Bundled `just-bash@2.0.0` via esbuild with `node:*` built-in stubs (zlib, dns)
- Injected browser-safe `process` global shim for runtime compatibility
- Added build script `scripts/bundle-just-bash.mjs` for reproducible vendor builds
- Added `https://esm.run` to CSP `script-src` and `connect-src`
- Added 3 Playwright regression tests for loading & execution

---

## Root Cause

`esm.sh` returns 404 for all `just-bash` versions because later 2.x releases (2.1.0+) added heavy Node.js dependencies (`sql.js`, `pyodide`, `@mongodb-js/zstd`) that break esm.sh's server-side bundler. The `@2` semver range resolved to these newer versions, causing the build to fail.

Additionally, the just-bash browser build (`dist/bundle/browser.js`) externalizes `node:zlib`, `node:dns`, and references the `process` global — none of which exist in browsers.

## Solution

Self-host a vendored browser bundle with:
1. **Node.js built-in stubs** — `node:zlib` (passthrough gunzip/gzip), `node:dns` (noop), etc.
2. **Process global shim** — `process.cwd()`, `process.env`, `process.stdout`, etc.
3. **All npm deps resolved inline** — `sprintf-js`, `diff`, `minimatch`, `turndown`

Build script: `node scripts/bundle-just-bash.mjs`

---

## Files Changed (6 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `index.html` | +3 −3 | Import URL + CSP update |
| `js/vendor/just-bash.browser.js` | +765 | Vendored browser bundle |
| `scripts/bundle-just-bash.mjs` | +107 | esbuild bundle script |
| `tests/feature/just-bash-loading.spec.js` | +125 | Regression tests |
| `package.json` | +2 | devDependencies |
| `package-lock.json` | +276 −110 | Lockfile |

---

## Tests

3 Playwright tests — all passed (4.2s):
- ✅ `just-bash vendor bundle loads without console errors` — verifies no 404, CSP, or process errors
- ✅ `bash code block executes echo command without errors` — verifies runtime execution
- ✅ `bash code block runs variable expansion and pipes` — verifies `$NAME`, `|`, `tr`
