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

// Model config
let MODEL_ID = "onnx-community/granite-docling-258M-ONNX";
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

        // 3. Load processor
        self.postMessage({ type: "status", message: `Loading ${MODEL_LABEL} processor...` });
        processor = await AutoProcessor.from_pretrained(MODEL_ID, {
            progress_callback: (progress) => {
                if (progress.status === "progress") {
                    self.postMessage({
                        type: "progress",
                        file: progress.file || "processor",
                        loaded: progress.loaded || 0,
                        total: progress.total || 0,
                        progress: progress.progress || 0,
                    });
                } else if (progress.status === "initiate") {
                    self.postMessage({
                        type: "status",
                        message: `Downloading ${progress.file || "model"}...`,
                    });
                }
            },
        });

        // 4. Load model
        self.postMessage({ type: "status", message: `Loading ${MODEL_LABEL} model (${device.toUpperCase()})...` });
        model = await AutoModelForVision2Seq.from_pretrained(MODEL_ID, {
            dtype: "fp32",
            device: device,
            progress_callback: (progress) => {
                if (progress.status === "progress") {
                    self.postMessage({
                        type: "progress",
                        file: progress.file || "model",
                        loaded: progress.loaded || 0,
                        total: progress.total || 0,
                        progress: progress.progress || 0,
                    });
                } else if (progress.status === "initiate") {
                    self.postMessage({
                        type: "status",
                        message: `Downloading ${progress.file || "model"}...`,
                    });
                }
            },
        });

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
async function processDocument({ imageData, outputFormat = 'docling', doImageSplitting = false, messageId }) {
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

        // Load image
        const image = await load_image(imageData);

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
        const generated_ids = await model.generate({
            ...inputs,
            max_new_tokens: 4096,
            streamer: new TextStreamer(processor.tokenizer, {
                skip_prompt: true,
                skip_special_tokens: false,
                callback_function: (token) => {
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
            if (imageAtt) {
                await processDocument({
                    imageData: imageAtt.data,
                    outputFormat: 'markdown',
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
