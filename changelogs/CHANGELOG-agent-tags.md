# Agent Tags & UI Label — Add {{Agent:}} pipelines and display tag

- Added `{{Agent:}}` multi-step pipeline sections to all 15 agent templates
- Added `displayTag: 'AI · Agent'` property to all 15 templates in `agents.js`
- Updated card rendering in `templates.js` to show `tpl.displayTag || tpl.category`
- Activated pre-commit changelog hook: set `core.hooksPath` to `.githooks/`
- Each Agent pipeline has 3 chained steps relevant to the template's domain

---

## Summary
Added `{{Agent:}}` multi-step pipeline tags to all 15 agent templates so they showcase the Agent Flow feature. Updated the UI to show "AI · Agent" label on template cards. Fixed the pre-commit hook that was inactive due to missing `core.hooksPath` config.

---

## 1. Agent Pipeline Content
**Files:** `js/templates/agents.js`
**What:** Added a `## 🔗 Agent Pipeline` section with `{{Agent: Step 1/2/3}}` tags to each template. Pipelines are domain-specific (e.g., Data Science gets analysis pipeline, SQL gets optimization pipeline).
**Impact:** Users see and can run Agent Flow pipelines when using these templates.

## 2. Display Tag
**Files:** `js/templates/agents.js`, `js/templates.js`
**What:** Added `displayTag: 'AI · Agent'` to all templates; card rendering uses `tpl.displayTag || tpl.category`.
**Impact:** Template cards show "AI · Agent" instead of just "ai".

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/templates/agents.js` | ~+165 | Agent pipeline sections + displayTag |
| `js/templates.js` | +1 | Card tag rendering |
