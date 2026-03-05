// ==============================================
// src/vendor-globals.js — Set up window globals
// Must be imported BEFORE local modules
//
// PERF: Heavy libs (export, converters, mathjs) are
//       lazy-loaded on first use via async getters.
//       Core libs (marked, hljs, DOMPurify, mermaid)
//       remain eager since they're needed on every render.
// ==============================================

// CSS imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'github-markdown-css/github-markdown.css';
import 'highlight.js/styles/github.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'emoji-toolkit/extras/css/joypixels.min.css';

// === EAGER (needed at startup) ===
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import pako from 'pako';
import mermaid from 'mermaid';
import * as bootstrap from 'bootstrap';
import joypixels from 'emoji-toolkit';

window.marked = marked;
window.hljs = hljs;
window.DOMPurify = DOMPurify;
window.pako = pako;
window.mermaid = mermaid;
window.bootstrap = bootstrap;
window.joypixels = joypixels;

// === LAZY (loaded on first use) ===
// Each lazy lib is loaded via a getter that caches the module.
// Consumer code calls: const lib = await window.getXXX();

// --- Export libs (only on PDF/HTML export) ---
let _html2pdf, _jsPDF, _html2canvas, _saveAs;

window.getHtml2pdf = async function () {
    if (!_html2pdf) {
        const mod = await import('html2pdf.js');
        _html2pdf = mod.default;
        window.html2pdf = _html2pdf;
    }
    return _html2pdf;
};
window.getJsPDF = async function () {
    if (!_jsPDF) {
        const mod = await import('jspdf');
        _jsPDF = mod.jsPDF;
        window.jspdf = { jsPDF: _jsPDF };
    }
    return _jsPDF;
};
window.getHtml2canvas = async function () {
    if (!_html2canvas) {
        const mod = await import('html2canvas');
        _html2canvas = mod.default;
        window.html2canvas = _html2canvas;
    }
    return _html2canvas;
};
window.getSaveAs = async function () {
    if (!_saveAs) {
        const mod = await import('file-saver');
        _saveAs = mod.saveAs;
        window.saveAs = _saveAs;
    }
    return _saveAs;
};

// --- File converters (only on .docx / .xlsx / .html import) ---
let _mammoth, _TurndownService, _XLSX;

window.getMammoth = async function () {
    if (!_mammoth) {
        const mod = await import('mammoth');
        _mammoth = mod.default;
        window.mammoth = _mammoth;
    }
    return _mammoth;
};
window.getTurndownService = async function () {
    if (!_TurndownService) {
        const mod = await import('turndown');
        _TurndownService = mod.default;
        window.TurndownService = _TurndownService;
    }
    return _TurndownService;
};
window.getXLSX = async function () {
    if (!_XLSX) {
        const mod = await import('xlsx');
        _XLSX = mod;
        window.XLSX = _XLSX;
    }
    return _XLSX;
};

// --- Math (only when doc has ```math blocks) ---
let _math;

window.getMathjs = async function () {
    if (!_math) {
        const mod = await import('mathjs');
        _math = mod;
        window.math = _math;
    }
    return _math;
};
