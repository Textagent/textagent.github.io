// ==============================================
// src/main.js — Vite entry point
// Step 1: Import vendor globals (sets window.*)
// Step 2: Import local CSS
// Step 3: Dynamically import local modules in order
// ==============================================

// 1. Vendor globals — this runs first because it's
//    the only static import. It sets window.marked,
//    window.mermaid, window.DOMPurify, etc.
import './vendor-globals.js';

// 2. Local CSS
import '../css/base.css';
import '../css/editor.css';
import '../css/header.css';
import '../css/themes.css';
import '../css/code-blocks.css';
import '../css/view-mode.css';
import '../css/mermaid.css';
import '../css/modals.css';
import '../css/formatting.css';
import '../css/toc.css';
import '../css/features.css';
import '../css/slides.css';
import '../css/ai-panel.css';
import '../css/speech.css';

// 3. Local modules — must use dynamic import so they
//    execute AFTER vendor-globals has set window.*
async function loadModules() {
    await import('../js/modal-templates.js');
    await import('../js/app-core.js');
    await import('../js/renderer.js');
    await import('../js/file-converters.js');
    await import('../js/pdf-export.js');
    await import('../js/mermaid-toolbar.js');
    await import('../js/executable-blocks.js');
    await import('../js/editor-features.js');
    await import('../js/ui-panels.js');
    await import('../js/toolbar-overflow.js');
    await import('../js/templates/documentation.js');
    await import('../js/templates/project.js');
    await import('../js/templates/technical.js');
    await import('../js/templates/creative.js');
    await import('../js/templates/coding.js');
    await import('../js/templates/maths.js');
    await import('../js/templates/ppt.js');
    await import('../js/templates/quiz.js');
    await import('../js/templates.js');
    await import('../js/cloud-share.js');
    await import('../js/ai-models.js');
    await import('../js/ai-assistant.js');
    await import('../js/llm-memory.js');
    await import('../js/speechToText.js');
    await import('../js/app-init.js');
}

loadModules();
