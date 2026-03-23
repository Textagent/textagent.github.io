# Hybrid Semantic Search & File Conversion for Memory Indexer

## Summary

Adds hybrid semantic search to Context Memory (FTS5 keywords + EmbeddingGemma cosine similarity) and integrates the existing file-to-markdown conversion pipeline into the Memory indexer, enabling binary file formats (DOCX, XLSX, Numbers, PDF) to be indexed.

---

## 1. Hybrid Semantic Search
**Files:** `js/context-memory.js`, `public/embedding-worker.js` (new), `js/ai-docgen.js`

**What:**
- EmbeddingGemma 300M ONNX model (`textagent/embeddinggemma-300m-ONNX`) for generating 256-dim text embeddings
- New embedding Web Worker (`public/embedding-worker.js`) with WASM backend (forced; WebGPU has shader issues with SimplifiedLayerNormalization)
- Hybrid search combines FTS5 keyword search (40%) with semantic cosine similarity (60%)
- `memory_embeddings` table stores per-chunk embeddings as JSON float arrays
- 💎 Semantic toggle on Memory card: auto-downloads embedding model (~150MB) when files are attached, serves as status indicator and manual re-embed trigger
- `enableSemanticSearch()`, `disableSemanticSearch()`, `getEmbeddingStatus()`, `reembedSource()` APIs

**Impact:** Queries like "how does authentication work?" now find relevant chunks even if the exact keyword "authentication" isn't present, by understanding semantic meaning.

## 2. File Conversion for Memory Indexer
**Files:** `js/file-converters.js`, `js/context-memory.js`

**What:**
- Exposed `M.convertFileToMarkdown(file)` public API in `file-converters.js` — reuses existing converters (Mammoth.js, SheetJS, PDF.js, Turndown.js, native parsers)
- Added `.numbers` (Apple Numbers) to the supported extensions map → uses SheetJS XLSX converter
- Updated `processDir()` (folder attach) and `attachFiles()` (file picker) in `context-memory.js` to auto-detect binary formats and convert before indexing
- Added `BINARY_EXTS` list: `docx`, `xlsx`, `xls`, `numbers`, `pdf`
- Extended `TEXT_EXTS` list with: `ts`, `tsx`, `jsx`, `log`
- Falls back to raw `file.text()` if conversion returns null

**Impact:** Users can now attach folders containing DOCX, XLSX, Numbers, PDF files and they'll be properly converted to markdown before being chunked and indexed.

## 3. Test Updates
**Files:** `tests/feature/context-memory.spec.js`

**What:**
- Updated `modelSize` assertion from `'23MB'` to `'~150MB'` to match EmbeddingGemma model
- Added new test cases for semantic search functionality

---

## Files Changed

| File | Change |
|------|--------|
| `js/context-memory.js` | Hybrid search, embedding worker management, file conversion integration |
| `js/file-converters.js` | `M.convertFileToMarkdown()` public API, `.numbers` extension |
| `js/ai-docgen.js` | 💎 Semantic toggle button on Memory card, auto-embed on attach |
| `public/embedding-worker.js` | **NEW** — Web Worker for EmbeddingGemma ONNX inference (WASM) |
| `tests/feature/context-memory.spec.js` | Updated model size assertion, semantic search tests |
