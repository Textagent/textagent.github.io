# CHANGELOG — Product Rebrand: MDview → WriteAgent

## Summary
Renamed all user-facing product branding from **MDview** to **WriteAgent** across 20 files.

## What Changed

### Core HTML & SEO (`index.html`)
- Title tag, meta title, description, keywords → WriteAgent
- Open Graph and Twitter Card meta tags → WriteAgent
- Two `<span class="brand-label">` elements (header + QAB) → WriteAgent

### Package Config
- `package.json` name → `writeagent`
- `package-lock.json` name → `writeagent`

### JavaScript User-Facing Strings
- `workspace.js` — page title base → WriteAgent
- `cloud-share.js` — share credentials banner → WriteAgent
- `modal-templates.js` — share modal text → WriteAgent
- `ai-worker-openrouter.js` (root + public) — X-Title header → WriteAgent

### Templates
- `documentation.js` — 8 template content references → WriteAgent
- `coding.js` — 2 bash template references → WriteAgent
- `quiz.js` — 2 template references → WriteAgent

### Documentation
- `README.md` — title, body, release notes → WriteAgent
- `CHANGELOG.md` — header and body → WriteAgent
- `CHANGELOG-help-mode.md` — branding reference → WriteAgent

### Firestore Rules
- `firestore.rules` + `public/firestore.rules` — comments → WriteAgent

### Desktop App
- `desktop-app/package.json` — description → WriteAgent
- `desktop-app/README.md` — title and body → WriteAgent
- `desktop-app/neutralino.config.json` — window title → WriteAgent

## Intentionally Preserved
- Firebase config keys (`mdview-share.*`) — infrastructure identifiers
- localStorage keys (`mdview-*`) — existing user data preservation
- GitHub URLs (`markdownview.github.io`) — separate concern
