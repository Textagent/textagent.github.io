/**
 * AI Worker — LFM 2.5 1.2B Thinking (Liquid AI)
 *
 * Dedicated worker for the LFM model which uses a hybrid SSM+Transformer
 * architecture requiring raw ONNX Runtime sessions (not AutoModelForCausalLM).
 *
 * Uses AutoTokenizer from Transformers.js for tokenization,
 * and ort.InferenceSession from ONNX Runtime Web for inference.
 *
 * Same message interface as ai-worker.js:
 *   setModelId  → configure model ID before loading
 *   load        → download and initialise model
 *   generate    → run inference
 *   ping/pong   → health check
 */

import { TOKEN_LIMITS, buildMessages as _buildMessages } from './ai-worker-common.js';

// CDN URLs
const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.0-next.6";
const ORT_URL = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.24.3/dist/ort.webgpu.min.mjs";

// Model host
const MODEL_HOST = "https://huggingface.co";
const MODEL_ORG_FALLBACK = "LiquidAI";

// Dynamically loaded modules
let AutoTokenizer = null;
let ort = null;

// Model config — overridable via setModelId
let MODEL_ID = "textagent/LFM2.5-1.2B-Thinking-ONNX";
let MODEL_LABEL = "LFM 1.2B Thinking";
let MODEL_DTYPE = "q4";  // 'q4', 'q8', or 'fp16'

// LFM architecture constants (from config.json)
const HIDDEN_SIZE = 2048;
const NUM_KV_HEADS = 8;       // num_key_value_heads
const HEAD_DIM = 64;           // hidden_size / num_attention_heads = 2048 / 32

// Runtime state
let tokenizer = null;
let session = null;

/**
 * Initialize the model: load tokenizer + ONNX session
 */
async function loadModel() {
    try {
        // 1. Import libraries dynamically
        if (!AutoTokenizer) {
            self.postMessage({ type: "status", message: "Loading AI libraries..." });
            try {
                const [transformers, ortModule] = await Promise.all([
                    import(TRANSFORMERS_URL),
                    import(ORT_URL),
                ]);
                AutoTokenizer = transformers.AutoTokenizer;
                ort = ortModule;
                // Configure ORT for WebGPU
                ort.env.wasm.numThreads = 1;
            } catch (importError) {
                self.postMessage({
                    type: "error",
                    message: `Failed to load AI libraries: ${importError.message}. Check your internet connection.`,
                });
                return;
            }
        }

        // 2. Check WebGPU (required for LFM)
        if (typeof navigator === "undefined" || !navigator.gpu) {
            self.postMessage({
                type: "error",
                message: "WebGPU is required for the LFM model but is not available in this browser. Please use Chrome or Edge with WebGPU enabled.",
            });
            return;
        }
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            self.postMessage({
                type: "error",
                message: "WebGPU adapter not found. Check chrome://gpu for WebGPU status.",
            });
            return;
        }

        // 3. Load tokenizer
        self.postMessage({ type: "status", message: `Loading ${MODEL_LABEL} tokenizer...` });

        async function loadFromHost(modelId) {
            tokenizer = await AutoTokenizer.from_pretrained(modelId, {
                progress_callback: (progress) => {
                    if (progress.status === "progress") {
                        self.postMessage({
                            type: "progress",
                            file: progress.file || "tokenizer",
                            loaded: progress.loaded || 0,
                            total: progress.total || 0,
                            progress: progress.progress || 0,
                            source: modelId,
                        });
                    } else if (progress.status === "initiate") {
                        self.postMessage({
                            type: "status",
                            message: `Loading ${progress.file || "tokenizer"}...`,
                            source: modelId,
                            loadingPhase: "initiate",
                        });
                    } else if (progress.status === "done") {
                        self.postMessage({
                            type: "status",
                            message: `Loaded ${progress.file || "tokenizer"} ✓`,
                            source: modelId,
                            loadingPhase: "done",
                        });
                    }
                },
            });

            // 4. Load ONNX session
            self.postMessage({ type: "status", message: `Loading ${MODEL_LABEL} model (WebGPU)...` });

            const modelBase = `${MODEL_HOST}/${modelId}/resolve/main`;
            const onnxFile = `model_${MODEL_DTYPE}.onnx`;
            const onnxPath = `${modelBase}/onnx/${onnxFile}`;
            const dataPath = `${modelBase}/onnx/${onnxFile}_data`;

            // Report download progress for the main model file
            // Note: ONNX Runtime downloads the external data (~600 MB+) internally
            // without a progress callback, so we show an informative status message.
            self.postMessage({
                type: "status",
                message: `Downloading ${MODEL_LABEL} weights — this may take a few minutes...`,
            });

            session = await ort.InferenceSession.create(onnxPath, {
                executionProviders: ["webgpu"],
                externalData: [{ path: `${onnxFile}_data`, data: dataPath }],
            });
        }

        try {
            await loadFromHost(MODEL_ID);
        } catch (primaryErr) {
            // Fallback to LiquidAI org
            const errMsg = (primaryErr && primaryErr.message) || String(primaryErr);
            console.warn(`textagent model failed: ${errMsg}. Falling back to ${MODEL_ORG_FALLBACK}…`);
            console.error('Primary load error:', primaryErr);
            self.postMessage({ type: "status", message: `Falling back to ${MODEL_ORG_FALLBACK} models…` });
            MODEL_ID = MODEL_ID.replace('textagent/', MODEL_ORG_FALLBACK + '/');
            tokenizer = null;
            session = null;
            await loadFromHost(MODEL_ID);
        }

        self.postMessage({ type: "loaded", device: "webgpu" });
    } catch (error) {
        const errMsg = (error && error.message) || String(error);
        const hint = errMsg.includes("Failed to fetch") || errMsg.includes("NetworkError")
            ? " (Check your internet connection and ensure the model host is not blocked)"
            : "";
        console.error('LFM load error:', error);
        self.postMessage({
            type: "error",
            message: `Failed to load LFM model: ${errMsg}${hint}`,
        });
    }
}

/**
 * Initialize KV cache tensors based on session input names.
 * LFM uses two types of state:
 *   - past_conv_*: SSM convolutional state [1, hiddenSize, 3]
 *   - past_key_values.*: Attention KV cache [1, numKVHeads, 0, headDim]
 */
function initCache() {
    const cache = {};
    for (const name of session.inputNames) {
        if (name.startsWith("past_conv")) {
            cache[name] = new ort.Tensor(
                "float32",
                new Float32Array(HIDDEN_SIZE * 3),
                [1, HIDDEN_SIZE, 3]
            );
        } else if (name.startsWith("past_key_values")) {
            cache[name] = new ort.Tensor(
                "float32",
                new Float32Array(0),
                [1, NUM_KV_HEADS, 0, HEAD_DIM]
            );
        }
    }
    return cache;
}

/**
 * Update cache from model outputs (present → past)
 */
function updateCache(cache, outputs) {
    for (const [name, tensor] of Object.entries(outputs)) {
        if (name.startsWith("present_conv")) {
            cache[name.replace("present_conv", "past_conv")] = tensor;
        } else if (name.startsWith("present.")) {
            cache[name.replace("present.", "past_key_values.")] = tensor;
        }
    }
}

/**
 * Generate text based on a prompt with system instructions
 */
async function generate(taskType, context, userPrompt, messageId, enableThinking = false, attachments = [], chatHistory = [], maxTokensOverride = 0) {
    if (!session || !tokenizer) {
        self.postMessage({
            type: "error",
            message: "Model not loaded. Please wait for the model to finish loading.",
            messageId,
        });
        return;
    }

    try {
        // Handle text file attachments (LFM has no vision support)
        const fileAttachments = (attachments || []).filter(a => a.type === 'file' && a.textContent);
        let augmentedPrompt = userPrompt || '';
        fileAttachments.forEach(att => {
            augmentedPrompt += '\n\n[Attached File: ' + (att.name || 'file') + ']\n' + att.textContent;
        });

        // Build messages — append detail hint since LFM Thinking tends to be terse
        // after its reasoning phase
        const detailHint = (taskType === 'generate' || taskType === 'chat' || taskType === 'qa' || taskType === 'explain')
            ? '\n\nProvide a detailed, comprehensive response with explanations.' : '';
        const messages = buildMessages(taskType, context, (augmentedPrompt || userPrompt) + detailHint, chatHistory);

        // LFM is a Thinking model — it always generates <think>...</think> reasoning
        // before the answer, consuming significant tokens. Use higher minimums.
        let maxTokens = maxTokensOverride || TOKEN_LIMITS[taskType] || 2048;
        maxTokens = Math.max(maxTokens, 2048); // ensure thinking has room
        if (enableThinking) maxTokens = Math.max(maxTokens * 2, 4096);

        // Apply chat template and tokenize
        const prompt = tokenizer.apply_chat_template(messages, {
            add_generation_prompt: true,
            tokenize: false,
        });
        const inputIds = tokenizer.encode(prompt);

        // Generation loop
        const cache = initCache();
        const eosTokenId = tokenizer.eos_token_id;
        const generatedTokens = [];
        let curLen = inputIds.length;
        let ids = inputIds;

        for (let step = 0; step < maxTokens; step++) {
            const inputIdsTensor = new ort.Tensor(
                "int64",
                new BigInt64Array(ids.map(BigInt)),
                [1, ids.length]
            );
            const attentionMask = new ort.Tensor(
                "int64",
                new BigInt64Array(curLen).fill(1n),
                [1, curLen]
            );

            const outputs = await session.run({
                input_ids: inputIdsTensor,
                attention_mask: attentionMask,
                ...cache,
            });

            // Temperature sampling with top-k for better response quality
            // (greedy argmax causes small models to produce very short answers)
            const logits = outputs.logits;
            const vocabSize = logits.dims[2];
            const lastLogits = logits.data.slice((logits.dims[1] - 1) * vocabSize);

            const temperature = enableThinking ? 0.6 : 0.7;
            const topK = 40;

            // Apply temperature scaling
            const scaled = new Float32Array(lastLogits.length);
            for (let i = 0; i < lastLogits.length; i++) {
                scaled[i] = lastLogits[i] / temperature;
            }

            // Top-k filtering: find top-k indices
            const indices = Array.from({ length: scaled.length }, (_, i) => i);
            indices.sort((a, b) => scaled[b] - scaled[a]);
            const topKIndices = indices.slice(0, topK);

            // Softmax over top-k
            let maxLogit = scaled[topKIndices[0]];
            let sumExp = 0;
            const probs = new Float32Array(topK);
            for (let i = 0; i < topK; i++) {
                probs[i] = Math.exp(scaled[topKIndices[i]] - maxLogit);
                sumExp += probs[i];
            }
            for (let i = 0; i < topK; i++) probs[i] /= sumExp;

            // Sample from the distribution
            let r = Math.random();
            let nextToken = topKIndices[0]; // fallback
            for (let i = 0; i < topK; i++) {
                r -= probs[i];
                if (r <= 0) { nextToken = topKIndices[i]; break; }
            }

            generatedTokens.push(nextToken);

            if (nextToken === eosTokenId) break;

            // Stream token back
            const tokenText = tokenizer.decode([nextToken], { skip_special_tokens: true });
            if (tokenText) {
                self.postMessage({ type: "token", token: tokenText, messageId });
            }

            updateCache(cache, outputs);
            ids = [nextToken];
            curLen++;
        }

        // Decode full response
        const fullText = tokenizer.decode(generatedTokens, { skip_special_tokens: true });

        // Parse thinking traces if present
        let finalText = fullText.trim();
        const thinkMatch = finalText.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
            const answer = finalText.slice(thinkMatch.index + thinkMatch[0].length).trim();
            finalText = answer || finalText;
        }

        self.postMessage({
            type: "complete",
            text: finalText,
            messageId,
        });
    } catch (error) {
        self.postMessage({
            type: "error",
            message: `Generation failed: ${error.message}`,
            messageId,
        });
    }
}

/**
 * Build chat messages (local worker: smaller context limits)
 */
function buildMessages(taskType, context, userPrompt, chatHistory) {
    const contextLimit = taskType === 'summarize' || taskType === 'grammar' ? 1500 : 2500;
    return _buildMessages(taskType, context, userPrompt, { contextLimit, autocompleteLimit: 800, chatHistory });
}

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
    const { type, taskType, context, userPrompt, messageId, enableThinking, attachments, chatHistory } = event.data;

    switch (type) {
        case "setModelId":
            MODEL_ID = event.data.modelId || MODEL_ID;
            MODEL_LABEL = event.data.modelLabel || MODEL_LABEL;
            MODEL_DTYPE = event.data.dtype || "q4";
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
