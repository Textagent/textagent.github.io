# Two-Stage RT-DETR → Gemma 4 Vision Pipeline

- New `ai-worker-detr.js` — transient Web Worker for RT-DETR object detection using `@huggingface/transformers@3.5.2`
- Primary model `onnx-community/rt-detr-r18-enc3-coco` (80 COCO classes, ~85 MB) with fallback to `onnx-community/rtdetr-r18-cppe5`
- WebGPU-first with WASM fallback; detection threshold: 0.3
- `rt-detr` model entry added to `ai-models.js` with `hidden: true` (not shown in main selector — used internally by Vision cards)
- `@detect: yes` / `@detect: no` field parsed in Vision card renderer (`ai-docgen.js`)
- 🔍 **Detect toggle button** added to Vision card header — toggles `active` CSS class, updates `@detect:` field in markdown source, updates card's `data-detect` attribute and modality hint footer inline
- `.ai-vision-detections` panel div now rendered into every Vision card (hidden by default, appears when RT-DETR runs)
- Modality hint footer updates to show: `· 🔍 RT-DETR detect → Gemma 4 describe` when detect is active
- `runDetrDetection(imageDataUrl, blockIndex)` in `ai-docgen-generate.js`: spins up a transient DETR worker, streams load progress into the detection panel, sends the image for detection, awaits results, calls `renderDetrDetections()`, terminates worker; 120 s timeout safety
- `renderDetrDetections(imageDataUrl, detections, blockIndex)`: draws image onto Canvas at max 520px width with colour-coded bounding boxes (label + % confidence drawn on box), renders per-class confidence pills below using `DETR_COLORS` palette (10-colour rotating)
- Vision block handler in `ai-docgen-generate.js` restructured as explicit two stages:
  - **Stage 1**: if `data-detect="true"` + image attachment present → `runDetrDetection()` → structured detection list
  - **Stage 2**: inject `"Detected objects (from RT-DETR): person (97%), laptop (94%), …\n\n[user prompt]"` into Gemma 4 → Gemma 4 receives both visual tokens + detection anchors for grounded, richer descriptions
- CSS additions in `ai-docgen.css`:
  - `.ai-vision-detections` panel (dark bg, cyan border, `fadeInDown` animation)
  - `.ai-detr-canvas` (full-width, rounded top corners)
  - `.ai-detr-header` + `.ai-detr-model-badge` (uppercase pill badge)
  - `.ai-detr-pills` + `.ai-detr-pill` — per-class confidence pills with `color-mix()` theming via `--detr-color` CSS variable
  - `.ai-detr-pill-dot` — colour swatch dot
  - `.ai-detr-progress` / `.ai-detr-progress-bar` — cyan gradient download progress bar
  - `.ai-detr-status` / `.ai-detr-empty` — italic status + empty state text
  - `.ai-vision-detect-toggle.active` — glowing cyan highlight when detect is enabled
  - Light theme variants for all new elements

---

## Summary

Implements a two-stage object detection + scene description pipeline directly inside the `{{@Vision:}}` DocGen card. When the user clicks 🔍 Detect, RT-DETR (80-class COCO, ~85 MB, runs locally via WebGPU/WASM) runs as a first pass on the uploaded image — drawing colour-coded bounding boxes onto a Canvas overlay and rendering confidence pill badges. The detected objects are then automatically injected as structured context into the Gemma 4 prompt, giving the model grounded object anchors for richer, more accurate scene descriptions. Inspired by Roboflow's RF-DETR + Gemma demo workflow.

---

## Files Changed (5 total)

| File | Type | Description |
|------|------|-------------|
| `ai-worker-detr.js` | NEW | RT-DETR Web Worker — object detection pipeline |
| `js/ai-models.js` | MODIFY | `rt-detr` model registry entry (hidden, internal) |
| `js/ai-docgen.js` | MODIFY | `@detect:` field parsing, 🔍 toggle button, detect toggle click handler |
| `js/ai-docgen-generate.js` | MODIFY | `runDetrDetection()`, `renderDetrDetections()`, two-stage Vision block handler |
| `css/ai-docgen.css` | MODIFY | Detection panel, bbox canvas, pills, progress bar, active detect button |
