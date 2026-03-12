// ============================================
// file-converters.js — Import Converters (DOCX, XLSX, CSV, HTML, JSON, XML, PDF)
// ============================================
(function (M) {
    'use strict';

    var SUPPORTED_EXTENSIONS = {
        md: 'markdown', markdown: 'markdown',
        docx: 'docx',
        xlsx: 'xlsx', xls: 'xlsx',
        csv: 'csv',
        html: 'html', htm: 'html',
        json: 'json',
        xml: 'xml',
        pdf: 'pdf'
    };

    var conversionOverlay = document.getElementById('conversion-overlay');
    var conversionTitle = document.getElementById('conversion-title');
    var conversionDetail = document.getElementById('conversion-detail');

    function showConversionOverlay(title, detail) {
        if (conversionTitle) conversionTitle.textContent = title || 'Converting...';
        if (conversionDetail) conversionDetail.textContent = detail || 'Processing your file';
        if (conversionOverlay) conversionOverlay.style.display = 'flex';
    }

    function hideConversionOverlay() {
        if (conversionOverlay) conversionOverlay.style.display = 'none';
    }

    function getFileExtension(filename) {
        return (filename.split('.').pop() || '').toLowerCase();
    }

    M.importFile = async function (file) {
        var ext = getFileExtension(file.name);
        var type = SUPPORTED_EXTENSIONS[ext];

        if (!type) {
            M.showToast('Unsupported file format: .' + ext + '. Supported: MD, DOCX, XLSX, CSV, HTML, JSON, XML, PDF', 'error');
            return;
        }

        if (type === 'markdown') {
            M.importMarkdownFile(file);
            return;
        }

        showConversionOverlay('Converting ' + file.name, ext.toUpperCase() + ' \u2192 Markdown');

        try {
            var markdown;
            switch (type) {
                case 'docx': markdown = await convertDocxToMarkdown(file); break;
                case 'xlsx': markdown = await convertXlsxToMarkdown(file); break;
                case 'csv': markdown = await convertCsvToMarkdown(file); break;
                case 'html': markdown = await convertHtmlToMarkdown(file); break;
                case 'json': markdown = await convertJsonToMarkdown(file); break;
                case 'xml': markdown = await convertXmlToMarkdown(file); break;
                case 'pdf': markdown = await convertPdfToMarkdown(file); break;
                default:
                    throw new Error('No converter found for type: ' + type);
            }

            M.markdownEditor.value = markdown;
            M.renderMarkdown();
            M.showToast('\u2713 Converted ' + file.name + ' to Markdown', 'success');
        } catch (err) {
            console.error('File conversion failed:', err);
            M.showToast('Failed to convert ' + file.name + ': ' + err.message, 'error');
        } finally {
            hideConversionOverlay();
        }
    };

    M.importMarkdownFile = function (file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            M.markdownEditor.value = e.target.result;
            M.renderMarkdown();
        };
        reader.readAsText(file);
    };

    // --- DOCX Converter (Mammoth.js + Turndown.js) ---
    async function convertDocxToMarkdown(file) {
        var mammoth = await window.getMammoth();
        var TurndownService = await window.getTurndownService();

        var arrayBuffer = await file.arrayBuffer();
        var result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });

        if (result.messages && result.messages.length > 0) {
            console.warn('Mammoth warnings:', result.messages);
        }

        var turndown = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            bulletListMarker: '-',
            emDelimiter: '*'
        });

        turndown.addRule('tables', {
            filter: 'table',
            replacement: function (content, node) {
                return htmlTableToMarkdown(node);
            }
        });

        var markdown = turndown.turndown(result.value);
        var header = '> *Converted from: ' + file.name + '*\n\n---\n\n';
        return header + markdown;
    }

    // --- XLSX/XLS Converter (SheetJS) ---
    async function convertXlsxToMarkdown(file) {
        var XLSX = await window.getXLSX();

        var arrayBuffer = await file.arrayBuffer();
        var workbook = XLSX.read(arrayBuffer, { type: 'array' });
        var markdown = '> *Converted from: ' + file.name + '*\n\n';

        workbook.SheetNames.forEach(function (sheetName) {
            var sheet = workbook.Sheets[sheetName];
            var jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

            if (jsonData.length === 0) return;

            if (workbook.SheetNames.length > 1) {
                markdown += '## Sheet: ' + sheetName + '\n\n';
            }

            markdown += arrayToMarkdownTable(jsonData) + '\n\n';
        });

        return markdown;
    }

    // --- CSV Converter (native) ---
    async function convertCsvToMarkdown(file) {
        var text = await file.text();
        var rows = parseCsv(text);

        if (rows.length === 0) return '> *Empty CSV file: ' + file.name + '*';

        var markdown = '> *Converted from: ' + file.name + '*\n\n';
        markdown += arrayToMarkdownTable(rows);
        return markdown;
    }

    // --- HTML Converter (Turndown.js) ---
    async function convertHtmlToMarkdown(file) {
        var TurndownService = await window.getTurndownService();

        var html = await file.text();
        var turndown = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            bulletListMarker: '-',
            emDelimiter: '*'
        });

        // Parse HTML and strip <script>/<style> tags (MarkItDown pattern)
        var doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('script, style').forEach(function (el) { el.remove(); });
        var content = doc.body ? doc.body.innerHTML : doc.documentElement.innerHTML;

        var markdown = turndown.turndown(content);
        var header = '> *Converted from: ' + file.name + '*\n\n---\n\n';
        return header + markdown;
    }

    // --- JSON Converter (native) ---
    async function convertJsonToMarkdown(file) {
        var text = await file.text();
        var formatted;
        try {
            var parsed = JSON.parse(text);
            formatted = JSON.stringify(parsed, null, 2);
        } catch (e) {
            formatted = text;
        }

        return '> *Converted from: ' + file.name + '*\n\n```json\n' + formatted + '\n```';
    }

    // --- XML Converter (native) ---
    async function convertXmlToMarkdown(file) {
        var text = await file.text();
        var formatted = text;
        try {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(text, 'text/xml');
            var errors = xmlDoc.getElementsByTagName('parsererror');
            if (errors.length === 0) {
                var serializer = new XMLSerializer();
                formatted = serializer.serializeToString(xmlDoc);
                formatted = formatted.replace(/(>)(<)(\/*)/g, '$1\n$2$3');
            }
        } catch (e) {
            // Use raw text on error
        }

        return '> *Converted from: ' + file.name + '*\n\n```xml\n' + formatted + '\n```';
    }

    // --- PDF Converter (pdf.js) ---
    async function convertPdfToMarkdown(file) {
        var pdfjsLib = window.pdfjsLib;
        if (!pdfjsLib) {
            try {
                var mod = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
                pdfjsLib = mod;
            } catch (e) {
                throw new Error('PDF.js library could not be loaded. PDF conversion requires a modern browser.');
            }
        }
        // Always ensure workerSrc is set (CDN eager load may skip it)
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
        }

        var arrayBuffer = await file.arrayBuffer();
        var pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        var markdown = '> *Converted from: ' + file.name + ' (' + pdf.numPages + ' pages)*\n\n---\n\n';

        for (var i = 1; i <= pdf.numPages; i++) {
            var page = await pdf.getPage(i);
            var textContent = await page.getTextContent();
            var pageText = textContent.items.map(function (item) { return item.str; }).join(' ');

            if (pdf.numPages > 1) {
                markdown += '## Page ' + i + '\n\n';
            }
            markdown += pageText.trim() + '\n\n';
        }

        return markdown;
    }

    // ============================================
    // Converter Utility Functions
    // ============================================

    function arrayToMarkdownTable(rows) {
        if (!rows || rows.length === 0) return '';

        var headers = rows[0].map(function (h) { return String(h).trim() || ' '; });
        var separator = headers.map(function () { return '---'; });
        var dataRows = rows.slice(1);

        var table = '| ' + headers.join(' | ') + ' |\n';
        table += '| ' + separator.join(' | ') + ' |\n';

        for (var r = 0; r < dataRows.length; r++) {
            var row = dataRows[r];
            var cells = headers.map(function (_, i) {
                var val = row[i] !== undefined ? String(row[i]).trim() : '';
                return val.replace(/\|/g, '\\|');
            });
            table += '| ' + cells.join(' | ') + ' |\n';
        }

        return table;
    }

    function parseCsv(text) {
        var rows = [];
        var current = '';
        var inQuotes = false;
        var result = [];

        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (inQuotes) {
                if (ch === '"' && text[i + 1] === '"') {
                    current += '"';
                    i++;
                } else if (ch === '"') {
                    inQuotes = false;
                } else {
                    current += ch;
                }
            } else {
                if (ch === '"') {
                    inQuotes = true;
                } else if (ch === ',') {
                    result.push(current);
                    current = '';
                } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
                    result.push(current);
                    rows.push(result.slice());
                    result.length = 0;
                    current = '';
                    if (ch === '\r') i++;
                } else {
                    current += ch;
                }
            }
        }
        if (current || result.length > 0) {
            result.push(current);
            rows.push(result);
        }

        return rows;
    }

    function htmlTableToMarkdown(tableNode) {
        var rows = [];
        var trs = tableNode.querySelectorAll('tr');
        trs.forEach(function (tr) {
            var cells = [];
            tr.querySelectorAll('th, td').forEach(function (cell) {
                cells.push(cell.textContent.trim().replace(/\|/g, '\\|'));
            });
            rows.push(cells);
        });

        if (rows.length === 0) return '';
        return arrayToMarkdownTable(rows);
    }

})(window.MDView);
