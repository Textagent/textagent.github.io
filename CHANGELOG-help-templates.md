# Help FAQ & Templates — Interactive Code Examples and Templates

- Added copy-paste-ready `faq` arrays to 20 `HELP_DATA` entries to provide realistic API/Agent workflows
- Built collapsible "📖 Examples" toggle in Help Mode popover displaying dark-themed monospace code blocks
- Implemented "Copy to clipboard" functionality (`<i class="bi bi-clipboard"></i>`) for all FAQ fragments with visual checkmark (`<i class="bi bi-check2"></i>`)
- Embedded click-to-load pill variables for 10 `HELP_DATA` entries linking to `MARKDOWN_TEMPLATES` names
- Built separate independent "🔲 Templates" toggle section (`buildTemplatesHtml()`) allowing template loading with `M.selectTemplate(tpl)` directly from the help popover
- Exposed `M.selectTemplate` and `M.MARKDOWN_TEMPLATES` APIs in `templates.js` for global availability
- Added ~150 lines of specialized CSS to `help-mode.css` supporting independent accordion states (`max-height: 300px`), dark mode toggles, and responsive popover widths up to 520px

---

## Summary
The Help Mode popover system was significantly upgraded to provide "Examples" and "Templates" sections. Users can now view and copy realistic multi-tag workflows (like AI to TTS piping), and launch specific document templates seamlessly via independent accordion toggles in the popover.

---

## 1. Help Registry & Popover UI Extensions
**Files:** `js/help-mode.js`
**What:** Sourced deep documentation (`faq` arrays) and corresponding template catalogs (`templates` array) to 20 core `HELP_DATA` module entries (AI, Thought, Agent, APIs, Vars). Extended UI rendering via `buildFaqHtml()` and `buildTemplatesHtml()`.
**Impact:** Provides instant, context-aware syntactical help that users can copy directly. Eliminates jumping to external documentation.

## 2. Shared Template Global API 
**Files:** `js/templates.js`
**What:** Exposed internal state logic (`M.selectTemplate`, `M.MARKDOWN_TEMPLATES`) allowing external listeners to query templates and programmatically bootstrap documents.
**Impact:** Architectural improvement enabling seamless cross-module workflows (e.g., clicking a Help chip loads the respective technical template).

## 3. Popover Animations & Theming
**Files:** `css/help-mode.css`
**What:** Created targeted layout styles spanning `.help-popover-faq`, `.help-template-chip`, and `.help-templates-toggle`. Added gradient hover states (`linear-gradient`), conditional CSS var dark mode adjustments, and increased optimal screen footprint.
**Impact:** Enhances the aesthetic utility of the platform with premium, fluid interactions that perfectly match existing TextAgent visuals.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/help-mode.js` | ~120 | Added FAQ/Templates data and separate UI toggle renderers |
| `js/templates.js` | +2 | Exposed `selectTemplate` and `MARKDOWN_TEMPLATES` |
| `css/help-mode.css` | ~150 | Added dark mode, accordion animations, and pill chip styles |
| `js/templates/technical.js` | ~200 | Appended Mermaid chart definitions (user-driven snippet update) |
