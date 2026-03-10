// ============================================
// templates/finance.js — Finance Templates
// ============================================
window.__MDV_TEMPLATES_FINANCE = [
    {
        name: 'Stock Watchlist',
        category: 'finance',
        icon: 'bi-graph-up-arrow',
        description: 'Live stock dashboard — add company tickers as variables, grid auto-adjusts',
        variables: [
            { name: 'dashboardTitle', value: 'My Stock Watchlist', desc: 'Dashboard heading' },
            { name: 'cname1', value: 'AAPL', desc: 'Stock ticker 1' },
            { name: 'cname2', value: 'MSFT', desc: 'Stock ticker 2' },
            { name: 'cname3', value: 'GOOGL', desc: 'Stock ticker 3' },
            { name: 'cname4', value: 'AMZN', desc: 'Stock ticker 4' },
            { name: 'chartRange', value: '1M', desc: 'Range: 1d, 7d, 1M, 12M, 36M, 5Y' },
            { name: 'chartInterval', value: 'D', desc: 'Interval: D, W, M' },
            { name: 'emaPeriod', value: '52', desc: 'EMA period (e.g. 20, 52, 200)' },
        ],
        content: '# 📈 $(dashboardTitle)\n' +
            '\n' +
            '**Last updated:** $(date) · $(time)\n' +
            '\n' +
            '---\n' +
            '\n' +
            '<div class="stock-grid" data-var-prefix="cname" data-range="$(chartRange)" data-interval="$(chartInterval)" data-ema="$(emaPeriod)"></div>\n' +
            '\n' +
            '---\n' +
            '\n' +
            '> [!TIP]\n' +
            '> **Add more stocks:** Add `cname5`, `cname6`, etc. rows to the variables table above.\n' +
            '> **Remove stocks:** Delete or leave a `cname` row empty.\n' +
            '> Then click **⚡ Vars** — the grid auto-adjusts!\n' +
            '\n' +
            '> [!NOTE]\n' +
            '> Use standard symbols: `AAPL`, `GOOGL`, `TSLA`, `MSFT`, `AMZN`, `NVDA`, `META`, `NFLX`, etc.\n' +
            '> For other exchanges: `NSE:RELIANCE`, `LSE:SHEL`, `TSE:7203`.\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## 📡 Fetch Stock Data via API\n' +
            '\n' +
            'Use the **API** and **Coding** tools to pull real-time data:\n' +
            '\n' +
            '{{API:\n' +
            '  URL: https://corsproxy.io/?https://query2.finance.yahoo.com/v1/finance/search?q=amazon' +
            '  Method: GET\n' +
            '  Variable: stockData\n' +
            '}}\n' +
            '\n' +
            '> Replace `TICKER` above with a symbol from your variable table.\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## 🔧 Parse Stock Data\n' +
            '\n' +
            '```javascript\n' +
            '// Dynamic Stock Grid Generator\n' +
            '// Reads cname variables and generates grid HTML + summary table\n' +
            '\n' +
            'const tickers = ["$(cname1)", "$(cname2)", "$(cname3)", "$(cname4)"].filter(t => t && !t.startsWith("$("));\n' +
            'const range = "$(chartRange)" || "1M";\n' +
            'const interval = "$(chartInterval)" || "D";\n' +
            'const ema = "$(emaPeriod)" || "52";\n' +
            '\n' +
            '// Generate stock-grid HTML\n' +
            'const cards = tickers.map(t =>\n' +
            '  `  <div class="stock-card" data-symbol="${t}"></div>`\n' +
            ').join("\\n");\n' +
            '\n' +
            'const gridHtml = `<div class="stock-grid" data-range="${range}" data-interval="${interval}" data-ema="${ema}">\\n\n' +
            '${cards}\\n\n' +
            '</div>`;\n' +
            '\n' +
            'console.log("Generated Grid HTML:");\n' +
            'console.log(gridHtml);\n' +
            '\n' +
            '// Summary table\n' +
            'const rows = tickers.map(t => `| ${t} | — | — | — |`);\n' +
            'const table = [\n' +
            '  "| Ticker | Price | Change | Volume |",\n' +
            '  "|--------|-------|--------|--------|",\n' +
            '  ...rows\n' +
            '].join("\\n");\n' +
            'console.log("\\n" + table);\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## 🔍 Find Ticker Symbols\n' +
            '\n' +
            '> 🔗 Search on **[Yahoo Finance](https://finance.yahoo.com/lookup/)** or **[TradingView](https://www.tradingview.com/symbol-search/)**\n' +
            '> then paste the ticker into `cname1`, `cname2`, etc. above and click **⚡ Vars**.\n'
    },
    {
        name: 'Crypto Tracker',
        category: 'finance',
        icon: 'bi-currency-bitcoin',
        description: 'Cryptocurrency dashboard — add coin pairs as variables, grid auto-adjusts',
        variables: [
            { name: 'dashboardTitle', value: 'Crypto Portfolio', desc: 'Dashboard heading' },
            { name: 'coin1', value: '', desc: 'Crypto pair 1 (e.g. BINANCE:BTCUSD)' },
            { name: 'coin2', value: '', desc: 'Crypto pair 2 (e.g. BINANCE:ETHUSD)' },
            { name: 'coin3', value: '', desc: 'Crypto pair 3 (e.g. BINANCE:SOLUSD)' },
            { name: 'coin4', value: '', desc: 'Crypto pair 4 (e.g. BINANCE:ADAUSD)' },
            { name: 'chartRange', value: '1M', desc: 'Range: 1M, 12M, 36M' },
            { name: 'chartInterval', value: 'D', desc: 'Interval: D, W, M' },
            { name: 'emaPeriod', value: '52', desc: 'EMA period' },
        ],
        content: '# 🪙 $(dashboardTitle)\n' +
            '\n' +
            '**Last updated:** $(date) · $(time)\n' +
            '\n' +
            '---\n' +
            '\n' +
            '<div class="stock-grid" data-var-prefix="coin" data-range="$(chartRange)" data-interval="$(chartInterval)" data-ema="$(emaPeriod)"></div>\n' +
            '\n' +
            '---\n' +
            '\n' +
            '> [!TIP]\n' +
            '> Add `coin5`, `coin6` rows to the variables table to add more coins.\n' +
            '> Use pairs like `BINANCE:BTCUSD`, `BINANCE:ETHUSD`, `BINANCE:XRPUSD`, etc.\n'
    },
    {
        name: 'Market Overview',
        category: 'finance',
        icon: 'bi-bar-chart-line',
        description: 'Global market indices — add indices as variables, grid auto-adjusts',
        variables: [
            { name: 'dashboardTitle', value: 'Global Market Overview', desc: 'Dashboard heading' },
            { name: 'idx1', value: '', desc: 'Index 1 (e.g. SPX for S&P 500)' },
            { name: 'idx2', value: '', desc: 'Index 2 (e.g. IXIC for Nasdaq)' },
            { name: 'idx3', value: '', desc: 'Index 3 (e.g. DJI for Dow Jones)' },
            { name: 'idx4', value: '', desc: 'Index 4 (e.g. FTSE for FTSE 100)' },
            { name: 'idx5', value: '', desc: 'Index 5 (e.g. NI225 for Nikkei)' },
            { name: 'idx6', value: '', desc: 'Index 6 (e.g. HSI for Hang Seng)' },
            { name: 'chartRange', value: '1M', desc: 'Range: 1M, 12M, 36M' },
            { name: 'chartInterval', value: 'D', desc: 'Interval: D, W, M' },
            { name: 'emaPeriod', value: '52', desc: 'EMA period' },
        ],
        content: '# 🌍 $(dashboardTitle)\n' +
            '\n' +
            '**Last updated:** $(date) · $(time)\n' +
            '\n' +
            '---\n' +
            '\n' +
            '<div class="stock-grid" data-var-prefix="idx" data-range="$(chartRange)" data-interval="$(chartInterval)" data-ema="$(emaPeriod)"></div>\n' +
            '\n' +
            '---\n' +
            '\n' +
            '> [!TIP]\n' +
            '> Add or remove `idx` rows to customize your index watchlist.\n' +
            '> Examples: `SPX`, `IXIC`, `DJI`, `FTSE`, `NI225`, `HSI`, `DAX`, `NIFTY`.\n'
    },
];
