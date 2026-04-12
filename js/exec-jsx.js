// ============================================
// exec-jsx.js — React JSX Executable Blocks
// Lazy-loads @babel/standalone to transpile JSX,
// renders React components in sandboxed iframes.
// ============================================
(function (M) {
    'use strict';

    var escapeHtml = M._exec.escapeHtml;

    // ========================================
    // Babel Standalone Lazy Loader
    // ========================================
    var _babelReady = false;
    var _babelLoading = false;
    var _babelCallbacks = [];

    function getBabel(onReady, onProgress) {
        if (_babelReady && window.Babel) { onReady(window.Babel); return; }
        _babelCallbacks.push(onReady);
        if (_babelLoading) return;
        _babelLoading = true;

        if (onProgress) onProgress('Loading React JSX transpiler...');

        var script = document.createElement('script');
        script.src = 'https://unpkg.com/@babel/standalone@7/babel.min.js';
        script.onload = function () {
            _babelReady = true;
            _babelLoading = false;
            if (onProgress) onProgress('Babel ready');
            var cbs = _babelCallbacks.splice(0);
            cbs.forEach(function (cb) { cb(window.Babel); });
        };
        script.onerror = function () {
            _babelLoading = false;
            console.error('[ExecJSX] Failed to load @babel/standalone');
            var cbs = _babelCallbacks.splice(0);
            cbs.forEach(function (cb) { cb(null, new Error('Failed to load @babel/standalone from CDN')); });
        };
        document.head.appendChild(script);
    }

    // ========================================
    // JSX → HTML Builder
    // ========================================

    /**
     * Transpile JSX source and build a self-contained HTML document
     * that loads React from CDN and renders the component.
     */
    function buildReactHtml(jsxSource) {
        // --- Pre-process: strip imports/exports BEFORE Babel sees them ---
        // This prevents Babel's env preset from generating CommonJS exports references
        var cleanedSource = jsxSource
            // Remove import statements — we provide these globally
            .replace(/^import\s+.*?from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
            // Convert `export default function` → just `function`
            .replace(/export\s+default\s+function\s+/g, 'function ')
            // Convert `export default` expression → assign to __ExportedApp
            .replace(/export\s+default\s+/g, 'var __ExportedApp = ')
            // Convert named exports
            .replace(/export\s+(?:const|let|var|function|class)\s+/g, '');

        // Transpile JSX → plain JS using Babel
        var transpiled;
        try {
            var result = window.Babel.transform(cleanedSource, {
                presets: [['env', { modules: false }], 'react'],
                plugins: [],
                filename: 'component.jsx'
            });
            transpiled = result.code;
        } catch (e) {
            return { error: e.message, html: null };
        }

        // Detect which packages are needed from import statements
        // (scan ORIGINAL source, not cleaned, since imports are stripped)
        // Each entry: { pattern, cdnScripts[], globalSetup }
        var LIB_REGISTRY = [
            {
                name: 'recharts',
                test: /from\s+['"]recharts['"]/,
                scripts: ['<script src="https://unpkg.com/recharts@2/umd/Recharts.min.js"><\/script>'],
                globals: '// Recharts globals\n' +
                    'if (window.Recharts) {\n' +
                    '  var LineChart = Recharts.LineChart, Line = Recharts.Line, BarChart = Recharts.BarChart, Bar = Recharts.Bar;\n' +
                    '  var AreaChart = Recharts.AreaChart, Area = Recharts.Area, PieChart = Recharts.PieChart, Pie = Recharts.Pie;\n' +
                    '  var Cell = Recharts.Cell, XAxis = Recharts.XAxis, YAxis = Recharts.YAxis;\n' +
                    '  var CartesianGrid = Recharts.CartesianGrid, Tooltip = Recharts.Tooltip, Legend = Recharts.Legend;\n' +
                    '  var ResponsiveContainer = Recharts.ResponsiveContainer, RadarChart = Recharts.RadarChart;\n' +
                    '  var Radar = Recharts.Radar, PolarGrid = Recharts.PolarGrid;\n' +
                    '  var PolarAngleAxis = Recharts.PolarAngleAxis, PolarRadiusAxis = Recharts.PolarRadiusAxis;\n' +
                    '  var Scatter = Recharts.Scatter, ScatterChart = Recharts.ScatterChart;\n' +
                    '  var ComposedChart = Recharts.ComposedChart, Treemap = Recharts.Treemap;\n' +
                    '  var FunnelChart = Recharts.FunnelChart, Funnel = Recharts.Funnel;\n' +
                    '  var RadialBarChart = Recharts.RadialBarChart, RadialBar = Recharts.RadialBar;\n' +
                    '  var Brush = Recharts.Brush, ReferenceArea = Recharts.ReferenceArea, ReferenceLine = Recharts.ReferenceLine;\n' +
                    '  var ReferencePoint = Recharts.ReferencePoint, LabelList = Recharts.LabelList;\n' +
                    '}\n'
            },
            {
                name: 'lucide-react',
                test: /from\s+['"]lucide-react['"]/,
                scripts: ['<script src="https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.min.js"><\/script>'],
                globals: '// Lucide React icons\n' +
                    'if (window.lucideReact) {\n' +
                    '  Object.keys(window.lucideReact).forEach(function(k) { window[k] = window.lucideReact[k]; });\n' +
                    '}\n'
            },
            {
                name: 'tailwindcss',
                // Detect by className= usage (with Tailwind-like classes) or explicit tailwind import
                test: /className\s*=\s*["'][^"']*(?:flex|grid|text-|bg-|p-|m-|rounded|shadow|border-|w-|h-|gap-|space-|items-|justify-)/,
                scripts: ['<script src="https://cdn.tailwindcss.com"><\/script>'],
                globals: ''
            },
            {
                name: 'framer-motion',
                test: /from\s+['"]framer-motion['"]/,
                scripts: ['<script src="https://unpkg.com/framer-motion@11/dist/framer-motion.js"><\/script>'],
                globals: '// Framer Motion globals\n' +
                    'if (window.Motion) {\n' +
                    '  var motion = Motion.motion || window.motion;\n' +
                    '  var AnimatePresence = Motion.AnimatePresence;\n' +
                    '  var useAnimation = Motion.useAnimation;\n' +
                    '  var useInView = Motion.useInView;\n' +
                    '  var useMotionValue = Motion.useMotionValue;\n' +
                    '  var useTransform = Motion.useTransform;\n' +
                    '  var useSpring = Motion.useSpring;\n' +
                    '}\n'
            },
            {
                name: 'lodash',
                test: /from\s+['"]lodash['"]|from\s+['"]lodash\//,
                scripts: ['<script src="https://unpkg.com/lodash@4/lodash.min.js"><\/script>'],
                globals: ''  // lodash exposes window._
            },
            {
                name: 'date-fns',
                test: /from\s+['"]date-fns['"]/,
                scripts: ['<script src="https://cdn.jsdelivr.net/npm/date-fns@3/cdn.min.js"><\/script>'],
                globals: '// date-fns globals\n' +
                    'if (window.dateFns) {\n' +
                    '  var format = dateFns.format, formatDistance = dateFns.formatDistance;\n' +
                    '  var parseISO = dateFns.parseISO, isValid = dateFns.isValid;\n' +
                    '  var addDays = dateFns.addDays, subDays = dateFns.subDays;\n' +
                    '  var differenceInDays = dateFns.differenceInDays;\n' +
                    '  var startOfMonth = dateFns.startOfMonth, endOfMonth = dateFns.endOfMonth;\n' +
                    '}\n'
            },
            {
                name: 'dayjs',
                test: /from\s+['"]dayjs['"]/,
                scripts: ['<script src="https://unpkg.com/dayjs@1/dayjs.min.js"><\/script>'],
                globals: ''  // dayjs exposes window.dayjs
            },
            {
                name: 'papaparse',
                test: /from\s+['"]papaparse['"]/,
                scripts: ['<script src="https://unpkg.com/papaparse@5/papaparse.min.js"><\/script>'],
                globals: '// Papa Parse globals\n' + 'var Papa = window.Papa;\n'
            },
            {
                name: 'uuid',
                test: /from\s+['"]uuid['"]/,
                scripts: ['<script src="https://unpkg.com/uuid@9/dist/umd/uuid.min.js"><\/script>'],
                globals: '// UUID globals\n' +
                    'if (window.uuid) { var uuidv4 = uuid.v4; var v4 = uuid.v4; }\n'
            },
            {
                name: 'clsx',
                test: /from\s+['"]clsx['"]/,
                scripts: [],
                globals: '// clsx polyfill\n' +
                    'function clsx() {\n' +
                    '  var args = arguments, classes = [];\n' +
                    '  for (var i = 0; i < args.length; i++) {\n' +
                    '    var arg = args[i];\n' +
                    '    if (!arg) continue;\n' +
                    '    if (typeof arg === "string" || typeof arg === "number") classes.push(arg);\n' +
                    '    else if (Array.isArray(arg)) classes.push(clsx.apply(null, arg));\n' +
                    '    else if (typeof arg === "object") {\n' +
                    '      for (var k in arg) { if (arg.hasOwnProperty(k) && arg[k]) classes.push(k); }\n' +
                    '    }\n' +
                    '  }\n' +
                    '  return classes.join(" ");\n' +
                    '}\n' +
                    'var cn = clsx;\n'
            },
            {
                name: 'chart.js',
                test: /from\s+['"]chart\.js['"]|from\s+['"]react-chartjs-2['"]/,
                scripts: [
                    '<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.js"><\/script>',
                    '<script src="https://cdn.jsdelivr.net/npm/react-chartjs-2@5/dist/index.umd.js"><\/script>'
                ],
                globals: '// Chart.js globals\n' +
                    'if (window.ReactChartjs2) {\n' +
                    '  var ChartLine = ReactChartjs2.Line, ChartBar = ReactChartjs2.Bar;\n' +
                    '  var ChartPie = ReactChartjs2.Pie, ChartDoughnut = ReactChartjs2.Doughnut;\n' +
                    '  var ChartRadar = ReactChartjs2.Radar, ChartPolar = ReactChartjs2.PolarArea;\n' +
                    '  var ChartBubble = ReactChartjs2.Bubble, ChartScatter = ReactChartjs2.Scatter;\n' +
                    '}\n'
            },
            {
                name: 'google-fonts',
                // Detect font-family references to common Google Fonts
                test: /['"](?:IBM Plex|Inter|Roboto|Outfit|Poppins|Montserrat|Lato|Open Sans|Nunito|Raleway|Source Sans|Fira|JetBrains|Playfair)/,
                scripts: [],
                globals: '',
                // Inject as <link> in <head> instead of <script>
                headLinks: function (jsxSource) {
                    var fonts = [];
                    var fontMap = {
                        'IBM Plex Sans': 'IBM+Plex+Sans:wght@400;500;600;700',
                        'IBM Plex Mono': 'IBM+Plex+Mono:wght@400;500',
                        'Inter': 'Inter:wght@300;400;500;600;700',
                        'Roboto': 'Roboto:wght@300;400;500;700',
                        'Outfit': 'Outfit:wght@300;400;500;600;700',
                        'Poppins': 'Poppins:wght@300;400;500;600;700',
                        'Montserrat': 'Montserrat:wght@300;400;500;600;700',
                        'Lato': 'Lato:wght@300;400;700',
                        'Open Sans': 'Open+Sans:wght@300;400;600;700',
                        'Nunito': 'Nunito:wght@300;400;600;700',
                        'Raleway': 'Raleway:wght@300;400;500;600;700',
                        'Source Sans Pro': 'Source+Sans+3:wght@300;400;600;700',
                        'Source Sans 3': 'Source+Sans+3:wght@300;400;600;700',
                        'Fira Sans': 'Fira+Sans:wght@300;400;500;600;700',
                        'Fira Code': 'Fira+Code:wght@400;500;600',
                        'JetBrains Mono': 'JetBrains+Mono:wght@400;500;600',
                        'Playfair Display': 'Playfair+Display:wght@400;500;600;700'
                    };
                    for (var fontName in fontMap) {
                        if (jsxSource.indexOf(fontName) !== -1) {
                            fonts.push(fontMap[fontName]);
                        }
                    }
                    if (fonts.length === 0) return '';
                    return '<link href="https://fonts.googleapis.com/css2?family=' +
                        fonts.join('&family=') + '&display=swap" rel="stylesheet">\n';
                }
            }
        ];

        // Detect which libraries are needed
        var detectedLibs = [];
        var extraScripts = [];
        var extraGlobals = '';
        var extraHeadLinks = '';

        for (var li = 0; li < LIB_REGISTRY.length; li++) {
            var lib = LIB_REGISTRY[li];
            if (lib.test.test(jsxSource)) {
                detectedLibs.push(lib.name);
                for (var si = 0; si < lib.scripts.length; si++) {
                    extraScripts.push(lib.scripts[si]);
                }
                if (lib.globals) extraGlobals += lib.globals;
                if (lib.headLinks) extraHeadLinks += lib.headLinks(jsxSource);
            }
        }

        if (detectedLibs.length > 0) {
            console.log('[ExecJSX] Auto-detected libraries:', detectedLibs.join(', '));
        }

        // Note: import/export stripping is done BEFORE Babel transpilation (above)
        // to prevent Babel from generating CommonJS exports references.

        // Find the App component name
        // Look for: function App() or function MyComponent() — first PascalCase function
        var appNameMatch = transpiled.match(/function\s+([A-Z][a-zA-Z0-9_]*)\s*\(/);
        var appName = appNameMatch ? appNameMatch[1] : '__ExportedApp';

        // Build CDN script tags (React core + detected libraries)
        var cdnScripts = [
            '<script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>',
            '<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>'
        ];
        for (var ei = 0; ei < extraScripts.length; ei++) {
            cdnScripts.push(extraScripts[ei]);
        }

        var html = '<!DOCTYPE html>\n<html>\n<head>\n' +
            '<meta charset="UTF-8">\n' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
            extraHeadLinks +
            '<style>\n' +
            '  * { box-sizing: border-box; }\n' +
            '  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }\n' +
            '  #root { min-height: 100vh; }\n' +
            '</style>\n' +
            cdnScripts.join('\n') + '\n' +
            '</head>\n<body>\n' +
            '<div id="root"></div>\n' +
            '<script>\n' +
            '// Make React hooks available as globals\n' +
            'var useState = React.useState;\n' +
            'var useEffect = React.useEffect;\n' +
            'var useRef = React.useRef;\n' +
            'var useMemo = React.useMemo;\n' +
            'var useCallback = React.useCallback;\n' +
            'var useReducer = React.useReducer;\n' +
            'var useContext = React.useContext;\n' +
            'var createContext = React.createContext;\n' +
            'var Fragment = React.Fragment;\n' +
            extraGlobals +
            '\n';

        html += '\ntry {\n' +
            transpiled + '\n' +
            '  var __AppComponent = (typeof ' + appName + ' === "function") ? ' + appName + ' : ' +
            '(typeof __ExportedApp === "function" ? __ExportedApp : null);\n' +
            '  if (__AppComponent) {\n' +
            '    ReactDOM.createRoot(document.getElementById("root")).render(\n' +
            '      React.createElement(__AppComponent)\n' +
            '    );\n' +
            '  } else {\n' +
            '    document.getElementById("root").innerHTML = ' +
            '"<div style=\\"padding:24px;color:#ef4444;font-family:monospace\\">Error: No React component found. ' +
            'Define a function component (e.g. function App() { ... }) or use export default.</div>";\n' +
            '  }\n' +
            '} catch (__err) {\n' +
            '  document.getElementById("root").innerHTML = ' +
            '"<div style=\\"padding:24px;font-family:monospace\\"><div style=\\"color:#ef4444;font-weight:700;margin-bottom:8px\\">Runtime Error</div>' +
            '<pre style=\\"color:#f87171;white-space:pre-wrap\\">" + __err.message + "\\n" + (__err.stack || "") + "</pre></div>";\n' +
            '  console.error(__err);\n' +
            '}\n' +
            '<\/script>\n' +
            '</body>\n</html>';

        return { error: null, html: html };
    }

    // ========================================
    // Link handler injection (same as HTML blocks)
    // ========================================
    function injectLinkHandler(html) {
        if (/data-ta-links-injected/.test(html)) return html;
        var injection = [
            '<base target="_blank" rel="noopener noreferrer" data-ta-links-injected="1">',
            '<script>',
            'document.addEventListener("click", function(e) {',
            '  var a = e.target.closest("a");',
            '  if (!a) return;',
            '  var href = a.getAttribute("href");',
            '  if (!href) return;',
            '  if (href.charAt(0) === "#") {',
            '    e.preventDefault();',
            '    var el = document.querySelector(href);',
            '    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });',
            '  }',
            '}, true);',
            '<\/script>'
        ].join('\n');
        if (/<head[^>]*>/i.test(html)) {
            return html.replace(/(<head[^>]*>)/i, '$1\n' + injection);
        }
        return injection + '\n' + html;
    }

    // ========================================
    // JSX Block Toolbars & Autorun
    // ========================================

    M.addJsxBlockToolbars = function () {
        M.markdownPreview.querySelectorAll('.executable-jsx-container').forEach(function (container) {
            if (container.querySelector('.code-block-toolbar')) return;

            var isAutorun = container.getAttribute('data-autorun') === 'true';

            var toolbar = document.createElement('div');
            toolbar.className = 'code-block-toolbar';
            toolbar.setAttribute('aria-label', 'JSX sandbox actions');

            // Language badge
            var badge = document.createElement('span');
            badge.className = 'code-lang-badge';
            badge.textContent = '⚛ React JSX';
            badge.style.cssText = 'font-size:11px;font-weight:600;color:#61dafb;margin-right:8px;letter-spacing:0.03em;';
            toolbar.appendChild(badge);

            if (isAutorun) {
                var preEl = container.querySelector('pre');
                if (preEl) preEl.style.display = 'none';

                // Show / hide source code
                var btnToggle = document.createElement('button');
                btnToggle.className = 'code-toolbar-btn code-copy-btn';
                btnToggle.title = 'Show / hide source code';
                btnToggle.innerHTML = '<i class="bi bi-code-slash"></i> Show Code';
                btnToggle.addEventListener('click', function () {
                    if (preEl.style.display === 'none') {
                        preEl.style.display = '';
                        btnToggle.innerHTML = '<i class="bi bi-eye-slash"></i> Hide Code';
                    } else {
                        preEl.style.display = 'none';
                        btnToggle.innerHTML = '<i class="bi bi-code-slash"></i> Show Code';
                    }
                });
                toolbar.appendChild(btnToggle);

                // Load JSX File button
                var fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.jsx,.tsx,.js';
                fileInput.style.display = 'none';
                container.appendChild(fileInput);

                var btnLoad = document.createElement('button');
                btnLoad.className = 'code-toolbar-btn html-load-file-btn';
                btnLoad.title = 'Load a JSX file into this block';
                btnLoad.innerHTML = '<i class="bi bi-folder2-open"></i> Load File';
                btnLoad.addEventListener('click', function () {
                    fileInput.value = '';
                    fileInput.click();
                });

                fileInput.addEventListener('change', function () {
                    var file = fileInput.files[0];
                    if (!file) return;
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var jsxContent = e.target.result;

                        // Re-render the iframe with new content
                        renderJsxInContainer(container, jsxContent, function () {
                            btnLoad.innerHTML = '<i class="bi bi-check-lg"></i> ' + file.name;
                            setTimeout(function () {
                                btnLoad.innerHTML = '<i class="bi bi-folder2-open"></i> Load File';
                            }, 3000);
                        });

                        // Write back to markdown editor
                        var allContainers = Array.from(
                            M.markdownPreview.querySelectorAll('.executable-jsx-container[data-autorun="true"]')
                        );
                        var blockIndex = allContainers.indexOf(container);
                        if (blockIndex >= 0 && M.markdownEditor) {
                            var src = M.markdownEditor.value;
                            var pattern = /(```jsx-autorun\n)([\s\S]*?)(```)/g;
                            var count = 0;
                            var newSrc = src.replace(pattern, function (match, open, body, close) {
                                if (count === blockIndex) {
                                    count++;
                                    return open + jsxContent + '\n' + close;
                                }
                                count++;
                                return match;
                            });
                            if (newSrc !== src) {
                                M.markdownEditor.value = newSrc;
                                M.markdownEditor.dispatchEvent(new Event('input'));
                            }
                        }
                    };
                    reader.readAsText(file);
                });
                toolbar.appendChild(btnLoad);

                // Expand / Collapse button
                var isExpanded = false;
                var btnExpand = document.createElement('button');
                btnExpand.className = 'code-toolbar-btn html-expand-btn';
                btnExpand.title = 'Expand iframe to full height';
                btnExpand.innerHTML = '<i class="bi bi-arrows-expand"></i>';
                btnExpand.addEventListener('click', function () {
                    var iframe = container.querySelector('.html-preview-frame');
                    if (!iframe) return;
                    isExpanded = !isExpanded;
                    if (isExpanded) {
                        iframe.classList.add('html-frame-expanded');
                        btnExpand.innerHTML = '<i class="bi bi-arrows-collapse"></i>';
                        btnExpand.title = 'Collapse iframe';
                    } else {
                        iframe.classList.remove('html-frame-expanded');
                        btnExpand.innerHTML = '<i class="bi bi-arrows-expand"></i>';
                        btnExpand.title = 'Expand iframe to full height';
                        try {
                            var doc = iframe.contentDocument || iframe.contentWindow.document;
                            var h = Math.min(doc.body.scrollHeight + 20, 5000);
                            iframe.style.height = Math.max(h, 200) + 'px';
                        } catch (e) { iframe.style.height = '600px'; }
                    }
                });
                toolbar.appendChild(btnExpand);

                container.insertBefore(toolbar, container.firstChild);

                // Auto-run: transpile and render
                autorunJsxBlock(container);
            } else {
                // Manual run mode
                var btnRun = document.createElement('button');
                btnRun.className = 'code-toolbar-btn html-preview-btn';
                btnRun.title = 'Transpile and render React component';
                btnRun.setAttribute('aria-label', 'Run JSX');
                btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
                btnRun.addEventListener('click', function () { manualRunJsxBlock(container, btnRun); });

                var btnCopy = document.createElement('button');
                btnCopy.className = 'code-toolbar-btn code-copy-btn';
                btnCopy.title = 'Copy code';
                btnCopy.setAttribute('aria-label', 'Copy code');
                btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>';
                btnCopy.addEventListener('click', function () {
                    var codeEl = container.querySelector('code');
                    if (!codeEl) return;
                    navigator.clipboard.writeText(codeEl.textContent).then(function () {
                        btnCopy.innerHTML = '<i class="bi bi-check-lg"></i>';
                        setTimeout(function () { btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
                    }).catch(function () {
                        btnCopy.innerHTML = '<i class="bi bi-x-lg"></i>';
                        setTimeout(function () { btnCopy.innerHTML = '<i class="bi bi-clipboard"></i>'; }, 1500);
                    });
                });

                toolbar.appendChild(btnRun);
                toolbar.appendChild(btnCopy);
                container.insertBefore(toolbar, container.firstChild);
            }
        });
    };

    // ========================================
    // Render JSX into a container's iframe
    // ========================================
    function renderJsxInContainer(container, jsxSource, onDone) {
        // Remove existing output
        var existingOutput = container.querySelector('.html-preview-output');
        if (existingOutput) existingOutput.remove();

        var outputEl = document.createElement('div');
        outputEl.className = 'html-preview-output';
        outputEl.style.display = 'block';
        outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> Transpiling JSX...</span>';
        container.appendChild(outputEl);

        getBabel(function (Babel, err) {
            if (!Babel || err) {
                outputEl.innerHTML = '<span class="code-output-error">Failed to load Babel: ' +
                    escapeHtml((err && err.message) || 'Unknown error') + '</span>';
                if (onDone) onDone();
                return;
            }

            outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> Rendering React component...</span>';

            var built = buildReactHtml(jsxSource);
            if (built.error) {
                outputEl.innerHTML = '<div style="padding:12px;font-family:monospace;font-size:12px;">' +
                    '<div style="color:#ef4444;font-weight:700;margin-bottom:4px;">JSX Transpilation Error</div>' +
                    '<pre style="color:#f87171;white-space:pre-wrap;margin:0;">' + escapeHtml(built.error) + '</pre></div>';
                if (onDone) onDone();
                return;
            }

            // Create sandboxed iframe using srcdoc (same pattern as html-autorun blocks)
            // allow-same-origin is required so CDN scripts can load
            var iframe = document.createElement('iframe');
            iframe.className = 'html-preview-frame';
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
            iframe.setAttribute('loading', 'lazy');
            iframe.srcdoc = injectLinkHandler(built.html);

            outputEl.innerHTML = '';
            outputEl.appendChild(iframe);

            function fitHeight() {
                if (iframe.classList.contains('html-frame-expanded')) return;
                try {
                    var doc = iframe.contentDocument || iframe.contentWindow.document;
                    var h = Math.min(doc.body.scrollHeight + 20, 5000);
                    if (h > 80) iframe.style.height = Math.max(h, 200) + 'px';
                } catch (e) { /* cross-origin guard */ }
            }

            iframe.addEventListener('load', function () {
                fitHeight();
                setTimeout(fitHeight, 800);
                setTimeout(fitHeight, 2000);
                setTimeout(fitHeight, 4000);
                if (onDone) onDone();
            });
        }, function (msg) {
            var outputEl = container.querySelector('.html-preview-output');
            if (outputEl) {
                outputEl.innerHTML = '<span class="code-output-loading"><i class="bi bi-arrow-repeat"></i> ' + escapeHtml(msg) + '</span>';
            }
        });
    }

    // ========================================
    // Autorun JSX block
    // ========================================
    function autorunJsxBlock(container) {
        var codeEl = container.querySelector('code');
        if (!codeEl) return;
        var source = codeEl.textContent;
        renderJsxInContainer(container, source);
    }

    // ========================================
    // Manual run JSX block
    // ========================================
    function manualRunJsxBlock(container, btnRun) {
        var codeEl = container.querySelector('code');
        if (!codeEl) return;
        var source = codeEl.textContent;

        var existingOutput = container.querySelector('.html-preview-output');
        if (existingOutput && existingOutput.style.display === 'block') {
            existingOutput.style.display = 'none';
            btnRun.innerHTML = '<i class="bi bi-play-fill"></i> Run';
            return;
        }

        btnRun.disabled = true;
        btnRun.innerHTML = '<i class="bi bi-hourglass-split"></i> Transpiling...';

        renderJsxInContainer(container, source, function () {
            btnRun.disabled = false;
            btnRun.innerHTML = '<i class="bi bi-eye-slash"></i> Close';
        });
    }

    // ========================================
    // Runtime Adapter for exec-controller
    // ========================================
    var jsxAdapter = {
        execute: function (source) {
            return new Promise(function (resolve, reject) {
                getBabel(function (Babel, err) {
                    if (!Babel || err) {
                        reject(err || new Error('Failed to load Babel'));
                        return;
                    }
                    var built = buildReactHtml(source);
                    if (built.error) {
                        reject(new Error(built.error));
                    } else {
                        resolve('[JSX component rendered]');
                    }
                });
            });
        }
    };

    if (M._execRegistry) {
        M._execRegistry.registerRuntime('jsx', jsxAdapter);
    } else {
        if (!M._pendingRuntimeAdapters) M._pendingRuntimeAdapters = [];
        M._pendingRuntimeAdapters.push({ key: 'jsx', adapter: jsxAdapter });
    }

})(window.MDView);
