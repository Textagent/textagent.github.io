# Lazy-load platform-skill.md (perf fix)

## Problem
`platform-skill.md` (859 lines) was fetched via `fetch()` on **every page reload** because `skills.js` used a top-level `await fetch()` that ran unconditionally during module initialization.

## Fix
- **`js/templates/skills.js`** — Replaced eager fetch with a lazy `loadContent()` function that fetches and caches on first use (only when user clicks the template).
- **`js/templates.js`** — Updated `renderTemplateCards`, `filterTemplates`, and `selectTemplate` to handle `null` content gracefully and `await loadContent()` on demand.

## Impact
- Eliminates one unnecessary network request on every page load
- No user-facing behaviour change — Skills template still works identically when selected
