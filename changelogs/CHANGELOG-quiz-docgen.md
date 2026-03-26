# Quiz DocGen — `{{@Quiz:}}` Tag System

## New Feature: Declarative Quiz Engine

Full `{{@Quiz:}}` tag pipeline for creating interactive quizzes directly in markdown.

### Core Engine (`quiz-docgen.js` — NEW, ~1100 lines)
- Declarative `{{@Quiz:}}` tag parsed from markdown with `@subject`, `@difficulty`, `@mode`, `@userinfo`, `@css`, `@chapter`, and `@question[type]` fields
- 9 question types: MCQ, True/False, Fill-in-blank, Match (drag-drop), Order (drag-drop), Short Answer, Essay, Likert, Multi-select
- Two modes: **Practice** (Duolingo-style with instant feedback) and **Test** (free navigation, no answers revealed)
- User info screen with configurable fields (name, email, id) and email format validation with visual feedback
- Gamified HUD: XP counter, hearts/lives, progress bar, star rating
- Response collection via `form-engine.js` — respondent answers stored in Firestore and viewable by creator

### Test Mode Workflow
- Navigation always enabled (no forced confirmation steps)
- Short, Fill, and Essay answers recorded as `ok:null` (pending manual review)
- Creator preview shows auto-graded vs pending breakdown
- Response viewer has ✅ Correct / ❌ Wrong toggle buttons for manual grading
- Score recalculates live when creator changes grades

### Bug Fixes (8 bugs found and fixed via audit)
1. Fixed `navDisabled` line with embedded `\n` literal → split into real newlines
2. Score counter now separates auto-graded vs pending items (was counting pending as 0)
3. Response viewer summary shows "X correct + Y pending review" instead of misleading total
4. Added mobile touch support (touchstart/touchmove/touchend) for match and order drag-drop
5. Removed dead `requireUserInfo()` function
6. Keyword hints hidden from respondents (only visible to creator)
7. Fixed wrong Unicode char in order text strip (`\u2800` → `\u283f`)
8. Email validation: `checkValidity()` enforces format, red border + error message on invalid input

### Templates (6 NEW quiz templates)
- General Science (physics, chemistry, biology)
- World History (ancient to modern)
- English Grammar (parts of speech, tenses)
- Computer Science (algorithms, data structures)
- World Geography (continents, capitals, rivers)
- Biology (cells, genetics, anatomy)

### Styling (`quiz-docgen.css` — NEW, ~690 lines)
- Full dark/light mode support
- Gamified UI with gradients, animations, and responsive layout
- Drag-drop visual feedback for match and order questions

### Response Viewer (`form-engine.js` — MODIFIED)
- NEEDS REVIEW badges for pending questions
- Full answer text display (non-truncated)
- Question type labels ([short], [fill], [essay])
- Yellow border indicator for manual-review items
- ✅ Correct / ❌ Wrong grade toggle buttons with live score update

### Files Changed
- `js/quiz-docgen.js` — NEW (core quiz engine)
- `css/quiz-docgen.css` — NEW (quiz styling)
- `js/form-engine.js` — response viewer enhancements + grade toggle
- `js/templates/quiz.js` — 6 new quiz templates
- `js/renderer.js` — quiz tag integration
- `js/ai-docgen.js` — quiz rendering hooks
- `js/cloud-share.js` — quiz response storage
- `index.html` — quiz module loading
- `src/main.js` — quiz module registration
- `css/modals.css` — response modal styling
- `css/tts.css` — minor adjustments
