# LLM Memory Fix & Format Overhaul

## Bug Fix
- Fixed broken LLM Memory data flow caused by modular refactor regression
- `llm-memory.js` used bare globals (`markdownEditor`, `compressData`, `db`, etc.) that are now scoped inside IIFEs
- Prefixed all 8 references with `M.` to access via `window.MDView`
- Exposed `SHARE_BASE_URL` on `M` in `cloud-share.js`

## Format Overhaul
- Replaced 4 generic formats (Standard, System Prompt, OpenAI Instructions, Raw) with 5 useful format-based options:
  - **XML** — Structured tags, ideal for Claude and system prompts
  - **JSON** — Pretty-printed, API-ready
  - **Compact JSON** — Minified with abbreviated keys, ~60% token savings
  - **Markdown** — Clean universal markdown with YAML frontmatter
  - **Plain Text** — No formatting, simple readable text

## Files Changed
- `js/llm-memory.js` — Fixed M. references, new template definitions, JSON generation
- `js/modal-templates.js` — Updated modal buttons (5 format options)
- `js/cloud-share.js` — Exposed SHARE_BASE_URL on M
- `README.md` — Updated export descriptions, release note
- `js/templates/documentation.js` — Updated Feature Showcase template
