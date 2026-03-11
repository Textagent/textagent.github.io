/**
 * AI Worker — Handles Transformers.js model loading and text generation
 * Supports Qwen 3.5 Small (0.8B), Medium (2B), and Large (4B) via WebGPU/WASM
 *
 * This is an ES Module worker (loaded with { type: "module" }).
 * Uses Transformers.js v4 (next) which supports the qwen3_5 architecture.
 *
 * The model ID is configurable via a `setModelId` message sent before `load`.
 */

// Transformers.js classes — loaded dynamically in loadModel() to avoid
// a top-level import that silently kills the worker when the CDN is unreachable.
let AutoProcessor = null;
let Qwen3_5ForConditionalGeneration = null;
let TextStreamer = null;
let RawImage = null;

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.0-next.6";

// Model config — default to 0.8B, overridable via setModelId message
let MODEL_ID = "onnx-community/Qwen3.5-0.8B-ONNX";
let MODEL_LABEL = "Qwen 3.5";

// Task-specific token limits to keep responses fast
const TOKEN_LIMITS = {
    summarize: 256,
    expand: 512,
    rephrase: 384,
    grammar: 384,
    polish: 384,
    formalize: 384,
    elaborate: 512,
    shorten: 256,
    autocomplete: 128,
    generate: 512,
    markdown: 512,
    explain: 384,
    simplify: 384,
    qa: 384,
    chat: 512,
};

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
                Qwen3_5ForConditionalGeneration = transformers.Qwen3_5ForConditionalGeneration;
                TextStreamer = transformers.TextStreamer;
                RawImage = transformers.RawImage;
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
                        message: `Downloading ${progress.file || "processor"}...`,
                    });
                }
            },
        });

        self.postMessage({
            type: "status",
            message: `Loading ${MODEL_LABEL} model (${device.toUpperCase()})...`,
        });

        model = await Qwen3_5ForConditionalGeneration.from_pretrained(MODEL_ID, {
            dtype: {
                embed_tokens: "q4",
                vision_encoder: "fp16",
                decoder_model_merged: "q4",
            },
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
        const hint = error.message.includes("Failed to fetch") || error.message.includes("NetworkError")
            ? " (Check your internet connection and ensure huggingface.co is not blocked by CSP or firewall)"
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
function buildMessages(taskType, context, userPrompt) {
    const systemPrompts = {
        summarize:
            "You are a helpful assistant. Summarize the following text concisely while keeping the key points. Be brief. Output in markdown format.",
        expand:
            "You are a helpful writing assistant. Expand the following text with more details, examples, and explanations. Keep the same tone and style. Output in markdown format.",
        rephrase:
            "You are a helpful writing assistant. Rephrase the following text to improve clarity and readability while preserving the meaning. Output in markdown format.",
        grammar:
            "You are a helpful writing assistant. Fix any grammar, spelling, and punctuation errors in the following text. Only output the corrected text, nothing else.",
        autocomplete:
            "You are a helpful writing assistant. Continue writing the text naturally. Only output the continuation, do not repeat the existing text. Write 1-2 sentences.",
        generate:
            "You are a helpful content generation assistant. Generate content based on the user's request. Output in well-formatted markdown.",
        markdown:
            "You are a markdown expert. Generate well-formatted markdown content based on the user's request. Use headings, lists, tables, code blocks, and other markdown features as appropriate.",
        explain:
            "You are a helpful assistant. Explain the following text in simple, easy-to-understand terms. Be concise. Output in markdown format.",
        simplify:
            "You are a helpful writing assistant. Simplify the following text to make it easier to understand. Use shorter sentences and simpler words. Output in markdown format.",
        polish:
            "You are a skilled writing editor. Polish the following text to improve flow, word choice, and overall quality while preserving the meaning and tone. Only output the polished text.",
        formalize:
            "You are a professional writing assistant. Rewrite the following text in a more formal, professional tone suitable for business or academic contexts. Only output the formalized text.",
        elaborate:
            "You are a helpful writing assistant. Elaborate on the following text by adding more details, examples, and explanations to make it more comprehensive. Output in markdown format.",
        shorten:
            "You are a concise writing editor. Shorten the following text while preserving all key information. Remove redundancy and use fewer words. Only output the shortened text.",
        qa: "You are a helpful assistant. Answer the user's question based on the provided document context. Be concise. If the answer cannot be found in the context, say so.",
        chat: "You are a helpful AI assistant integrated into a Markdown editor. Help the user with writing, editing, and formatting tasks. Be concise. Output in markdown format.",
    };

    const systemMessage = systemPrompts[taskType] || systemPrompts.chat;

    const messages = [{ role: "system", content: systemMessage }];

    // Limit context size based on task — shorter context = faster inference
    const contextLimit =
        taskType === "summarize" || taskType === "grammar" ? 1500 : 2500;

    // For tasks that need context (selected text or document)
    if (
        context &&
        (taskType === "qa" || taskType === "explain" || taskType === "simplify")
    ) {
        messages.push({
            role: "user",
            content: `Context:\n\`\`\`\n${context.substring(0, contextLimit)}\n\`\`\`\n\n${userPrompt || "Please process this text."}`,
        });
    } else if (
        context &&
        ["summarize", "expand", "rephrase", "grammar", "polish", "formalize", "elaborate", "shorten"].includes(taskType)
    ) {
        messages.push({
            role: "user",
            content: context.substring(0, contextLimit),
        });
    } else if (context && taskType === "autocomplete") {
        messages.push({
            role: "user",
            content: `Continue this text:\n${context.substring(Math.max(0, context.length - 800))}`,
        });
    } else {
        messages.push({
            role: "user",
            content: userPrompt || context || "Hello!",
        });
    }

    return messages;
}

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
    const { type, taskType, context, userPrompt, messageId, enableThinking, attachments } = event.data;

    switch (type) {
        case "setModelId":
            MODEL_ID = event.data.modelId || MODEL_ID;
            MODEL_LABEL = event.data.modelLabel || MODEL_LABEL;
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
