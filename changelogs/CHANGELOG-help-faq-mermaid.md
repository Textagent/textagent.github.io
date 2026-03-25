# Interactive Help FAQ & Mermaid Diagram Catalog

- Added interactive FAQ examples inside Help Mode popovers
- Added copy-to-clipboard functionality for FAQ code snippets
- Added clickable template chips inside Help Mode popovers to instantly load related templates
- Added a comprehensive "Mermaid Diagram Catalog" template containing 18 diagram types
- Fixed Mermaid v11.6+ `requirementDiagram` rendering error by correctly quoting identifiers with hyphens
- Extracted and centralized `escapeHtml` utility for safe text insertion in Help Mode

---

## Summary
Enhanced the Help Mode with interactive, copy-pasteable FAQ examples and related template chips to improve learnability. Additionally, created a centralized Mermaid Diagram Catalog template with 18 working diagram examples and fixed a rendering bug with requirement diagrams in Mermaid v11.6.

---

## 1. Help Mode FAQ and Templates
**Files:** `css/help-mode.css`, `js/help-mode.js`, `js/templates.js`
**What:** Updated the Help Mode popover logic to selectively inject an interactive FAQ section and a Templates section. The FAQ entries display markdown blocks with a one-click copy button, and the Template chips instantly invoke `M.selectTemplate()` to load a related template without leaving the editor.
**Impact:** Significantly lowers the learning curve by providing users with immediate copyable examples and direct access to full-document templates directly from the contextually highlighted toolbar buttons.

## 2. Mermaid Diagram Catalog Template
**Files:** `js/templates/technical.js`
**What:** Created a massive new template that serves as a living catalog of all 18 supported Mermaid diagram types (Flowchart, Sequence, Class, State, ER, Gantt, User Journey, Requirement, Quadrant, Mindmap, Pie, Timeline, Sankey, XY Chart, Git Graph, Block, Architecture, and C4). Also resolved a critical `requirementDiagram` syntax error (Mermaid v11.6) by quoting all hyphenated IDs and relationships.
**Impact:** Provides users with a one-stop reference for all Mermaid visualizations, complete with correctly formatted syntax examples, making it dramatically easier to build complex technical documentation.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `css/help-mode.css` | +259 −0 | Added styles for FAQ sections, toggle chevrons, copy buttons, and template chips |
| `js/help-mode.js` | +223 −5 | Injected FAQ and Templates HTML builders, copy handlers, and template selection logic |
| `js/templates.js` | +2 −0 | Exposed `selectTemplate` and `MARKDOWN_TEMPLATES` for external use |
| `js/templates/technical.js` | +377 −0 | Added the extensive "Mermaid Diagram Catalog" template definition |
