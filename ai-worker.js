/**
 * AI Worker — Handles Transformers.js model loading and text generation
 * Supports Qwen 3.5 Small (0.8B), Medium (2B), Large (4B) and
 * Qwen 3 4B Thinking via WebGPU/WASM
 *
 * This is an ES Module worker (loaded with { type: "module" }).
 * Uses Transformers.js v4 (next) which supports qwen3_5 and qwen3 architectures.
 *
 * The model ID is configurable via a `setModelId` message sent before `load`.
 */

// Transformers.js classes — loaded dynamically in loadModel() to avoid
// a top-level import that silently kills the worker when the CDN is unreachable.
let AutoProcessor = null;
let AutoTokenizer = null;
let Qwen3_5ForConditionalGeneration = null;
let AutoModelForCausalLM = null;
let TextStreamer = null;
let RawImage = null;

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.0-next.6";

// Model host — downloads ONNX models from textagent HuggingFace org
const MODEL_HOST = "https://huggingface.co";
const MODEL_ORG_FALLBACK = "onnx-community";

// Reference to Transformers.js env (set after dynamic import)
let transformersEnv = null;

// Model config — default to 0.8B, overridable via setModelId message
let MODEL_ID = "textagent/Qwen3.5-0.8B-ONNX";
let MODEL_LABEL = "Qwen 3.5";
let MODEL_ARCH = "qwen3_5";      // 'qwen3_5' or 'qwen3'
let MODEL_DTYPE = "q4";           // 'q4' or 'q4f16'

import { TOKEN_LIMITS, buildMessages as _buildMessages } from './ai-worker-common.js';

let processor = null;
let model = null;

/**
 * Initialize the model and processor
 */
async function loadModel() {
    try {
        // Dynamically import Transformers.js (avoids top-level import crash)
        if (!AutoProcessor) {
            self.postMessage({
                type: "status",
                message: "Loading Transformers.js library...",
            });
            try {
                const transformers = await import(TRANSFORMERS_URL);
                AutoProcessor = transformers.AutoProcessor;
                AutoTokenizer = transformers.AutoTokenizer;
                Qwen3_5ForConditionalGeneration = transformers.Qwen3_5ForConditionalGeneration;
                AutoModelForCausalLM = transformers.AutoModelForCausalLM;
                TextStreamer = transformers.TextStreamer;
                RawImage = transformers.RawImage;

                // Point model downloads to HuggingFace
                transformersEnv = transformers.env;
                transformersEnv.remoteHost = MODEL_HOST;
            } catch (importError) {
                self.postMessage({
                    type: "error",
                    message: `Failed to load AI library from CDN: ${importError.message}. Check your internet connection or try again later.`,
                });
                return;
            }
        }

        // Check WebGPU support
        let device = "wasm";
        if (typeof navigator !== "undefined" && navigator.gpu) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    device = "webgpu";
                }
            } catch (e) {
                console.warn("WebGPU check failed, falling back to WASM:", e);
            }
        }

        self.postMessage({
            type: "status",
            message: `Loading ${MODEL_LABEL} processor...`,
        });

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

        // Choose the right model class and dtype config based on architecture
        const isQwen3 = MODEL_ARCH === 'qwen3';
        const ModelClass = isQwen3 ? AutoModelForCausalLM : Qwen3_5ForConditionalGeneration;
        const dtypeConfig = isQwen3
            ? MODEL_DTYPE     // e.g. 'q4f16' — single string for text-only models
            : {                // object with per-component dtypes for vision models
                embed_tokens: "q4",
                vision_encoder: "fp16",
                decoder_model_merged: "q4",
            };

        // Helper: load processor/tokenizer + model, with automatic fallback
        async function loadFromHost() {
            // Text-only models (qwen3) don't have preprocessor_config.json,
            // so use AutoTokenizer instead of AutoProcessor.
            if (isQwen3) {
                const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID, {
                    progress_callback: progressCb("tokenizer"),
                });
                // Wrap tokenizer in a processor-like object so the rest of the
                // code can uniformly access processor.tokenizer
                processor = { tokenizer };
            } else {
                processor = await AutoProcessor.from_pretrained(MODEL_ID, {
                    progress_callback: progressCb("processor"),
                });
            }

            self.postMessage({
                type: "status",
                message: `Loading ${MODEL_LABEL} model (${device.toUpperCase()})...`,
            });

            model = await ModelClass.from_pretrained(MODEL_ID, {
                dtype: dtypeConfig,
                device: device,
                progress_callback: progressCb("model"),
            });
        }

        try {
            await loadFromHost();
        } catch (primaryErr) {
            // Primary org (textagent) failed — fall back to onnx-community
            console.warn(`textagent model failed: ${primaryErr.message}. Falling back to onnx-community…`);
            self.postMessage({
                type: "status",
                message: `Falling back to onnx-community models…`,
            });
            MODEL_ID = MODEL_ID.replace('textagent/', MODEL_ORG_FALLBACK + '/');
            processor = null;
            model = null;
            await loadFromHost();
        }

        self.postMessage({ type: "loaded", device: device });
    } catch (error) {
        const hint = error.message.includes("Failed to fetch") || error.message.includes("NetworkError")
            ? " (Check your internet connection and ensure the model host is not blocked by CSP or firewall)"
            : "";
        self.postMessage({
            type: "error",
            message: `Failed to load model: ${error.message}${hint}`,
        });
    }
}

/**
 * Generate text based on a prompt with system instructions
 */
async function generate(taskType, context, userPrompt, messageId, enableThinking = false, attachments = []) {
    if (!model || !processor) {
        self.postMessage({
            type: "error",
            message: "Model not loaded. Please wait for the model to finish loading.",
            messageId,
        });
        return;
    }

    try {
        // Separate image attachments from text file attachments
        const imageAttachments = (attachments || []).filter(a => a.type === 'image' && a.data);
        const fileAttachments = (attachments || []).filter(a => a.type === 'file' && a.textContent);

        // Append text file contents to the user prompt
        let augmentedPrompt = userPrompt || '';
        fileAttachments.forEach(att => {
            augmentedPrompt += '\n\n[Attached File: ' + (att.name || 'file') + ']\n' + att.textContent;
        });

        // Build messages array based on task type
        const messages = buildMessages(taskType, context, augmentedPrompt || userPrompt);

        // Use task-specific token limit; thinking mode needs more tokens
        let maxTokens = TOKEN_LIMITS[taskType] || 512;
        if (enableThinking) maxTokens = Math.max(maxTokens * 2, 1024);

        // --- MULTIMODAL PATH: images attached ---
        console.log('[AI Worker] attachments received:', attachments?.length, 'images:', imageAttachments.length, 'RawImage available:', !!RawImage);
        if (imageAttachments.length > 0 && RawImage) {
            // Load the first image (Qwen 3.5 processes one image at a time)
            const imgAtt = imageAttachments[0];
            const dataUrl = 'data:' + (imgAtt.mimeType || 'image/png') + ';base64,' + imgAtt.data;
            const rawImage = await (await RawImage.read(dataUrl)).resize(448, 448);

            // Build prompt manually with vision tokens
            // (apply_chat_template doesn't correctly insert vision tokens — see HF reference)
            let prompt = '';
            for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];
                if (i === messages.length - 1 && msg.role === 'user') {
                    // Last user message: insert vision tokens before text
                    const textContent = typeof msg.content === 'string' ? msg.content : (augmentedPrompt || 'Describe this image.');
                    prompt += '<|im_start|>user\n<|vision_start|><|image_pad|><|vision_end|>' + textContent + '<|im_end|>\n';
                } else {
                    prompt += '<|im_start|>' + msg.role + '\n' + msg.content + '<|im_end|>\n';
                }
            }
            // Add generation prompt (with or without thinking)
            prompt += enableThinking
                ? '<|im_start|>assistant\n<think>\n'
                : '<|im_start|>assistant\n<think>\n\n</think>\n\n';

            // Process text + image together
            const inputs = await processor(prompt, rawImage);

            // Collect streamed text
            let fullText = '';
            const streamer = new TextStreamer(processor.tokenizer, {
                skip_prompt: true,
                skip_special_tokens: true,
                callback_function: (token) => {
                    fullText += token;
                },
            });

            // Generate
            await model.generate({
                ...inputs,
                do_sample: true,
                max_new_tokens: maxTokens,
                streamer,
            });

            self.postMessage({
                type: "complete",
                text: fullText.trim(),
                messageId,
            });
        } else {
            // --- TEXT-ONLY PATH: no images ---
            const text = processor.tokenizer.apply_chat_template(messages, {
                tokenize: false,
                add_generation_prompt: true,
                enable_thinking: enableThinking,
            });

            const inputs = processor.tokenizer(text, {
                return_tensors: "pt",
            });

            // Collect streamed text
            let fullText = "";
            const streamer = new TextStreamer(processor.tokenizer, {
                skip_prompt: true,
                skip_special_tokens: true,
                callback_function: (token) => {
                    fullText += token;
                },
            });

            // Generate
            await model.generate({
                ...inputs,
                do_sample: false,
                max_new_tokens: maxTokens,
                streamer,
            });

            self.postMessage({
                type: "complete",
                text: fullText.trim(),
                messageId,
            });
        }
    } catch (error) {
        self.postMessage({
            type: "error",
            message: `Generation failed: ${error.message}`,
            messageId,
        });
    }
}

/**
 * Build chat messages array based on task type
 */
// Local worker: smaller context limits for faster inference
function buildMessages(taskType, context, userPrompt) {
    const contextLimit = taskType === 'summarize' || taskType === 'grammar' ? 1500 : 2500;
    return _buildMessages(taskType, context, userPrompt, { contextLimit, autocompleteLimit: 800 });
}

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
    const { type, taskType, context, userPrompt, messageId, enableThinking, attachments } = event.data;

    switch (type) {
        case "setModelId":
            MODEL_ID = event.data.modelId || MODEL_ID;
            MODEL_LABEL = event.data.modelLabel || MODEL_LABEL;
            MODEL_ARCH = event.data.architecture || 'qwen3_5';
            MODEL_DTYPE = event.data.dtype || 'q4';
            break;
        case "load":
            await loadModel();
            break;
        case "generate":
            await generate(taskType, context, userPrompt, messageId, enableThinking, attachments);
            break;
        case "ping":
            self.postMessage({ type: "pong" });
            break;
        default:
            console.warn("Unknown message type:", type);
    }
});
