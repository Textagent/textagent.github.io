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
import '../css/linux-terminal.css';
import '../css/toast.css';

// 3. Local modules — must use dynamic import so they
//    execute AFTER vendor-globals has set window.*
async function loadModules() {
    // Phase 1: Core (must load in order — each depends on prior)
    await import('../js/storage-keys.js');
    await import('../js/product-metadata.js');
    await import('../js/toast.js');
    await import('../js/modal-templates.js');
    await import('../js/app-core.js');
    await import('../js/renderer.js');
    await import('../js/workspace.js');
    await import('../js/disk-workspace.js');

    // Phase 2: Critical UI — loaded immediately so buttons work on first paint.
    // These provide setViewMode, importFile, shareMarkdown, editor wiring, etc.
    await Promise.all([
        import('../js/ui-panels.js'),
        import('../js/editor-features.js'),
        import('../js/file-converters.js'),
        import('../js/cloud-share.js'),
        import('../js/toolbar-overflow.js'),
    ]);

    // app-init.js must load after Phase 2 — it wires event handlers
    // and calls setViewMode('split') at the end.
    await import('../js/app-init.js');

    // Phase 3: Non-critical features — loaded immediately after Phase 2
    // so all button handlers are registered promptly.
    // (Phase 2 already ensures the critical rendering path is unblocked.)

    // 3a: Independent features (parallel — no inter-dependencies)
    await Promise.all([
        import('../js/pdf-export.js'),
        import('../js/mermaid-toolbar.js'),
        import('../js/executable-blocks.js'),
        import('../js/ai-models.js'),
        import('../js/llm-memory.js'),
        import('../js/speechToText.js'),
        import('../js/table-tools.js'),
        import('../js/feature-demos.js'),
        import('../js/help-mode.js'),
    ]);

    // 3b: Sub-modules that depend on 3a namespaces (M._exec, M._table)
    await Promise.all([
        import('../js/exec-math.js'),
        import('../js/exec-python.js'),
        import('../js/exec-sandbox.js'),
        import('../js/coding-blocks.js'),
        import('../js/table-sort-filter.js'),
        import('../js/table-analytics.js'),
    ]);

    // 3b-ext: Context Memory (depends on M._exec.getSqlJs from exec-sandbox.js)
    await import('../js/context-memory.js');

    // 3c: Templates (parallel — all independent data modules)
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
        import('../js/templates/agents.js'),
    ]);
    await import('../js/templates.js');

    // 3d: AI (depends on ai-models from 3a)
    await import('../js/ai-web-search.js');
    await import('../js/ai-assistant.js');
    await import('../js/ai-chat.js');
    await import('../js/ai-actions.js');
    await import('../js/ai-image.js');

    // 3e: DocGen (depends on ai-assistant's requestAiTask API)
    await import('../js/ai-docgen.js');
    await import('../js/ai-docgen-generate.js');
    await import('../js/ai-docgen-ui.js');

    // 3f: API Component (depends on M._showToast from ai-docgen)
    await import('../js/api-docgen.js');

    // 3g: Linux Terminal Component (depends on M._showToast)
    await import('../js/linux-docgen.js');
}

loadModules();

