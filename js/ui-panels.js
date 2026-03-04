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
        M.contentContainer.classList.remove('view-editor-only', 'view-preview-only', 'view-split', 'view-ppt');
        var classMap = { editor: 'view-editor-only', preview: 'view-preview-only', split: 'view-split', ppt: 'view-ppt' };
        M.contentContainer.classList.add(classMap[mode] || 'view-split');
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
        // PPT mode: parse slides and enter presentation
        if (mode === 'ppt') {
            if (M.enterPptMode) M.enterPptMode();
        }
        // Exiting PPT mode: hide slide container
        if (previousMode === 'ppt' && mode !== 'ppt') {
            var sc = document.getElementById('slide-container');
            if (sc) { sc.style.display = 'none'; sc.classList.remove('slide-fullscreen'); }
        }
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
    // PRESENTATION MODE (Slidev-Inspired)
    // ========================================
    var slideContainer = document.getElementById('slide-container');
    var slideBody = document.getElementById('slide-body');
    var slideContent = document.getElementById('slide-content');
    var slideTransitionWrapper = document.getElementById('slide-transition-wrapper');
    var slideCounter = document.getElementById('slide-counter');
    var slidePrevBtn = document.getElementById('slide-prev');
    var slideNextBtn = document.getElementById('slide-next');
    var slideExitBtn = document.getElementById('slide-exit');
    var presentBtn = document.getElementById('present-button');
    var slideProgressBar = document.getElementById('slide-progress-bar');
    var slideNotesPanel = document.getElementById('slide-notes-panel');
    var slideNotesBody = document.getElementById('slide-notes-body');
    var slideNotesToggle = document.getElementById('slide-notes-toggle');
    var slideNotesClose = document.getElementById('slide-notes-close');
    var slideOverview = document.getElementById('slide-overview');
    var slideOverviewGrid = document.getElementById('slide-overview-grid');
    var slideOverviewToggle = document.getElementById('slide-overview-toggle');
    var slideOverviewClose = document.getElementById('slide-overview-close');
    var slideShortcuts = document.getElementById('slide-shortcuts');
    var slideShortcutsToggle = document.getElementById('slide-shortcuts-toggle');
    var slideShortcutsClose = document.getElementById('slide-shortcuts-close');
    var slideFullscreenToggle = document.getElementById('slide-fullscreen-toggle');

    var slides = [];
    var currentSlide = 0;
    var notesVisible = false;

    // --- Parse frontmatter from a slide chunk ---
    function parseSlideFrontmatter(raw) {
        var result = { content: raw, notes: '', layout: '', className: '', background: '', transition: '' };
        // Extract speaker notes: trailing <!-- ... --> comments
        var noteMatch = raw.match(/<!--\s*([\s\S]*?)\s*-->[\s]*$/);
        if (noteMatch) {
            result.notes = noteMatch[1].trim();
            result.content = raw.replace(/<!--\s*[\s\S]*?\s*-->[\s]*$/, '').trim();
        }
        // Extract optional YAML-like frontmatter at top of slide
        var fmMatch = result.content.match(/^((?:\w[\w-]*:\s*.+\n?)+)\n([\s\S]*)$/);
        if (fmMatch) {
            var fmLines = fmMatch[1].trim().split('\n');
            var validFm = true;
            var meta = {};
            for (var i = 0; i < fmLines.length; i++) {
                var kv = fmLines[i].match(/^(\w[\w-]*):\s*(.+)$/);
                if (kv) { meta[kv[1].toLowerCase()] = kv[2].trim(); }
                else { validFm = false; break; }
            }
            if (validFm && Object.keys(meta).length > 0) {
                result.content = fmMatch[2].trim();
                result.layout = meta.layout || '';
                result.className = meta['class'] || '';
                result.background = meta.background || '';
                result.transition = meta.transition || '';
            }
        }
        return result;
    }

    function parseSlides(markdown) {
        var chunks = markdown.split(/\n(?:---|___|\*\*\*)\n/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
        return chunks.map(parseSlideFrontmatter);
    }

    function renderSlide(index, direction) {
        if (index < 0 || index >= slides.length) return;
        var prevIndex = currentSlide;
        currentSlide = index;
        var slide = slides[index];

        // Render content
        var html = marked.parse(slide.content);
        var sanitized = DOMPurify.sanitize(html, { ADD_TAGS: ['mjx-container'], ADD_ATTR: ['id', 'class'] });
        slideBody.innerHTML = sanitized;
        M.processEmojis(slideBody);
        if (M.addHeadingAnchors) M.addHeadingAnchors(slideBody);
        if (M.processCallouts) M.processCallouts(slideBody);
        var mermaidNodes = slideBody.querySelectorAll('.mermaid');
        if (mermaidNodes.length > 0) { try { mermaid.run({ nodes: mermaidNodes, suppressErrors: true }); } catch (e) { } }
        if (window.MathJax) { try { MathJax.typesetPromise([slideBody]); } catch (e) { } }

        // Apply layout class
        slideTransitionWrapper.className = 'slide-transition-wrapper';
        if (slide.layout) slideTransitionWrapper.classList.add('slide-layout-' + slide.layout);
        if (slide.className) slide.className.split(/\s+/).forEach(function (c) { if (c) slideTransitionWrapper.classList.add(c); });

        // Apply background
        if (slide.background) {
            var bg = slide.background;
            if (bg.startsWith('#') || bg.startsWith('rgb') || bg.startsWith('hsl')) {
                // Solid color
                slideContent.style.backgroundColor = bg;
                slideContent.style.backgroundImage = '';
            } else if (bg.startsWith('linear-gradient') || bg.startsWith('radial-gradient') || bg.startsWith('conic-gradient')) {
                // CSS gradient — apply directly as backgroundImage
                slideContent.style.backgroundImage = bg;
                slideContent.style.backgroundColor = '';
            } else {
                // Image URL
                slideContent.style.backgroundImage = 'url(' + bg + ')';
                slideContent.style.backgroundSize = 'cover';
                slideContent.style.backgroundPosition = 'center';
                slideContent.style.backgroundColor = '';
            }
            slideContent.setAttribute('data-bg', 'true');
        } else {
            slideContent.style.backgroundColor = '';
            slideContent.style.backgroundImage = '';
            slideContent.removeAttribute('data-bg');
        }

        // Apply transition animation
        if (direction !== undefined && prevIndex !== index) {
            var transClass = direction > 0 ? 'slide-transition-from-right' : 'slide-transition-from-left';
            if (slide.transition === 'fade') transClass = 'slide-transition-fade';
            slideTransitionWrapper.classList.add(transClass);
            // Remove after animation
            slideTransitionWrapper.addEventListener('animationend', function handler() {
                slideTransitionWrapper.classList.remove(transClass);
                slideTransitionWrapper.removeEventListener('animationend', handler);
            });
        }

        // Update counter & progress
        slideCounter.textContent = (index + 1) + ' / ' + slides.length;
        slidePrevBtn.disabled = index === 0;
        slideNextBtn.disabled = index === slides.length - 1;
        if (slideProgressBar) {
            var progress = slides.length <= 1 ? 100 : ((index) / (slides.length - 1)) * 100;
            slideProgressBar.style.width = progress + '%';
        }

        // Update speaker notes
        if (slideNotesBody) {
            if (slide.notes) {
                slideNotesBody.innerHTML = DOMPurify.sanitize(marked.parse(slide.notes));
            } else {
                slideNotesBody.innerHTML = '<span class="slide-notes-empty">No notes for this slide</span>';
            }
        }
    }

    function goToSlide(index, direction) {
        if (direction === undefined) direction = index > currentSlide ? 1 : -1;
        renderSlide(index, direction);
    }

    // --- Speaker Notes ---
    function toggleNotes() {
        notesVisible = !notesVisible;
        slideNotesPanel.style.display = notesVisible ? 'block' : 'none';
        if (slideNotesToggle) slideNotesToggle.classList.toggle('active', notesVisible);
    }

    // --- Overview Grid ---
    function showOverview() {
        slideOverviewGrid.innerHTML = '';
        slides.forEach(function (slide, i) {
            var card = document.createElement('div');
            card.className = 'slide-overview-card' + (i === currentSlide ? ' active' : '');
            var body = document.createElement('div');
            body.className = 'slide-overview-card-body';
            var innerHtml = marked.parse(slide.content.substring(0, 500));
            body.innerHTML = '<div class="markdown-body">' + DOMPurify.sanitize(innerHtml) + '</div>';
            var footer = document.createElement('div');
            footer.className = 'slide-overview-card-footer';
            footer.textContent = 'Slide ' + (i + 1);
            card.appendChild(body);
            card.appendChild(footer);
            card.addEventListener('click', function () {
                hideOverview();
                goToSlide(i);
            });
            slideOverviewGrid.appendChild(card);
        });
        slideOverview.style.display = 'flex';
        if (slideOverviewToggle) slideOverviewToggle.classList.add('active');
    }

    function hideOverview() {
        slideOverview.style.display = 'none';
        if (slideOverviewToggle) slideOverviewToggle.classList.remove('active');
    }

    function toggleOverview() {
        if (slideOverview.style.display === 'none' || slideOverview.style.display === '') {
            showOverview();
        } else {
            hideOverview();
        }
    }

    // --- Shortcuts overlay ---
    function toggleShortcuts() {
        var visible = slideShortcuts.style.display !== 'none' && slideShortcuts.style.display !== '';
        slideShortcuts.style.display = visible ? 'none' : 'flex';
        if (slideShortcutsToggle) slideShortcutsToggle.classList.toggle('active', !visible);
    }

    function hideShortcuts() {
        slideShortcuts.style.display = 'none';
        if (slideShortcutsToggle) slideShortcutsToggle.classList.remove('active');
    }

    // --- Fullscreen toggle ---
    function toggleSlideFullscreen() {
        if (slideContainer.classList.contains('slide-fullscreen')) {
            slideContainer.classList.remove('slide-fullscreen');
            try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { }
        } else {
            slideContainer.classList.add('slide-fullscreen');
            try { slideContainer.requestFullscreen(); } catch (e) { }
        }
    }

    // --- Start / Exit Presentation ---
    M.startPresentation = function () {
        var md = M.markdownEditor.value;
        slides = parseSlides(md);
        if (slides.length === 0) { alert('No slides found. Use --- (horizontal rule) to separate slides.'); return; }
        currentSlide = 0;
        notesVisible = false;
        slideNotesPanel.style.display = 'none';
        slideOverview.style.display = 'none';
        slideShortcuts.style.display = 'none';
        slideContainer.style.display = 'flex';
        slideContainer.classList.add('slide-fullscreen');
        renderSlide(0);
        try { slideContainer.requestFullscreen(); } catch (e) { }
    };

    M.exitPresentation = function () {
        // If in PPT view mode, just switch back to split
        if (M.currentViewMode === 'ppt') {
            M.setViewMode('split');
            return;
        }
        slideContainer.style.display = 'none';
        slideContainer.classList.remove('slide-fullscreen');
        slides = []; currentSlide = 0;
        notesVisible = false;
        try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { }
    };

    M.isPresentationActive = function () {
        return M.currentViewMode === 'ppt' || slideContainer.style.display !== 'none';
    };

    // --- Enter PPT View Mode ---
    M.enterPptMode = function () {
        var md = M.markdownEditor.value;
        slides = parseSlides(md);
        if (slides.length === 0) {
            slides = [{ content: M.markdownEditor.value || '*No slides — use `---` to separate slides*', notes: '', layout: '', className: '', background: '', transition: '' }];
        }
        currentSlide = 0;
        notesVisible = false;
        slideNotesPanel.style.display = 'none';
        slideOverview.style.display = 'none';
        slideShortcuts.style.display = 'none';
        slideContainer.classList.remove('slide-fullscreen');
        renderSlide(0);
    };

    // --- Event Wiring ---
    if (presentBtn) presentBtn.addEventListener('click', M.startPresentation);
    if (slideExitBtn) slideExitBtn.addEventListener('click', M.exitPresentation);
    if (slidePrevBtn) slidePrevBtn.addEventListener('click', function () { goToSlide(currentSlide - 1, -1); });
    if (slideNextBtn) slideNextBtn.addEventListener('click', function () { goToSlide(currentSlide + 1, 1); });
    if (slideNotesToggle) slideNotesToggle.addEventListener('click', toggleNotes);
    if (slideNotesClose) slideNotesClose.addEventListener('click', toggleNotes);
    if (slideOverviewToggle) slideOverviewToggle.addEventListener('click', toggleOverview);
    if (slideOverviewClose) slideOverviewClose.addEventListener('click', hideOverview);
    if (slideShortcutsToggle) slideShortcutsToggle.addEventListener('click', toggleShortcuts);
    if (slideShortcutsClose) slideShortcutsClose.addEventListener('click', hideShortcuts);
    if (slideFullscreenToggle) slideFullscreenToggle.addEventListener('click', toggleSlideFullscreen);

    // Keyboard shortcuts for presentation
    document.addEventListener('keydown', function (e) {
        if (!M.isPresentationActive()) return;
        // Ignore if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // Close overlays first
        if (e.key === 'Escape') {
            if (slideShortcuts.style.display !== 'none' && slideShortcuts.style.display !== '') { hideShortcuts(); e.preventDefault(); return; }
            if (slideOverview.style.display !== 'none' && slideOverview.style.display !== '') { hideOverview(); e.preventDefault(); return; }
            if (slideContainer.classList.contains('slide-fullscreen')) {
                slideContainer.classList.remove('slide-fullscreen');
                try { if (document.fullscreenElement) document.exitFullscreen(); } catch (ex) { }
                e.preventDefault();
                return;
            }
            // In PPT view mode, Escape does nothing (use view mode buttons to switch)
            return;
        }

        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); goToSlide(currentSlide + 1, 1); }
        else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goToSlide(currentSlide - 1, -1); }
        else if (e.key === 'Home') { e.preventDefault(); goToSlide(0, -1); }
        else if (e.key === 'End') { e.preventDefault(); goToSlide(slides.length - 1, 1); }
        else if (e.key === 's' || e.key === 'S') { e.preventDefault(); toggleNotes(); }
        else if (e.key === 'g' || e.key === 'G') { e.preventDefault(); toggleOverview(); }
        else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleSlideFullscreen(); }
        else if (e.key === '?') { e.preventDefault(); toggleShortcuts(); }
    });

    // Handle fullscreen exit
    document.addEventListener('fullscreenchange', function () {
        if (!document.fullscreenElement && slideContainer.classList.contains('slide-fullscreen')) {
            slideContainer.classList.remove('slide-fullscreen');
        }
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
