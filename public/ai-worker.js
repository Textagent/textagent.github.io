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

// Task-specific token limits — industry standard (Qwen 3.5 supports 32K output natively)
const TOKEN_LIMITS = {
    summarize: 2048,
    expand: 4096,
    rephrase: 2048,
    grammar: 2048,
    polish: 2048,
    formalize: 2048,
    elaborate: 4096,
    shorten: 1024,
    autocomplete: 512,
    generate: 8192,
    markdown: 8192,
    explain: 4096,
    simplify: 2048,
    qa: 4096,
    chat: 8192,
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
async function generate(taskType, context, userPrompt, messageId, enableThinking = false, attachments = [], chatHistory = [], maxTokensOverride = 0) {
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
        const messages = buildMessages(taskType, context, augmentedPrompt || userPrompt, chatHistory);

        // Use task-specific token limit; thinking mode needs more tokens
        let maxTokens = maxTokensOverride || TOKEN_LIMITS[taskType] || 512;
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

            // Collect streamed text — filter thinking content
            // Use skip_special_tokens:false when thinking is on so we see <think>/</ think> markers
            let fullText = '';
            let inThinkingPhase = !!enableThinking;
            let thinkingBuffer = '';
            const streamer = new TextStreamer(processor.tokenizer, {
                skip_prompt: true,
                skip_special_tokens: !enableThinking,
                callback_function: (token) => {
                    if (!enableThinking) {
                        fullText += token;
                        self.postMessage({ type: "token", token, messageId });
                        return;
                    }
                    if (inThinkingPhase) {
                        thinkingBuffer += token;
                        if (thinkingBuffer.includes('</think>')) {
                            inThinkingPhase = false;
                            const afterThink = thinkingBuffer.substring(
                                thinkingBuffer.indexOf('</think>') + '</think>'.length
                            );
                            const cleaned = afterThink.replace(/<\|[^|]*\|>/g, '').replace(/<\/?(?:think|thinking|thought)>/gi, '');
                            if (cleaned.trim()) {
                                fullText += cleaned;
                                self.postMessage({ type: "token", token: cleaned, messageId });
                            }
                        }
                        return;
                    }
                    const cleaned = token.replace(/<\|[^|]*\|>/g, '').replace(/<\/?(?:think|thinking|thought)>/gi, '');
                    if (cleaned) {
                        fullText += cleaned;
                        self.postMessage({ type: "token", token: cleaned, messageId });
                    }
                },
            });

            // Generate — Qwen3 model card: use sampling, NOT greedy, for thinking mode
            const genConfig = enableThinking
                ? { do_sample: true, temperature: 0.6, top_p: 0.95, top_k: 20, max_new_tokens: Math.max(maxTokens, 4096) }
                : { do_sample: true, temperature: 0.7, top_p: 0.8, top_k: 20, max_new_tokens: maxTokens };
            await model.generate({ ...inputs, ...genConfig, streamer });

            // Final cleanup — strip any remaining think tags or special tokens
            let cleanedText = fullText.trim();
            cleanedText = cleanedText.replace(/<(?:think|thinking|thought)>[\s\S]*?<\/(?:think|thinking|thought)>/gi, '');
            cleanedText = cleanedText.replace(/<(?:think|thinking|thought)>[\s\S]*$/gi, '');
            const closeMatch = cleanedText.match(/<\/(?:think|thinking|thought)>/i);
            if (closeMatch) {
                cleanedText = cleanedText.substring(cleanedText.indexOf(closeMatch[0]) + closeMatch[0].length);
            }
            cleanedText = cleanedText.replace(/<\|[^|]*\|>/g, '').trim();

            self.postMessage({
                type: "complete",
                text: cleanedText.trim(),
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

            // --- Thinking-aware streaming ---
            // When enableThinking is on, the model generates:
            //   <think>...thinking content...</think>\n\nactual response
            //
            // Problem: skip_special_tokens:true strips <think> and </think> markers,
            // making it impossible to detect where thinking ends.
            // Solution: use skip_special_tokens:false so we see the markers,
            // then manually filter thinking content and strip special tokens.
            let fullText = "";
            let inThinkingPhase = !!enableThinking;
            let thinkingBuffer = "";  // buffer thinking content (not forwarded)

            const streamer = new TextStreamer(processor.tokenizer, {
                skip_prompt: true,
                skip_special_tokens: !enableThinking,  // false when thinking, so we see markers
                callback_function: (token) => {
                    if (!enableThinking) {
                        // Normal mode: forward everything
                        fullText += token;
                        self.postMessage({ type: "token", token, messageId });
                        return;
                    }

                    // Thinking mode: track <think>...</think> boundary
                    if (inThinkingPhase) {
                        thinkingBuffer += token;
                        // Check if we've seen the </think> closing marker
                        if (thinkingBuffer.includes('</think>')) {
                            inThinkingPhase = false;
                            // Extract anything after </think> (there might be content)
                            const afterThink = thinkingBuffer.substring(
                                thinkingBuffer.indexOf('</think>') + '</think>'.length
                            );
                            // Clean special tokens from the after-think content
                            const cleaned = afterThink
                                .replace(/<\|[^|]*\|>/g, '')  // strip <|im_start|>, <|im_end|>, etc.
                                .replace(/<\/?(?:think|thinking|thought)>/gi, '');
                            if (cleaned.trim()) {
                                fullText += cleaned;
                                self.postMessage({ type: "token", token: cleaned, messageId });
                            }
                        }
                        return; // don't forward thinking tokens
                    }

                    // Post-thinking: forward real content, strip any special tokens
                    const cleaned = token
                        .replace(/<\|[^|]*\|>/g, '')
                        .replace(/<\/?(?:think|thinking|thought)>/gi, '');
                    if (cleaned) {
                        fullText += cleaned;
                        self.postMessage({ type: "token", token: cleaned, messageId });
                    }
                },
            });

            // Generate — Qwen3 model card: use sampling, NOT greedy, for thinking mode
            // Thinking: temp=0.6, top_p=0.95, top_k=20 | Non-thinking: temp=0.7, top_p=0.8, top_k=20
            const genConfig = enableThinking
                ? { do_sample: true, temperature: 0.6, top_p: 0.95, top_k: 20, max_new_tokens: Math.max(maxTokens, 4096) }
                : { do_sample: true, temperature: 0.7, top_p: 0.8, top_k: 20, max_new_tokens: maxTokens };
            await model.generate({ ...inputs, ...genConfig, streamer });

            // Final cleanup: strip any remaining think tags or reasoning artifacts
            let cleanedText = fullText.trim();
            cleanedText = cleanedText.replace(/<(?:think|thinking|thought)>[\s\S]*?<\/(?:think|thinking|thought)>/gi, '');
            cleanedText = cleanedText.replace(/<(?:think|thinking|thought)>[\s\S]*$/gi, '');
            const closeMatch = cleanedText.match(/<\/(?:think|thinking|thought)>/i);
            if (closeMatch) {
                cleanedText = cleanedText.substring(cleanedText.indexOf(closeMatch[0]) + closeMatch[0].length);
            }
            cleanedText = cleanedText.replace(/<\|[^|]*\|>/g, '').trim();

            self.postMessage({
                type: "complete",
                text: cleanedText.trim(),
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
function buildMessages(taskType, context, userPrompt, chatHistory) {
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

    // Inject conversation history for conversational task types
    if (chatHistory && chatHistory.length > 0 &&
        ['generate', 'qa', 'chat', 'explain', 'markdown'].includes(taskType)) {
        const recent = chatHistory.slice(-30);
        recent.forEach(function (m) {
            messages.push({
                role: m.role,
                content: m.content.substring(0, 4000)
            });
        });
    }

    // Limit context size — Qwen 3.5 supports 256K context; send generous document context
    const contextLimit =
        taskType === "summarize" || taskType === "grammar" ? 16000 : 32000;

    // Detect if context contains web search results
    const hasSearchResults = context && context.indexOf('[Web Search Results') !== -1;

    // Web-search grounding: when search results are present, wrap with strong grounding instructions
    if (hasSearchResults && (taskType === 'generate' || taskType === 'qa' || taskType === 'chat')) {
        var groundedPrompt =
            'IMPORTANT: The following web search results were retrieved for the user\'s question. ' +
            'You MUST base your answer PRIMARILY on these search results. ' +
            'Do NOT fabricate, invent, or hallucinate any facts, numbers, scores, dates, or statistics that are not explicitly stated in the search results. ' +
            'If the search results contain the answer, use them directly and cite the sources. ' +
            'If the search results are insufficient or contradictory, say so honestly rather than guessing.\n\n' +
            context.substring(0, contextLimit) +
            '\n\nUser question: ' + (userPrompt || 'Please answer based on the search results above.');
        messages.push({ role: 'user', content: groundedPrompt });
    } else if (
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
    const { type, taskType, context, userPrompt, messageId, enableThinking, attachments, chatHistory } = event.data;

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
            await generate(taskType, context, userPrompt, messageId, enableThinking, attachments, chatHistory, event.data.maxTokensOverride || 0);
            break;
        case "ping":
            self.postMessage({ type: "pong" });
            break;
        default:
            console.warn("Unknown message type:", type);
    }
});
