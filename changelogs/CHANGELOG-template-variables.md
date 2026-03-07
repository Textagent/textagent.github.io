# Template Variables Engine — $(varName) Substitution System

- Added template variables engine (`js/templates.js`): `generateVariableBlock()`, `parseVariableBlock()`, `scanForVariables()`, `applyTemplateVariables()`, `resolveGlobalVariables()`
- New amber ⚡ Vars button in formatting toolbar to apply variable substitution
- Auto-detection mode: type `$(varName)` anywhere → click Vars → table auto-generated at top → fill values → click Vars again → all resolved
- 7 built-in global variables: `$(date)`, `$(time)`, `$(year)`, `$(month)`, `$(day)`, `$(timestamp)`, `$(uuid)`
- Added `variables` arrays to 12 templates across 4 files for instant reusability
  - `documentation.js`: README (5 vars: projectName, authorName, authorGithub, projectDesc, license)
  - `ai.js`: AI Business Proposal (4 vars), AI Cover Letter (3 vars), AI SWOT Analysis (2 vars)
  - `project.js`: Meeting Notes (3 vars), Project Proposal (3 vars), Sprint Planning (4 vars), Product Launch (1 var)
  - `technical.js`: Bug Report (3 vars), Technical Spec (2 vars), Code Review (4 vars), Technical Report (2 vars)
- CSS styling for `.fmt-vars-btn`: amber accent, hover glow, green success flash, pulsing "waiting" animation

---

## Summary

Implemented a template variables system that lets users define and reuse variables across documents. Variables can come from template definitions or be auto-detected from `$(varName)` patterns in any document. The system supports both user-defined local variables (via an in-editor markdown table) and built-in global variables. Updated 12 templates to use variables, making them instantly reusable with different company names, project names, and other context.

---

## 1. Variable Engine
**Files:** `js/templates.js`
**What:** Added 5 core functions: `resolveGlobalVariables()` handles 7 built-in date/time/uuid vars; `generateVariableBlock()` creates the `<!-- @variables -->` markdown table; `parseVariableBlock()` extracts var-value pairs from the block; `scanForVariables()` auto-detects `$(varName)` patterns excluding globals; `applyTemplateVariables()` orchestrates the two-click flow (generate table → apply replacements).
**Impact:** Users can define variables in any document using `$(varName)` syntax, click Vars to auto-generate the input table, fill in values, and click Vars again to replace all occurrences.

## 2. Toolbar Button & CSS
**Files:** `index.html`, `css/ai-docgen.css`
**What:** Added amber-styled "⚡ Vars" button to the formatting toolbar's AI Tags group. CSS includes hover glow, `.apply-vars-success` green flash, and `.apply-vars-waiting` pulsing animation.
**Impact:** Clear visual affordance for the variables feature, with feedback states for success and "fill in values" prompts.

## 3. Template Variables (12 templates)
**Files:** `js/templates/documentation.js`, `js/templates/ai.js`, `js/templates/project.js`, `js/templates/technical.js`
**What:** Added `variables` arrays with name/value/desc objects to 12 templates. Replaced bracketed `[placeholder]` text with `$(varName)` patterns. Templates auto-generate the variable table when loaded.
**Impact:** Templates are now instantly reusable — change the company name once in the table, click Vars, and it propagates everywhere in the document.

---

## Files Changed (7 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/templates.js` | +60 −10 | Variable engine + auto-detect |
| `index.html` | +4 | Vars button in toolbar |
| `css/ai-docgen.css` | +55 | Button styling + animations |
| `js/templates/documentation.js` | +12 −10 | README template variables |
| `js/templates/ai.js` | +20 −10 | AI Proposal, Cover Letter, SWOT vars |
| `js/templates/project.js` | +30 −10 | Meeting Notes, Proposal, Sprint, Launch vars |
| `js/templates/technical.js` | +30 −10 | Bug Report, Tech Spec, Code Review, Report vars |
