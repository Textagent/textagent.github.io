# CHANGELOG — Skills Template Tab + Platform Skill Document

## Added
- **`platform-skill.md`** — Comprehensive platform skill reference (859 lines) documenting all 11 DocGen tags, variable system, code execution, media embedding, Run All engine, web search, file import, and 7 template composition patterns. Designed to be fed to any AI to generate rich TextAgent templates.
- **`js/templates/skills.js`** — New "Skills" template category that fetches `platform-skill.md` at load time using top-level `await`. Registers "Platform Skills Reference" as a standard template card.
- **Skills tab** in Templates modal — appears alongside All, AI, Documentation, Project, etc. as a regular category pill.

## Modified
- **`src/main.js`** — Added `skills.js` to Phase 3c template imports.
- **`js/templates.js`** — Added `__MDV_TEMPLATES_SKILLS` to template concat array, `skills` case to icon class/icon switch statements.
- **`js/modal-templates.js`** — Added Skills category button to template pills row.
- **`css/modals.css`** — Added `overflow-x: auto`, `flex-shrink: 0`, and hidden scrollbar to `.template-categories` to prevent pill overflow when many categories are present.
- **`js/templates/documentation.js`** — Minor text fix.
- **`README.md`** — Minor corrections (`@Think` → `@think: yes` mode of `{{@AI:}}`).
- **`js/ai-docgen-ui.js`** — Minor fix.
- **`js/help-mode.js`** — Minor fix.
