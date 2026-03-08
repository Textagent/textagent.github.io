# Agent Templates Merge — Move agents to AI category

- Changed all 15 agent template categories from `'agents'` to `'ai'`
- Removed unused `case 'agents'` from `getCategoryIconClass()` in `templates.js`
- Removed unused `case 'agents'` from `getCategoryIcon()` in `templates.js`

---

## Summary
Merged the 15 agent templates into the existing AI category so they appear under the AI tab in the template picker, instead of a separate Agents tab that wasn't rendering.

---

## 1. Category Change
**Files:** `js/templates/agents.js`
**What:** Changed `category: 'agents'` to `category: 'ai'` on all 15 template objects.
**Impact:** All agent templates now show under the AI tab in the template picker modal.

## 2. Dead Code Cleanup
**Files:** `js/templates.js`
**What:** Removed `case 'agents': return 'technical'` from `getCategoryIconClass()` and `case 'agents': return 'bi-person-gear'` from `getCategoryIcon()`.
**Impact:** No unused switch cases; cleaner code.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/templates/agents.js` | +15 −15 | Category rename |
| `js/templates.js` | +0 −2 | Dead code removal |
