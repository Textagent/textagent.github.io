# File Import Format Expansion — 15 New File Types

- Added `.txt` and `.text` plain text file import (loaded directly as text, same as `.md`)
- Added `.log`, `.rst`, `.ini`, `.conf`, `.cfg`, `.env`, `.properties` as plain text file types
- Added `.yaml` / `.yml` import with YAML code block wrapping
- Added `.toml` import with TOML code block wrapping
- Added `.tsv` (tab-separated values) import with Markdown table conversion
- Updated file input `accept` attribute to include all 15 new extensions + MIME types
- Updated dropzone label from "MD, DOCX, XLSX, CSV, HTML, JSON, XML, PDF" to "TXT, MD, DOCX, XLSX, CSV, TSV, HTML, JSON, XML, YAML, TOML, PDF"
- Updated error toast to list all supported formats
- Updated `convertFileToMarkdown()` public API with new TSV/YAML/TOML converters

---

## Summary
Expanded file import support from 10 to 25 file extensions, adding `.txt` and 14 other common text-based formats that were previously rejected with an "Unsupported file format" error.

---

## 1. Plain Text File Import
**Files:** `js/file-converters.js`
**What:** Added `text` type to `SUPPORTED_EXTENSIONS` for `.txt`, `.text`, `.log`, `.rst`, `.ini`, `.conf`, `.cfg`, `.env`, `.properties`. These are routed through `importMarkdownFile()` (reads raw text into editor, no conversion needed).
**Impact:** Users can now drag-and-drop or upload plain text files directly — the most commonly expected file type that was missing.

## 2. YAML / TOML / TSV Converters
**Files:** `js/file-converters.js`
**What:** Added three new converter functions: `convertYamlToMarkdown()` (wraps in ```yaml block), `convertTomlToMarkdown()` (wraps in ```toml block), `convertTsvToMarkdown()` (parses tab-separated rows into Markdown table). All three also added to the `convertFileToMarkdown()` public API used by the Memory indexer.
**Impact:** YAML configs, TOML configs, and TSV data files now import with proper syntax highlighting or table formatting.

## 3. HTML & Accept Attribute Updates
**Files:** `index.html`
**What:** Updated the `#file-input` accept attribute to include `.txt,.text,.log,.rst,.ini,.conf,.cfg,.env,.properties,.tsv,.yaml,.yml,.toml` and corresponding MIME types (`text/plain`, `text/tab-separated-values`, `application/x-yaml`). Updated the dropzone label to show the expanded format list.
**Impact:** File browser dialog now shows all supported file types when clicking "Browse"; dropzone label accurately reflects supported formats.

---

## Files Changed (2 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/file-converters.js` | +43 −4 | New extensions, converters, API |
| `index.html` | +4 −4 | Accept attribute, dropzone label |
