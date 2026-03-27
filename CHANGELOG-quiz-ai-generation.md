# AI-Assisted Quiz Generation — Skill Injection, Per-Card Model, Mode Toggle

- Added `QUIZ_SYNTAX_SKILL` constant — comprehensive syntax reference injected into AI prompts for accurate quiz generation
- Added `postProcessQuizLines()` — auto-fixes common AI output errors (missing colons, swapped MCQ pipes, wrong types)
- Added `@prompt:` field to quiz parser — users can describe quizzes in natural language instead of manually writing `@question` lines
- Added AI prompt textarea to quiz card UI — renders below the header for free-text quiz descriptions
- Added per-card AI model selector dropdown — creators can choose which model generates questions for each quiz
- Added Practice/Test mode toggle button — clickable pill in card header syncs `@mode:` to the editor
- Added model-readiness handling with try/catch — shows toast instead of crashing if model isn't loaded
- Added `runAiPrompt` callback fallback for backward compatibility
- Creator's Next button is always enabled — no longer blocked until answering in preview mode
- Fixed: `{{Quiz :}}` with space before colon now parses correctly (`\s*` before `:`)
- Fixed: AI-generated `@hint:` lines are now preserved alongside `@question` lines
- Added CSS styles for `.quiz-dg-prompt-area`, `.quiz-dg-prompt-input`, `.quiz-dg-gen-prompt`
- Added CSS styles for `.quiz-dg-model-select` dropdown
- Added CSS styles for `.quiz-dg-mode-toggle` button with Practice (green) / Test (purple) states

---

## Summary
Implements AI-assisted quiz creation using the Skill Injection pattern from `game-docgen.js`. Users can now describe a quiz in plain language (via `@prompt:` or the prompt textarea), pick a model, and click Generate to produce correctly-formatted `@question` markup. A post-processor auto-fixes common AI syntax errors.

---

## 1. Quiz Syntax Skill Injection
**Files:** `js/quiz-docgen.js`
**What:** Added `QUIZ_SYNTAX_SKILL` constant (~40 lines) containing the complete quiz syntax reference with explicit pipe-format documentation for all 8 question types. This is prepended to every AI generation request.
**Impact:** The AI receives exact formatting rules, producing valid `@question[mcq]:`, `@question[tf]:`, etc. markup instead of guessing the syntax.

## 2. Post-Processor for AI Output
**Files:** `js/quiz-docgen.js`
**What:** Added `postProcessQuizLines()` function that fixes missing colons (`@question[mcq] ` → `@question[mcq]: `), swapped MCQ pipe order, and filters non-question lines.
**Impact:** Even imperfect AI output gets corrected into valid quiz markup before insertion.

## 3. `@prompt:` Field & Prompt Textarea
**Files:** `js/quiz-docgen.js`, `css/quiz-docgen.css`
**What:** Added `@prompt:` parser field (multi-line, same pattern as `@chapter:`), prompt textarea UI in quiz cards, and debounced sync back to editor markdown.
**Impact:** Users can type "Create 10 biology questions on photosynthesis" instead of manually writing `@question` lines.

## 4. Per-Card Model Selector
**Files:** `js/quiz-docgen.js`, `css/quiz-docgen.css`
**What:** Added `<select>` dropdown populated from `window.AI_MODELS`, filtering out image/TTS/STT models. On change, triggers local model download or API key prompt.
**Impact:** Each quiz card can use a different AI model for generation.

## 5. Practice/Test Mode Toggle
**Files:** `js/quiz-docgen.js`, `css/quiz-docgen.css`
**What:** Replaced static "📝 Test" badge with clickable toggle button. Click handler syncs `@mode:` field to editor markdown via regex replace or insertion.
**Impact:** Creators can switch quiz mode with a single click instead of editing markdown.

## 6. Creator Navigation Fix
**Files:** `js/quiz-docgen.js`
**What:** Changed `navDisabled` from `(b.mode === 'test') ? '' : 'disabled'` to `(!isRespondent || b.mode === 'test') ? '' : 'disabled'`.
**Impact:** Creators can freely navigate through all questions to preview; only respondents in practice mode must answer first.

## 7. Flexible Quiz Tag Parsing
**Files:** `js/quiz-docgen.js`
**What:** Added `\s*` before `:` in both parser and transform regexes.
**Impact:** `{{Quiz : title}}`, `{{Quiz: title}}`, and `{{Quiz  :  title}}` all work.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/quiz-docgen.js` | +331 −34 | Skill injection, @prompt parser, model selector, mode toggle, post-processor |
| `css/quiz-docgen.css` | +114 −0 | Styles for prompt area, model dropdown, mode toggle |
