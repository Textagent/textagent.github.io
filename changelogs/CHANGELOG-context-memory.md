# Context Memory — SQLite FTS5 Workspace Intelligence

- New `js/context-memory.js` module: SQLite FTS5-powered search engine for local context
- Heading-aware chunking (H1/H2/H3 hierarchy, ~1500 char max per chunk)
- Three storage modes: browser-only (IndexedDB blob), disk workspace (`.textagent/memory.db`), external memory (IndexedDB blob keyed by name)
- Incremental indexing: tracks file modification times, re-indexes only changed files
- Reuses existing `sql.js` WASM from `exec-sandbox.js` — no new bundle size increase
- `{{Memory: Name: my-docs}}` tag for defining external context sources
- `Use: workspace, my-docs` field in AI/Think/Agent tags for multi-source context retrieval
- **Auto-discovery**: AI/Think/Agent tags automatically detect `{{Memory:}}` tags in the same document — no `Use:` field required
- **`Use: none` opt-out**: explicitly disables memory for a specific AI/Agent block even when Memory tags exist
- 📚 Memory toolbar button in AI Tags overflow dropdown (`index.html`)
- Memory card renders with amber/orange accent: 📂 Folder, 📄 Files, 🔄 Rebuild buttons + stats display
- Use: hint badge on AI/Think/Agent cards shows active memory sources
- Context injection: memory search results injected into `buildPrompt()`, `generateAndReview()`, and `generateAgentFlow()` per-step
- `discoverMemorySources()` helper scans editor for `{{Memory:}}` tags at generation time
- **📚 Memory Selector dropdown** on every AI/Think/Agent card for visual multi-select
- `listAllSources(docNames)` API: combines workspace + document tags + IndexedDB externals
- Checkbox selection auto-syncs to editor `Use:` field + hint badge
- Quick-attach 📂 Folder / 📄 Files directly from card (auto-names, no prompt dialog)
- Origin badges: `doc` for document tags, `saved` for IndexedDB sources
- 135 lines of dropdown CSS with dark/light theme support
- 30 Playwright tests covering module API, tag parsing, card rendering, toolbar insertion, DOMPurify allowlist

---

## Summary
Added `{{Memory:}}` tag and `Use:` field for workspace intelligence. AI tags can now leverage indexed local context from workspace files or external folders via SQLite FTS5 full-text search. Three persistence modes ensure memory survives page reloads. Reuses existing sql.js — zero additional bundle size.

---

## Files Changed (9 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/context-memory.js` | +447 | New module: FTS5 engine, chunking, 3 storage modes |
| `js/exec-sandbox.js` | +4 | Expose `getSqlJs` on `M._exec` |
| `js/ai-docgen.js` | +95 −10 | Memory tag parsing, Use: field, Memory card HTML, bindings |
| `js/ai-docgen-generate.js` | +35 −3 | Memory context injection into prompts |
| `js/renderer.js` | +1 −1 | DOMPurify: allow `data-memory-name`, `data-step` |
| `js/storage-keys.js` | +3 | `MEMORY_DB` key |
| `src/main.js` | +3 | Import `context-memory.js` in Phase 3b-ext |
| `css/ai-docgen.css` | +90 | Amber Memory card styles, Use: badge |
| `tests/feature/context-memory.spec.js` | +340 | 30 Playwright tests |
