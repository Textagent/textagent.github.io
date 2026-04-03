// ============================================
// ai-worker-detr.js — RT-DETR Object Detection Worker
// Model: onnx-community/rt-detr-r18-cppe5  (COCO-80 fallback: onnx-community/rt-detr-v2-r18-enc3-coco)
// Pipeline: object-detection
// Role: First-pass detector — feeds bounding boxes + labels to Gemma 4
// ============================================

const TRANSFORMERS_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.2";

// Primary: small RT-DETR r18 trained on COCO (80 classes, ~83 MB)
const MODEL_PRIMARY  = "onnx-community/rt-detr-r18-enc3-coco";
const MODEL_FALLBACK = "onnx-community/rtdetr-r18-cppe5";
let   MODEL_ID       = MODEL_PRIMARY;

let pipeline = null;
let detector = null;

self.postMessage({ type: "status", message: "[DETR] Initialising RT-DETR worker…" });

// ─────────────────────────────────────────────
// Progress callback
// ─────────────────────────────────────────────
function makeProgressCb() {
    return (progress) => {
        if (progress.status === "progress") {
            self.postMessage({
                type: "progress",
                file: progress.file || "RT-DETR",
                loaded: progress.loaded || 0,
                total: progress.total || 0,
                progress: progress.progress || 0,
                source: MODEL_ID,
            });
        } else if (progress.status === "initiate") {
            self.postMessage({ type: "status", message: `Loading ${progress.file || "RT-DETR"}…`, loadingPhase: "initiate" });
        } else if (progress.status === "done") {
            self.postMessage({ type: "status", message: `Loaded ${progress.file || "RT-DETR"} ✓`, loadingPhase: "done" });
        }
    };
}

// ─────────────────────────────────────────────
// Load model
// ─────────────────────────────────────────────
async function loadModel() {
    try {
        self.postMessage({ type: "status", message: "Initialising RT-DETR (object detection)…" });

        const transformers = await import(TRANSFORMERS_URL);
        pipeline = transformers.pipeline;

        // WebGPU if available
        let device = "wasm";
        if (typeof navigator !== "undefined" && navigator.gpu) {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) device = "webgpu";
        }
        self.postMessage({ type: "status", message: `RT-DETR using ${device.toUpperCase()}…` });

        async function tryLoad(modelId) {
            detector = await pipeline("object-detection", modelId, {
                device,
                progress_callback: makeProgressCb(),
            });
        }

        try {
            await tryLoad(MODEL_PRIMARY);
        } catch (e) {
            console.warn("[DETR] Primary model failed:", e.message, "→ falling back to", MODEL_FALLBACK);
            self.postMessage({ type: "status", message: "Falling back to CPPE-5 RT-DETR model…" });
            MODEL_ID = MODEL_FALLBACK;
            await tryLoad(MODEL_FALLBACK);
        }

        self.postMessage({ type: "loaded", device, modelId: MODEL_ID });
    } catch (err) {
        self.postMessage({ type: "error", message: `RT-DETR failed to load: ${err.message}` });
    }
}

// ─────────────────────────────────────────────
// Detect — returns structured detection list
// ─────────────────────────────────────────────
async function detect({ imageData, threshold = 0.35, messageId }) {
    if (!detector) {
        self.postMessage({ type: "error", message: "RT-DETR not loaded yet.", messageId });
        return;
    }

    try {
        self.postMessage({ type: "status", message: "Running RT-DETR object detection…", messageId });

        // imageData is a base64 data-URL string (data:image/jpeg;base64,...)
        const output = await detector(imageData, { threshold });

        // output: [{ score, label, box: { xmin, ymin, xmax, ymax } }, ...]
        // Sort by confidence descending
        const sorted = [...output].sort((a, b) => b.score - a.score);

        self.postMessage({
            type: "detections",
            detections: sorted,
            messageId,
        });
    } catch (err) {
        self.postMessage({ type: "error", message: `RT-DETR detection failed: ${err.message}`, messageId });
    }
}

// ─────────────────────────────────────────────
// Message handler
// ─────────────────────────────────────────────
self.addEventListener("message", async (event) => {
    const { type } = event.data;

    switch (type) {
        case "load":
            await loadModel();
            break;

        case "detect":
            await detect({
                imageData: event.data.imageData,
                threshold: event.data.threshold || 0.35,
                messageId: event.data.messageId,
            });
            break;

        case "ping":
            self.postMessage({ type: "pong" });
            break;

        default:
            console.warn("[DETR worker] Unknown message type:", type);
    }
});
