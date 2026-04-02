// ============================================================
// js/pretext-resize.js — Shared utility for reflow-free textarea auto-resize
//
// Replaces the double-reflow antipattern used in 9 files:
//   textarea.style.height = 'auto';           // WRITE  (invalidates layout)
//   textarea.style.height = el.scrollHeight   // READ   (forces full reflow)
//
// With a single DOM write using Pretext (canvas-based text measurement):
//   const { height } = layout(prepare(text, font), width, lineH)
//   textarea.style.height = height + 'px';    // WRITE only
//
// Guards against known failure modes:
//   1. system-ui / -apple-system font aliasing on macOS (Pretext caveat)
//   2. Zero clientWidth when panel is hidden (would give infinite line count)
//   3. Padding must be subtracted from clientWidth for accurate line wrapping
//   4. Line height is read from getComputedStyle to match actual rendering
// ============================================================

import { prepare, layout } from '@chenglou/pretext';

// ── Font alias: system-ui is inaccurate on macOS with canvas.measureText ──────
// Pretext's README explicitly warns against this. We swap to Helvetica Neue which
// renders identically to -apple-system on macOS and is measurable by canvas.
function safeFont(el) {
    var cs = getComputedStyle(el);
    var size = cs.fontSize || '14px';
    var family = cs.fontFamily || 'sans-serif';
    // Replace system font aliases with a named equivalent canvas can measure
    family = family.replace(/(-apple-system|BlinkMacSystemFont|system-ui)/g, 'Helvetica Neue');
    return size + ' ' + family;
}

// ── Read exact line height in px ──────────────────────────────────────────────
function lineHeightPx(el) {
    var cs = getComputedStyle(el);
    var lh = cs.lineHeight;
    if (lh === 'normal') {
        // 'normal' = ~1.2 × font-size; use 1.4 as a safe approximation
        return parseFloat(cs.fontSize) * 1.4;
    }
    return parseFloat(lh);
}

// ── Usable inner width (excludes padding so Pretext wraps at the same point CSS does) ─
function innerWidth(el) {
    var cs = getComputedStyle(el);
    return el.clientWidth - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0);
}

// ── Prepare cache: keyed by (text, font) to avoid redundant canvas work ───────
// Real Pretext caches internally too, but an outer cache avoids even the
// cache-lookup overhead on identical consecutive calls (e.g. unfocused re-renders).
var _cache = new Map();
var CACHE_MAX = 500;

function cachedPrepare(text, font) {
    var key = font + '\x00' + text;
    if (_cache.has(key)) return _cache.get(key);
    var result = prepare(text, font, { whiteSpace: 'pre-wrap' });
    if (_cache.size >= CACHE_MAX) {
        // Evict oldest entry (Map preserves insertion order)
        _cache.delete(_cache.keys().next().value);
    }
    _cache.set(key, result);
    return result;
}

// ── Main export: drop-in replacement for the double-reflow pattern ────────────
//
//   Before:  el.style.height = 'auto';
//            el.style.height = Math.min(el.scrollHeight, maxH) + 'px';
//
//   After:   pretextResize(el, maxH);
//
// @param {HTMLTextAreaElement} el     — the textarea to resize
// @param {number}              [maxH] — optional max height cap in px (default: Infinity)
// @returns {boolean}                  — false if skipped (hidden element), true if resized
// ─────────────────────────────────────────────────────────────────────────────
export function pretextResize(el, maxH) {
    // Guard: hidden panel → clientWidth is 0 → would produce wildly wrong height
    var w = innerWidth(el);
    if (w <= 0) return false;

    var font    = safeFont(el);
    var lineH   = lineHeightPx(el);
    var text    = el.value;

    // Empty textarea: set to one line height
    if (!text) {
        var oneLineH = maxH ? Math.min(lineH + 4, maxH) : lineH + 4;
        el.style.height = oneLineH + 'px';
        return true;
    }

    var prepared = cachedPrepare(text, font);
    var result   = layout(prepared, w, lineH);
    var h        = result.height + 4; // +4px bottom breathing room
    if (maxH) h = Math.min(h, maxH);
    h = Math.max(h, lineH + 4);       // never collapse below one line

    el.style.height = h + 'px';
    return true;
}

// ── Expose on MDView for IIFE modules that can't import directly ───────────────
if (window.MDView) {
    window.MDView.pretextResize = pretextResize;
}
