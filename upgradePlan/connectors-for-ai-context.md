# Connectors for AI Context — Notion AI-style

Add a **Connectors** system that lets users connect external data sources to enrich AI context — similar to Notion AI connectors (Slack, Google Drive, GitHub, etc.).

TextAgent already has `context-memory.js` with SQLite FTS5 indexing and folder/file attachment. This plan builds on that foundation with **named connector adapters** that fetch, index, and surface external content.

## Design Philosophy

Since TextAgent is 100% client-side with zero-knowledge privacy:
- **No server-side indexing** — all indexing happens in-browser via SQLite/FTS5
- **API keys stored in localStorage** (same pattern as `ai-web-search.js`)
- **Content fetched, chunked, and indexed locally** into the existing memory system
- **Database**: Stay with sql.js + FTS5 (see DB Assessment below)

---

## Connector Registry

| Connector | Icon | Requires Key? | Description |
|-----------|------|--------------|-------------|
| `url` | `bi-link-45deg` | No | Fetch & index any public URL/webpage |
| `rss` | `bi-rss` | No | Index RSS/Atom feed entries |
| `github` | `bi-github` | Yes (PAT) | Index repo files (README, docs, code) |
| `paste` | `bi-clipboard-data` | No | Manually paste text/markdown to index |
| `pageindex` | `bi-file-earmark-text` | Yes (API key) | Vectorless reasoning-based RAG for PDFs via [PageIndex](https://github.com/VectifyAI/PageIndex) |

### Future Connectors (require OAuth)
- Google Drive (Google Picker API)
- Notion (OAuth)
- Slack (OAuth)

---

## PageIndex Integration (VectifyAI)

[PageIndex](https://github.com/VectifyAI/PageIndex) is a **vectorless, reasoning-based RAG** system that replaces similarity search with LLM reasoning over hierarchical document tree indexes. It's ideal for long, complex documents (financial reports, legal filings, technical manuals) where traditional chunking + FTS5 falls short.

### Why PageIndex complements the existing connector approach

| Aspect | Local FTS5 (url, rss, github, paste) | PageIndex |
|--------|--------------------------------------|-----------|
| **Indexing** | Client-side chunking + SQLite FTS5 | Server-side hierarchical tree index |
| **Retrieval** | Keyword/BM25 similarity | LLM reasoning-based tree search |
| **Best for** | Short-to-medium docs, quick lookups | Long professional documents (100+ pages) |
| **Privacy** | 100% local | API call to `api.pageindex.ai` (document uploaded) |
| **Cost** | Free | Requires PageIndex API key (free tier available) |

### Integration approach

PageIndex operates differently from the other connectors — it doesn't feed into the local FTS5 pipeline. Instead:

1. **Upload**: User attaches a PDF via the Connector panel → file is submitted to `pi_client.submit_document()` via REST API
2. **Index**: PageIndex builds a hierarchical tree index (async, poll for completion)
3. **Query**: When AI chat queries fire, the PageIndex Chat API is called alongside local FTS5 search
4. **Response**: PageIndex returns reasoning-traced, page-referenced answers in OpenAI-compatible format

### Adapter — `fetchPageIndex(apiKey, docId, query)`

```js
// REST API calls (no Python SDK needed — direct fetch to api.pageindex.ai)

// Submit document
async function submitToPageIndex(apiKey, pdfBlob, filename) {
  // POST multipart/form-data to PageIndex API
  // Returns { doc_id: "pi-..." }
}

// Check processing status
async function getPageIndexTree(apiKey, docId) {
  // GET document tree structure
  // Returns { status: "completed", result: [...tree nodes...] }
}

// Chat with document (reasoning-based RAG)
async function chatWithPageIndex(apiKey, docId, messages, stream) {
  // POST to chat_completions endpoint
  // OpenAI-compatible response format
  // Supports streaming via SSE
}
```

### DocGen tag support

```
{{AI:
  @connect: pageindex:pi-abc123def456
  @prompt: What are the key financial risks mentioned in this report?
}}
```

### Storage keys
- `API_KEY_PAGEINDEX` — PageIndex API key (from [developer dashboard](https://dash.pageindex.ai))
- `CONNECTOR_PAGEINDEX_DOCS` — JSON map of `{ docId → { filename, status, uploadedAt } }`

### Privacy note
Unlike the local connectors, PageIndex **uploads documents to an external service**. This should trigger:
- A clear consent banner on first use ("Your PDF will be uploaded to pageindex.ai for processing")
- A separate privacy indicator icon on PageIndex-connected sources
- Option to delete documents from PageIndex via `delete_document(doc_id)`

---

## Implementation Scope

### 1. Storage Keys (`storage-keys.js`)
- `CONNECTORS_CONFIG` — JSON blob of enabled connectors and settings
- `API_KEY_GITHUB_PAT` — GitHub Personal Access Token
- `CONNECTOR_SYNC_LOG` — Last sync timestamps per connector

### 2. Connector Engine — `js/connectors.js` (~400 lines)

**Public API** (`M._connectors`):
```js
M._connectors = {
  REGISTRY,                          // Connector type definitions
  getConnectedSources(),             // List active connectors
  connect(type, config),             // Add connector → fetch + index
  disconnect(id),                    // Remove connector + indexed data
  syncAll(),                         // Re-fetch all connectors
  sync(id),                          // Re-fetch one connector
  search(query, connectorIds, max),  // Search across connector indices
  formatForContext(results),         // Format for LLM injection
};
```

**Data flow:**
1. User configures connector (URL, repo, etc.)
2. Adapter fetches content (fetch API, GitHub API)
3. Content chunked via existing `chunkMarkdown`/`chunkPlainText`
4. Chunks indexed into per-connector FTS5 database (IndexedDB)
5. AI queries search across all enabled connectors

**Adapters:**
- `fetchUrl(url)` — fetch + DOMParser to extract text from HTML
- `fetchRss(feedUrl)` — Parse RSS/Atom XML, extract entries
- `fetchGitHub(owner, repo, pat)` — GitHub REST API for repo tree + files
- `pasteText(label, text)` — Directly index user-provided text

### 3. Connector Panel UI (`index.html`)
- Toolbar button: `<button id="connector-toggle"><i class="bi bi-plug"></i></button>`
- Slide-out panel (same architecture as AI panel)
- Cards for each active connector (icon, label, status, sync/delete buttons)
- "+ Add Connector" dropdown for selecting type
- Inline config form per type

### 4. Panel CSS (`styles.css`, ~200 lines)
- `.connector-panel` — Fixed right panel with slide animation
- `.connector-card` — Card per connector
- `.connector-add-modal` — Type selector
- Status indicators (synced, syncing, error)
- Mobile responsive

### 5. AI Chat Integration (`ai-chat.js`)
In `sendChatMessage()`, inject connector context alongside web search:
```js
if (M._connectors) {
  var sources = M._connectors.getConnectedSources();
  if (sources.length > 0) {
    var results = await M._connectors.search(text, sources.map(s => s.id), 5);
    if (results.length > 0) {
      context += '\n\n[Connected Sources]\n' + M._connectors.formatForContext(results);
    }
  }
}
```

### 6. DocGen Tag Integration (`ai-docgen.js`)
Add `@connect:` field parsing:
```
{{AI:
  @connect: github-repo, docs-site
  @prompt: Summarize the API changes
}}
```

---

## DB Assessment (sql.js vs alternatives)

| DB | Size | FTS? | Verdict |
|---|---|---|---|
| **sql.js** (current) | ~300KB | FTS5 ✓ | ✅ Keep — right tool for chunked doc search |
| **PGlite** | ~3–5MB | tsvector | ❌ Overkill — massive bundle, less FTS capability |
| **wa-sqlite** | ~300KB | FTS5 | ✅ Future upgrade — same API, native OPFS |
| **cr-sqlite** | ~400KB | FTS5 | ✅ Future — adds CRDTs for multi-device sync |
| **DuckDB-WASM** | ~8MB | Limited | ❌ Analytics engine, wrong use case |

**Recommendation**: Stay with sql.js + FTS5. If perf upgrade needed, migrate to **wa-sqlite** (same SQL API, native OPFS persistence). If multi-device sync needed, consider **cr-sqlite**.

---

## Privacy Notes

- URL/RSS connectors make fetch requests to external URLs
- GitHub connector sends PAT to `api.github.com`
- Consistent with existing web search feature (calls external APIs)
- Consider adding a consent/warning banner for first-time use
