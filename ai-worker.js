/**
 * AI Worker — Handles Transformers.js model loading and text generation
 * Uses Qwen 3.5 Small (0.8B) running locally via WebGPU/WASM
 *
 * This is an ES Module worker (loaded with { type: "module" }).
 */

import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3";

// Model config — Qwen 3.5 Small 0.8B (the latest and best for browser)
const MODEL_ID = "onnx-community/Qwen3.5-0.8B-ONNX";

// Task-specific token limits to keep responses fast
const TOKEN_LIMITS = {
    summarize: 256,
    expand: 512,
    rephrase: 384,
    grammar: 384,
    autocomplete: 128,
    generate: 512,
    markdown: 512,
    explain: 384,
    simplify: 384,
    qa: 384,
    chat: 512,
};

let generator = null;

// Allow loading from remote
env.allowRemoteModels = true;
env.allowLocalModels = false;

/**
 * Initialize the text-generation pipeline
 */
async function loadModel() {
    try {
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
            message: `Initializing Qwen 3.5 (using ${device.toUpperCase()})...`,
        });

        generator = await pipeline("text-generation", MODEL_ID, {
            device: device,
            dtype: device === "webgpu" ? "q4f16" : "q4",
            progress_callback: (progress) => {
                if (progress.status === "progress") {
                    self.postMessage({
                        type: "progress",
                        file: progress.file,
                        loaded: progress.loaded,
                        total: progress.total,
                        progress: progress.progress,
                    });
                } else if (progress.status === "ready") {
                    self.postMessage({
                        type: "status",
                        message: "Model loaded successfully!",
                    });
                } else if (progress.status === "initiate") {
                    self.postMessage({
                        type: "status",
                        message: `Downloading ${progress.file}...`,
                    });
                }
            },
        });

        self.postMessage({ type: "loaded", device: device });
    } catch (error) {
        self.postMessage({
            type: "error",
            message: `Failed to load model: ${error.message}`,
        });
    }
}

/**
 * Generate text based on a prompt with system instructions
 */
async function generate(taskType, context, userPrompt, messageId) {
    if (!generator) {
        self.postMessage({
            type: "error",
            message: "Model not loaded. Please wait for the model to finish loading.",
            messageId,
        });
        return;
    }

    try {
        // Build messages array based on task type
        const messages = buildMessages(taskType, context, userPrompt);

        // Use task-specific token limit for faster responses
        const maxTokens = TOKEN_LIMITS[taskType] || 512;

        // Generate
        const output = await generator(messages, {
            max_new_tokens: maxTokens,
            do_sample: true,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
        });

        const generatedText =
            output[0].generated_text[output[0].generated_text.length - 1].content;

        self.postMessage({
            type: "complete",
            text: generatedText,
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
        qa: "You are a helpful assistant. Answer the user's question based on the provided document context. Be concise. If the answer cannot be found in the context, say so.",
        chat: "You are a helpful AI assistant integrated into a Markdown editor. Help the user with writing, editing, and formatting tasks. Be concise. Output in markdown format.",
    };

    const systemMessage = systemPrompts[taskType] || systemPrompts.chat;

    const messages = [{ role: "system", content: systemMessage }];

    // Limit context size based on task — shorter context = faster inference
    const contextLimit = taskType === "summarize" || taskType === "grammar" ? 1500 : 2500;

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
        ["summarize", "expand", "rephrase", "grammar"].includes(taskType)
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
    const { type, taskType, context, userPrompt, messageId } = event.data;

    switch (type) {
        case "load":
            await loadModel();
            break;
        case "generate":
            await generate(taskType, context, userPrompt, messageId);
            break;
        case "ping":
            self.postMessage({ type: "pong" });
            break;
        default:
            console.warn("Unknown message type:", type);
    }
});
