/**
 * AI Worker — Granite Docling 258M (IBM) — Document OCR
 *
 * Converts document images to structured Markdown/HTML using
 * IBM's Granite Docling vision-language model via Transformers.js.
 *
 * Uses AutoModelForVision2Seq + AutoProcessor from Transformers.js.
 * Supports WebGPU acceleration.
 *
 * Message interface:
 *   setModelId  → configure model ID before loading
 *   load        → download and initialise model
 *   process     → run document OCR on an image
 *   ping/pong   → health check
 */

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.0-next.6";

// Model host — downloads ONNX models from textagent HuggingFace org
const MODEL_ORG_FALLBACK = "onnx-community";

// Model config
let MODEL_ID = "textagent/granite-docling-258M-ONNX";
let MODEL_LABEL = "Granite Docling 258M";

// Dynamically loaded modules
let AutoProcessor = null;
let AutoModelForVision2Seq = null;
let load_image = null;
let TextStreamer = null;

// Runtime state
let processor = null;
let model = null;
let device = "wasm"; // will upgrade to webgpu if available

/**
 * Initialize the model: load processor + model
 */
async function loadModel() {
    try {
        // 1. Import Transformers.js
        if (!AutoProcessor) {
            self.postMessage({ type: "status", message: "Loading AI libraries..." });
            try {
                const transformers = await import(TRANSFORMERS_URL);
                AutoProcessor = transformers.AutoProcessor;
                AutoModelForVision2Seq = transformers.AutoModelForVision2Seq;
                load_image = transformers.load_image;
                TextStreamer = transformers.TextStreamer;
            } catch (importError) {
                self.postMessage({
                    type: "error",
                    message: `Failed to load AI libraries: ${importError.message}`,
                });
                return;
            }
        }

        // 2. Check WebGPU
        if (typeof navigator !== "undefined" && navigator.gpu) {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) device = "webgpu";
        }

        // Progress callback factory
        const progressCb = (label) => (progress) => {
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

        // Helper: load processor + model from current MODEL_ID
        async function loadFromHost() {
            self.postMessage({ type: "status", message: `Loading ${MODEL_LABEL} processor...` });
            processor = await AutoProcessor.from_pretrained(MODEL_ID, {
                progress_callback: progressCb("processor"),
            });

            self.postMessage({ type: "status", message: `Loading ${MODEL_LABEL} model (${device.toUpperCase()})...` });
            model = await AutoModelForVision2Seq.from_pretrained(MODEL_ID, {
                dtype: {
                    embed_tokens: "fp16",
                    vision_encoder: "fp32",
                    decoder_model_merged: "fp32",
                },
                device: device,
                progress_callback: progressCb("model"),
            });
        }

        // 3. Load with fallback
        try {
            await loadFromHost();
        } catch (primaryErr) {
            console.warn(`textagent model failed: ${primaryErr.message}. Falling back to ${MODEL_ORG_FALLBACK}…`);
            self.postMessage({ type: "status", message: `Falling back to ${MODEL_ORG_FALLBACK} models…` });
            MODEL_ID = MODEL_ID.replace('textagent/', MODEL_ORG_FALLBACK + '/');
            processor = null;
            model = null;
            await loadFromHost();
        }

        self.postMessage({ type: "loaded", device: device });
    } catch (error) {
        self.postMessage({
            type: "error",
            message: `Failed to load Docling model: ${error.message}`,
        });
    }
}

/**
 * Process a document image and convert to structured text
 * @param {object} options
 * @param {string} options.imageData - Base64 data URL or URL to the image
 * @param {string} options.outputFormat - 'docling', 'markdown', 'html', or 'text'
 * @param {boolean} options.doImageSplitting - Split image into patches for more accuracy
 * @param {string} options.messageId
 */
async function processDocument({ imageData, outputFormat = 'docling', doImageSplitting = true, mimeType = 'image/png', messageId }) {
    if (!model || !processor) {
        self.postMessage({
            type: "error",
            message: "Model not loaded. Please wait for the model to finish loading.",
            messageId,
        });
        return;
    }

    try {
        self.postMessage({ type: "status", message: "Processing document...", messageId });

        // Ensure imageData is a proper data URL (uploads store raw base64 without prefix)
        let imageUrl = imageData;
        if (imageData && !imageData.startsWith('data:') && !imageData.startsWith('http')) {
            // Raw base64 — reconstruct data URL
            const mime = mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${imageData}`;
        }

        // Load image
        const image = await load_image(imageUrl);

        // Build prompt based on output format
        let promptText = "Convert this page to docling.";
        if (outputFormat === 'markdown') {
            promptText = "Convert this page to markdown.";
        } else if (outputFormat === 'html') {
            promptText = "Convert this page to html.";
        } else if (outputFormat === 'text') {
            promptText = "Extract all text from this page.";
        }

        // Create messages
        const messages = [
            {
                role: "user",
                content: [
                    { type: "image" },
                    { type: "text", text: promptText },
                ],
            },
        ];

        // Apply chat template and process inputs
        const text = processor.apply_chat_template(messages, { add_generation_prompt: true });
        const inputs = await processor(text, [image], {
            do_image_splitting: doImageSplitting,
        });

        // Generate with streaming
        let lastToken = '';
        let repeatCount = 0;
        const MAX_REPEATS = 50; // Stop if same token repeats 50+ times
        let shouldStop = false;

        const generated_ids = await model.generate({
            ...inputs,
            max_new_tokens: 4096,
            do_sample: false,
            repetition_penalty: 1.5,
            streamer: new TextStreamer(processor.tokenizer, {
                skip_prompt: true,
                skip_special_tokens: false,
                callback_function: (token) => {
                    // Detect degeneration loops
                    if (token === lastToken) {
                        repeatCount++;
                        if (repeatCount >= MAX_REPEATS) {
                            // Don't stream garbage tokens
                            return;
                        }
                    } else {
                        lastToken = token;
                        repeatCount = 0;
                    }
                    self.postMessage({ type: "token", token: token, messageId });
                },
            }),
        });

        // Decode final output
        const generated_texts = processor.batch_decode(
            generated_ids.slice(null, [inputs.input_ids.dims.at(-1), null]),
            { skip_special_tokens: true },
        );

        const result = generated_texts[0] || "";

        self.postMessage({
            type: "complete",
            text: result,
            messageId,
        });
    } catch (error) {
        self.postMessage({
            type: "error",
            message: `Document processing failed: ${error.message}`,
            messageId,
        });
    }
}

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
    const { type, messageId } = event.data;

    switch (type) {
        case "setModelId":
            MODEL_ID = event.data.modelId || MODEL_ID;
            MODEL_LABEL = event.data.modelLabel || MODEL_LABEL;
            break;
        case "load":
            await loadModel();
            break;
        case "process":
            await processDocument(event.data);
            break;
        // Also support 'generate' for compatibility with the standard worker interface
        case "generate": {
            const attachments = event.data.attachments || [];
            const imageAtt = attachments.find(a => a.type === 'image');
            // Read OCR mode from the context field (set by ai-docgen-generate.js for doc models)
            const ocrMode = event.data.context || 'text';
            // Map OCR card mode to Docling outputFormat
            let outputFormat = 'markdown';
            if (ocrMode === 'text') outputFormat = 'text';
            else if (ocrMode === 'svg') outputFormat = 'markdown'; // Docling doesn't do SVG — use markdown

            if (imageAtt) {
                await processDocument({
                    imageData: imageAtt.data,
                    mimeType: imageAtt.mimeType || 'image/png',
                    outputFormat,
                    doImageSplitting: false,
                    messageId,
                });
            } else {
                self.postMessage({
                    type: "error",
                    message: "Granite Docling requires a document image. Please attach an image.",
                    messageId,
                });
            }
            break;
        }
        case "ping":
            self.postMessage({ type: "pong" });
            break;
        default:
            console.warn("Unknown message type:", type);
    }
});
