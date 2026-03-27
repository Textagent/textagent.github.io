# Chart Bug Fixes — 6 Bugs Resolved

- Fixed: ECharts memory leak — old chart instances never disposed on re-render, causing growing memory usage
- Fixed: `@code` brace-depth tracker desynced on braces inside string literals and comments
- Fixed: `stripTypeScript` regex mangled valid JS (e.g. `{ type: "string" }` had `: "string"` removed)
- Fixed: "Add Series" insert position used fragile `- 2` offset instead of scanning for `}}`
- Fixed: Area-style applied unintentionally to stacked line charts via confusing boolean logic
- Fixed: Block index desync risk when `transformChartMarkdown` re-parsed `fullMatch` substrings

---

## Summary
Fixed 6 bugs in the ECharts `{{Chart:}}` DocGen tag system: a memory leak from undisposed chart instances, brace-depth tracking that ignored strings/comments, TypeScript stripping that could corrupt valid JS object values, a fragile insert offset in the Add Series feature, confusing area-style default logic, and a re-parsing pattern that risked block index desync.

---

## 1. ECharts Memory Leak Fix
**Files:** `js/renderer.js`
**What:** Added `M._activeCharts` array to track all `ec.init()` instances. At the start of each render cycle, old instances are `dispose()`d before creating new ones. All 3 `ec.init()` call sites (async code mode, sync code mode, declarative JSON mode) now push to this array.
**Impact:** Prevents growing memory usage and stale ResizeObserver callbacks during long editing sessions.

## 2. String/Comment-Aware Brace Tracking
**Files:** `js/chart-docgen.js`
**What:** Replaced naive character-by-character `{`/`}` counting with a scanner that skips braces inside `"`, `'`, `` ` `` string literals, `//` line comments, and `/* */` block comments. Applied in both `parseChartBlocks` (existing) and the new `parseConfigFromBody` helper.
**Impact:** Prevents parsing failures when ECharts code contains unbalanced braces in strings like `formatter: "{value}%"`.

## 3. TypeScript Stripping Regex Fix
**Files:** `js/chart-docgen.js`
**What:** Anchored the type annotation removal regex to `let/const/var` declarations with a `(?=\s*=)` lookahead, preventing it from matching `: "string"` in object values like `{ type: "string" }`.
**Impact:** Prevents silent code corruption when ECharts templates contain common JS patterns.

## 4. Robust "Add Series" Insert Position
**Files:** `js/chart-docgen.js`
**What:** Replaced `blocks[idx].end - 2` with `text.lastIndexOf('}}', blocks[idx].end - 1)` plus a safety check ensuring the found position is within the block.
**Impact:** Correctly inserts new series content before `}}` regardless of whitespace or newlines.

## 5. Simplified Area-Style Logic
**Files:** `js/chart-docgen.js`
**What:** Changed `if (cfg.area || (type === 'line' && cfg.area !== false && cfg.stack))` to `if (cfg.area === true)`.
**Impact:** Area fill now only applied when explicitly set via `@area: true`, removing confusing implicit behavior.

## 6. Block Index Desync Prevention
**Files:** `js/chart-docgen.js`
**What:** Extracted `parseConfigFromBody(body)` as a shared helper function. `transformChartMarkdown` now calls this directly on `rb.body` instead of re-parsing `rb.fullMatch` via `parseChartBlocks()`, which could return multiple blocks if `fullMatch` contained nested `{{Chart:}}` references.
**Impact:** Eliminates risk of wrong chart being deleted/modified when documents contain chart documentation.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/chart-docgen.js` | +99 −6 | Bug fixes 1-4, 5-6 |
| `js/renderer.js` | +10 −0 | Memory leak fix (Bug 5) |
