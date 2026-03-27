// ============================================
// templates/charts-advanced-gallery.js — Advanced ECharts Gallery
// Charts that use async fetch, registerMap, myChart, setInterval
// Unlocked by the enhanced async code execution engine
// ============================================
window.__MDV_TEMPLATES_ADVANCED_GALLERY = [
    {
        name: 'Advanced Charts Gallery (Async)',
        category: 'charts',
        icon: 'bi-lightning-charge-fill',
        description: 'Advanced charts — GEO/Map, Bar Race, Dynamic Line, Force Graph, fetched Scatter & Candlestick',
        content: '# ⚡ Advanced ECharts Gallery\n\n' +
            '> Charts that use `fetch()`, `registerMap()`, `myChart.on()`, and `setInterval` — powered by the async engine.\n\n---\n\n' +

            // ─── 1. GEO Organ Diagram ───
            '## 1. Organ Diagram (GEO SVG Map)\n\n' +
            '> Fetches an SVG from CDN, registers it as a geo map, and cross-highlights with a bar chart on hover.\n\n' +
            '{{Chart: Organ Diagram\n' +
            '  @type: echart\n' +
            '  @height: 500\n' +
            '  @code: {\n' +
            'var ROOT_PATH = "https://cdn.jsdelivr.net/gh/apache/echarts-examples@gh-pages/public";\n' +
            'var svgResponse = await fetch(ROOT_PATH + "/data/asset/geo/Veins_Medical_Diagram_clip_art.svg");\n' +
            'var svgText = await svgResponse.text();\n' +
            'echarts.registerMap("organ_diagram", { svg: svgText });\n' +
            'var option = {\n' +
            '  tooltip: {},\n' +
            '  geo: {\n' +
            '    left: 10, right: "50%",\n' +
            '    map: "organ_diagram",\n' +
            '    selectedMode: "multiple",\n' +
            '    emphasis: {\n' +
            '      focus: "self",\n' +
            '      itemStyle: { color: null },\n' +
            '      label: { position: "bottom", distance: 0, textBorderColor: "#fff", textBorderWidth: 2 }\n' +
            '    },\n' +
            '    blur: {},\n' +
            '    select: {\n' +
            '      itemStyle: { color: "#b50205" },\n' +
            '      label: { show: false, textBorderColor: "#fff", textBorderWidth: 2 }\n' +
            '    }\n' +
            '  },\n' +
            '  grid: { left: "60%", top: "20%", bottom: "20%" },\n' +
            '  xAxis: {},\n' +
            '  yAxis: {\n' +
            '    data: ["heart","large-intestine","small-intestine","spleen","kidney","lung","liver"]\n' +
            '  },\n' +
            '  series: [{\n' +
            '    type: "bar",\n' +
            '    emphasis: { focus: "self" },\n' +
            '    data: [121, 321, 141, 52, 198, 289, 139]\n' +
            '  }]\n' +
            '};\n' +
            'myChart.setOption(option);\n' +
            'myChart.on("mouseover", { seriesIndex: 0 }, function (event) {\n' +
            '  myChart.dispatchAction({ type: "highlight", geoIndex: 0, name: event.name });\n' +
            '});\n' +
            'myChart.on("mouseout", { seriesIndex: 0 }, function (event) {\n' +
            '  myChart.dispatchAction({ type: "downplay", geoIndex: 0, name: event.name });\n' +
            '});\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 2. Bar Race (Dynamic) ───
            '## 2. Bar Race (Dynamic Animation)\n\n' +
            '> Animated bar race using `setInterval` — bars re-sort every 2 seconds with random growth.\n\n' +
            '{{Chart: Bar Race\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  { name: "Python", value: 85 },\n' +
            '  { name: "JavaScript", value: 78 },\n' +
            '  { name: "Java", value: 72 },\n' +
            '  { name: "C++", value: 65 },\n' +
            '  { name: "Go", value: 55 },\n' +
            '  { name: "Rust", value: 48 },\n' +
            '  { name: "TypeScript", value: 62 },\n' +
            '  { name: "Swift", value: 40 }\n' +
            '];\n' +
            'var colors = ["#6366f1","#22c55e","#f59e0b","#ec4899","#06b6d4","#ef4444","#a855f7","#14b8a6"];\n' +
            'function getOption() {\n' +
            '  data.sort(function(a,b) { return a.value - b.value; });\n' +
            '  return {\n' +
            '    title: { text: "Language Popularity Race", left: "center" },\n' +
            '    grid: { left: "15%", right: "10%", top: "10%", bottom: "5%" },\n' +
            '    xAxis: { max: "dataMax" },\n' +
            '    yAxis: {\n' +
            '      type: "category", data: data.map(function(d) { return d.name; }),\n' +
            '      inverse: false, animationDuration: 300, animationDurationUpdate: 300\n' +
            '    },\n' +
            '    series: [{\n' +
            '      type: "bar", realtimeSort: true,\n' +
            '      data: data.map(function(d, i) {\n' +
            '        return { value: d.value, itemStyle: { color: colors[i % colors.length] } };\n' +
            '      }),\n' +
            '      label: { show: true, position: "right", formatter: "{c}" }\n' +
            '    }],\n' +
            '    animationDuration: 0,\n' +
            '    animationDurationUpdate: 1500,\n' +
            '    animationEasing: "linear",\n' +
            '    animationEasingUpdate: "linear"\n' +
            '  };\n' +
            '}\n' +
            'myChart.setOption(getOption());\n' +
            'setInterval(function() {\n' +
            '  data.forEach(function(d) { d.value += Math.round(Math.random() * 20); });\n' +
            '  myChart.setOption(getOption());\n' +
            '}, 2000);\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 3. Dynamic Real-time Line ───
            '## 3. Dynamic Real-time Line\n\n' +
            '> Live-updating line chart using `setInterval` — new data point added every second.\n\n' +
            '{{Chart: Real-time Line\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'var data = [];\n' +
            'var now = new Date();\n' +
            'for (var i = 19; i >= 0; i--) {\n' +
            '  var t = new Date(now - i * 1000);\n' +
            '  data.push({ name: t.toLocaleTimeString(), value: [t, Math.round(Math.random() * 100)] });\n' +
            '}\n' +
            'var option = {\n' +
            '  title: { text: "Real-time Sensor Data", left: "center" },\n' +
            '  tooltip: { trigger: "axis", formatter: function(p) { return p[0].name + ": " + p[0].value[1]; } },\n' +
            '  xAxis: { type: "time", splitLine: { show: false } },\n' +
            '  yAxis: { type: "value", min: 0, max: 100 },\n' +
            '  series: [{\n' +
            '    type: "line", showSymbol: false, smooth: true,\n' +
            '    lineStyle: { color: "#6366f1", width: 2 },\n' +
            '    areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,\n' +
            '      colorStops: [{ offset: 0, color: "rgba(99,102,241,0.4)" }, { offset: 1, color: "rgba(99,102,241,0.02)" }] } },\n' +
            '    data: data\n' +
            '  }]\n' +
            '};\n' +
            'myChart.setOption(option);\n' +
            'setInterval(function() {\n' +
            '  var t = new Date();\n' +
            '  data.shift();\n' +
            '  data.push({ name: t.toLocaleTimeString(), value: [t, Math.round(Math.random() * 100)] });\n' +
            '  myChart.setOption({ series: [{ data: data }] });\n' +
            '}, 1000);\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 4. Force-Directed Graph ───
            '## 4. Force-Directed Graph\n\n' +
            '> Interactive network graph with draggable nodes and force layout.\n\n' +
            '{{Chart: Network Graph\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var nodes = [\n' +
            '  { name: "CEO", symbolSize: 50, category: 0 },\n' +
            '  { name: "CTO", symbolSize: 40, category: 1 },\n' +
            '  { name: "CFO", symbolSize: 40, category: 2 },\n' +
            '  { name: "CMO", symbolSize: 40, category: 3 },\n' +
            '  { name: "Frontend", symbolSize: 25, category: 1 },\n' +
            '  { name: "Backend", symbolSize: 25, category: 1 },\n' +
            '  { name: "DevOps", symbolSize: 25, category: 1 },\n' +
            '  { name: "ML/AI", symbolSize: 25, category: 1 },\n' +
            '  { name: "Finance", symbolSize: 25, category: 2 },\n' +
            '  { name: "Accounting", symbolSize: 25, category: 2 },\n' +
            '  { name: "Marketing", symbolSize: 25, category: 3 },\n' +
            '  { name: "Sales", symbolSize: 25, category: 3 },\n' +
            '  { name: "PR", symbolSize: 25, category: 3 }\n' +
            '];\n' +
            'var links = [\n' +
            '  { source: "CEO", target: "CTO" }, { source: "CEO", target: "CFO" }, { source: "CEO", target: "CMO" },\n' +
            '  { source: "CTO", target: "Frontend" }, { source: "CTO", target: "Backend" },\n' +
            '  { source: "CTO", target: "DevOps" }, { source: "CTO", target: "ML/AI" },\n' +
            '  { source: "CFO", target: "Finance" }, { source: "CFO", target: "Accounting" },\n' +
            '  { source: "CMO", target: "Marketing" }, { source: "CMO", target: "Sales" }, { source: "CMO", target: "PR" },\n' +
            '  { source: "Frontend", target: "Backend" }, { source: "DevOps", target: "Backend" },\n' +
            '  { source: "Marketing", target: "Sales" }\n' +
            '];\n' +
            'var categories = [\n' +
            '  { name: "Executive" }, { name: "Engineering" }, { name: "Finance" }, { name: "Marketing" }\n' +
            '];\n' +
            'var option = {\n' +
            '  title: { text: "Company Network Graph", left: "center" },\n' +
            '  tooltip: {},\n' +
            '  legend: [{ data: categories.map(function(c) { return c.name; }), bottom: "5%" }],\n' +
            '  series: [{\n' +
            '    type: "graph", layout: "force",\n' +
            '    data: nodes, links: links, categories: categories,\n' +
            '    roam: true, draggable: true,\n' +
            '    label: { show: true, position: "right" },\n' +
            '    force: { repulsion: 200, edgeLength: [80, 150] },\n' +
            '    emphasis: { focus: "adjacency", lineStyle: { width: 5 } }\n' +
            '  }]\n' +
            '};\n' +
            'myChart.setOption(option);\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 5. Scatter with Fetched Data ───
            '## 5. Scatter Plot (Fetched Data)\n\n' +
            '> Fetches the Life Expectancy dataset from ECharts CDN and renders a bubble scatter plot.\n\n' +
            '{{Chart: Life Expectancy Scatter\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var ROOT_PATH = "https://cdn.jsdelivr.net/gh/apache/echarts-examples@gh-pages/public";\n' +
            'var response = await fetch(ROOT_PATH + "/data/asset/data/life-expectancy-table.json");\n' +
            'var rawData = await response.json();\n' +
            'var data2015 = rawData.filter(function(d) { return d[4] === 2015 && d[0] > 0; });\n' +
            'var option = {\n' +
            '  title: { text: "Life Expectancy vs GDP (2015)", left: "center" },\n' +
            '  tooltip: {\n' +
            '    trigger: "item",\n' +
            '    formatter: function(p) {\n' +
            '      return p.data[4] + "<br/>GDP: $" + p.data[0] + "<br/>Life: " + p.data[1] + " yrs<br/>Pop: " + (p.data[2]/1e6).toFixed(1) + "M";\n' +
            '    }\n' +
            '  },\n' +
            '  xAxis: { name: "GDP per Capita ($)", type: "log", min: 300, max: 100000 },\n' +
            '  yAxis: { name: "Life Expectancy (Years)", min: 20, max: 90 },\n' +
            '  series: [{\n' +
            '    type: "scatter",\n' +
            '    data: data2015.map(function(d) {\n' +
            '      return [d[0], d[1], d[2], d[3], d[3]];\n' +
            '    }),\n' +
            '    symbolSize: function(d) { return Math.max(5, Math.sqrt(d[2]) / 500); },\n' +
            '    itemStyle: { color: "#6366f1", opacity: 0.6 }\n' +
            '  }]\n' +
            '};\n' +
            'myChart.setOption(option);\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 6. Candlestick with Fetched Data ───
            '## 6. Candlestick (Fetched Stock Data)\n\n' +
            '> Fetches stock OHLC data from ECharts CDN and renders a professional candlestick chart with MA lines.\n\n' +
            '{{Chart: Stock Candlestick\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var ROOT_PATH = "https://cdn.jsdelivr.net/gh/apache/echarts-examples@gh-pages/public";\n' +
            'var response = await fetch(ROOT_PATH + "/data/asset/data/stock-DJI.json");\n' +
            'var rawData = await response.json();\n' +
            'var dates = rawData.map(function(d) { return d[0]; });\n' +
            'var ohlc = rawData.map(function(d) { return [+d[1], +d[2], +d[3], +d[4]]; });\n' +
            'function calcMA(dayCount) {\n' +
            '  var result = [];\n' +
            '  for (var i = 0; i < ohlc.length; i++) {\n' +
            '    if (i < dayCount) { result.push("-"); continue; }\n' +
            '    var sum = 0;\n' +
            '    for (var j = 0; j < dayCount; j++) sum += ohlc[i - j][1];\n' +
            '    result.push((sum / dayCount).toFixed(2));\n' +
            '  }\n' +
            '  return result;\n' +
            '}\n' +
            'var last200 = dates.length > 200 ? dates.length - 200 : 0;\n' +
            'var option = {\n' +
            '  title: { text: "Dow Jones Industrial Average", left: "center" },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "cross" } },\n' +
            '  legend: { data: ["Candlestick", "MA5", "MA20"], bottom: "0%" },\n' +
            '  grid: { left: "8%", right: "8%", top: "10%", bottom: "15%" },\n' +
            '  xAxis: { type: "category", data: dates, boundaryGap: false,\n' +
            '    axisLine: { onZero: false }, min: last200, max: dates.length - 1 },\n' +
            '  yAxis: { scale: true, splitArea: { show: true } },\n' +
            '  dataZoom: [\n' +
            '    { type: "inside", start: 85, end: 100 },\n' +
            '    { show: true, type: "slider", bottom: "5%", start: 85, end: 100 }\n' +
            '  ],\n' +
            '  series: [\n' +
            '    { name: "Candlestick", type: "candlestick", data: ohlc,\n' +
            '      itemStyle: { color: "#22c55e", color0: "#ef4444", borderColor: "#22c55e", borderColor0: "#ef4444" } },\n' +
            '    { name: "MA5", type: "line", data: calcMA(5), smooth: true,\n' +
            '      lineStyle: { opacity: 0.7, width: 1 }, showSymbol: false },\n' +
            '    { name: "MA20", type: "line", data: calcMA(20), smooth: true,\n' +
            '      lineStyle: { opacity: 0.7, width: 1 }, showSymbol: false }\n' +
            '  ]\n' +
            '};\n' +
            'myChart.setOption(option);\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 7. Calendar Heatmap ───
            '## 7. Calendar Heatmap\n\n' +
            '> GitHub-style contribution calendar heatmap with generated data.\n\n' +
            '{{Chart: Calendar Heatmap\n' +
            '  @type: echart\n' +
            '  @height: 200\n' +
            '  @code: {\n' +
            'var data = [];\n' +
            'var start = new Date("2024-01-01");\n' +
            'var end = new Date("2024-12-31");\n' +
            'for (var d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {\n' +
            '  data.push([d.toISOString().split("T")[0], Math.floor(Math.random() * 10)]);\n' +
            '}\n' +
            'var option = {\n' +
            '  title: { text: "2024 Contributions", left: "center" },\n' +
            '  tooltip: { formatter: function(p) { return p.value[0] + ": " + p.value[1] + " commits"; } },\n' +
            '  visualMap: { min: 0, max: 10, show: false,\n' +
            '    inRange: { color: ["#1e293b", "#3b5998", "#6366f1", "#a855f7", "#22c55e"] } },\n' +
            '  calendar: {\n' +
            '    top: 50, left: 50, right: 30,\n' +
            '    cellSize: ["auto", 13],\n' +
            '    range: "2024",\n' +
            '    itemStyle: { borderWidth: 1, borderColor: "#334155" },\n' +
            '    yearLabel: { show: false },\n' +
            '    dayLabel: { color: "#94a3b8" },\n' +
            '    monthLabel: { color: "#94a3b8" }\n' +
            '  },\n' +
            '  series: [{ type: "heatmap", coordinateSystem: "calendar", data: data }]\n' +
            '};\n' +
            'myChart.setOption(option);\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 8. Animated Pie / Doughnut ───
            '## 8. Animated Nightingale Chart\n\n' +
            '> Rose/Nightingale chart with animation timer cycling through data focus.\n\n' +
            '{{Chart: Animated Nightingale\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'var option = {\n' +
            '  title: { text: "Tech Stack Usage", left: "center" },\n' +
            '  tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },\n' +
            '  legend: { bottom: "5%" },\n' +
            '  series: [{\n' +
            '    type: "pie", radius: ["20%", "70%"], roseType: "area",\n' +
            '    itemStyle: { borderRadius: 8 },\n' +
            '    data: [\n' +
            '      { value: 40, name: "React" },\n' +
            '      { value: 38, name: "Vue" },\n' +
            '      { value: 32, name: "Angular" },\n' +
            '      { value: 30, name: "Svelte" },\n' +
            '      { value: 28, name: "Next.js" },\n' +
            '      { value: 26, name: "Nuxt" },\n' +
            '      { value: 22, name: "Solid" },\n' +
            '      { value: 18, name: "Remix" }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            'myChart.setOption(option);\n' +
            'var currentIndex = -1;\n' +
            'setInterval(function() {\n' +
            '  var dataLen = option.series[0].data.length;\n' +
            '  myChart.dispatchAction({ type: "downplay", seriesIndex: 0, dataIndex: currentIndex });\n' +
            '  currentIndex = (currentIndex + 1) % dataLen;\n' +
            '  myChart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex: currentIndex });\n' +
            '  myChart.dispatchAction({ type: "showTip", seriesIndex: 0, dataIndex: currentIndex });\n' +
            '}, 2000);\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '> **Note:** These charts use the async execution engine. They require network access for fetched examples (SVG, JSON). All examples use the CORS-friendly `cdn.jsdelivr.net` mirror of the ECharts gallery data.\n'
    }
];
