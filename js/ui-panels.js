// ============================================
// ui-panels.js — View Mode, Resize, Scroll Sync, TOC, Zen, Presentation, Themes, PlantUML
// ============================================
(function (M) {
    'use strict';

    // ========================================
    // SCROLL SYNCHRONIZATION
    // ========================================
    M.syncEditorToPreview = function () {
        if (!M.syncScrollingEnabled || M.isPreviewScrolling) return;
        var editorScrollable = M.editorPane.scrollHeight - M.editorPane.clientHeight;
        if (editorScrollable <= 0) return;
        M.isEditorScrolling = true;
        clearTimeout(M.scrollSyncTimeout);
        M.scrollSyncTimeout = setTimeout(function () {
            var editorScrollRatio = M.editorPane.scrollTop / editorScrollable;
            var previewScrollable = M.previewPane.scrollHeight - M.previewPane.clientHeight;
            var previewScrollPosition = previewScrollable * editorScrollRatio;
            if (!isNaN(previewScrollPosition) && isFinite(previewScrollPosition)) {
                M.previewPane.scrollTop = previewScrollPosition;
            }
            setTimeout(function () { M.isEditorScrolling = false; }, 50);
        }, M.SCROLL_SYNC_DELAY);
    };

    M.syncPreviewToEditor = function () {
        if (!M.syncScrollingEnabled || M.isEditorScrolling) return;
        var previewScrollable = M.previewPane.scrollHeight - M.previewPane.clientHeight;
        if (previewScrollable <= 0) return;
        M.isPreviewScrolling = true;
        clearTimeout(M.scrollSyncTimeout);
        M.scrollSyncTimeout = setTimeout(function () {
            var previewScrollRatio = M.previewPane.scrollTop / previewScrollable;
            var editorScrollable = M.editorPane.scrollHeight - M.editorPane.clientHeight;
            var editorScrollPosition = editorScrollable * previewScrollRatio;
            if (!isNaN(editorScrollPosition) && isFinite(editorScrollPosition)) {
                M.editorPane.scrollTop = editorScrollPosition;
            }
            setTimeout(function () { M.isPreviewScrolling = false; }, 50);
        }, M.SCROLL_SYNC_DELAY);
    };

    M.toggleSyncScrolling = function () {
        M.syncScrollingEnabled = !M.syncScrollingEnabled;
        if (M.syncScrollingEnabled) {
            M.toggleSyncButton.innerHTML = '<i class="bi bi-link"></i>';
            M.toggleSyncButton.classList.add("sync-enabled");
            M.toggleSyncButton.classList.remove("sync-disabled");
        } else {
            M.toggleSyncButton.innerHTML = '<i class="bi bi-link-45deg"></i>';
            M.toggleSyncButton.classList.add("sync-disabled");
            M.toggleSyncButton.classList.remove("sync-enabled");
        }
    };

    // ========================================
    // VIEW MODE
    // ========================================
    function updateSyncToggleVisibility(mode) {
        var isSplitView = mode === 'split';
        if (M.toggleSyncButton) {
            M.toggleSyncButton.style.display = isSplitView ? '' : 'none';
            M.toggleSyncButton.setAttribute('aria-hidden', !isSplitView);
        }
        if (M.mobileToggleSync) {
            M.mobileToggleSync.style.display = isSplitView ? '' : 'none';
            M.mobileToggleSync.setAttribute('aria-hidden', !isSplitView);
        }
    }

    M.setViewMode = function (mode) {
        if (mode === M.currentViewMode) return;
        var previousMode = M.currentViewMode;
        M.currentViewMode = mode;
        M.contentContainer.classList.remove('view-editor-only', 'view-preview-only', 'view-split');
        M.contentContainer.classList.add('view-' + (mode === 'editor' ? 'editor-only' : mode === 'preview' ? 'preview-only' : 'split'));
        M.viewModeButtons.forEach(function (btn) {
            var btnMode = btn.getAttribute('data-mode');
            btn.classList.toggle('active', btnMode === mode);
            btn.setAttribute('aria-pressed', btnMode === mode ? 'true' : 'false');
        });
        M.mobileViewModeButtons.forEach(function (btn) {
            var btnMode = btn.getAttribute('data-mode');
            btn.classList.toggle('active', btnMode === mode);
            btn.setAttribute('aria-pressed', btnMode === mode ? 'true' : 'false');
        });
        updateSyncToggleVisibility(mode);
        if (mode === 'split') { applyPaneWidths(); }
        else if (previousMode === 'split') { resetPaneWidths(); }
        if (mode === 'split' || mode === 'preview') { M.renderMarkdown(); }
    };

    // ========================================
    // RESIZE DIVIDER
    // ========================================
    function initResizer() {
        if (!M.resizeDivider) return;
        M.resizeDivider.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
        M.resizeDivider.addEventListener('touchstart', startResizeTouch);
        document.addEventListener('touchmove', handleResizeTouch);
        document.addEventListener('touchend', stopResize);
        M.resizeDivider.addEventListener('keydown', function (e) {
            if (M.currentViewMode !== 'split') return;
            var step = 2;
            if (e.key === 'ArrowLeft') { e.preventDefault(); M.editorWidthPercent = Math.max(M.MIN_PANE_PERCENT, M.editorWidthPercent - step); applyPaneWidths(); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); M.editorWidthPercent = Math.min(100 - M.MIN_PANE_PERCENT, M.editorWidthPercent + step); applyPaneWidths(); }
        });
    }

    function startResize(e) {
        if (M.currentViewMode !== 'split') return;
        e.preventDefault(); M.isResizing = true;
        M.resizeDivider.classList.add('dragging'); document.body.classList.add('resizing');
    }
    function startResizeTouch(e) {
        if (M.currentViewMode !== 'split') return;
        e.preventDefault(); M.isResizing = true;
        M.resizeDivider.classList.add('dragging'); document.body.classList.add('resizing');
    }
    function handleResize(e) {
        if (!M.isResizing) return;
        var containerRect = M.contentContainer.getBoundingClientRect();
        var mouseX = e.clientX - containerRect.left;
        var newEditorPercent = (mouseX / containerRect.width) * 100;
        M.editorWidthPercent = Math.max(M.MIN_PANE_PERCENT, Math.min(100 - M.MIN_PANE_PERCENT, newEditorPercent));
        applyPaneWidths();
    }
    function handleResizeTouch(e) {
        if (!M.isResizing || !e.touches[0]) return;
        var containerRect = M.contentContainer.getBoundingClientRect();
        var touchX = e.touches[0].clientX - containerRect.left;
        var newEditorPercent = (touchX / containerRect.width) * 100;
        M.editorWidthPercent = Math.max(M.MIN_PANE_PERCENT, Math.min(100 - M.MIN_PANE_PERCENT, newEditorPercent));
        applyPaneWidths();
    }
    function stopResize() {
        if (!M.isResizing) return;
        M.isResizing = false;
        M.resizeDivider.classList.remove('dragging'); document.body.classList.remove('resizing');
    }
    function applyPaneWidths() {
        if (M.currentViewMode !== 'split') return;
        var previewPercent = 100 - M.editorWidthPercent;
        M.editorPaneElement.style.flex = '0 0 calc(' + M.editorWidthPercent + '% - 4px)';
        M.previewPaneElement.style.flex = '0 0 calc(' + previewPercent + '% - 4px)';
    }
    function resetPaneWidths() {
        M.editorPaneElement.style.flex = '';
        M.previewPaneElement.style.flex = '';
    }

    // ========================================
    // MOBILE MENU
    // ========================================
    function openMobileMenu() {
        M.mobileMenuPanel.classList.add("active");
        M.mobileMenuOverlay.classList.add("active");
    }
    M.closeMobileMenu = function () {
        M.mobileMenuPanel.classList.remove("active");
        M.mobileMenuOverlay.classList.remove("active");
    };
    M.mobileMenuToggle.addEventListener("click", openMobileMenu);
    M.mobileCloseMenu.addEventListener("click", M.closeMobileMenu);
    M.mobileMenuOverlay.addEventListener("click", M.closeMobileMenu);

    function updateMobileStats() {
        M.mobileCharCount.textContent = M.charCountElement.textContent;
        M.mobileWordCount.textContent = M.wordCountElement.textContent;
        M.mobileReadingTime.textContent = M.readingTimeElement.textContent;
    }

    // Wrap updateDocumentStats to also update mobile stats
    var origUpdateStats = M.updateDocumentStats;
    M.updateDocumentStats = function () {
        origUpdateStats.call(this);
        updateMobileStats();
    };

    // ========================================
    // TABLE OF CONTENTS
    // ========================================
    var tocPanelEl = document.getElementById('toc-panel');
    var tocNavEl = document.getElementById('toc-nav');
    var tocToggleBtn = document.getElementById('toc-toggle');
    var tocCloseBtn = document.getElementById('toc-close');
    var tocObserver = null;

    M.buildTOC = function () {
        if (!tocNavEl) return;
        tocNavEl.innerHTML = '';
        var headings = M.markdownPreview.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
            tocNavEl.innerHTML = '<div style="padding:12px;font-size:13px;opacity:0.6">No headings found</div>';
            return;
        }
        headings.forEach(function (heading, i) {
            var level = parseInt(heading.tagName.charAt(1));
            if (!heading.id) heading.id = 'heading-' + i;
            var item = document.createElement('a');
            item.className = 'toc-item';
            item.setAttribute('data-level', level);
            item.textContent = heading.textContent.replace('🔗', '').trim();
            item.href = '#' + heading.id;
            item.addEventListener('click', function (e) {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            tocNavEl.appendChild(item);
        });
        if (tocObserver) tocObserver.disconnect();
        tocObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    tocNavEl.querySelectorAll('.toc-item').forEach(function (item) {
                        item.classList.toggle('active', item.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { root: M.previewPane, rootMargin: '0px 0px -80% 0px', threshold: 0 });
        headings.forEach(function (h) { tocObserver.observe(h); });
    };

    function toggleTOC() {
        var isVisible = tocPanelEl.style.display !== 'none';
        tocPanelEl.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) M.buildTOC();
    }
    M.closeTOC = function () { tocPanelEl.style.display = 'none'; };
    if (tocToggleBtn) tocToggleBtn.addEventListener('click', toggleTOC);
    if (tocCloseBtn) tocCloseBtn.addEventListener('click', M.closeTOC);

    // ========================================
    // ZEN MODE
    // ========================================
    var zenModeBtn = document.getElementById('zen-mode-button');
    var zenExitHint = document.getElementById('zen-exit-hint');
    M.isZenMode = false;

    M.toggleZenMode = function () {
        M.isZenMode = !M.isZenMode;
        document.body.classList.toggle('zen-mode', M.isZenMode);
        document.body.classList.toggle('zen-mode-preview', M.isZenMode && M.currentViewMode === 'preview');
        if (M.isZenMode) {
            if (M.aiPanelOpen && M.closeAiPanel) M.closeAiPanel();
            zenExitHint.style.display = 'block';
            setTimeout(function () { zenExitHint.style.display = 'none'; }, 4000);
            try { document.documentElement.requestFullscreen(); } catch (e) { }
        } else {
            document.body.classList.remove('zen-mode-preview');
            zenExitHint.style.display = 'none';
            try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { }
        }
    };
    if (zenModeBtn) zenModeBtn.addEventListener('click', M.toggleZenMode);
    document.addEventListener('fullscreenchange', function () {
        if (!document.fullscreenElement && M.isZenMode) {
            M.isZenMode = false;
            document.body.classList.remove('zen-mode');
            document.body.classList.remove('zen-mode-preview');
            zenExitHint.style.display = 'none';
        }
    });

    // ========================================
    // PRESENTATION MODE
    // ========================================
    var slideContainer = document.getElementById('slide-container');
    var slideBody = document.getElementById('slide-body');
    var slideCounter = document.getElementById('slide-counter');
    var slidePrevBtn = document.getElementById('slide-prev');
    var slideNextBtn = document.getElementById('slide-next');
    var slideExitBtn = document.getElementById('slide-exit');
    var presentBtn = document.getElementById('present-button');
    var slides = [];
    var currentSlide = 0;

    function parseSlides(markdown) {
        return markdown.split(/\n(?:---|\*\*\*|___)\n/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
    }
    function renderSlide(index) {
        if (index < 0 || index >= slides.length) return;
        currentSlide = index;
        var html = marked.parse(slides[index]);
        var sanitized = DOMPurify.sanitize(html, { ADD_TAGS: ['mjx-container'], ADD_ATTR: ['id', 'class'] });
        slideBody.innerHTML = sanitized;
        M.processEmojis(slideBody);
        if (M.addHeadingAnchors) M.addHeadingAnchors(slideBody);
        if (M.processCallouts) M.processCallouts(slideBody);
        var mermaidNodes = slideBody.querySelectorAll('.mermaid');
        if (mermaidNodes.length > 0) { try { mermaid.run({ nodes: mermaidNodes, suppressErrors: true }); } catch (e) { } }
        if (window.MathJax) { try { MathJax.typesetPromise([slideBody]); } catch (e) { } }
        slideCounter.textContent = (index + 1) + ' / ' + slides.length;
        slidePrevBtn.disabled = index === 0;
        slideNextBtn.disabled = index === slides.length - 1;
    }
    M.startPresentation = function () {
        var md = M.markdownEditor.value;
        slides = parseSlides(md);
        if (slides.length === 0) { alert('No slides found. Use --- (horizontal rule) to separate slides.'); return; }
        currentSlide = 0;
        slideContainer.style.display = 'flex';
        renderSlide(0);
        try { document.documentElement.requestFullscreen(); } catch (e) { }
    };
    M.exitPresentation = function () {
        slideContainer.style.display = 'none';
        slides = []; currentSlide = 0;
        try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { }
    };
    M.isPresentationActive = function () { return slideContainer.style.display !== 'none'; };
    if (presentBtn) presentBtn.addEventListener('click', M.startPresentation);
    if (slideExitBtn) slideExitBtn.addEventListener('click', M.exitPresentation);
    if (slidePrevBtn) slidePrevBtn.addEventListener('click', function () { renderSlide(currentSlide - 1); });
    if (slideNextBtn) slideNextBtn.addEventListener('click', function () { renderSlide(currentSlide + 1); });
    document.addEventListener('keydown', function (e) {
        if (slideContainer.style.display === 'none') return;
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); renderSlide(currentSlide + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); renderSlide(currentSlide - 1); }
    });
    document.addEventListener('fullscreenchange', function () {
        if (!document.fullscreenElement && slideContainer.style.display !== 'none') M.exitPresentation();
    });

    // ========================================
    // CUSTOM PREVIEW THEMES
    // ========================================
    var savedPreviewTheme = localStorage.getItem('md-viewer-preview-theme') || 'github';
    document.documentElement.setAttribute('data-preview-theme', savedPreviewTheme);
    function updateThemeDropdown(themeName) {
        document.querySelectorAll('.theme-option').forEach(function (opt) {
            opt.classList.toggle('active-theme', opt.getAttribute('data-theme-name') === themeName);
        });
    }
    updateThemeDropdown(savedPreviewTheme);
    document.querySelectorAll('.theme-option').forEach(function (opt) {
        opt.addEventListener('click', function () {
            var themeName = this.getAttribute('data-theme-name');
            document.documentElement.setAttribute('data-preview-theme', themeName);
            localStorage.setItem('md-viewer-preview-theme', themeName);
            updateThemeDropdown(themeName);
            M.renderMarkdown();
        });
    });

    // ========================================
    // PLANTUML SUPPORT
    // ========================================
    var PLANTUML_SERVER = 'https://www.plantuml.com/plantuml/svg/';

    function plantumlEncode(text) {
        var data = pako.deflateRaw(new TextEncoder().encode(text), { level: 9, to: 'string' });
        return plantumlBase64Encode(data);
    }
    function plantumlBase64Encode(data) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
        var result = '';
        for (var i = 0; i < data.length; i += 3) {
            var b1 = data.charCodeAt(i) & 0xFF;
            var b2 = i + 1 < data.length ? data.charCodeAt(i + 1) & 0xFF : 0;
            var b3 = i + 2 < data.length ? data.charCodeAt(i + 2) & 0xFF : 0;
            result += chars.charAt(b1 >> 2);
            result += chars.charAt(((b1 & 0x3) << 4) | (b2 >> 4));
            result += chars.charAt(((b2 & 0xF) << 2) | (b3 >> 6));
            result += chars.charAt(b3 & 0x3F);
        }
        return result;
    }
    M.renderPlantUML = function (container) {
        var codeBlocks = container.querySelectorAll('pre code.language-plantuml, pre code.hljs.language-plantuml');
        codeBlocks.forEach(function (codeEl) {
            var pre = codeEl.parentElement;
            if (pre._plantumlProcessed) return;
            pre._plantumlProcessed = true;
            var source = codeEl.textContent.trim();
            if (!source) return;
            var wrapper = document.createElement('div');
            wrapper.className = 'plantuml-container plantuml-loading';
            try {
                var encoded = plantumlEncode(source);
                var img = document.createElement('img');
                img.alt = 'PlantUML Diagram';
                img.src = PLANTUML_SERVER + encoded;
                img.onload = function () { wrapper.classList.remove('plantuml-loading'); };
                img.onerror = function () {
                    wrapper.classList.remove('plantuml-loading');
                    wrapper.classList.add('plantuml-error');
                    wrapper.textContent = 'Failed to render PlantUML diagram';
                };
                wrapper.appendChild(img);
            } catch (e) {
                wrapper.classList.remove('plantuml-loading');
                wrapper.classList.add('plantuml-error');
                wrapper.textContent = 'PlantUML encoding error: ' + e.message;
            }
            pre.replaceWith(wrapper);
        });
    };

    // --- Initialize ---
    initResizer();
    M.contentContainer.classList.add('view-split');

})(window.MDView);
