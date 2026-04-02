# ⚡ Pretext × TextAgent — Annotation Examples

> **How to use:** These `{{Annotate:}}` blocks render interactive canvas layers.  
> Draw with the pen ✏️, highlight 🖍️, add arrows ➡️ or erase 🧹.  
> Annotations are **auto-saved** to your browser. Export as PNG or insert into this document.

---

## 1 · Blank Canvas — Free Sketch

Annotate freely on an empty canvas. Great for diagrams, brainstorming maps, or lecture notes.

{{Annotate: Brainstorm — Q2 Ideas
}}

---

## 2 · Image Annotation — Ant Anatomy

Draw labels, arrows, and callouts directly over the image. The canvas floats perfectly on top — no DOM reflow interference.

{{Annotate: Camponotus flavomarginatus
  @source: https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/640px-Camponotus_flavomarginatus_ant.jpg
}}

> Try the **Arrow** tool ➡️ to label the head, thorax, and abdomen.  
> Use **Highlight** 🖍️ to mark the antennae segment.

---

## 3 · Cell Biology Diagram

{{Annotate: Cell Organelles
  @source: https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Animal_Cell.svg/640px-Animal_Cell.svg.png
}}

---

## 4 · World Map Annotations

Mark regions, draw trade routes, or highlight areas of interest.

{{Annotate: World Trade Routes — 2026
  @source: https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/640px-World_map_-_low_resolution.svg.png
}}

---

## 5 · Circuit Diagram Review

{{Annotate: PCB Review Notes
  @source: https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Pcb_design_altium.jpg/640px-Pcb_design_altium.jpg
}}

> Use **Arrow** ➡️ to flag suspect components.  
> Use **Red pen** for errors, **Green pen** for verified sections.

---

## 6 · Blank Whiteboard — Architecture Planning

{{Annotate: System Architecture Draft
}}

{{Annotate: API Flow Diagram
}}

---

## About Pretext Reflow

The scanline text-reflow engine (live at [`/pretext-reflow-demo.html`](http://localhost:8877/pretext-reflow-demo.html)) uses `canvas.measureText()` and a per-row `getImageData()` pass to compute **pixel-precise exclusion zones** around any drawn shape — zero DOM reflows.

| Feature | DOM / CSS | Pretext Canvas |
|---|---|---|
| Reflows per annotation | **∞** (layout thrash) | **0** |
| Shape awareness | ❌ None | ✅ Per-pixel |
| Freehand exclusion | ❌ | ✅ Exact stroke outline |
| Speed | Slow (synchronous) | **~0.5ms** per reflow |

```javascript
// The core scanline read — zero DOM access
var pixels = maskCtx.getImageData(0, scanY, width, 1).data;
// Pack words into gaps between non-transparent pixels
```
