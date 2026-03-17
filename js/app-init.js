// ============================================
// app-init.js — Global Event Wiring, Drag/Drop, Keyboard Shortcuts, Escape Handler
// ============================================
(function (M) {
    'use strict';

    // ========================================
    // COPY MARKDOWN BUTTON
    // ========================================
    var copyMarkdownButton = document.getElementById('copy-markdown-button');
    if (copyMarkdownButton) {
        copyMarkdownButton.addEventListener('click', function () {
            try {
                copyToClipboard(M.markdownEditor.value);
            } catch (e) {
                console.error('Copy failed:', e);
                M.showToast('Failed to copy Markdown: ' + e.message, 'error');
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
            M.showToast('Failed to copy Markdown: ' + err.message, 'error');
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
    var quickActionBar = document.getElementById('quick-action-bar');
    var siteHeader = document.querySelector('header');

    // Toggle dropzone ↔ action bar visibility (+ hide/show header)
    function syncQabVisibility() {
        if (quickActionBar) {
            var dropzoneHidden = dropzone.style.display === 'none';
            quickActionBar.style.display = dropzoneHidden ? 'flex' : 'none';
            if (siteHeader) siteHeader.style.display = dropzoneHidden ? 'none' : '';
        }
    }

    // QAB view mode buttons — sync with header view-mode buttons
    var qabViewBtns = quickActionBar ? quickActionBar.querySelectorAll('.qab-view-btn') : [];
    var headerViewBtns = document.querySelectorAll('.view-mode-group .view-mode-btn');

    // Sync QAB active state from header on init
    function syncQabViewState() {
        var activeMode = '';
        headerViewBtns.forEach(function (btn) {
            if (btn.classList.contains('active')) activeMode = btn.getAttribute('data-mode');
        });
        qabViewBtns.forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-mode') === activeMode);
        });
    }

    // Wire QAB view buttons to trigger existing header view-mode buttons
    qabViewBtns.forEach(function (qBtn) {
        qBtn.addEventListener('click', function () {
            var mode = this.getAttribute('data-mode');
            // Click the matching header button (which has all the logic)
            headerViewBtns.forEach(function (hBtn) {
                if (hBtn.getAttribute('data-mode') === mode) hBtn.click();
            });
            // Update QAB active state
            qabViewBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
        });
    });

    // Also sync when header buttons are clicked directly
    headerViewBtns.forEach(function (hBtn) {
        hBtn.addEventListener('click', function () {
            syncQabViewState();
        });
    });

    // Initial sync
    syncQabViewState();

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
    // Also handle drops anywhere on the page (editor, preview, etc.)
    // The dropzone's own handler has stopPropagation, so this won't double-fire
    document.body.addEventListener('drop', function (e) {
        handleDrop(e);
    }, false);
    dropzone.addEventListener('click', function (e) {
        if (e.target !== closeDropzoneBtn && !closeDropzoneBtn.contains(e.target)) fileInput.click();
    });
    closeDropzoneBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropzone.style.display = 'none';
        syncQabVisibility();
    });

    function handleDrop(e) {
        var dt = e.dataTransfer;
        var files = dt.files;
        if (files.length) {
            M.importFile(files[0]);
        }
    }

    // ========================================
    // THREE-LEVEL HEADER VISIBILITY TOGGLE
    // Level 0 = Full header (app-header + dropzone visible)
    // Level 1 = Compact (QAB visible, header hidden)
    // Level 2 = Hidden (everything hidden, floating pill only)
    // ========================================
    var headerLevel = 0;
    var HEADER_LEVEL_KEY = 'ta-header-level';
    var restorePill = document.getElementById('header-restore-pill');

    function setHeaderLevel(level) {
        headerLevel = level;
        localStorage.setItem(HEADER_LEVEL_KEY, String(level));

        if (level === 0) {
            // Full header — show header + dropzone, hide QAB, remove hidden class
            document.body.classList.remove('header-hidden');
            dropzone.style.display = 'block';
            if (quickActionBar) quickActionBar.style.display = 'none';
            if (siteHeader) siteHeader.style.display = '';
        } else if (level === 1) {
            // Compact — hide header + dropzone, show QAB
            document.body.classList.remove('header-hidden');
            dropzone.style.display = 'none';
            if (siteHeader) siteHeader.style.display = 'none';
            if (quickActionBar) quickActionBar.style.display = 'flex';
            syncQabViewState();
        } else if (level === 2) {
            // Hidden — hide everything, show floating restore pill
            dropzone.style.display = 'none';
            if (siteHeader) siteHeader.style.display = 'none';
            if (quickActionBar) quickActionBar.style.display = 'none';
            document.body.classList.add('header-hidden');
        }
    }

    // Collapse header button (in app-header) — level 0 → 1
    var collapseHeaderBtn = document.getElementById('collapse-header-btn');
    if (collapseHeaderBtn) collapseHeaderBtn.addEventListener('click', function () {
        setHeaderLevel(1);
    });

    // QAB header toggle — level 1 → 2 (hide everything)
    if (quickActionBar) {
        var qabHeaderToggle = document.getElementById('qab-header-toggle');
        if (qabHeaderToggle) {
            // Update title/icon to indicate it will hide everything
            qabHeaderToggle.title = 'Hide full header';
            var qabIcon = qabHeaderToggle.querySelector('i');
            if (qabIcon) qabIcon.className = 'bi bi-chevron-up';
            qabHeaderToggle.addEventListener('click', function () {
                setHeaderLevel(2);
            });
        }
    }

    // Floating restore pill — level 2 → 0 (restore full header)
    if (restorePill) restorePill.addEventListener('click', function () {
        setHeaderLevel(0);
    });

    // Restore saved header level on page load
    var savedLevel = parseInt(localStorage.getItem(HEADER_LEVEL_KEY), 10);
    if (savedLevel === 1 || savedLevel === 2) {
        setHeaderLevel(savedLevel);
    }

    // ========================================
    // QUICK ACTION BAR WIRING
    // ========================================
    if (quickActionBar) {
        // New — delegate to existing new-document button
        var qabNew = document.getElementById('qab-new');
        if (qabNew) qabNew.addEventListener('click', function () {
            var btn = document.getElementById('new-document-btn');
            if (btn) btn.click();
        });

        // Import — open file picker directly
        var qabImport = document.getElementById('qab-import');
        if (qabImport) qabImport.addEventListener('click', function () {
            fileInput.click();
        });

        // Export MD / HTML / PDF — delegate to existing export buttons
        var qabExportMd = document.getElementById('qab-export-md');
        if (qabExportMd) qabExportMd.addEventListener('click', function () {
            document.getElementById('export-md').click();
        });
        var qabExportHtml = document.getElementById('qab-export-html');
        if (qabExportHtml) qabExportHtml.addEventListener('click', function () {
            document.getElementById('export-html').click();
        });
        var qabExportPdf = document.getElementById('qab-export-pdf');
        if (qabExportPdf) qabExportPdf.addEventListener('click', function () {
            document.getElementById('export-pdf').click();
        });
        var qabExportLlm = document.getElementById('qab-export-llm-memory');
        if (qabExportLlm) qabExportLlm.addEventListener('click', function () {
            document.getElementById('export-llm-memory').click();
        });

        // Search — open find/replace bar
        var qabSearch = document.getElementById('qab-search');
        if (qabSearch) qabSearch.addEventListener('click', function () {
            M.openFindBar();
        });

        // Template — open template modal
        var qabTemplate = document.getElementById('qab-template');
        if (qabTemplate) qabTemplate.addEventListener('click', function () {
            var btn = document.getElementById('template-btn');
            if (btn) btn.click();
        });

        // Files — toggle workspace sidebar
        var qabFiles = document.getElementById('qab-files');
        if (qabFiles) qabFiles.addEventListener('click', function () {
            var btn = document.getElementById('workspace-toggle');
            if (btn) btn.click();
        });

        // TOC — toggle table of contents
        var qabToc = document.getElementById('qab-toc');
        if (qabToc) qabToc.addEventListener('click', function () {
            var btn = document.getElementById('toc-toggle');
            if (btn) btn.click();
        });

        // Share — share markdown
        var qabShare = document.getElementById('qab-share');
        if (qabShare) qabShare.addEventListener('click', function () {
            var btn = document.getElementById('share-button');
            if (btn) btn.click();
        });

        // Copy — copy markdown
        var qabCopy = document.getElementById('qab-copy');
        if (qabCopy) qabCopy.addEventListener('click', function () {
            var btn = document.getElementById('copy-markdown-button');
            if (btn) btn.click();
        });

        // Present — presentation mode
        var qabPresent = document.getElementById('qab-present');
        if (qabPresent) qabPresent.addEventListener('click', function () {
            var btn = document.getElementById('present-button');
            if (btn) btn.click();
        });

        // Zen — zen mode
        var qabZen = document.getElementById('qab-zen');
        if (qabZen) qabZen.addEventListener('click', function () {
            var btn = document.getElementById('zen-mode-button');
            if (btn) btn.click();
        });

        // Word Wrap — toggle word wrap
        var qabWordwrap = document.getElementById('qab-wordwrap');
        if (qabWordwrap) qabWordwrap.addEventListener('click', function () {
            var btn = document.getElementById('word-wrap-toggle');
            if (btn) btn.click();
        });

        // Focus — focus mode
        var qabFocus = document.getElementById('qab-focus');
        if (qabFocus) qabFocus.addEventListener('click', function () {
            var btn = document.getElementById('focus-mode-toggle');
            if (btn) btn.click();
        });

        // Voice — voice dictation
        var qabVoice = document.getElementById('qab-voice');
        if (qabVoice) qabVoice.addEventListener('click', function () {
            var btn = document.getElementById('speech-to-text-btn');
            if (btn) btn.click();
        });

        // AI — toggle AI assistant panel
        var qabAi = document.getElementById('qab-ai');
        if (qabAi) qabAi.addEventListener('click', function () {
            var btn = document.getElementById('ai-toggle-button');
            if (btn) btn.click();
        });

        // Model — open model selection panel
        var qabModel = document.getElementById('qab-model');
        if (qabModel) qabModel.addEventListener('click', function () {
            var btn = document.getElementById('ai-model-select-btn');
            if (btn) btn.click();
        });

        // Theme — toggle dark/light (direct implementation, header may be hidden)
        var qabTheme = document.getElementById('qab-theme');
        var qabThemeIcon = document.getElementById('qab-theme-icon');
        var qabThemeLabel = document.getElementById('qab-theme-label');
        // Sync icon on init
        if (qabThemeIcon && qabThemeLabel) {
            var curTheme = document.documentElement.getAttribute('data-theme');
            qabThemeIcon.className = curTheme === 'dark' ? 'bi bi-sun-fill me-2' : 'bi bi-moon me-2';
            qabThemeLabel.textContent = curTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
        }
        if (qabTheme) qabTheme.addEventListener('click', function () {
            var currentTheme = document.documentElement.getAttribute('data-theme');
            var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            // Update the header toggle icon
            var headerIcon = document.querySelector('#theme-toggle i');
            if (headerIcon) headerIcon.className = newTheme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
            // Update this dropdown icon + label
            if (qabThemeIcon) qabThemeIcon.className = newTheme === 'dark' ? 'bi bi-sun-fill me-2' : 'bi bi-moon me-2';
            if (qabThemeLabel) qabThemeLabel.textContent = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
            localStorage.setItem(M.KEYS.THEME, newTheme);
            M.isDarkMode = newTheme === 'dark';
            M.initMermaid();
            M.renderMarkdown();
        });

        // Preview Theme — collapsible section toggle
        var qabPreviewToggle = document.getElementById('qab-preview-theme-toggle');
        var qabThemeList = document.getElementById('qab-theme-list');
        var qabChevron = document.getElementById('qab-theme-chevron');
        if (qabPreviewToggle && qabThemeList) {
            qabPreviewToggle.addEventListener('click', function (e) {
                e.stopPropagation(); // prevent dropdown from closing
                var isOpen = qabThemeList.style.display !== 'none';
                qabThemeList.style.display = isOpen ? 'none' : 'block';
                if (qabChevron) qabChevron.className = isOpen ? 'bi bi-chevron-right ms-auto' : 'bi bi-chevron-down ms-auto';
            });
        }

        // Preview Theme — wire each QAB theme option to the header's theme-option
        var qabThemeOptions = document.querySelectorAll('.qab-theme-option');
        function syncQabThemeChecks(activeThemeName) {
            qabThemeOptions.forEach(function (opt) {
                var check = opt.querySelector('.qab-theme-check');
                if (check) check.style.visibility = opt.getAttribute('data-theme-name') === activeThemeName ? 'visible' : 'hidden';
            });
        }
        // Sync checkmarks on init
        syncQabThemeChecks(localStorage.getItem(M.KEYS.PREVIEW_THEME) || 'github');
        qabThemeOptions.forEach(function (qOpt) {
            qOpt.addEventListener('click', function () {
                var themeName = this.getAttribute('data-theme-name');
                // Delegate to the header's theme-option button
                var headerOpt = document.querySelector('.theme-option[data-theme-name="' + themeName + '"]');
                if (headerOpt) headerOpt.click();
                syncQabThemeChecks(themeName);
            });
        });

        // Upload — toggle dropzone in-place (header stays hidden)
        var qabMore = document.getElementById('qab-more');
        if (qabMore) qabMore.addEventListener('click', function () {
            var isVisible = dropzone.style.display !== 'none';
            dropzone.style.display = isVisible ? 'none' : 'block';
        });

        // Help — toggle help mode
        var qabHelp = document.getElementById('qab-help');
        if (qabHelp) qabHelp.addEventListener('click', function () {
            var btn = document.getElementById('help-mode-btn');
            if (btn) btn.click();
        });
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
        // Ctrl+B → Toggle Workspace Sidebar
        if ((e.ctrlKey || e.metaKey) && (e.key === 'b' || e.key === 'B') && !e.shiftKey) {
            e.preventDefault();
            if (M.wsToggleSidebar) M.wsToggleSidebar();
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
    // EDITOR INPUT → RENDER PREVIEW
    // ========================================
    M.markdownEditor.addEventListener('input', function () {
        M.debouncedRender();
    });

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
            var currentTheme = document.documentElement.getAttribute('data-theme');
            var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            this.querySelector('i').className = newTheme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
            localStorage.setItem(M.KEYS.THEME, newTheme);
            M.isDarkMode = newTheme === 'dark';
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
    M.exportMd.addEventListener('click', async function () {
        var saveAs = await window.getSaveAs();
        var blob = new Blob([M.markdownEditor.value], { type: 'text/markdown' });
        saveAs(blob, 'document.md');
    });
    M.exportHtml.addEventListener('click', async function () {
        var saveAs = await window.getSaveAs();

        // Collect all inline CSS from the running page so the export is self-contained
        var cssText = '';
        try {
            for (var i = 0; i < document.styleSheets.length; i++) {
                try {
                    var rules = document.styleSheets[i].cssRules || document.styleSheets[i].rules;
                    if (rules) {
                        for (var j = 0; j < rules.length; j++) {
                            cssText += rules[j].cssText + '\n';
                        }
                    }
                } catch (cssErr) {
                    // Cross-origin stylesheet — skip (CDN fonts, etc.)
                    console.warn('Could not read stylesheet:', cssErr.message);
                }
            }
        } catch (e) {
            console.warn('CSS collection failed:', e);
        }

        // Preserve current theme attributes so theme CSS applies
        var currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        var previewTheme = document.documentElement.getAttribute('data-preview-theme') || '';
        var previewThemeAttr = previewTheme ? ' data-preview-theme="' + previewTheme + '"' : '';

        var htmlContent = '<!DOCTYPE html>\n'
            + '<html lang="en" data-theme="' + currentTheme + '"' + previewThemeAttr + '>\n'
            + '<head>\n'
            + '  <meta charset="utf-8">\n'
            + '  <title>Markdown Export</title>\n'
            + '  <style>\n' + cssText + '  </style>\n'
            + '</head>\n'
            + '<body style="max-width:980px;margin:0 auto;padding:32px 16px;">\n'
            + '  <div class="markdown-body">\n'
            + M.markdownPreview.innerHTML + '\n'
            + '  </div>\n'
            + '</body>\n'
            + '</html>';
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
        if (M.isPresentationActive && M.isPresentationActive() && M.currentViewMode !== 'ppt') { M.exitPresentation(); return; }
        var shareResultModal = document.getElementById('share-result-modal');
        if (shareResultModal && shareResultModal.classList.contains('active')) { M.closeShareResultModal(); return; }
        if (M.aiPanelOpen) { M.closeAiPanel(); return; }
        if (M.wsIsSidebarOpen && M.wsIsSidebarOpen()) { M.wsCloseSidebar(); return; }
        var findBar = document.getElementById('find-replace-bar');
        if (findBar && findBar.style.display === 'block') { M.closeFindBar(); return; }
        if (M.isZenMode) { M.toggleZenMode(); return; }
    });

    // ========================================
    // INITIAL VIEW MODE
    // ========================================
    M.setViewMode('split');
    // ========================================
    // STATS PILL TOGGLE
    // ========================================
    var statsToggle = document.getElementById('stats-toggle');
    var statsPill = document.getElementById('stats-container');
    if (statsToggle && statsPill) {
        // restore saved state
        if (localStorage.getItem(M.KEYS.STATS_OPEN) === 'true') {
            statsPill.classList.add('expanded');
            statsToggle.classList.add('active');
        }
        statsToggle.addEventListener('click', function () {
            var open = statsPill.classList.toggle('expanded');
            statsToggle.classList.toggle('active', open);
            localStorage.setItem(M.KEYS.STATS_OPEN, open);
        });
    }

})(window.MDView);
