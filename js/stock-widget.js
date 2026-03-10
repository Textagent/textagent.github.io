// ============================================
// stock-widget.js — TradingView Stock Widget Renderer
// Post-render hook: converts <div class="stock-card" data-symbol="TICKER">
// into embedded TradingView Advanced Chart widgets with EMA overlay.
//
// Config via data attributes on .stock-grid:
//   data-range    — default range  (1M, 12M, 36M)   [default: 1M]
//   data-interval — default interval (D, W, M)       [default: D]
//   data-ema      — EMA period                        [default: 52]
// ============================================
(function (M) {
    'use strict';

    var DEFAULT_RANGE = '1M';
    var DEFAULT_INTERVAL = 'D';
    var DEFAULT_EMA = 52;

    /**
     * Detect current theme for TradingView widget.
     */
    function getTvTheme() {
        var theme = document.documentElement.getAttribute('data-theme');
        return theme === 'dark' ? 'dark' : 'light';
    }

    /**
     * Build TradingView Advanced Chart widget URL with EMA overlay.
     */
    function buildWidgetUrl(symbol, interval, range, emaPeriod) {
        var emaStudy = 'EMA@tv-basicstudies';
        var overrides = JSON.stringify({
            'moving average exponential.length': parseInt(emaPeriod, 10) || DEFAULT_EMA
        });
        var params = new URLSearchParams({
            symbol: symbol,
            interval: interval || DEFAULT_INTERVAL,
            range: range || DEFAULT_RANGE,
            theme: getTvTheme(),
            style: '3',
            locale: 'en',
            hide_side_toolbar: '1',
            hide_top_toolbar: '1',
            withdateranges: '0',
            symboledit: '0',
            saveimage: '0',
            hideideas: '1',
            studies: emaStudy,
            studies_overrides: overrides,
            timezone: 'exchange',
        });
        return 'https://s.tradingview.com/widgetembed/?' + params.toString();
    }

    /**
     * Create range + EMA toggle buttons for a card.
     */
    function createControls(symbol, iframeWrap, cfg) {
        var controls = document.createElement('div');
        controls.className = 'stock-card-controls';

        // Range buttons
        var ranges = [
            { label: '1M', range: '1M', interval: 'D' },
            { label: '1Y', range: '12M', interval: 'D' },
            { label: '3Y', range: '36M', interval: 'W' },
        ];
        var rangeGroup = document.createElement('div');
        rangeGroup.className = 'stock-range-buttons';

        ranges.forEach(function (r) {
            var btn = document.createElement('button');
            var isActive = r.range === cfg.range;
            btn.className = 'stock-range-btn' + (isActive ? ' active' : '');
            btn.textContent = r.label;
            btn.title = r.label + ' range';
            btn.addEventListener('click', function () {
                rangeGroup.querySelectorAll('.stock-range-btn').forEach(function (b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                var iframe = iframeWrap.querySelector('iframe');
                if (iframe) iframe.src = buildWidgetUrl(symbol, r.interval, r.range, cfg.ema);
            });
            rangeGroup.appendChild(btn);
        });

        // EMA interval buttons
        var emaIntervals = [
            { label: cfg.ema + 'D', interval: 'D', title: cfg.ema + '-Day EMA' },
            { label: cfg.ema + 'W', interval: 'W', title: cfg.ema + '-Week EMA' },
            { label: cfg.ema + 'M', interval: 'M', title: cfg.ema + '-Month EMA' },
        ];
        var emaGroup = document.createElement('div');
        emaGroup.className = 'stock-range-buttons stock-ema-buttons';

        emaIntervals.forEach(function (e) {
            var btn = document.createElement('button');
            var isActive = e.interval === cfg.interval;
            btn.className = 'stock-ema-btn' + (isActive ? ' active' : '');
            btn.textContent = e.label;
            btn.title = e.title;
            btn.addEventListener('click', function () {
                emaGroup.querySelectorAll('.stock-ema-btn').forEach(function (b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                var activeRange = rangeGroup.querySelector('.stock-range-btn.active');
                var rangeLabel = activeRange ? activeRange.textContent : '1M';
                var rangeVal = ranges.find(function (r) { return r.label === rangeLabel; });
                var iframe = iframeWrap.querySelector('iframe');
                if (iframe) iframe.src = buildWidgetUrl(symbol, e.interval, rangeVal ? rangeVal.range : '12M', cfg.ema);
            });
            emaGroup.appendChild(btn);
        });

        controls.appendChild(rangeGroup);
        controls.appendChild(emaGroup);
        return controls;
    }

    /**
     * Render all .stock-card[data-symbol] elements inside the given container.
     * Reads config from the parent .stock-grid data attributes.
     */
    M.renderStockWidgets = function (container) {
        if (!container) return;

        var cards = container.querySelectorAll('.stock-card[data-symbol]');
        if (cards.length === 0) return;

        cards.forEach(function (card) {
            if (card.getAttribute('data-widget-loaded') === 'true') return;

            var symbol = (card.getAttribute('data-symbol') || '').trim();
            if (!symbol || symbol.includes('$(')) return;

            // Read config from parent .stock-grid (or fallback to defaults)
            var grid = card.closest('.stock-grid');
            var cfg = {
                range: (grid && grid.getAttribute('data-range')) || DEFAULT_RANGE,
                interval: (grid && grid.getAttribute('data-interval')) || DEFAULT_INTERVAL,
                ema: (grid && grid.getAttribute('data-ema')) || DEFAULT_EMA,
            };

            card.setAttribute('data-widget-loaded', 'true');

            // Header
            var header = document.createElement('div');
            header.className = 'stock-card-header';
            var symbolSpan = document.createElement('span');
            symbolSpan.className = 'stock-card-symbol';
            symbolSpan.textContent = symbol;
            header.appendChild(symbolSpan);

            // Chart iframe
            var iframeWrap = document.createElement('div');
            iframeWrap.className = 'stock-card-chart';
            var iframe = document.createElement('iframe');
            iframe.src = buildWidgetUrl(symbol, cfg.interval, cfg.range, cfg.ema);
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowtransparency', 'true');
            iframe.setAttribute('scrolling', 'no');
            iframe.setAttribute('loading', 'lazy');
            iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
            iframe.title = symbol + ' chart';
            iframeWrap.appendChild(iframe);

            // Controls
            var controls = createControls(symbol, iframeWrap, cfg);
            header.appendChild(controls);

            card.appendChild(header);
            card.appendChild(iframeWrap);
        });
    };

})(window.MDView);
