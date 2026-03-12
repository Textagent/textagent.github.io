# Run All Output Fix — Bug Fixes for Code Block Execution

- Fixed: "Run All" executed blocks but did not show output for any block (bash, JS, SQL, math)
- Fixed: `findBlockContainer` produced wrong CSS selectors for bash (`executable-bash-container`) and JavaScript (`executable-javascript-container`) — now uses `mapLangToContainer()` 
- Added `renderBlockOutput()` function in exec-controller.js to render results into `.code-output` DOM elements during Run All
- Output rendering handles SQL (formatted HTML table), math (expression → result lines), and all others (plain text)
- Fixed: Default SQL template used `CREATE TABLE` which errored on re-run — changed to `CREATE TABLE IF NOT EXISTS`
- Fixed: Default math template `x^2 + 2*x + 1` caused "Undefined symbol x" — added `x = 5` assignment line
- Updated exec-hello-world test assertions to match new SQL and math defaults

---

## Summary
Fixed multiple bugs in the code execution system: "Run All" now renders output for every block, the SQL default template is idempotent, and the math default template defines variables before using them.

---

## 1. Run All Output Rendering
**Files:** `js/exec-controller.js`
**What:** Added `renderBlockOutput()` function (~80 lines) that creates `.code-output` DOM elements and renders results after each block executes in `runAll`. Handles three output formats: SQL (HTML table from pipe-delimited adapter output), math (expression → result formatting), and plain text (bash, python, JS). Also fixed `findBlockContainer` which used broken inline class-name logic — replaced with a call to the existing `mapLangToContainer()` function.
**Impact:** "Run All" now shows output for every block type, matching the behavior of individual Run buttons.

## 2. SQL Template Idempotency
**Files:** `js/coding-blocks.js`
**What:** Changed default SQL template from `CREATE TABLE greetings` to `CREATE TABLE IF NOT EXISTS greetings`.
**Impact:** SQL blocks no longer error with "table already exists" when re-run or when using Run All.

## 3. Math Template Fix
**Files:** `js/coding-blocks.js`
**What:** Added `x = 5` assignment line before `x^2 + 2*x + 1` in the default math template.
**Impact:** Math evaluation no longer errors with "Undefined symbol x".

## 4. Test Updates
**Files:** `tests/feature/exec-hello-world.spec.js`
**What:** Updated SQL assertions to use `CREATE TABLE IF NOT EXISTS` to match the new default template.
**Impact:** Tests pass with updated defaults.

---

## Files Changed (3 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/exec-controller.js` | +85 −1 | Run All output rendering + findBlockContainer fix |
| `js/coding-blocks.js` | +2 −2 | SQL IF NOT EXISTS + math variable assignment |
| `tests/feature/exec-hello-world.spec.js` | +2 −2 | Updated test assertions |
