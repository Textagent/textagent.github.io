// ============================================
// app-init.js — Global Event Wiring, Drag/Drop, Keyboard Shortcuts, Escape Handler
// ============================================
(function (M) {
    'use strict';

    // ========================================
    // COPY MARKDOWN BUTTON
    // ========================================
    var copyMarkdownButton = document.getElementById('copy-md-button');
    if (copyMarkdownButton) {
        copyMarkdownButton.addEventListener('click', function () {
            try {
                copyToClipboard(M.markdownEditor.value);
            } catch (e) {
                console.error('Copy failed:', e);
                alert('Failed to copy Markdown: ' + e.message);
            }
        });
    }

    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                showCopiedMessage();
            } else {
                var textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus(); textArea.select();
                var successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) showCopiedMessage();
                else throw new Error('Copy command was unsuccessful');
            }
        } catch (err) {
            console.error('Copy failed:', err);
            alert('Failed to copy Markdown: ' + err.message);
        }
    }

    function showCopiedMessage() {
        if (!copyMarkdownButton) return;
        var originalText = copyMarkdownButton.innerHTML;
        copyMarkdownButton.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
        setTimeout(function () { copyMarkdownButton.innerHTML = originalText; }, 2000);
    }

    // ========================================
    // DRAG & DROP
    // ========================================
    var dropzone = M.dropzone;
    var fileInput = M.fileInput;
    var closeDropzoneBtn = M.closeDropzoneBtn;

    var dropEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
    dropEvents.forEach(function (eventName) {
        dropzone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

    ['dragenter', 'dragover'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function () { dropzone.classList.add('active'); }, false);
    });
    ['dragleave', 'drop'].forEach(function (eventName) {
        dropzone.addEventListener(eventName, function () { dropzone.classList.remove('active'); }, false);
    });

    dropzone.addEventListener('drop', handleDrop, false);
    dropzone.addEventListener('click', function (e) {
        if (e.target !== closeDropzoneBtn && !closeDropzoneBtn.contains(e.target)) fileInput.click();
    });
    closeDropzoneBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropzone.style.display = 'none';
    });

    function handleDrop(e) {
        var dt = e.dataTransfer;
        var files = dt.files;
        if (files.length) {
            var file = files[0];
            var ext = M.getFileExtension(file.name);
            if (M.SUPPORTED_EXTENSIONS[ext]) {
                M.importFile(file);
            } else {
                alert('Unsupported file format: .' + ext + '\n\nSupported: MD, DOCX, XLSX, CSV, HTML, JSON, XML, PDF');
            }
        }
    }

    // ========================================
    // GLOBAL KEYBOARD SHORTCUTS
    // ========================================
    document.addEventListener('keydown', function (e) {
        // Ctrl+S → Export MD
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            M.exportMd.click();
        }
        // Ctrl+Shift+S → Toggle sync scrolling (only in split view)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            if (M.currentViewMode === 'split') M.toggleSyncScrolling();
        }
        // Ctrl+F → Find & Replace
        if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
            if (document.activeElement === M.markdownEditor || document.getElementById('find-replace-bar').style.display === 'block') {
                e.preventDefault();
                M.openFindBar();
            }
        }
    });

    // ========================================
    // VIEW MODE BUTTON WIRING
    // ========================================
    M.viewModeButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            M.setViewMode(this.getAttribute('data-mode'));
        });
    });
    M.mobileViewModeButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            M.closeMobileMenu();
            M.setViewMode(this.getAttribute('data-mode'));
        });
    });
    if (M.mobileToggleSync) {
        M.mobileToggleSync.addEventListener('click', function () { M.toggleSyncScrolling(); });
    }

    // ========================================
    // SCROLL SYNC EVENT WIRING
    // ========================================
    M.editorPane.addEventListener('scroll', function () { M.syncEditorToPreview(); });
    M.previewPane.addEventListener('scroll', function () { M.syncPreviewToEditor(); });
    if (M.toggleSyncButton) {
        M.toggleSyncButton.addEventListener('click', function () { M.toggleSyncScrolling(); });
    }

    // ========================================
    // THEME TOGGLE
    // ========================================
    if (M.themeToggle) {
        M.themeToggle.addEventListener('click', function () {
            M.isDarkMode = !M.isDarkMode;
            document.documentElement.setAttribute('data-theme', M.isDarkMode ? 'dark' : 'light');
            this.querySelector('i').className = M.isDarkMode ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
            localStorage.setItem('md-viewer-dark', M.isDarkMode);
            M.initMermaid();
            M.renderMarkdown();
        });
    }

    // ========================================
    // FILE INPUT & EXPORT
    // ========================================
    M.fileInput.addEventListener('change', function (e) {
        if (e.target.files.length) M.importFile(e.target.files[0]);
    });
    M.importButton.addEventListener('click', function () {
        if (M.dropzone.style.display === 'block') M.dropzone.style.display = 'none';
        else M.dropzone.style.display = 'block';
    });
    M.exportMd.addEventListener('click', function () {
        var blob = new Blob([M.markdownEditor.value], { type: 'text/markdown' });
        saveAs(blob, 'document.md');
    });
    M.exportHtml.addEventListener('click', function () {
        var htmlContent = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Markdown Export</title></head><body>' + M.markdownPreview.innerHTML + '</body></html>';
        var blob = new Blob([htmlContent], { type: 'text/html' });
        saveAs(blob, 'document.html');
    });

    // ========================================
    // SHARE BUTTON WIRING
    // ========================================
    document.getElementById('share-button').addEventListener('click', function () { M.shareMarkdown(); });
    document.getElementById('mobile-share-button').addEventListener('click', function () {
        M.closeMobileMenu();
        M.shareMarkdown();
    });

    // ========================================
    // LOAD SHARED CONTENT ON PAGE LOAD
    // ========================================
    M.loadSharedMarkdown();

    // ========================================
    // UNIFIED ESCAPE KEY HANDLER
    // ========================================
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        // Priority order: topmost overlay wins
        if (M.memoryModalOpen) { M.closeMemoryModal(); return; }
        var aiApikeyModal = document.getElementById('ai-apikey-modal');
        if (aiApikeyModal && aiApikeyModal.style.display === 'flex') { if (M.hideApiKeyModal) M.hideApiKeyModal(); return; }
        var aiConsentModal = document.getElementById('ai-consent-modal');
        if (aiConsentModal && aiConsentModal.style.display === 'flex') { if (M.hideAiConsentDialog) M.hideAiConsentDialog(); return; }
        var mermaidModal = document.getElementById('mermaid-zoom-modal');
        if (mermaidModal && mermaidModal.classList.contains('active')) { M.closeMermaidModal(); return; }
        if (M.isPresentationActive && M.isPresentationActive()) { M.exitPresentation(); return; }
        var shareResultModal = document.getElementById('share-result-modal');
        if (shareResultModal && shareResultModal.classList.contains('active')) { M.closeShareResultModal(); return; }
        if (M.aiPanelOpen) { M.closeAiPanel(); return; }
        var findBar = document.getElementById('find-replace-bar');
        if (findBar && findBar.style.display === 'block') { M.closeFindBar(); return; }
        if (M.isZenMode) { M.toggleZenMode(); return; }
    });

    // ========================================
    // INITIAL VIEW MODE
    // ========================================
    M.setViewMode('split');

})(window.MDView);
