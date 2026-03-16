// ============================================
// page-view.js — A4 Page View Mode (Split Layout)
// Editor left + paginated A4 page frames right
// ============================================
(function (M) {
    'use strict';

    // --- DOM Elements ---
    var pageContainer = document.getElementById('page-view-container');
    var pageScroll = document.getElementById('page-view-scroll');
    var pageCounter = document.getElementById('page-view-counter');
    var pageExportBtn = document.getElementById('page-view-export-btn');
    var pageZoomSelect = document.getElementById('page-view-zoom');

    if (!pageContainer || !pageScroll) return;

    // --- A4 Page Dimensions (in mm, converted to px at ~96dpi → 1mm ≈ 3.7795px) ---
    var PAGE_WIDTH_MM = 210;
    var PAGE_HEIGHT_MM = 297;
    var PADDING_V_MM = 20; // vertical padding top+bottom = 40mm
    var PADDING_H_MM = 15;
    var CONTENT_HEIGHT_MM = PAGE_HEIGHT_MM - (PADDING_V_MM * 2); // 257mm usable

    // Convert mm to px for measurement (1mm = 3.7795275591px at 96 DPI)
    var MM_TO_PX = 3.7795275591;
    var CONTENT_HEIGHT_PX = CONTENT_HEIGHT_MM * MM_TO_PX; // ~970px usable per page

    // --- Hidden rendering container ---
    var hiddenRender = null;

    function getOrCreateHiddenRender() {
        if (!hiddenRender) {
            hiddenRender = document.createElement('div');
            hiddenRender.className = 'markdown-body';
            hiddenRender.style.cssText = 'position:fixed;left:-9999px;top:0;width:180mm;padding:0;visibility:hidden;';
            document.body.appendChild(hiddenRender);
        }
        return hiddenRender;
    }

    // --- Reflow Algorithm: split rendered HTML into page frames ---
    function reflowPages() {
        var container = getOrCreateHiddenRender();

        // Render markdown into hidden container
        M.renderMarkdownToContainer(container);

        // Collect all top-level children
        var children = Array.from(container.childNodes).filter(function (node) {
            return node.nodeType === Node.ELEMENT_NODE || (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
        });

        if (children.length === 0) {
            pageScroll.innerHTML = '';
            buildEmptyPage();
            updateCounter();
            return;
        }

        // Measure each child's height
        var items = [];
        children.forEach(function (child) {
            if (child.nodeType === Node.TEXT_NODE) {
                var wrapper = document.createElement('p');
                wrapper.textContent = child.textContent;
                container.replaceChild(wrapper, child);
                child = wrapper;
            }
            var rect = child.getBoundingClientRect();
            var marginTop = parseFloat(getComputedStyle(child).marginTop) || 0;
            var marginBottom = parseFloat(getComputedStyle(child).marginBottom) || 0;
            items.push({
                element: child,
                height: rect.height + marginTop + marginBottom,
                isPageBreak: child.classList && child.classList.contains('page-break-marker')
            });
        });

        // Distribute items across pages
        var pages = [];
        var currentPageItems = [];
        var currentHeight = 0;

        items.forEach(function (item) {
            // Force page break marker
            if (item.isPageBreak) {
                if (currentPageItems.length > 0) {
                    pages.push(currentPageItems);
                }
                currentPageItems = [];
                currentHeight = 0;
                return;
            }

            // Check if item fits on current page
            if (currentHeight + item.height > CONTENT_HEIGHT_PX && currentPageItems.length > 0) {
                pages.push(currentPageItems);
                currentPageItems = [];
                currentHeight = 0;
            }

            currentPageItems.push(item);
            currentHeight += item.height;
        });

        // Don't forget the last page
        if (currentPageItems.length > 0) {
            pages.push(currentPageItems);
        }

        // Ensure at least one page
        if (pages.length === 0) {
            pages.push([]);
        }

        // Build page frame DOM
        pageScroll.innerHTML = '';
        pages.forEach(function (pageItems, pageIndex) {
            var frame = document.createElement('div');
            frame.className = 'page-frame';

            var body = document.createElement('div');
            body.className = 'markdown-body';

            pageItems.forEach(function (item) {
                body.appendChild(item.element.cloneNode(true));
            });

            frame.appendChild(body);

            // Page number
            var pageNum = document.createElement('div');
            pageNum.className = 'page-frame-number';
            pageNum.textContent = (pageIndex + 1);
            frame.appendChild(pageNum);

            pageScroll.appendChild(frame);
        });

        updateCounter();

        // Post-render: run Mermaid, MathJax, highlight on page frames
        postRenderPages();
    }

    function buildEmptyPage() {
        var frame = document.createElement('div');
        frame.className = 'page-frame';

        var body = document.createElement('div');
        body.className = 'markdown-body';
        body.innerHTML = '<p style="opacity:0.4;font-style:italic;text-align:center;margin-top:40%">Start typing in the editor to see your A4 pages here…</p>';
        frame.appendChild(body);

        var pageNum = document.createElement('div');
        pageNum.className = 'page-frame-number';
        pageNum.textContent = '1';
        frame.appendChild(pageNum);

        pageScroll.appendChild(frame);
    }

    function updateCounter() {
        var count = pageScroll.querySelectorAll('.page-frame').length;
        if (pageCounter) {
            pageCounter.textContent = count + (count === 1 ? ' page' : ' pages');
        }
    }

    // --- Post-render tasks for page frame content ---
    function postRenderPages() {
        var frames = pageScroll.querySelectorAll('.page-frame .markdown-body');
        frames.forEach(function (body) {
            // Emojis
            if (M.processEmojis) M.processEmojis(body);
            // Heading anchors
            if (M.addHeadingAnchors) M.addHeadingAnchors(body);
            // Callouts
            if (M.processCallouts) M.processCallouts(body);
        });

        // Mermaid
        var mermaidNodes = pageScroll.querySelectorAll('.mermaid');
        if (mermaidNodes.length > 0 && window.getMermaid) {
            window.getMermaid().then(function (mermaidLib) {
                if (M.initMermaid) M.initMermaid();
                mermaidLib.run({ nodes: mermaidNodes, suppressErrors: true }).catch(function () {});
            }).catch(function () {});
        }

        // MathJax
        if (window.MathJax) {
            try {
                MathJax.typesetPromise(Array.from(frames)).catch(function () {});
            } catch (e) {}
        }
    }

    // --- Zoom Control ---
    if (pageZoomSelect) {
        pageZoomSelect.addEventListener('change', function () {
            var zoom = this.value;
            pageScroll.setAttribute('data-zoom', zoom);
        });
    }

    // --- Export PDF Button ---
    if (pageExportBtn) {
        pageExportBtn.addEventListener('click', function () {
            // Reuse existing PDF export pipeline
            if (M.exportPdf) {
                M.exportPdf.click();
            }
        });
    }

    // --- Enter Page Mode ---
    var pageRenderTimeout = null;

    M.enterPageMode = function () {
        pageContainer.style.display = 'flex';
        reflowPages();

        // Listen for editor changes (debounced)
        if (!M._pageViewInputBound) {
            M._pageViewInputBound = true;
            M.markdownEditor.addEventListener('input', function () {
                if (M.currentViewMode !== 'page') return;
                clearTimeout(pageRenderTimeout);
                pageRenderTimeout = setTimeout(reflowPages, M.RENDER_DELAY || 300);
            });
        }
    };

    // --- Exit Page Mode ---
    M.exitPageMode = function () {
        pageContainer.style.display = 'none';
        clearTimeout(pageRenderTimeout);
    };

    // --- Expose for external use ---
    M.reflowPages = reflowPages;

})(window.MDView);
