# CHANGELOG — Agent Flow & Web Search

## New Features

### Agent Flow (`{{Agent:}}` tag)
- **New AI tag type**: `{{Agent:}}` for multi-step pipelines
- Steps defined inline: `Step 1: ...`, `Step 2: ...`, etc.
- Sequential execution — each step's output chains into the next as context
- Pipeline card rendering with numbered steps and connecting arrows (↓)
- Live status indicators: ⏳ running, ✅ done, ❌ error
- Per-card model selector and search provider dropdown
- Combined output review with Accept/Reject/Regenerate

### Web Search for AI
- New `ai-web-search.js` module with 3 providers:
  - DuckDuckGo (free, no API key)
  - Brave Search (API key, free tier 2,000/month)
  - Serper.dev (API key, free tier 2,500 queries)
- Toggle search on/off in AI panel header
- Search results injected into LLM context
- Source citation links displayed below AI responses
- Per-agent-card search provider selector dropdown
- Auto-prompted API key dialog when selecting Brave/Serper without a key

## Files Modified
- `js/ai-docgen.js` — Agent tag parsing, pipeline card rendering, generateAgentFlow(), search provider change handler with API key prompt
- `js/ai-web-search.js` — New module: search providers, performSearch() with provider override support, result formatting
- `css/ai-docgen.css` — Agent pipeline card styles, search provider dropdown styles, card overflow fix
- `js/modal-templates.js` — Search toggle UI in AI panel header
- `css/ai-panel.css` — Search bar styling

## Documentation
- `README.md` — Features table, new demo section, release notes
- `js/help-mode.js` — Agent tag help entry with demo mapping
- `js/templates/documentation.js` — Feature Showcase updated with Agent Flow and Web Search sections
- `public/assets/demos/17_agent_flow.webp` — Demo video
