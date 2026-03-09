# Compile & Run — Judge0 CE Integration + 10 Language Templates

- Switched from Piston API (HTTP 401) to Judge0 CE for multi-language code execution
- Added `executeCode()` function using Judge0 CE API with `?wait=true` for synchronous results
- Added `judge0Id` to `LANG_META` for 28 supported languages (C, C++, Rust, Go, Java, Python, TypeScript, Ruby, Kotlin, Scala, C#, Dart, Swift, Haskell, Perl, Lua, PHP, R, Bash, Assembly, and more)
- Added inline output rendering with stdout (green), stderr (red), compile errors, execution time & memory stats
- Added 10 new language-specific Compile & Run coding templates: C, C++ Modern, Rust Essentials, Go Programming, Java OOP, Python Algorithms, TypeScript, Ruby Scripting, Kotlin Playground, Scala Functional
- Updated existing "Compile & Run" template to reference Judge0 CE instead of Piston
- Updated Feature Showcase template with Compile & Run section and template count (108+)
- Updated README.md features table, code execution row, technologies, template count, release notes, and demo section
- Added Compile & Run demo video (`18_compile_run.webp`)
- Added `.linux-output-stats` CSS for execution time/memory display

---

## Summary
Switched the `{{Linux:}}` tag's Compile & Run mode from the now-restricted Piston API to Judge0 CE, added 10 language-specific templates, updated documentation across README and Feature Showcase.

---

## 1. Judge0 CE API Integration
**Files:** `js/linux-docgen.js`
**What:** Replaced `PISTON_API_URL` with `JUDGE0_API_URL` (`https://ce.judge0.com/submissions?base64_encoded=false&wait=true`). Rewrote `executeCode()` to map language names to Judge0 `language_id`s and parse the Judge0 response format (stdout, stderr, compile_output, time, memory, status).
**Impact:** Code execution now works again with 28+ languages via the free Judge0 CE API.

## 2. 10 New Language Templates
**Files:** `js/templates/coding.js`
**What:** Added C Programming, C++ Modern, Rust Essentials, Go Programming, Java OOP, Python Algorithms, TypeScript, Ruby Scripting, Kotlin Playground, Scala Functional templates, each with 2-3 runnable examples.
**Impact:** Users get ready-to-run examples for 10 popular languages covering data structures, algorithms, OOP, functional programming, and more.

## 3. Documentation Updates
**Files:** `README.md`, `js/templates/documentation.js`
**What:** Updated features table (Linux Terminal, Code Execution rows), template count to 108+, added Judge0 CE to technologies, added release note and demo video section.
**Impact:** Documentation accurately reflects the new Compile & Run capability.

## 4. CSS & Rendering
**Files:** `css/linux-terminal.css`, `js/renderer.js`
**What:** Added `.linux-output-stats` CSS rule for execution time/memory display. Added `data-linux-lang` to DOMPurify whitelist.
**Impact:** Execution stats render with correct styling; language badge attributes pass sanitization.

---

## Files Changed (8 total + 1 new)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/linux-docgen.js` | +80 −50 | Judge0 CE API integration |
| `js/templates/coding.js` | +730 −30 | 10 new templates + updated Compile & Run |
| `js/templates/documentation.js` | +22 −3 | Feature Showcase update |
| `README.md` | +15 −4 | Features, technologies, release notes, demo |
| `css/linux-terminal.css` | +10 −0 | Execution stats CSS |
| `js/renderer.js` | +1 −0 | DOMPurify whitelist |
| `js/help-mode.js` | +2 −1 | Help entry for dual mode |
| `CHANGELOG-linux-terminal.md` | — | Updated changelog |
| `public/assets/demos/18_compile_run.webp` | NEW | Demo video |
