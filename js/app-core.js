// ============================================
// app-core.js — Shared State, DOM Refs, Config
// ============================================
(function () {
    'use strict';

    const M = window.MDView = {};

    // --- Timing / Render State ---
    M.markdownRenderTimeout = null;
    M.RENDER_DELAY = 300;
    M.syncScrollingEnabled = true;
    M.isEditorScrolling = false;
    M.isPreviewScrolling = false;
    M.scrollSyncTimeout = null;
    M.SCROLL_SYNC_DELAY = 10;

    // View Mode State — initialised to null so the first setViewMode('split')
    // in app-init.js runs its full path (including renderMarkdown).
    M.currentViewMode = null;

    // --- DOM Element References ---
    M.markdownEditor = document.getElementById("markdown-editor");
    M.markdownPreview = document.getElementById("markdown-preview");
    M.themeToggle = document.getElementById("theme-toggle");
    M.importButton = document.getElementById("import-button");
    M.fileInput = document.getElementById("file-input");
    M.exportMd = document.getElementById("export-md");
    M.exportHtml = document.getElementById("export-html");
    M.exportPdf = document.getElementById("export-pdf");
    M.copyMarkdownButton = document.getElementById("copy-markdown-button");
    M.dropzone = document.getElementById("dropzone");
    M.closeDropzoneBtn = document.getElementById("close-dropzone");
    M.toggleSyncButton = document.getElementById("toggle-sync");
    M.editorPane = M.markdownEditor; // alias
    M.previewPane = document.querySelector(".preview-pane");
    M.readingTimeElement = document.getElementById("reading-time");
    M.wordCountElement = document.getElementById("word-count");
    M.charCountElement = document.getElementById("char-count");

    // View Mode Elements
    M.contentContainer = document.querySelector(".content-container");
    M.viewModeButtons = document.querySelectorAll(".view-mode-btn");
    M.mobileViewModeButtons = document.querySelectorAll(".mobile-view-mode-btn");

    // Resize Divider Elements
    M.resizeDivider = document.querySelector(".resize-divider");
    M.editorPaneElement = document.querySelector(".editor-pane");
    M.previewPaneElement = document.querySelector(".preview-pane");
    M.isResizing = false;
    M.editorWidthPercent = 50;
    M.MIN_PANE_PERCENT = 20;

    // Mobile Menu Elements
    M.mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    M.mobileMenuPanel = document.getElementById("mobile-menu-panel");
    M.mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
    M.mobileCloseMenu = document.getElementById("close-mobile-menu");
    M.mobileReadingTime = document.getElementById("mobile-reading-time");
    M.mobileWordCount = document.getElementById("mobile-word-count");
    M.mobileCharCount = document.getElementById("mobile-char-count");
    M.mobileToggleSync = document.getElementById("mobile-toggle-sync");
    M.mobileImportBtn = document.getElementById("mobile-import-button");
    M.mobileExportMd = document.getElementById("mobile-export-md");
    M.mobileExportHtml = document.getElementById("mobile-export-html");
    M.mobileExportPdf = document.getElementById("mobile-export-pdf");
    M.mobileCopyMarkdown = document.getElementById("mobile-copy-markdown");
    M.mobileThemeToggle = document.getElementById("mobile-theme-toggle");

    // --- Theme Initialization ---
    const savedTheme = localStorage.getItem('markdown-viewer-theme');
    const prefersDarkMode =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDarkMode ? "dark" : "light");

    document.documentElement.setAttribute("data-theme", initialTheme);

    M.themeToggle.innerHTML = initialTheme === "dark"
        ? '<i class="bi bi-sun"></i>'
        : '<i class="bi bi-moon"></i>';

    // --- Mermaid Initialization ---
    M.initMermaid = function () {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const mermaidTheme = currentTheme === "dark" ? "dark" : "default";

        window.mermaid.initialize({
            startOnLoad: false,
            theme: mermaidTheme,
            securityLevel: 'strict',
            flowchart: { useMaxWidth: true, htmlLabels: true },
            fontSize: 16
        });
    };

    try {
        M.initMermaid();
    } catch (e) {
        console.warn("Mermaid initialization failed:", e);
    }

    // --- Marked Options ---
    M.markedOptions = {
        gfm: true,
        breaks: false,
        pedantic: false,
        smartypants: false,
        xhtml: false,
        headerIds: true,
        mangle: false,
    };
})();
