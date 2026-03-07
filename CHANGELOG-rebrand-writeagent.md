# CHANGELOG — Product Rebrand: MDview → TextAgent

## Summary
Renamed all user-facing product branding from **MDview** to **TextAgent** across 20 files.

## What Changed

### Core HTML & SEO (`index.html`)
- Title tag, meta title, description, keywords → TextAgent
- Open Graph and Twitter Card meta tags → TextAgent
- Two `<span class="brand-label">` elements (header + QAB) → TextAgent

### Package Config
- `package.json` name → `textagent`
- `package-lock.json` name → `textagent`

### JavaScript User-Facing Strings
- `workspace.js` — page title base → TextAgent
- `cloud-share.js` — share credentials banner → TextAgent
- `modal-templates.js` — share modal text → TextAgent
- `ai-worker-openrouter.js` (root + public) — X-Title header → TextAgent

### Templates
- `documentation.js` — 8 template content references → TextAgent
- `coding.js` — 2 bash template references → TextAgent
- `quiz.js` — 2 template references → TextAgent

### Documentation
- `README.md` — title, body, release notes → TextAgent
- `CHANGELOG.md` — header and body → TextAgent
- `CHANGELOG-help-mode.md` — branding reference → TextAgent

### Firestore Rules
- `firestore.rules` + `public/firestore.rules` — comments → TextAgent

### Desktop App
- `desktop-app/package.json` — description → TextAgent
- `desktop-app/README.md` — title and body → TextAgent
- `desktop-app/neutralino.config.json` — window title → TextAgent

## Intentionally Preserved
- Firebase config keys (`mdview-share.*`) — infrastructure identifiers
- localStorage keys (`mdview-*`) — existing user data preservation
- GitHub URLs (`textagent.github.io`) — separate concern
