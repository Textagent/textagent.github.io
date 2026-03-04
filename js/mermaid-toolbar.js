// ============================================
// mermaid-toolbar.js — Mermaid Diagram Toolbar + Zoom Modal
// ============================================
(function (M) {
    'use strict';

    // --- SVG Conversion Helpers ---

    function svgToDataUrl(svgEl) {
        var clone = svgEl.cloneNode(true);
        var bbox = svgEl.getBoundingClientRect();
        if (!clone.getAttribute('width')) clone.setAttribute('width', Math.round(bbox.width));
        if (!clone.getAttribute('height')) clone.setAttribute('height', Math.round(bbox.height));
        var serialized = new XMLSerializer().serializeToString(clone);
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serialized);
    }

    function svgToCanvas(svgEl) {
        return new Promise(function (resolve, reject) {
            var bbox = svgEl.getBoundingClientRect();
            var scale = window.devicePixelRatio || 1;
            var width = Math.max(Math.round(bbox.width), 1);
            var height = Math.max(Math.round(bbox.height), 1);
            var canvas = document.createElement('canvas');
            canvas.width = width * scale;
            canvas.height = height * scale;
            var ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);
            var bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim() || '#ffffff';
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
            var img = new Image();
            img.onload = function () { ctx.drawImage(img, 0, 0, width, height); resolve(canvas); };
            img.onerror = reject;
            img.src = svgToDataUrl(svgEl);
        });
    }

    // --- Download / Copy Functions ---

    async function downloadMermaidPng(container, btn) {
        var svgEl = container.querySelector('svg');
        if (!svgEl) return;
        var original = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
        try {
            var canvas = await svgToCanvas(svgEl);
            canvas.toBlob(function (blob) {
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url; a.download = 'diagram-' + Date.now() + '.png'; a.click();
                URL.revokeObjectURL(url);
                btn.innerHTML = '<i class="bi bi-check-lg"></i>';
                setTimeout(function () { btn.innerHTML = original; }, 1500);
            }, 'image/png');
        } catch (e) {
            console.error('Mermaid PNG export failed:', e);
            btn.innerHTML = original;
        }
    }

    async function copyMermaidImage(container, btn) {
        var svgEl = container.querySelector('svg');
        if (!svgEl) return;
        var original = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
        try {
            var canvas = await svgToCanvas(svgEl);
            canvas.toBlob(async function (blob) {
                try {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
                } catch (clipErr) {
                    console.error('Clipboard write failed:', clipErr);
                    btn.innerHTML = '<i class="bi bi-x-lg"></i>';
                }
                setTimeout(function () { btn.innerHTML = original; }, 1800);
            }, 'image/png');
        } catch (e) {
            console.error('Mermaid copy failed:', e);
            btn.innerHTML = original;
        }
    }

    function downloadMermaidSvg(container, btn) {
        var svgEl = container.querySelector('svg');
        if (!svgEl) return;
        var clone = svgEl.cloneNode(true);
        var serialized = new XMLSerializer().serializeToString(clone);
        var blob = new Blob([serialized], { type: 'image/svg+xml' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'diagram-' + Date.now() + '.svg'; a.click();
        URL.revokeObjectURL(url);
        var original = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-lg"></i>';
        setTimeout(function () { btn.innerHTML = original; }, 1500);
    }

    // --- Zoom Modal ---

    var modalZoomScale = 1;
    var modalPanX = 0;
    var modalPanY = 0;
    var modalIsDragging = false;
    var modalDragStart = { x: 0, y: 0 };
    var modalCurrentSvgEl = null;

    var mermaidZoomModal = document.getElementById('mermaid-zoom-modal');
    var mermaidModalDiagram = document.getElementById('mermaid-modal-diagram');

    function applyModalTransform() {
        if (modalCurrentSvgEl) {
            modalCurrentSvgEl.style.transform = 'translate(' + modalPanX + 'px, ' + modalPanY + 'px) scale(' + modalZoomScale + ')';
        }
    }

    M.closeMermaidModal = function () {
        if (!mermaidZoomModal.classList.contains('active')) return;
        mermaidZoomModal.classList.remove('active');
        mermaidModalDiagram.innerHTML = '';
        modalCurrentSvgEl = null;
        modalZoomScale = 1; modalPanX = 0; modalPanY = 0;
    };

    function openMermaidZoomModal(container) {
        var svgEl = container.querySelector('svg');
        if (!svgEl) return;
        mermaidModalDiagram.innerHTML = '';
        modalZoomScale = 1; modalPanX = 0; modalPanY = 0;
        var svgClone = svgEl.cloneNode(true);
        svgClone.removeAttribute('width');
        svgClone.removeAttribute('height');
        svgClone.style.width = 'auto';
        svgClone.style.height = 'auto';
        svgClone.style.maxWidth = '80vw';
        svgClone.style.maxHeight = '60vh';
        svgClone.style.transformOrigin = 'center';
        mermaidModalDiagram.appendChild(svgClone);
        modalCurrentSvgEl = svgClone;
        mermaidZoomModal.classList.add('active');
    }

    // --- Modal Event Listeners ---
    document.getElementById('mermaid-modal-close').addEventListener('click', M.closeMermaidModal);
    mermaidZoomModal.addEventListener('click', function (e) {
        if (e.target === mermaidZoomModal) M.closeMermaidModal();
    });
    document.getElementById('mermaid-modal-zoom-in').addEventListener('click', function () {
        modalZoomScale = Math.min(modalZoomScale + 0.25, 10); applyModalTransform();
    });
    document.getElementById('mermaid-modal-zoom-out').addEventListener('click', function () {
        modalZoomScale = Math.max(modalZoomScale - 0.25, 0.1); applyModalTransform();
    });
    document.getElementById('mermaid-modal-zoom-reset').addEventListener('click', function () {
        modalZoomScale = 1; modalPanX = 0; modalPanY = 0; applyModalTransform();
    });
    mermaidModalDiagram.addEventListener('wheel', function (e) {
        e.preventDefault();
        var delta = e.deltaY < 0 ? 0.15 : -0.15;
        modalZoomScale = Math.min(Math.max(modalZoomScale + delta, 0.1), 10);
        applyModalTransform();
    }, { passive: false });
    mermaidModalDiagram.addEventListener('mousedown', function (e) {
        modalIsDragging = true;
        modalDragStart = { x: e.clientX - modalPanX, y: e.clientY - modalPanY };
        mermaidModalDiagram.classList.add('dragging');
    });
    document.addEventListener('mousemove', function (e) {
        if (!modalIsDragging) return;
        modalPanX = e.clientX - modalDragStart.x;
        modalPanY = e.clientY - modalDragStart.y;
        applyModalTransform();
    });
    document.addEventListener('mouseup', function () {
        if (modalIsDragging) { modalIsDragging = false; mermaidModalDiagram.classList.remove('dragging'); }
    });
    document.getElementById('mermaid-modal-download-png').addEventListener('click', async function () {
        if (!modalCurrentSvgEl) return;
        var btn = this; var original = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
        try {
            var canvas = await svgToCanvas(modalCurrentSvgEl);
            canvas.toBlob(function (blob) {
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url; a.download = 'diagram-' + Date.now() + '.png'; a.click();
                URL.revokeObjectURL(url);
                btn.innerHTML = '<i class="bi bi-check-lg"></i>';
                setTimeout(function () { btn.innerHTML = original; }, 1500);
            }, 'image/png');
        } catch (e) {
            console.error('Modal PNG export failed:', e);
            btn.innerHTML = original;
        }
    });
    document.getElementById('mermaid-modal-copy').addEventListener('click', async function () {
        if (!modalCurrentSvgEl) return;
        var btn = this; var original = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
        try {
            var canvas = await svgToCanvas(modalCurrentSvgEl);
            canvas.toBlob(async function (blob) {
                try {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
                } catch (clipErr) {
                    console.error('Clipboard write failed:', clipErr);
                    btn.innerHTML = '<i class="bi bi-x-lg"></i>';
                }
                setTimeout(function () { btn.innerHTML = original; }, 1800);
            }, 'image/png');
        } catch (e) {
            console.error('Modal copy failed:', e);
            btn.innerHTML = original;
        }
    });
    document.getElementById('mermaid-modal-download-svg').addEventListener('click', function () {
        if (!modalCurrentSvgEl) return;
        var serialized = new XMLSerializer().serializeToString(modalCurrentSvgEl);
        var blob = new Blob([serialized], { type: 'image/svg+xml' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = 'diagram-' + Date.now() + '.svg'; a.click();
        URL.revokeObjectURL(url);
    });

    // --- Add Toolbars ---
    M.addMermaidToolbars = function () {
        M.markdownPreview.querySelectorAll('.mermaid-container').forEach(function (container) {
            if (container.querySelector('.mermaid-toolbar')) return;
            var svgEl = container.querySelector('svg');
            if (!svgEl) return;
            var toolbar = document.createElement('div');
            toolbar.className = 'mermaid-toolbar';
            toolbar.setAttribute('aria-label', 'Diagram actions');

            var btnZoom = document.createElement('button');
            btnZoom.className = 'mermaid-toolbar-btn'; btnZoom.title = 'Zoom diagram';
            btnZoom.setAttribute('aria-label', 'Zoom diagram');
            btnZoom.innerHTML = '<i class="bi bi-arrows-fullscreen"></i>';
            btnZoom.addEventListener('click', function () { openMermaidZoomModal(container); });

            var btnPng = document.createElement('button');
            btnPng.className = 'mermaid-toolbar-btn'; btnPng.title = 'Download PNG';
            btnPng.setAttribute('aria-label', 'Download PNG');
            btnPng.innerHTML = '<i class="bi bi-file-image"></i> PNG';
            btnPng.addEventListener('click', function () { downloadMermaidPng(container, btnPng); });

            var btnCopy = document.createElement('button');
            btnCopy.className = 'mermaid-toolbar-btn'; btnCopy.title = 'Copy image to clipboard';
            btnCopy.setAttribute('aria-label', 'Copy image to clipboard');
            btnCopy.innerHTML = '<i class="bi bi-clipboard-image"></i> Copy';
            btnCopy.addEventListener('click', function () { copyMermaidImage(container, btnCopy); });

            var btnSvg = document.createElement('button');
            btnSvg.className = 'mermaid-toolbar-btn'; btnSvg.title = 'Download SVG';
            btnSvg.setAttribute('aria-label', 'Download SVG');
            btnSvg.innerHTML = '<i class="bi bi-filetype-svg"></i> SVG';
            btnSvg.addEventListener('click', function () { downloadMermaidSvg(container, btnSvg); });

            toolbar.appendChild(btnZoom);
            toolbar.appendChild(btnCopy);
            toolbar.appendChild(btnPng);
            toolbar.appendChild(btnSvg);
            container.appendChild(toolbar);
        });
    };

})(window.MDView);
