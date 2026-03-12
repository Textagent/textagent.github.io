// ============================================
// ai-worker-florence.js — Florence-2 Vision Worker
// Runs Florence-2-base-ft (Microsoft) for OCR, captioning,
// and document understanding via @huggingface/transformers
// ============================================

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.0-next.6";

// Model host — downloads ONNX models from textagent HuggingFace org
const MODEL_ORG_FALLBACK = "onnx-community";

// Model config
let MODEL_ID = "textagent/Florence-2-base-ft";
let MODEL_LABEL = "Florence-2 (230M)";

// Dynamically loaded modules
let Florence2ForConditionalGeneration, AutoProcessor, load_image, TextStreamer;

// Runtime state
let model = null;
let processor = null;

/**
 * Load model and processor
 */
async function loadModel() {
    try {
        self.postMessage({ type: "status", message: `Initializing ${MODEL_LABEL}...` });

        // 1. Import Transformers.js modules
        const transformers = await import(TRANSFORMERS_URL);
        Florence2ForConditionalGeneration = transformers.Florence2ForConditionalGeneration;
        AutoProcessor = transformers.AutoProcessor;
        load_image = transformers.RawImage
            ? (url) => transformers.RawImage.fromURL(url)
            : transformers.load_image;
        TextStreamer = transformers.TextStreamer;

        // 2. Detect WebGPU
        let device = "wasm";
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
                });
            } else if (progress.status === "initiate") {
                self.postMessage({
                    type: "status",
                    message: `Downloading ${progress.file || label}...`,
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
            model = await Florence2ForConditionalGeneration.from_pretrained(MODEL_ID, {
                dtype: "fp32",
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
            message: `Failed to load ${MODEL_LABEL}: ${error.message}`,
        });
    }
}

// ============================================
// Florence-2 Task Mapping
// ============================================
const FLORENCE_TASKS = {
    'ocr': '<OCR>',
    'ocr_region': '<OCR_WITH_REGION>',
    'caption': '<CAPTION>',
    'detailed_caption': '<DETAILED_CAPTION>',
    'more_detailed_caption': '<MORE_DETAILED_CAPTION>',
    'text': '<OCR>',
    'markdown': '<OCR>',
    'svg': '<MORE_DETAILED_CAPTION>',
};

/**
 * Process a document image using Florence-2
 */
async function processDocument({ imageData, outputFormat = 'text', mimeType = 'image/png', messageId }) {
    if (!model || !processor) {
        self.postMessage({
            type: "error",
            message: "Florence-2 model not loaded. Please wait for loading to complete.",
            messageId,
        });
        return;
    }

    try {
        self.postMessage({ type: "status", message: "Processing document...", messageId });

        // Reconstruct data URL if needed (raw base64 → data URL)
        let imageUrl = imageData;
        if (imageData && !imageData.startsWith('data:') && !imageData.startsWith('http')) {
            const mime = mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${imageData}`;
        }

        // Load image
        const image = await load_image(imageUrl);

        // Determine Florence-2 task from output format
        const task = FLORENCE_TASKS[outputFormat] || '<OCR>';

        // Build prompt using Florence-2's construct_prompts
        const prompts = processor.construct_prompts(task);
        const inputs = await processor(image, prompts);

        // Generate with streaming
        let lastToken = '';
        let repeatCount = 0;
        const MAX_REPEATS = 50;

        const generated_ids = await model.generate({
            ...inputs,
            max_new_tokens: 1024,
            do_sample: false,
            repetition_penalty: 1.2,
            streamer: new TextStreamer(processor.tokenizer, {
                skip_prompt: true,
                skip_special_tokens: true,
                callback_function: (token) => {
                    // Detect degeneration loops
                    if (token === lastToken) {
                        repeatCount++;
                        if (repeatCount >= MAX_REPEATS) return;
                    } else {
                        lastToken = token;
                        repeatCount = 0;
                    }
                    self.postMessage({ type: "token", token: token, messageId });
                },
            }),
        });

        // Decode final output
        const generated_text = processor.batch_decode(generated_ids, { skip_special_tokens: false })[0];

        // Post-process with Florence-2's built-in parser
        const result = processor.post_process_generation(generated_text, task, image.size);
        const output = result[task] || generated_text || "";

        self.postMessage({
            type: "complete",
            text: typeof output === 'string' ? output : JSON.stringify(output, null, 2),
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
            // Read OCR mode from the context field
            const ocrMode = event.data.context || 'text';
            // Map OCR card mode to Florence-2 task
            let outputFormat = 'text';
            if (ocrMode === 'text') outputFormat = 'text';
            else if (ocrMode === 'svg') outputFormat = 'svg';
            else if (ocrMode === 'caption') outputFormat = 'more_detailed_caption';

            if (imageAtt) {
                await processDocument({
                    imageData: imageAtt.data,
                    mimeType: imageAtt.mimeType || 'image/png',
                    outputFormat,
                    messageId,
                });
            } else {
                self.postMessage({
                    type: "error",
                    message: "Florence-2 requires a document image. Please attach an image.",
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
