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
import '../css/table-tools.css';
import '../css/ai-docgen.css';
import '../css/feature-demos.css';
import '../css/help-mode.css';
import '../css/workspace.css';

// 3. Local modules — must use dynamic import so they
//    execute AFTER vendor-globals has set window.*
async function loadModules() {
    // Phase 1: Core (must load in order — each depends on prior)
    await import('../js/modal-templates.js');
    await import('../js/app-core.js');
    await import('../js/renderer.js');
    await import('../js/workspace.js');

    // Phase 2: Independent features (parallel — no inter-dependencies)
    await Promise.all([
        import('../js/file-converters.js'),
        import('../js/pdf-export.js'),
        import('../js/mermaid-toolbar.js'),
        import('../js/executable-blocks.js'),
        import('../js/editor-features.js'),
        import('../js/ui-panels.js'),
        import('../js/toolbar-overflow.js'),
        import('../js/cloud-share.js'),
        import('../js/ai-models.js'),
        import('../js/llm-memory.js'),
        import('../js/speechToText.js'),
        import('../js/table-tools.js'),
        import('../js/feature-demos.js'),
        import('../js/help-mode.js'),
    ]);

    // Phase 3: Templates (parallel — all independent data modules)
    await Promise.all([
        import('../js/templates/documentation.js'),
        import('../js/templates/project.js'),
        import('../js/templates/technical.js'),
        import('../js/templates/creative.js'),
        import('../js/templates/coding.js'),
        import('../js/templates/maths.js'),
        import('../js/templates/ppt.js'),
        import('../js/templates/quiz.js'),
        import('../js/templates/tables.js'),
        import('../js/templates/ai.js'),
    ]);
    await import('../js/templates.js');

    // Phase 4: AI (depends on ai-models from phase 2)
    await import('../js/ai-assistant.js');

    // Phase 4.5: DocGen (depends on ai-assistant's requestAiTask API)
    await import('../js/ai-docgen.js');

    // Phase 5: Init wiring (must be last — wires everything together)
    await import('../js/app-init.js');
}

loadModules();
