// ============================================
// ai-worker-smolvlm.js — SmolVLM (256M / 500M) Lightweight Vision Worker
// Models: HuggingFaceTB/SmolVLM-256M-Instruct, HuggingFaceTB/SmolVLM-500M-Instruct
// Supports: text + image (image-text-to-text). A far lighter alternative to
// Gemma 4 Vision (~2–4 GB) and Florence-2 for captioning & visual Q&A.
//
// Mirrors the message protocol of ai-worker-gemma4.js (setModelId / load /
// generate / process / ping) so it drops into the same model-loading pipeline.
// ============================================

// SmolVLM (Idefics3 architecture) is supported in transformers.js v4.
const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.1";

let MODEL_ID = "HuggingFaceTB/SmolVLM-256M-Instruct";
let MODEL_LABEL = "SmolVLM 256M";

// Dynamically imported from transformers.js
let AutoProcessor, AutoModelForImageTextToText, load_image, TextStreamer;

let model = null;
let processor = null;

self.postMessage({ type: "status", message: `[SmolVLM] Loading transformers.js ${TRANSFORMERS_URL.split('@').pop()}...` });

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
            self.postMessage({ type: "status", message: `Loading ${progress.file || label}...`, source: MODEL_ID, loadingPhase: "initiate" });
        } else if (progress.status === "done") {
            self.postMessage({ type: "status", message: `Loaded ${progress.file || label} ✓`, source: MODEL_ID, loadingPhase: "done" });
        }
    };
}

async function loadModel() {
    try {
        self.postMessage({ type: "status", message: `Initializing ${MODEL_LABEL}...` });

        const transformers = await import(TRANSFORMERS_URL);
        AutoProcessor = transformers.AutoProcessor;
        AutoModelForImageTextToText = transformers.AutoModelForImageTextToText;
        load_image = transformers.load_image;
        TextStreamer = transformers.TextStreamer;

        // WebGPU when available, WASM otherwise.
        let device = "wasm";
        if (typeof navigator !== "undefined" && navigator.gpu) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) device = "webgpu";
            } catch (_) { /* keep wasm */ }
        }
        self.postMessage({ type: "status", message: `Using ${device.toUpperCase()} backend...` });

        self.postMessage({ type: "status", message: `Loading ${MODEL_LABEL} processor...` });
        processor = await AutoProcessor.from_pretrained(MODEL_ID, {
            progress_callback: makeProgressCb("processor"),
        });

        self.postMessage({ type: "status", message: `Loading ${MODEL_LABEL} model (${device.toUpperCase()})...` });
        // SmolVLM ships as three ONNX components; transformers.js needs a per-component
        // dtype map (a single string mis-resolves the merged decoder). This mirrors the
        // official transformers.js SmolVLM WebGPU example.
        model = await AutoModelForImageTextToText.from_pretrained(MODEL_ID, {
            dtype: {
                embed_tokens: "fp16",
                vision_encoder: device === "webgpu" ? "q4" : "fp16",
                decoder_model_merged: "q4",
            },
            device: device,
            progress_callback: makeProgressCb("model"),
        });

        self.postMessage({ type: "loaded", device: device });
    } catch (error) {
        self.postMessage({ type: "error", message: `Failed to load ${MODEL_LABEL}: ${error.message}` });
    }
}

async function generate({ userPrompt, prompt, attachments = [], context, messageId, options = {} }) {
    const userText = userPrompt || prompt || context || "Describe this image.";

    if (!model || !processor) {
        self.postMessage({ type: "error", message: "SmolVLM not loaded yet. Please wait for the model to finish loading.", messageId });
        return;
    }

    try {
        self.postMessage({ type: "status", message: "Processing...", messageId });

        // Build the user turn — image tokens first, then text (Idefics3 order).
        const userContent = [];
        let loadedImage = null;
        const imageAtts = (attachments || []).filter(a => a.type === "image");
        for (const att of imageAtts) {
            let url = att.data;
            if (url && !url.startsWith("data:") && !url.startsWith("http")) {
                url = `data:${att.mimeType || "image/png"};base64,${url}`;
            }
            userContent.push({ type: "image" });
            if (!loadedImage) loadedImage = await load_image(url);
        }
        userContent.push({ type: "text", text: userText });

        const messages = [{ role: "user", content: userContent }];

        const formattedPrompt = processor.apply_chat_template(messages, { add_generation_prompt: true });
        const inputs = await processor(formattedPrompt, loadedImage || undefined, { add_special_tokens: false });

        let fullText = "";
        const streamer = new TextStreamer(processor.tokenizer, {
            skip_prompt: true,
            skip_special_tokens: true,
            callback_function: (token) => {
                fullText += token;
                self.postMessage({ type: "token", token, messageId });
            },
        });

        await model.generate({
            ...inputs,
            max_new_tokens: options.maxTokens || 1024,
            do_sample: false,
            streamer,
        });

        self.postMessage({ type: "complete", text: fullText.trim(), messageId });
    } catch (error) {
        self.postMessage({ type: "error", message: `SmolVLM generation failed: ${error.message}`, messageId });
    }
}

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
            console.warn("SmolVLM worker — unknown message type:", type);
    }
});
