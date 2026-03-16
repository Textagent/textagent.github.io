# Agent Templates & Page View — New Features

- Upgraded "Debug This Error" to 3-phase pipeline: triage & classify → root cause & fix → verify & prevent
- Added `language` and `codeSnippet` variables to Debug template for framework-specific analysis
- Added 14-pattern common-fix lookup table to Debug template (CORS, null ref, module not found, etc.)
- Added DO/DON'T rules table and verification commands to Debug template
- New agent template: Performance Profiler (N+1 detection, memory leaks, O(n²) loops, caching strategy)
- New agent template: Implementation Planner (feature → phased plan with task breakdown, risk assessment)
- New agent template: Git Commit Reviewer (diff → conventional commits, breaking change detection, changelog)
- New agent template: Deployment Checklist (stack → CI/CD pipeline, Docker config, rollback plan)
- New agent template: Cost-Aware LLM Pipeline (model routing, budget tracking, fallback strategies)
- Added "Agents" category pill to template modal for filtering agent templates
- Added `agents` category mapping in template loader (icon + color)
- New: Page View mode (A4 document view with zoom and Export PDF button)
- Added `<!-- pagebreak -->` comment parsing in renderer for document page breaks
- Added `data-pagebreak` to DOMPurify allowed attributes
- New game templates: Canvas 2D Arcade Classics (platformer, top-down shooter, rhythm, tile match, tower defense)
- Fixed: Game prebuilt emoji encoding (HTML entities → native Unicode for Snake, Breakout, etc.)
- Fixed: Snake game localStorage wrapped in try/catch for sandboxed iframes
- Fixed: Breakout game touch event handlers for mobile play
- Fixed: Game template duplicate code blocks removed (was showing source + rendered)
- Fixed: Game iframe sandbox now allows `allow-same-origin` for proper asset loading

---

## Summary

Major agent template expansion and page view mode. Upgraded the Debug This Error template from a basic single-prompt to a systematic 3-phase debugging pipeline inspired by ECC's build-error-resolver. Added 5 brand-new agent templates covering performance profiling, implementation planning, git commit review, deployment checklists, and LLM cost optimization. Also added page view (A4 document mode) and fixed several game template issues.

---

## 1. Debug This Error Template Upgrade
**Files:** `js/templates/agents.js`
**What:** Replaced the single-phase AI prompt with a 3-phase pipeline: Phase 1 (Triage & Classify with error classification table and 14-pattern common-fix lookup), Phase 2 (Root Cause & Fix with before/after diffs, DO/DON'T rules), Phase 3 (Verify & Prevent via Agent multi-step with verification commands, preventive guard code, and related-issue sweep). Added `language` and `codeSnippet` template variables.
**Impact:** Dramatically more actionable debug output — developers get categorized errors, known-pattern matching, minimal diffs, and exact verification commands instead of a generic analysis.

## 2. Five New Agent Templates
**Files:** `js/templates/agents.js`
**What:** Added Performance Profiler, Implementation Planner, Git Commit Reviewer, Deployment Checklist, and Cost-Aware LLM Pipeline templates. Each uses @AI with @think and/or Agent multi-step patterns.
**Impact:** Expands the Agents category from developer-tool templates (code review, TDD, security scan) into planning, DevOps, and AI infrastructure territory.

## 3. Agents Category in Template Modal
**Files:** `js/modal-templates.js`, `js/templates.js`
**What:** Added "Agents" category pill button to the template modal filter bar. Added category-to-icon (`bi-robot`) and category-to-color (`technical`) mappings.
**Impact:** Agent templates are now discoverable via their own filter pill instead of being mixed into other categories.

## 4. Page View Mode (A4 Document)
**Files:** `index.html`, `css/page-view.css`, `js/page-view.js`, `js/ui-panels.js`, `js/renderer.js`, `src/main.js`
**What:** Added a new "Page" view mode that reflows rendered content into A4-sized pages with zoom controls and an Export PDF button. Added `<!-- pagebreak -->` comment support in the renderer and `data-pagebreak` attribute to DOMPurify allowlist.
**Impact:** Users can view and export documents in paginated A4 format, useful for reports, specs, and printable documents.

## 5. Game Template Fixes
**Files:** `js/game-prebuilts.js`, `js/templates/games.js`, `js/game-docgen.js`
**What:** Fixed emoji encoding (HTML entities → native Unicode), wrapped localStorage in try/catch for sandboxed iframes, added touch event handlers to Breakout game, removed duplicate code blocks from game template, added `allow-same-origin` to game iframe sandbox, and added new Canvas 2D arcade game templates.
**Impact:** Games now display correctly in sandboxed iframes without errors, and mobile touch controls work for Breakout.

---

## Files Changed (13 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/templates/agents.js` | +2565 | Debug template upgrade + 5 new agent templates |
| `js/templates/games.js` | +192 −48 | New game templates + duplicate block cleanup |
| `js/game-prebuilts.js` | +64 −40 | Emoji encoding fixes + touch events + localStorage safety |
| `index.html` | +33 −2 | Page view container HTML |
| `js/ui-panels.js` | +12 −4 | Page view mode support |
| `js/renderer.js` | +7 −2 | Pagebreak parsing + DOMPurify attr |
| `css/modals.css` | +2 −2 | Minor modal styling |
| `js/modal-templates.js` | +1 | Agents category pill |
| `js/templates.js` | +2 | Agents category mapping |
| `js/game-docgen.js` | +1 −1 | iframe sandbox allow-same-origin |
| `src/main.js` | +2 | Page view CSS + JS imports |
| `css/page-view.css` | NEW | Page view mode styles |
| `js/page-view.js` | NEW | Page view mode logic |
