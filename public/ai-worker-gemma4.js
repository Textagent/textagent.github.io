// ============================================
// ai-worker-gemma4.js — Gemma 4 E4B Omni-modal Worker
// Model: textagent/gemma-4-E4B-it-ONNX (mirrors onnx-community/gemma-4-E4B-it-ONNX)
// Supports: text, image, audio (≤30 s), video frames (≤60 frames @ 1 fps)
// ============================================

// Must be v4.0.1+ — Gemma 4 processor support was added in v4 stable
const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.1";

// Use onnx-community (confirmed live). Falls back to textagent mirror when ready.
let MODEL_ID = "onnx-community/gemma-4-E4B-it-ONNX";
const MODEL_ID_FALLBACK = "textagent/gemma-4-E4B-it-ONNX";
let MODEL_LABEL = "Gemma 4 E4B";

// Dynamically imported from transformers.js
// Use Gemma4Processor directly — AutoProcessor fails because preprocessor_config.json
// only has {"processor_class": "Gemma4Processor"} with no image_processor_type key.
let Gemma4ForConditionalGeneration, Gemma4Processor, load_image, read_audio, TextStreamer;

// Runtime state
let model = null;
let processor = null;

// Broadcast the URL immediately so we can verify which version loads
self.postMessage({ type: "status", message: `[Gemma4] Loading transformers.js ${TRANSFORMERS_URL.split('@').pop()}...` });
console.log(`[Gemma4 worker] TRANSFORMERS_URL = ${TRANSFORMERS_URL}`);

// ============================================
// Progress callback factory
// ============================================
function makeProgressCb(label) {
    return (progress) => {
        if (progress.status === "progress") {
            self.postMessage({
                type: "progress",
                file: progress.file || label,
                loaded: progress.loaded || 0,
                total: progress.total || 0,
                progress: progress.progress || 0,
                source: MODEL_ID,
            });
        } else if (progress.status === "initiate") {
            self.postMessage({
                type: "status",
                message: `Loading ${progress.file || label}...`,
                source: MODEL_ID,
                loadingPhase: "initiate",
            });
        } else if (progress.status === "done") {
            self.postMessage({
                type: "status",
                message: `Loaded ${progress.file || label} ✓`,
                source: MODEL_ID,
                loadingPhase: "done",
            });
        }
    };
}

// ============================================
// Load model + processor
// ============================================
async function loadModel() {
    try {
        self.postMessage({ type: "status", message: `Initializing ${MODEL_LABEL}...` });

        // 1. Import transformers.js
        const transformers = await import(TRANSFORMERS_URL);
        Gemma4ForConditionalGeneration = transformers.Gemma4ForConditionalGeneration;
        // Use Gemma4Processor directly — AutoProcessor throws on this model's preprocessor_config
        Gemma4Processor = transformers.Gemma4Processor;
        load_image = transformers.load_image;
        read_audio = transformers.read_audio;
        TextStreamer = transformers.TextStreamer;

        // 2. WebGPU detection
        let device = "wasm";
        if (typeof navigator !== "undefined" && navigator.gpu) {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) device = "webgpu";
        }
        self.postMessage({ type: "status", message: `Using ${device.toUpperCase()} backend...` });

        async function loadFromId() {
            self.postMessage({ type: "status", message: `Loading ${MODEL_LABEL} processor...` });
            processor = await Gemma4Processor.from_pretrained(MODEL_ID, {
                progress_callback: makeProgressCb("processor"),
            });

            self.postMessage({ type: "status", message: `Loading ${MODEL_LABEL} model (${device.toUpperCase()})...` });
            model = await Gemma4ForConditionalGeneration.from_pretrained(MODEL_ID, {
                dtype: "q4f16",
                device: device,
                progress_callback: makeProgressCb("model"),
            });
        }

        // 3. Try onnx-community first, fall back to textagent mirror
        try {
            await loadFromId();
        } catch (primaryErr) {
            console.warn(`Primary model failed: ${primaryErr.message}. Falling back to ${MODEL_ID_FALLBACK}…`);
            self.postMessage({ type: "status", message: `Falling back to textagent mirror…` });
            MODEL_ID = MODEL_ID_FALLBACK;
            processor = null;
            model = null;
            await loadFromId();
        }

        self.postMessage({ type: "loaded", device: device });
    } catch (error) {
        self.postMessage({
            type: "error",
            message: `Failed to load ${MODEL_LABEL}: ${error.message}`,
        });
    }
}

// ============================================
// Task-specific token limits (mirrors Qwen worker)
// Gemma 4 context window: 8192 tokens
// ============================================
const TOKEN_LIMITS = {
    summarize:  2048,
    expand:     4096,
    rephrase:   2048,
    grammar:    2048,
    polish:     2048,
    formalize:  2048,
    elaborate:  4096,
    shorten:    1024,
    autocomplete: 512,
    generate:   8192,
    markdown:   8192,
    explain:    4096,
    simplify:   2048,
    qa:         4096,
    chat:       8192,
    translate:  4096,
    ocr:        2048,
    research:   8192,
};

// ============================================
// Degenerate-output circuit breaker (mirrors Qwen worker)
// Detects repetition loops and stops generation early
// ============================================
const DEGEN_WINDOW = 200;
const DEGEN_CHECK_INTERVAL = 40;
const DEGEN_UNIQUE_RATIO = 0.30;
let _degenTokenCount = 0;
let _degenAborted = false;

function resetDegen() { _degenTokenCount = 0; _degenAborted = false; }

function isDegenerate(text) {
    _degenTokenCount++;
    if (_degenTokenCount % DEGEN_CHECK_INTERVAL !== 0) return false;
    if (text.length < DEGEN_WINDOW) return false;
    const win = text.slice(-DEGEN_WINDOW).toLowerCase();
    const words = win.split(/\s+/).filter(w => w.length > 0);
    if (words.length < 15) return false;
    const ratio = new Set(words).size / words.length;
    if (ratio < DEGEN_UNIQUE_RATIO) {
        console.warn('[Gemma4] Degenerate output detected (ratio=' + ratio.toFixed(2) + '). Aborting.');
        _degenAborted = true;
        return true;
    }
    return false;
}

function trimToLastSentence(text) {
    const match = text.match(/.*[.!?\n](?:\s|$)/s);
    if (match && match[0].trim().length > 50) return match[0].trim();
    const cut = Math.floor(text.length * 0.75);
    const sp = text.lastIndexOf(' ', cut);
    return sp > 50 ? text.substring(0, sp).trim() : text.trim();
}

// ============================================
// Generate — text + image + audio + video frames
// ============================================
async function generate({ userPrompt, prompt, attachments = [], context, chatHistory = [], messageId, enableThinking, taskType, maxTokensOverride, options = {} }) {
    // ai-assistant.js sends `userPrompt`; ai-docgen sends `prompt` — handle both
    const userText = userPrompt || prompt || context || 'Hello!';

    if (!model || !processor) {
        self.postMessage({
            type: 'error',
            message: 'Gemma 4 not loaded yet. Please wait for the model to finish loading.',
            messageId,
        });
        return;
    }

    // ── Dynamic token limit ──────────────────────────────────────────────────
    // Priority: explicit override → taskType map → options.maxTokens → 4096
    let maxTokens = maxTokensOverride
        || TOKEN_LIMITS[taskType]
        || options.maxTokens
        || 4096;
    // Thinking mode needs more headroom
    if (enableThinking) maxTokens = Math.max(maxTokens * 2, 4096);

    try {
        self.postMessage({ type: 'status', message: 'Processing...', messageId });
        resetDegen();

        // ── 1. Build the messages array ──────────────────────────
        // System message so Gemma 4 knows its role
        const messages = [
            {
                role: 'system',
                content: 'You are Gemma, a helpful, accurate, and friendly AI assistant made by Google. You can understand text, images, and audio. Answer clearly and concisely.',
            },
        ];

        // Multi-turn chat history (from ai-assistant chatHistory)
        if (chatHistory && chatHistory.length > 0) {
            for (const turn of chatHistory) {
                if (turn.role && turn.content) {
                    messages.push({ role: turn.role, content: [{ type: 'text', text: turn.content }] });
                }
            }
        }

        // Build current user turn — multimodal tokens MUST come before text
        const userContent = [];
        let loadedImage = null;
        let loadedAudio = null;

        // Images / video frames
        const imageAtts = (attachments || []).filter(a => a.type === 'image');
        const videoFrames = (attachments || []).filter(a => a.type === 'video_frame');
        for (const att of [...imageAtts, ...videoFrames]) {
            let url = att.data;
            if (url && !url.startsWith('data:') && !url.startsWith('http')) {
                url = `data:${att.mimeType || 'image/png'};base64,${url}`;
            }
            userContent.push({ type: 'image' });
            if (!loadedImage) loadedImage = await load_image(url);
        }

        // Audio
        const audioAtts = (attachments || []).filter(a => a.type === 'audio');
        if (audioAtts.length > 0) {
            const att = audioAtts[0];
            let url = att.data;
            if (url && !url.startsWith('data:') && !url.startsWith('http')) {
                url = `data:${att.mimeType || 'audio/wav'};base64,${url}`;
            }
            userContent.push({ type: 'audio' });
            loadedAudio = await read_audio(url, 16000);
        }

        // Text always last
        userContent.push({ type: 'text', text: userText });
        messages.push({ role: 'user', content: userContent });

        // ── 2. Apply chat template → formatted prompt string ──────
        const formattedPrompt = processor.apply_chat_template(messages, {
            enable_thinking: !!enableThinking,
            add_generation_prompt: true,
        });

        // ── 3. Encode inputs ───────────────────────────────────────
        const inputs = await processor(
            formattedPrompt,
            loadedImage || undefined,
            loadedAudio || undefined,
            { add_special_tokens: false }
        );

        // ── 4. Streaming generation ────────────────────────────────
        let fullText = '';
        const streamer = new TextStreamer(processor.tokenizer, {
            skip_prompt: true,
            skip_special_tokens: true,
            callback_function: (token) => {
                if (_degenAborted) return;
                fullText += token;
                if (isDegenerate(fullText)) return;
                self.postMessage({ type: 'token', token, messageId });
            },
        });

        await model.generate({
            ...inputs,
            max_new_tokens: maxTokens,
            do_sample: true,
            temperature: options.temperature || 0.7,
            top_p: options.topP || 0.9,
            streamer,
        });

        // Final cleanup — trim degenerate tail if circuit breaker fired
        let finalText = fullText.trim();
        if (_degenAborted) finalText = trimToLastSentence(finalText);

        self.postMessage({ type: 'complete', text: finalText, messageId });

    } catch (error) {
        self.postMessage({
            type: 'error',
            message: `Gemma 4 generation failed: ${error.message}`,
            messageId,
        });
    }
}

// ============================================
// Message handler
// ============================================
self.addEventListener("message", async (event) => {
    const { type } = event.data;

    switch (type) {
        case "setModelId":
            MODEL_ID = event.data.modelId || MODEL_ID;
            MODEL_LABEL = event.data.modelLabel || MODEL_LABEL;
            break;

        case "load":
            await loadModel();
            break;

        case "generate":
            await generate(event.data);
            break;

        // Compatibility alias used by ai-docgen-generate.js
        case "process":
            await generate({
                prompt: event.data.prompt || event.data.task,
                attachments: event.data.attachments || [],
                context: event.data.context,
                messageId: event.data.messageId,
                options: event.data.options || {},
            });
            break;

        case "ping":
            self.postMessage({ type: "pong" });
            break;

        default:
            console.warn("Gemma4 worker — unknown message type:", type);
    }
});
