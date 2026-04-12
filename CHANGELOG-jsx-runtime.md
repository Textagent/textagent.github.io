# React JSX Live Runtime — Interactive React Components in Markdown

- Added `exec-jsx.js` — full React JSX runtime with Babel standalone transpilation, sandboxed iframe rendering, and auto-detected CDN library injection
- Added `⚛ React JSX Live` button to the Coding toolbar dropdown (between HTML Live and JS)
- Auto-detects and loads 12+ libraries from CDN: Recharts, Tailwind CSS, Lucide React, Framer Motion, Lodash, date-fns, dayjs, PapaParse, UUID, clsx, Chart.js, Google Fonts
- `jsx-autorun` blocks auto-render on page load (same pattern as `html-autorun`) with source code hidden
- `jsx` blocks show source with manual ▶ Run button
- Toolbar badge shows "⚛ React JSX" for JSX blocks
- Support for `export default function App()` component detection and first PascalCase function fallback
- Load File button on JSX blocks to import `.jsx` files from disk
- Added Help Mode documentation for React JSX Live with 3 FAQ examples (counter, Recharts chart, Tailwind styling)
- Updated Code Block and Run All help descriptions to mention JSX (7 languages now)
- Fixed: `exports is not defined` runtime error — moved import/export stripping to before Babel transpilation to prevent `env` preset from generating CommonJS references
- Added 20 Playwright tests covering module lifecycle, block detection, rendering, interactive state, library auto-detection, complex components, and Run All pipeline

---

## Summary

Added a complete React JSX runtime to TextAgent, enabling users to write interactive React components directly in markdown code blocks. Components are transpiled via `@babel/standalone`, rendered in sandboxed iframes with React 18 from CDN, and automatically detect required libraries (Recharts, Tailwind, etc.) for injection. A critical bug where Babel's `env` preset generated CommonJS `exports` references was fixed by pre-processing import/export statements before transpilation.

---

## 1. React JSX Runtime Engine
**Files:** `js/exec-jsx.js`
**What:** New 658-line module implementing the full JSX execution pipeline: Babel lazy-loading, JSX→JS transpilation with `['env', { modules: false }], 'react'` presets, import/export pre-processing (strips ES module syntax before Babel sees it), auto-detection of 12+ libraries via `LIB_REGISTRY` regex patterns, CDN script/link injection into sandboxed `srcdoc` iframes, component detection via PascalCase function matching, toolbar with Run/Load File/language badge, and autorun support.
**Impact:** Users can write `jsx-autorun` blocks with `import { useState } from "react"` and `export default function App()` and see interactive React components rendered live in the preview. Complex dashboards with state, filtering, sorting, and charts work out of the box.

## 2. Toolbar Integration
**Files:** `index.html`, `js/coding-blocks.js`
**What:** Added `⚛ React JSX Live` button to the coding dropdown in `index.html` (between HTML Live and JS). Template in `coding-blocks.js` inserts a `jsx-autorun` block with a `useState` counter component.
**Impact:** One-click insertion of JSX blocks from the toolbar with a ready-to-run template.

## 3. Renderer & Execution Pipeline
**Files:** `js/renderer.js`, `js/exec-registry.js`, `js/exec-controller.js`, `src/main.js`
**What:** Added JSX block detection in `renderer.js` (lines 70-74) with `data-autorun` attribute for `jsx-autorun`; registered `jsx` and `jsx-autorun` language mappings in `exec-registry.js`; added JSX container CSS class in `exec-controller.js`; lazy-loaded `exec-jsx.js` in `main.js` Phase 3b.
**Impact:** JSX blocks are fully integrated into the execution pipeline — they render in preview, execute via Run All, and support the same toolbar/autorun patterns as HTML blocks.

## 4. Help Mode Documentation
**Files:** `js/help-mode.js`
**What:** Added `[data-action="coding-jsx"]` help entry with description, 3 FAQ examples (counter, Recharts chart, Tailwind), and updated Code Block/Run All descriptions from "6 languages" to "7 languages".
**Impact:** Users can discover JSX capabilities via Help Mode with copy-pasteable examples.

## 5. Bug Fix: `exports is not defined`
**Files:** `js/exec-jsx.js`
**What:** Moved import/export stripping from post-transpilation to pre-transpilation. Previously, `export default function App()` was passed to Babel which transformed it to `Object.defineProperty(exports, ...)` — but `exports` doesn't exist in browser iframes. Now imports/exports are stripped before Babel sees them, so Babel only processes plain function declarations and JSX.
**Impact:** All JSX components with `export default` now render correctly instead of throwing "exports is not defined" at runtime.

## 6. Automated Test Suite
**Files:** `tests/feature/exec-jsx.spec.js`
**What:** 528-line Playwright test suite with 20 tests covering: module loading (2), block detection (4), toolbar badge (1), rendering (4), interactive state (1), library auto-detection (4), complex components (2), and Run All pipeline (2).
**Impact:** Comprehensive regression coverage for the JSX runtime. All 20 tests pass.

---

## Files Changed (9 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/exec-jsx.js` | +658 | New JSX runtime engine |
| `tests/feature/exec-jsx.spec.js` | +528 | New Playwright test suite |
| `index.html` | +2 | JSX button in toolbar dropdown |
| `js/coding-blocks.js` | +1 −1 | JSX template already existed |
| `js/renderer.js` | +10 −1 | JSX block detection in renderer |
| `js/exec-registry.js` | +3 −1 | jsx/jsx-autorun language mapping |
| `js/exec-controller.js` | +1 | JSX container CSS class |
| `js/help-mode.js` | +15 −2 | Help docs + FAQ examples |
| `src/main.js` | +1 | Lazy-load exec-jsx.js |
