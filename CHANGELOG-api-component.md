# API Component Extraction — Standalone `{{API:}}` Tag

- New `js/api-docgen.js` — standalone module for `{{API:}}` REST API call tags
- Supports GET/POST/PUT/DELETE methods, custom headers, JSON body, `Variable:` storage
- Toolbar GET/POST buttons insert API templates with method-specific defaults
- API cards render inline with method badge (colored GET/POST/PUT/DELETE) + URL display
- ▶ execute button makes fetch call, shows inline review panel (Accept/Regenerate/Reject)
- API responses stored in `$(api_varName)` variables, accessible via ⚡ Vars table
- Fixed: stale `M.parseApiConfig` reference in `ai-docgen.js` crashing module chain
- Fixed: CSP `connect-src` blocking fetch to arbitrary API URLs — added `https: http:` wildcards
- Fixed: Vars table breaking on multi-line JSON — newlines now always stripped before display
- Fixed: Review panel appearing at bottom — now renders inline after the triggering API card
- Updated README with API Calls feature row and release note
- Updated Feature Showcase template with API Calls section and examples

---

## Summary
Extracted all API functionality from `ai-docgen.js` into a new standalone `api-docgen.js` module. The API component handles `{{API:}}` tags independently — parsing, rendering cards, executing fetch calls, review panels, toolbar actions, and variable storage.

---

## 1. API Component Module
**Files:** `js/api-docgen.js`
**What:** New 414-line IIFE module containing: `parseApiConfig`, `parseApiBlocks`, `transformApiMarkdown`, `bindApiPreviewActions`, `executeApiBlock`, `showApiReviewPanel`, `insertApiTag`, and toolbar action registrations for GET/POST buttons.
**Impact:** API functionality is now a fully independent component, not coupled to the AI system.

## 2. AI Module Cleanup
**Files:** `js/ai-docgen.js`
**What:** Removed all API-specific code (regex, card rendering, click routing, parseApiConfig, executeApiBlock, toolbar registrations). Exposed `M._showToast` for API module. Removed stale `M.parseApiConfig = parseApiConfig` reference that was causing ReferenceError.
**Impact:** AI module is cleaner and no longer crashes on load.

## 3. Renderer Integration
**Files:** `js/renderer.js`
**What:** Chained `M.transformApiMarkdown` after `M.transformDocgenMarkdown`. Added `M.bindApiPreviewActions` after AI bindings. Added `data-api-index` to DOMPurify `ADD_ATTR` list.
**Impact:** API cards render correctly in preview with functional action buttons.

## 4. Module Loading
**Files:** `src/main.js`
**What:** Added `await import('../js/api-docgen.js')` as Phase 4.6, after ai-docgen.js.
**Impact:** API module loads after AI module, accessing shared `M._showToast`.

## 5. CSP Fix
**Files:** `index.html`
**What:** Added `https: http:` to `connect-src` CSP directive.
**Impact:** Fetch calls to arbitrary user-specified API URLs are no longer blocked.

## 6. Variable Table Fix
**Files:** `js/templates.js`
**What:** Changed newline stripping to always apply (not just when value > 80 chars). Added whitespace normalization.
**Impact:** Multi-line JSON API responses display as clean single-line previews in Vars table.

## 7. Review Panel Position Fix
**Files:** `js/api-docgen.js`
**What:** Changed `container.appendChild(panel)` to `insertBefore(panel, apiCard.nextSibling)`.
**Impact:** Review panel appears inline after the API card, not at the bottom.

## 8. README & Template Updates
**Files:** `README.md`, `js/templates/documentation.js`
**What:** Added API Calls row to Features at a Glance, release note entry, Feature Showcase API section with GET/POST examples, updated template counts.
**Impact:** Documentation reflects the new API component feature.

---

## Files Changed (8 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/api-docgen.js` | +414 | New API component module |
| `js/ai-docgen.js` | −150 +2 | Removed API code, exposed showToast |
| `js/renderer.js` | +4 | Chained API transform/bind |
| `src/main.js` | +3 | Added API module import |
| `index.html` | +1 | CSP connect-src fix |
| `js/templates.js` | +2 −1 | Vars table newline fix |
| `README.md` | +3 | API feature + release note |
| `js/templates/documentation.js` | +30 | API section in Feature Showcase |
