# TextAgent — Platform Skill Reference

> **Purpose**: This document describes every capability of the TextAgent platform. Feed this to any LLM to enable it to generate rich, valid TextAgent templates for any user requirement.

---

## 1. What is TextAgent?

TextAgent is a 100% client-side markdown editor with built-in AI, code execution, games, TTS, STT, translation, OCR, and agentic workflows. Everything runs in the browser — no server, no sign-up, zero-knowledge privacy.

Users write markdown in the **Editor** panel and see live-rendered output in the **Preview** panel. Special `{{Tag:}}` syntax creates interactive cards that generate content, run AI, translate text, speak aloud, and more.

---

## 2. DocGen Tags — Interactive AI Cards

All tags follow the syntax `{{@TagType: fields }}`. The `@` prefix is optional. Tags are rendered as interactive cards in the preview panel with ▶ Run buttons. There are **11 tag types**.

### 2.1 `{{AI:}}` — Text Generation

Generates text using an LLM (local or cloud).

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `@model:` | No | Model ID (e.g. `qwen-local`, `gemini-flash`, `groq-llama`) |
| `@prompt:` | Yes | The instruction/question for the AI |
| `@var:` | No | Store the output in a named variable for downstream blocks |
| `@input:` | No | Comma-separated list of variable names to inject as context |
| `@think:` | No | `yes` or `no` — enables two-pass generation with deep reasoning and refinement |
| `@search:` | No | Comma-separated search providers (e.g. `duckduckgo, brave`) |
| `@use:` | No | Comma-separated Memory block names to use as RAG context |
| `@upload:` | No | Reference to uploaded image/PDF for multimodal vision analysis |

**Example — simple:**
```
{{@AI:
  @model: gemini-flash
  @prompt: Explain quantum entanglement in simple terms
}}
```

**Example — with variable chaining:**
```
{{@AI:
  @model: qwen-local
  @var: summary
  @prompt: Summarize the key benefits of renewable energy
}}

{{@AI:
  @model: gemini-flash
  @input: summary
  @prompt: Create a presentation outline based on this summary
}}
```

**Example — with thinking and web search:**
```
{{@AI:
  @model: gemini-flash
  @think: yes
  @search: duckduckgo, brave
  @prompt: What are the latest advances in fusion energy?
}}
```

---

### 2.2 `{{Image:}}` — Image Generation

Generates images using Gemini Imagen or compatible image models.

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `@model:` | No | Image model ID (e.g. `imagen-ultra`) |
| `@prompt:` | Yes | Description of the image to generate |
| `@upload:` | No | Reference image for editing/variation |

**Example:**
```
{{@Image:
  @model: imagen-ultra
  @prompt: A futuristic city skyline at sunset with flying cars
}}
```

---

### 2.3 `{{Agent:}}` — Multi-Step Agentic Pipeline

Chains multiple AI steps sequentially. Each step's output feeds into the next as context. This is the most powerful tag for complex workflows.

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `@model:` | No | Model for all steps |
| `@step N:` | Yes | Step description (N = 1, 2, 3…) |
| `@var:` | No | Store final output in a named variable |
| `@input:` | No | Inject variables from previous blocks |
| `@think:` | No | Enable chain-of-thought for all steps |
| `@search:` | No | Enable web search for the pipeline |
| `@use:` | No | Memory sources for RAG |

**Example:**
```
{{@Agent:
  @model: gemini-flash
  @var: travel_plan
  @search: duckduckgo
  @step 1: Research the top 5 tourist destinations in Japan
  @step 2: Create a 7-day itinerary covering these destinations
  @step 3: Estimate the total budget in USD including flights, hotels, and food
}}
```

---

### 2.4 `{{Memory:}}` — Context Memory / RAG

Creates a named memory store. Users attach files or folders, and the content is chunked with SQLite FTS5 full-text search (heading-aware, ~1500 chars/chunk) for Retrieval-Augmented Generation.

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `@name:` | Yes | Unique identifier for this memory block |

**Storage modes:** browser-only (IndexedDB), disk workspace (`.textagent/memory.db`), external folders (IndexedDB).

**Example:**
```
{{@Memory:
  @name: project-docs
}}

{{@AI:
  @model: gemini-flash
  @use: project-docs
  @prompt: Based on the attached documentation, summarize the API endpoints
}}
```

---

### 2.5 `{{OCR:}}` — Image/PDF to Text

Extracts text, math, or tables from uploaded images or PDFs. Supports PDF page rendering via pdf.js (2x scale, max 3 pages).

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `@model:` | No | Vision model: `granite-docling` (258M) or `florence-2` (230M) |
| `@mode:` | No | `text`, `math`, or `table` |
| `@prompt:` | No | Optional instruction for what to extract |
| `@upload:` | No | Image or PDF to process |

**Example:**
```
{{@OCR:
  @model: granite-docling
  @mode: text
  @prompt: Extract the table data from this invoice
}}
```

---

### 2.6 `{{Translate:}}` — Text Translation

Translates text between languages using an LLM with integrated TTS pronunciation.

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `@model:` | No | Model for translation |
| `@lang:` | No | Target language (default: Japanese). Supported: Japanese, Korean, Chinese, French, German, Italian, Spanish, Portuguese, Hindi, English |
| `@prompt:` | Yes | Text to translate |
| `@var:` | No | Store translation in a variable |
| `@input:` | No | Inject variables as text to translate |

**Example:**
```
{{@Translate:
  @model: gemini-flash
  @lang: Japanese
  @prompt: Hello, how are you today?
}}
```

**Example — chained from AI output:**
```
{{@AI:
  @var: story
  @prompt: Write a short fairy tale about a brave rabbit
}}

{{@Translate:
  @model: gemini-flash
  @input: story
  @lang: French
  @prompt: Translate the story
}}
```

---

### 2.7 `{{TTS:}}` — Text-to-Speech

Converts text to audio using Kokoro TTS (82M, in-browser via ONNX WebWorker, ~80 MB). Korean, German & others fall back to Web Speech API. Cards have separate buttons: ▶ Run (generate), ▷ Play (replay), 💾 Save (download WAV).

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `@model:` | No | TTS model (default: `kokoro-tts`) |
| `@lang:` | No | Voice language. Supported: English, English (US), English (UK), Chinese (Mandarin), Japanese, Korean, French, German, Italian, Spanish, Portuguese, Hindi |
| `@prompt:` | Yes | Text to speak |
| `@var:` | No | Store reference |
| `@input:` | No | Inject variable text to speak |

**Example:**
```
{{@TTS:
  @model: kokoro-tts
  @lang: English
  @prompt: Welcome to TextAgent, your private AI writing assistant
}}
```

**Example — speak a translation:**
```
{{@Translate:
  @var: japanese_text
  @lang: Japanese
  @prompt: Good morning, the weather is beautiful today
}}

{{@TTS:
  @model: kokoro-tts
  @input: japanese_text
  @lang: Japanese
  @prompt: Speak the translated text
}}
```

---

### 2.8 `{{STT:}}` — Speech-to-Text

Records audio from the microphone and transcribes it. Three engines available. 11 languages. Record/Stop/Insert/Clear buttons in preview card.

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `@model:` | No | STT model (e.g. `voxtral-stt`) |
| `@engine:` | No | `voxtral` (WebGPU, 3B, primary), `whisper` (WASM, 800MB), or `webspeech` (browser API) |
| `@lang:` | No | Language code (e.g. `en-US`, `ja-JP`, `ko-KR`) |
| `@var:` | No | Store transcription in a variable |

**Example:**
```
{{@STT:
  @model: voxtral-stt
  @lang: en-US
}}
```

---

### 2.9 `{{Game:}}` — Game Builder

Creates playable HTML games — either pre-built or AI-generated. Supports Import (paste/upload HTML), Export (standalone HTML), and fullscreen mode.

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `@engine:` | No | `canvas2d`, `threejs`, or `p5js` (default: threejs) |
| `@model:` | No | AI model for generation |
| `@prebuilt:` | No | Pre-built game: `chess`, `snake`, `shooter`, `pong`, `breakout`, `maths` |
| `@prompt:` | No | Game description for AI generation |

**Example — pre-built game:**
```
{{@Game: @engine: canvas2d @prebuilt: chess @prompt: Chess game}}
```

**Example — AI-generated game:**
```
{{@Game:
  @engine: threejs
  @model: gemini-flash
  @prompt: Build a 3D maze runner game where the player navigates through procedurally generated corridors
}}
```

---

### 2.10 `{{API:}}` — REST API Calls

Makes HTTP requests directly from the document. Toolbar buttons available for GET and POST.

**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `URL:` | Yes | The endpoint URL |
| `Method:` | No | HTTP method: `GET` or `POST` (default: GET) |
| `Headers:` | No | Comma-separated header pairs (e.g. `Content-Type: application/json`) |
| `Body:` | No | Request body (for POST) |
| `Variable:` | No | Store response in a variable accessible as `$(api_<name>)` |

> Note: The API tag uses different field syntax (no `@` prefix): `URL:`, `Method:`, `Headers:`, `Body:`, `Variable:`.

**Example — GET:**
```
{{API:
  URL: https://httpbin.org/get
  Method: GET
  Variable: myResponse
}}
```

**Example — POST with body:**
```
{{API:
  URL: https://httpbin.org/post
  Method: POST
  Headers: Content-Type: application/json
  Body: {"message": "Hello from TextAgent"}
  Variable: postResult
}}
```

---

### 2.11 `{{Linux:}}` — Linux Terminal & Compiled Code

Two modes: **Terminal Mode** opens a full Debian Linux (WebVM) in a new window, **Script Mode** compiles and runs code via Judge0 CE API.

> Note: The Linux tag uses different field syntax (no `@` prefix): `Packages:`, `Language:`, `Script:`, `Stdin:`.

#### Terminal Mode — Launch WebVM
```
{{Linux:
  Packages: curl, vim, htop
}}
```

#### Script Mode — Compile & Run (20+ Languages)
**Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `Language:` | Yes | Language identifier (see supported list below) |
| `Script:` | Yes | Source code (use `|` for multi-line) |
| `Stdin:` | No | Standard input for the program |

**Supported compiled languages:** C, C++, Rust, Go, Java, Python, TypeScript, JavaScript, Ruby, Swift, Kotlin, Haskell, Lua, Perl, PHP, R, Bash, C#, Dart, Scala

**Example — C++:**
```
{{Linux:
  Language: cpp
  Script: |
    #include <iostream>
    int main() {
        std::cout << "Hello from C++!" << std::endl;
        return 0;
    }
}}
```

**Example — Rust:**
```
{{Linux:
  Language: rust
  Script: |
    fn main() {
        println!("Hello from Rust!");
    }
}}
```

**Example — Go:**
```
{{Linux:
  Language: go
  Script: |
    package main
    import "fmt"
    func main() {
        fmt.Println("Hello from Go!")
    }
}}
```

---

## 3. Executable Code Blocks

Standard markdown code blocks with supported language identifiers get a ▶ Run button automatically. These are **in-browser sandboxed** environments (not the same as `{{Linux:}}` compiled code).

### Supported Languages

| Language | Syntax | Engine | Capabilities |
|----------|--------|--------|-------------|
| Python | ` ```python ` | Pyodide (WASM) | Data science, matplotlib plots, pandas, numpy, any pure Python |
| SQL | ` ```sql ` | sql.js (SQLite WASM) | In-memory database, tables persist across blocks, shared context store |
| Bash | ` ```bash ` | just-bash (VFS) | Unix commands, file manipulation in virtual filesystem |
| JavaScript | ` ```javascript ` | iframe sandbox | DOM manipulation, UI experiments. Document variables auto-injected as JS variables |
| HTML | ` ```html ` | iframe injection | Interactive widgets, visualizations. Use `html-autorun` to auto-execute and hide source |
| Math | ` ```math ` | Nerdamer | Symbolic algebra, calculus, equation solving |
| LaTeX | `$$...$$` | MathJax + Nerdamer | LaTeX expressions with evaluation |

### Code Block Examples

**Python with matplotlib:**
````
```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)
plt.plot(x, y)
plt.title('Sine Wave')
plt.show()
```
````

**SQL — create and query:**
````
```sql
CREATE TABLE IF NOT EXISTS students (name TEXT, grade INTEGER);
INSERT INTO students VALUES ('Alice', 95), ('Bob', 87), ('Carol', 92);
SELECT name, grade FROM students ORDER BY grade DESC;
```
````

**Interactive HTML widget (auto-run, hides source):**
````
```html-autorun
<div style="text-align:center; padding:20px;">
  <h2 id="counter">0</h2>
  <button onclick="document.getElementById('counter').textContent = parseInt(document.getElementById('counter').textContent) + 1">
    Click Me
  </button>
</div>
```
````

---

## 4. Variable System

Variables enable data flow between blocks, user customization, and cross-block pipelines. The system has **two layers**: manual variables (from `<!-- @variables -->` table) and runtime variables (from `@var:` outputs, API responses). Manual variables take priority over runtime.

### 4.1 Global Variables (Auto-resolved)

| Token | Value |
|-------|-------|
| `$(date)` | Current date (YYYY-MM-DD) |
| `$(time)` | Current time (HH:MM) |
| `$(year)` | Current year |
| `$(month)` | Current month name |
| `$(day)` | Current day name |
| `$(timestamp)` | ISO timestamp |
| `$(uuid)` | Random UUID |

### 4.2 User-Defined Variables (`<!-- @variables -->`)

Define custom variables anywhere in the document using `$(variableName)` syntax. Click the **⚡ Vars** button to:
1. Auto-detect all `$(varName)` patterns in the document
2. Generate a `<!-- @variables -->` table at the top
3. User fills in values in the table
4. Click ⚡ Vars again to apply — all `$(varName)` tokens are replaced with table values

**Example:**
```markdown
<!-- @variables -->
| Variable | Value | Description |
|----------|-------|-------------|
| company_name | Acme Inc | Company name |
| author | John Doe | Report author |
| revenue | $10M | Annual revenue |
<!-- @/variables -->

# Report for $(company_name)

Date: $(date)
Prepared by: $(author)

## Executive Summary
$(company_name) achieved $(revenue) in annual revenue...
```

### 4.3 Block-to-Block Variable Chaining

Use `@var:` on any AI/Agent/Translate/TTS/STT tag to name its output. Use `@input:` on a later block to inject that variable as context. This creates **multi-block pipelines**.

How it works:
1. `@var: myName` → stores the block's output as a **runtime variable** named `myName`
2. `@input: myName` → retrieves the variable and injects it into the AI prompt context
3. Variables are passed with `### DOCUMENT VARIABLES ###` header, truncated to ~2000 chars per var, ~6000 chars total

```markdown
{{@AI:
  @var: research
  @prompt: List the top 5 programming languages in 2025
}}

{{@AI:
  @input: research
  @var: analysis
  @prompt: For each language listed, explain its main use case
}}

{{@Translate:
  @input: analysis
  @lang: Japanese
  @prompt: Translate the analysis
}}

{{@TTS:
  @input: analysis
  @lang: English
  @prompt: Read the analysis aloud
}}
```

### 4.4 Variables in Code Blocks

All document variables (both manual and runtime) are automatically injected into **JavaScript** code blocks as pre-declared JS variables. JSON values are auto-parsed. This allows code blocks to process AI/API outputs.

```javascript
// If $(api_weather) contains '{"temp": 72, "city": "Tokyo"}'
// It's automatically available as:
console.log(api_weather.temp);  // 72
console.log(api_weather.city);  // "Tokyo"
```

### 4.5 API Response Variables

API tag responses are stored with the `api_` prefix. If `Variable: myData` is set, the response is accessible as `$(api_myData)` throughout the document, in AI prompts (via `@input: api_myData`), and in code blocks.

### 4.6 Variables Panel

Click the **{•} Vars** toolbar button to open the Document Variables Panel:
- **Document Vars** — manually set variables from the `@variables` table
- **Runtime Vars** — outputs from `@var:`, API responses
- **Pending Vars** — declared `@var:` names on blocks that haven't run yet
- **Variable Flow graph** — shows producer → consumer relationships between blocks
- Right-click selected text in editor or press `Cmd+Shift+V` to assign text to a variable

---

## 5. Media Embedding

### Video Playback
Use markdown image syntax with video extensions: `.mp4`, `.webm`, `.ogg`, `.mov`, `.m4v`
```markdown
![Demo video](video.mp4)
```
YouTube and Vimeo URLs are auto-detected and rendered as embedded players.

### Embed Grid
Use the `embed` code block for responsive media grids:
````
```embed
cols=2
height=300
https://youtube.com/watch?v=example1
https://youtube.com/watch?v=example2
https://example.com
```
````
Website URLs render as rich link preview cards with favicon and "Open ↗" button.

---

## 6. Run All — Notebook Engine

The **▶ Run All** button executes every code block and tag in document order, creating a notebook-like experience.

**Features:**
- **Preflight dialog** — shows a block table with type, model, and status before execution
- **Pre-execution model loading** — auto-loads all required AI + TTS models before blocks run
- **Progress bar** — fixed-bottom bar with per-block status badges (pending/running/done/error)
- **Abort** — Stop button works even during model loading
- **SQLite context store** — cross-block data sharing via `_exec_results` table
- **11 runtime adapters** — bash, math, python, html, js, sql, docgen-ai, docgen-image, docgen-agent, api, linux-script

---

## 7. Web Search Integration

AI blocks can fetch fresh data from the web. Enable via `@search:` field. Multiple providers can be activated simultaneously — results are fetched in parallel, deduplicated, and merged.

### Available Providers

| Provider | ID | Cost | Notes |
|----------|-----|------|-------|
| DuckDuckGo | `duckduckgo` | Free | No API key needed |
| Brave Search | `brave` | Free tier (2,000/mo) | API key required |
| Serper.dev | `serper` | Free tier (2,500) | Google results via API |
| Tavily | `tavily` | Free tier (1,000/mo) | AI-optimized search |
| Google CSE | `google_cse` | Free (100/day) | Custom Search Engine |
| Wikipedia | `wikipedia` | Free | Encyclopedia lookup |
| Wikidata | `wikidata` | Free | Structured data |

**Usage:** `@search: duckduckgo, wikipedia`

---

## 8. File Import/Conversion

TextAgent can import and convert these file formats to markdown (all client-side):

| Format | Library | Notes |
|--------|---------|-------|
| DOCX | Mammoth.js + Turndown.js | Preserves formatting, tables, images |
| XLSX/XLS | SheetJS | Multi-sheet support |
| CSV | Native parser | Auto-detection of delimiters |
| HTML | Turndown.js | Extracts body content |
| PDF | pdf.js | Page-by-page text extraction |
| JSON | Native | Pretty-printed code block |
| XML | DOMParser | Formatted code block |

---

## 9. Interactive Tables

Any markdown table rendered in preview gets a floating toolbar with:
- **Sort** — Alphabetical/numerical column sorting
- **Filter** — Row filtering by criteria
- **Search** — Full-text search across cells
- **Σ Stats** — Count, Sum, Average, Min, Max
- **Chart** — Canvas-based bar chart generation
- **Add Row/Col** — Structural editing
- **Inline Cell Edit** — Double-click any cell to edit
- **Export** — Copy as CSV or Markdown, download CSV

---

## 10. Export Options

| Format | Details |
|--------|---------|
| Markdown (.md) | Raw markdown with timestamped filename |
| HTML | Self-contained styled HTML with all CSS inlined |
| PDF | Smart page-break detection, graphic scaling |
| LLM Memory | 5 formats: XML, JSON, Compact JSON (~60% token savings), Markdown, Plain Text — with live token count and shareable encrypted link |

---

## 11. Presentations

Use `---` horizontal rules to separate slides. The Preview panel has a **Slideshow** mode with:
- Multiple layouts (title, section, two-column, image)
- Transitions and speaker notes
- Overview grid
- 20+ PPT templates with image backgrounds
- Keyboard navigation

---

## 12. Encrypted Sharing

AES-256-GCM encrypted sharing via Firebase:
- **Quick Share** — key in URL fragment (never sent to server)
- **Secure Share** — custom passphrase (8-char minimum) required to decrypt
- Read-only shared links with "Edit Copy" for local fork
- Email to Self — send document to inbox with share link + `.md` file attached

---

## 13. Template Composition Patterns

### Pattern A: Zero-Input Pipeline (fully automated)
```markdown
{{@AI:
  @var: content
  @prompt: Write a haiku about the ocean
}}

{{@Translate:
  @input: content
  @var: translated
  @lang: Japanese
  @prompt: Translate the haiku
}}

{{@TTS:
  @input: translated
  @lang: Japanese
  @prompt: Speak the Japanese haiku
}}
```

### Pattern B: User-Parameterized (variables + AI)
```markdown
<!-- @variables -->
| Variable | Value | Description |
|----------|-------|-------------|
| topic | artificial intelligence | Topic to write about |
| audience | beginners | Target audience |
| format | blog post | Output format |
<!-- @/variables -->

{{@Agent:
  @model: gemini-flash
  @step 1: Research $(topic) for $(audience)
  @step 2: Write a $(format) explaining the key concepts
  @step 3: Add practical examples and a conclusion
}}
```

### Pattern C: Multi-Modal (AI + Code + Game)
```markdown
# 🎮 $(game_name) Builder

{{@AI:
  @var: game_design
  @prompt: Design a game concept for: $(game_description)
}}

{{@Game:
  @engine: canvas2d
  @model: gemini-flash
  @prompt: $(game_description)
}}
```

### Pattern D: Language Learning
```markdown
# Learn $(target_language)

{{@AI:
  @var: lesson
  @prompt: Create a beginner $(target_language) lesson with 10 common phrases
}}

{{@Translate:
  @input: lesson
  @lang: $(target_language)
  @var: translated_lesson
  @prompt: Show each phrase with its translation
}}

{{@TTS:
  @input: translated_lesson
  @lang: $(target_language)
  @prompt: Pronounce each phrase clearly
}}
```

### Pattern E: Research + Analysis with Code
```markdown
{{@Agent:
  @model: gemini-flash
  @search: duckduckgo, wikipedia
  @var: research
  @step 1: Research $(research_topic) using web search
  @step 2: Analyze the findings and identify key themes
  @step 3: Create a summary table comparing the main points
}}

```python
# Process the research data
data = """$(research)"""
words = data.split()
print(f"Word count: {len(words)}")
print(f"Unique words: {len(set(words))}")
```
```

### Pattern F: API Data Pipeline
```markdown
{{API:
  URL: https://api.example.com/data
  Method: GET
  Variable: rawData
}}

{{@AI:
  @input: api_rawData
  @var: analysis
  @prompt: Analyze this API response and create a summary table
}}

```javascript
// Process the data in JavaScript
console.log("Data length:", api_rawData.length);
```
```

### Pattern G: Finance Dashboard
```markdown
<!-- @variables -->
| Variable | Value | Description |
|----------|-------|-------------|
| cname1 | AAPL | Stock ticker 1 |
| cname2 | MSFT | Stock ticker 2 |
| cname3 | GOOGL | Stock ticker 3 |
| chartRange | 12 | Chart range in months |
<!-- @/variables -->

```javascript
// Generate stock grid from variables
var tickers = [$(cname1), $(cname2), $(cname3)];
// ... builds TradingView chart widgets
```
```

---

## 14. Available AI Models

| Model | Type | Size | Provider |
|-------|------|------|----------|
| Qwen 3.5 Small (0.8B) | 🔒 Local (WebGPU/WASM) | ~500 MB | textagent HF org |
| Qwen 3.5 Medium (2B) | 🔒 Local (WebGPU/WASM) | ~1.2 GB | textagent HF org |
| Qwen 3.5 Large (4B) | 🔒 Local (WebGPU/WASM) | ~2.5 GB | textagent HF org |
| Gemini 3.1 Flash Lite | ☁️ Cloud (free tier) | — | Google |
| Llama 3.3 70B | ☁️ Cloud (free tier) | — | Groq |
| Auto · Best Free | ☁️ Cloud (free tier) | — | OpenRouter |
| Kokoro TTS (82M) | 🔒 Local (WebWorker/ONNX) | ~80 MB | textagent HF org |
| Voxtral Mini 3B | 🔒 Local (WebGPU) | ~2.7 GB | textagent HF org |
| Whisper V3 Turbo | 🔒 Local (WASM) | ~800 MB | textagent HF org |
| Granite Docling (258M) | 🔒 Local (WebGPU/WASM) | ~500 MB | textagent HF org |
| Florence-2 (230M) | 🔒 Local (WebGPU/WASM) | ~230 MB | textagent HF org |
| Imagen Ultra | ☁️ Cloud | — | Google Gemini |

---

## 15. Template File Structure

Templates are JavaScript files in `js/templates/` that register arrays on `window.__MDV_TEMPLATES_<CATEGORY>`.

```javascript
window.__MDV_TEMPLATES_MYCATEGORY = [
  {
    name: 'Template Display Name',
    category: 'mycategory',
    icon: 'bi-icon-name',        // Bootstrap icon class
    description: 'Short description shown in template browser',
    variables: [                   // Optional: auto-generates @variables table
      { name: 'topic', value: 'AI', desc: 'Topic to write about' }
    ],
    content: `# Template Content Here

Normal markdown with {{@AI:}} tags, code blocks, $(variables), etc.
`
  }
];
```

**13 Categories:** `agents`, `ai`, `coding`, `creative`, `documentation`, `finance`, `games`, `maths`, `ppt`, `project`, `quiz`, `tables`, `technical`

**109+ templates** covering: AI business proposals, agent pipelines, coding playgrounds (Python/JS/SQL/Bash/HTML), language-specific compiled code (C++/Rust/Go/Java/Kotlin/Scala), game collections, finance dashboards, interactive quizzes, presentation decks, and more.
