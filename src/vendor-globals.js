// ==============================================
// src/vendor-globals.js — Set up window globals
// Must be imported BEFORE local modules
// ==============================================

// CSS imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'github-markdown-css/github-markdown.css';
import 'highlight.js/styles/github.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'emoji-toolkit/extras/css/joypixels.min.css';

// npm library imports
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import pako from 'pako';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import * as XLSX from 'xlsx';
import * as math from 'mathjs';
import mermaid from 'mermaid';
import * as bootstrap from 'bootstrap';
import joypixels from 'emoji-toolkit';

// Expose as globals for IIFE modules
window.marked = marked;
window.hljs = hljs;
window.DOMPurify = DOMPurify;
window.saveAs = saveAs;
window.html2pdf = html2pdf;
window.jspdf = { jsPDF };
window.html2canvas = html2canvas;
window.pako = pako;
window.mammoth = mammoth;
window.TurndownService = TurndownService;
window.XLSX = XLSX;
window.math = math;
window.mermaid = mermaid;
window.bootstrap = bootstrap;
window.joypixels = joypixels;
