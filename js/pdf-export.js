// ============================================
// pdf-export.js — PDF Export with Page-Break Logic
// ============================================
(function (M) {
    'use strict';

    // Page configuration constants for A4 PDF export
    var PAGE_CONFIG = {
        a4Width: 210,
        a4Height: 297,
        margin: 15,
        contentWidth: 180,
        contentHeight: 267,
        windowWidth: 1000,
        scale: 2
    };

    // --- Page-Break Detection Functions ---

    function identifyGraphicElements(container) {
        var graphics = [];
        container.querySelectorAll('img').forEach(function (el) { graphics.push({ element: el, type: 'img' }); });
        container.querySelectorAll('svg').forEach(function (el) { graphics.push({ element: el, type: 'svg' }); });
        container.querySelectorAll('pre').forEach(function (el) { graphics.push({ element: el, type: 'pre' }); });
        container.querySelectorAll('table').forEach(function (el) { graphics.push({ element: el, type: 'table' }); });
        return graphics;
    }

    function calculateElementPositions(elements, container) {
        var containerRect = container.getBoundingClientRect();
        return elements.map(function (item) {
            var rect = item.element.getBoundingClientRect();
            var top = rect.top - containerRect.top;
            var height = rect.height;
            return { element: item.element, type: item.type, top: top, height: height, bottom: top + height };
        });
    }

    function calculatePageBoundaries(totalHeight, elementWidth, pageConfig) {
        var aspectRatio = pageConfig.contentHeight / pageConfig.contentWidth;
        var pageHeightPx = elementWidth * aspectRatio;
        var boundaries = [];
        var y = pageHeightPx;
        while (y < totalHeight) {
            boundaries.push(y);
            y += pageHeightPx;
        }
        return { boundaries: boundaries, pageHeightPx: pageHeightPx };
    }

    function detectSplitElements(elements, pageBoundaries) {
        if (!elements || elements.length === 0) return [];
        if (!pageBoundaries || pageBoundaries.length === 0) return [];

        var splitElements = [];
        for (var idx = 0; idx < elements.length; idx++) {
            var item = elements[idx];
            var startPage = 0;
            for (var i = 0; i < pageBoundaries.length; i++) {
                if (item.top >= pageBoundaries[i]) { startPage = i + 1; } else { break; }
            }
            var endPage = 0;
            for (var j = 0; j < pageBoundaries.length; j++) {
                if (item.bottom > pageBoundaries[j]) { endPage = j + 1; } else { break; }
            }
            if (endPage > startPage) {
                var boundaryY = pageBoundaries[startPage] || pageBoundaries[0];
                splitElements.push({
                    element: item.element, type: item.type, top: item.top, height: item.height,
                    splitPageIndex: startPage, overflowAmount: item.bottom - boundaryY
                });
            }
        }
        return splitElements;
    }

    function analyzeGraphicsForPageBreaks(tempElement) {
        try {
            var graphics = identifyGraphicElements(tempElement);
            var elementsWithPositions = calculateElementPositions(graphics, tempElement);
            var totalHeight = tempElement.scrollHeight;
            var elementWidth = tempElement.offsetWidth;
            var result = calculatePageBoundaries(totalHeight, elementWidth, PAGE_CONFIG);
            var splitElements = detectSplitElements(elementsWithPositions, result.boundaries);
            return {
                totalElements: graphics.length, splitElements: splitElements,
                pageCount: result.boundaries.length + 1, pageBoundaries: result.boundaries, pageHeightPx: result.pageHeightPx
            };
        } catch (error) {
            console.error('Page-break analysis failed:', error);
            return { totalElements: 0, splitElements: [], pageCount: 1, pageBoundaries: [], pageHeightPx: 0 };
        }
    }

    // --- Page-Break Insertion Functions ---
    var PAGE_BREAK_THRESHOLD = 0.3;

    function categorizeBySize(splitElements, pageHeightPx) {
        var fittingElements = [], oversizedElements = [];
        for (var i = 0; i < splitElements.length; i++) {
            if (splitElements[i].height <= pageHeightPx) { fittingElements.push(splitElements[i]); }
            else { oversizedElements.push(splitElements[i]); }
        }
        return { fittingElements: fittingElements, oversizedElements: oversizedElements };
    }

    function insertPageBreaks(fittingElements, pageHeightPx) {
        for (var idx = 0; idx < fittingElements.length; idx++) {
            var item = fittingElements[idx];
            var currentPageBottom = (item.splitPageIndex + 1) * pageHeightPx;
            var remainingSpace = currentPageBottom - item.top;
            var remainingRatio = remainingSpace / pageHeightPx;
            if (remainingRatio > PAGE_BREAK_THRESHOLD) {
                var scaledHeight = item.height * 0.9;
                if (scaledHeight <= remainingSpace) continue;
            }
            var marginNeeded = currentPageBottom - item.top + 5;
            var targetElement = item.element;
            if (item.type === 'svg' && item.element.parentElement) { targetElement = item.element.parentElement; }
            var currentMargin = parseFloat(targetElement.style.marginTop) || 0;
            targetElement.style.marginTop = (currentMargin + marginNeeded) + 'px';
        }
    }

    function applyPageBreaksWithCascade(tempElement, pageConfig, maxIterations) {
        maxIterations = maxIterations || 10;
        var iteration = 0, analysis, previousSplitCount = -1;
        do {
            analysis = analyzeGraphicsForPageBreaks(tempElement);
            var pageHeightPx = analysis.pageHeightPx;
            var categorized = categorizeBySize(analysis.splitElements, pageHeightPx);
            analysis.oversizedElements = categorized.oversizedElements;
            if (categorized.fittingElements.length === 0) break;
            if (categorized.fittingElements.length === previousSplitCount) { console.warn('Page-break adjustment not making progress, stopping'); break; }
            previousSplitCount = categorized.fittingElements.length;
            insertPageBreaks(categorized.fittingElements, pageHeightPx);
            iteration++;
        } while (iteration < maxIterations);
        if (iteration >= maxIterations) console.warn('Page-break stabilization reached max iterations:', maxIterations);
        return analysis;
    }

    // --- Oversized Graphics Scaling Functions ---
    var MIN_SCALE_FACTOR = 0.5;

    function calculateScaleFactor(elementHeight, availableHeight, buffer) {
        buffer = buffer || 5;
        var targetHeight = availableHeight - buffer;
        var scaleFactor = targetHeight / elementHeight;
        var wasClampedToMin = false;
        if (scaleFactor < MIN_SCALE_FACTOR) {
            console.warn('Warning: Large graphic requires ' + (scaleFactor * 100).toFixed(0) + '% scaling. Clamping to minimum ' + (MIN_SCALE_FACTOR * 100) + '%.');
            scaleFactor = MIN_SCALE_FACTOR;
            wasClampedToMin = true;
        }
        return { scaleFactor: scaleFactor, wasClampedToMin: wasClampedToMin };
    }

    function applyGraphicScaling(element, scaleFactor, elementType) {
        var originalHeight = element.offsetHeight;
        if (elementType === 'svg') { element.style.maxWidth = 'none'; }
        element.style.transform = 'scale(' + scaleFactor + ')';
        element.style.transformOrigin = 'top left';
        var scaledHeight = originalHeight * scaleFactor;
        element.style.marginBottom = '-' + (originalHeight - scaledHeight) + 'px';
    }

    function handleOversizedElements(oversizedElements, pageHeightPx) {
        if (!oversizedElements || oversizedElements.length === 0) return;
        var scaledCount = 0, clampedCount = 0;
        for (var i = 0; i < oversizedElements.length; i++) {
            var result = calculateScaleFactor(oversizedElements[i].height, pageHeightPx);
            applyGraphicScaling(oversizedElements[i].element, result.scaleFactor, oversizedElements[i].type);
            scaledCount++;
            if (result.wasClampedToMin) clampedCount++;
        }
        console.log('Oversized graphics scaling complete:', { totalScaled: scaledCount, clampedToMinimum: clampedCount });
    }

    // --- PDF Export Click Handler ---
    M.exportPdf.addEventListener("click", async function () {
        var progressContainer = null;
        var tempElement = null;
        try {
            var originalText = M.exportPdf.innerHTML;
            M.exportPdf.innerHTML = '<i class="bi bi-hourglass-split"></i> Generating...';
            M.exportPdf.disabled = true;

            progressContainer = document.createElement('div');
            progressContainer.style.position = 'fixed';
            progressContainer.style.top = '50%';
            progressContainer.style.left = '50%';
            progressContainer.style.transform = 'translate(-50%, -50%)';
            progressContainer.style.padding = '15px 20px';
            progressContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            progressContainer.style.color = 'white';
            progressContainer.style.borderRadius = '5px';
            progressContainer.style.zIndex = '9999';
            progressContainer.style.textAlign = 'center';

            var statusText = document.createElement('div');
            statusText.textContent = 'Generating PDF...';
            progressContainer.appendChild(statusText);
            document.body.appendChild(progressContainer);

            tempElement = document.createElement("div");
            tempElement.className = "markdown-body pdf-export";
            tempElement.style.padding = "20px";
            tempElement.style.width = "210mm";
            tempElement.style.margin = "0 auto";
            tempElement.style.fontSize = "14px";
            tempElement.style.position = "fixed";
            tempElement.style.left = "-9999px";
            tempElement.style.top = "0";

            var currentTheme = document.documentElement.getAttribute("data-theme");
            tempElement.style.backgroundColor = currentTheme === "dark" ? "#0d1117" : "#ffffff";
            tempElement.style.color = currentTheme === "dark" ? "#c9d1d9" : "#24292e";

            document.body.appendChild(tempElement);

            // Reuse the shared rendering pipeline so the PDF matches the preview
            M.renderMarkdownToContainer(tempElement);

            await new Promise(function (resolve) { setTimeout(resolve, 200); });

            try {
                await mermaid.run({ nodes: tempElement.querySelectorAll('.mermaid'), suppressErrors: true });
            } catch (mermaidError) {
                console.warn("Mermaid rendering issue:", mermaidError);
            }

            if (window.MathJax) {
                try {
                    await MathJax.typesetPromise([tempElement]);
                } catch (mathJaxError) {
                    console.warn("MathJax rendering issue:", mathJaxError);
                }
                tempElement.querySelectorAll('mjx-assistive-mml').forEach(function (el) {
                    el.style.display = 'none'; el.style.visibility = 'hidden'; el.style.position = 'absolute';
                    el.style.width = '0'; el.style.height = '0'; el.style.overflow = 'hidden'; el.remove();
                });
                tempElement.querySelectorAll('script[type*="math"], script[type*="tex"]').forEach(function (el) { el.remove(); });
            }

            await new Promise(function (resolve) { setTimeout(resolve, 500); });

            var pageBreakAnalysis = applyPageBreaksWithCascade(tempElement, PAGE_CONFIG);
            if (pageBreakAnalysis.oversizedElements && pageBreakAnalysis.pageHeightPx) {
                handleOversizedElements(pageBreakAnalysis.oversizedElements, pageBreakAnalysis.pageHeightPx);
            }

            var pdfOptions = { orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, hotfixes: ["px_scaling"] };
            var jsPDF = await window.getJsPDF();
            var pdf = new jsPDF(pdfOptions);
            var pageWidth = pdf.internal.pageSize.getWidth();
            var pageHeight = pdf.internal.pageSize.getHeight();
            var margin = 15;
            var contentWidth = pageWidth - (margin * 2);

            var _html2canvas = await window.getHtml2canvas();
            var canvas = await _html2canvas(tempElement, {
                scale: 2, useCORS: true, allowTaint: true, logging: false,
                windowWidth: 1000, windowHeight: tempElement.scrollHeight
            });

            var scaleFactor2 = canvas.width / contentWidth;
            var imgHeight = canvas.height / scaleFactor2;
            var pagesCount = Math.ceil(imgHeight / (pageHeight - margin * 2));

            for (var page = 0; page < pagesCount; page++) {
                if (page > 0) pdf.addPage();
                var sourceY = page * (pageHeight - margin * 2) * scaleFactor2;
                var sourceHeight = Math.min(canvas.height - sourceY, (pageHeight - margin * 2) * scaleFactor2);
                var destHeight = sourceHeight / scaleFactor2;
                var pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = sourceHeight;
                var ctx = pageCanvas.getContext('2d');
                ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
                var imgData = pageCanvas.toDataURL('image/png');
                pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, destHeight);
            }

            pdf.save("document.pdf");
            statusText.textContent = 'Download successful!';
            setTimeout(function () { document.body.removeChild(progressContainer); }, 1500);
            document.body.removeChild(tempElement);
            M.exportPdf.innerHTML = originalText;
            M.exportPdf.disabled = false;
        } catch (error) {
            console.error("PDF export failed:", error);
            alert("PDF export failed: " + error.message);
            M.exportPdf.innerHTML = '<i class="bi bi-file-earmark-pdf"></i> Export';
            M.exportPdf.disabled = false;
            if (progressContainer && progressContainer.parentNode) progressContainer.parentNode.removeChild(progressContainer);
            if (tempElement && tempElement.parentNode) tempElement.parentNode.removeChild(tempElement);
        }
    });

})(window.MDView);
