# Quiz Progress Bar Fix — Sync bar with respondent navigation

- Fixed: Quiz progress bar not filling as respondent navigates through questions
- Fixed: `gotoScreen()` never called `updateHUD()`, so navigation didn't touch the bar
- Changed progress calculation from answered-question count to current question position (`cur + 1`)

---

## Summary
The quiz progress bar was stuck at 0% until answers were recorded because it tracked answered questions, not navigation position. Now it fills progressively as the respondent moves through questions.

---

## 1. Progress Bar Sync Fix
**Files:** `js/quiz-docgen.js`
**What:** Changed `updateHUD()` to use `(st.cur + 1) / st.total * 100` instead of `results.filter(r => r !== undefined).length / st.total * 100`. Added `updateHUD(bi)` call inside `gotoScreen()`.
**Impact:** The progress bar now visually fills in sync with the respondent's current question, reaching 100% on the last question.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/quiz-docgen.js` | +4 −2 | Bug fix — progress bar tracking |
