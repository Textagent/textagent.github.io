// ============================================
// templates/charts.js — ECharts Chart Templates
// All charts use {{Chart: @type: echart @code: {}}} format
// ============================================
window.__MDV_TEMPLATES_CHARTS = [
    {
        name: 'Bar Chart',
        category: 'charts',
        icon: 'bi-bar-chart-fill',
        description: 'Colorful bar chart with gradient colors — great for comparing categories',
        content: '# 📊 Bar Chart\n\n' +
            '> Edit the code below to customize your chart.\n\n' +
            '{{Chart: Monthly Sales\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Monthly Sales", left: "center" },\n' +
            '  tooltip: { trigger: "axis" },\n' +
            '  xAxis: { type: "category", data: ["Jan","Feb","Mar","Apr","May","Jun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [{\n' +
            '    type: "bar",\n' +
            '    data: [120, 200, 150, 280, 190, 340],\n' +
            '    itemStyle: {\n' +
            '      color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,\n' +
            '        colorStops: [{ offset: 0, color: "#818cf8" }, { offset: 1, color: "#6366f1" }] },\n' +
            '      borderRadius: [6, 6, 0, 0]\n' +
            '    }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n'
    },
    {
        name: 'Line Chart',
        category: 'charts',
        icon: 'bi-graph-up',
        description: 'Smooth line chart with gradient area fill — ideal for trends over time',
        content: '# 📈 Line Chart\n\n' +
            '{{Chart: Weekly Traffic\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Weekly Traffic", left: "center" },\n' +
            '  tooltip: { trigger: "axis" },\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], boundaryGap: false },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [{\n' +
            '    type: "line", smooth: true,\n' +
            '    data: [820, 932, 901, 1234, 1290, 1530, 1320],\n' +
            '    lineStyle: { color: "#22c55e", width: 3 },\n' +
            '    itemStyle: { color: "#22c55e" },\n' +
            '    areaStyle: {\n' +
            '      color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,\n' +
            '        colorStops: [{ offset: 0, color: "rgba(34,197,94,0.4)" }, { offset: 1, color: "rgba(34,197,94,0.02)" }] }\n' +
            '    }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n'
    },
    {
        name: 'Pie / Doughnut Chart',
        category: 'charts',
        icon: 'bi-pie-chart-fill',
        description: 'Doughnut chart with colorful segments and labels — perfect for proportions',
        content: '# 🍩 Doughnut Chart\n\n' +
            '{{Chart: Market Share\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Market Share", left: "center" },\n' +
            '  tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },\n' +
            '  legend: { bottom: "5%" },\n' +
            '  series: [{\n' +
            '    type: "pie", radius: ["40%", "70%"], avoidLabelOverlap: true,\n' +
            '    itemStyle: { borderRadius: 10, borderColor: "#1e293b", borderWidth: 3 },\n' +
            '    data: [\n' +
            '      { value: 1048, name: "Product A", itemStyle: { color: "#6366f1" } },\n' +
            '      { value: 735, name: "Product B", itemStyle: { color: "#22c55e" } },\n' +
            '      { value: 580, name: "Product C", itemStyle: { color: "#f59e0b" } },\n' +
            '      { value: 484, name: "Product D", itemStyle: { color: "#ec4899" } },\n' +
            '      { value: 300, name: "Other", itemStyle: { color: "#64748b" } }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n'
    },
    {
        name: 'Radar Chart',
        category: 'charts',
        icon: 'bi-bullseye',
        description: 'Multi-axis radar chart — compare skills, attributes, or performance metrics',
        content: '# 🎯 Radar Chart\n\n' +
            '{{Chart: Skill Comparison\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Skill Comparison", left: "center" },\n' +
            '  tooltip: {},\n' +
            '  legend: { bottom: "5%", data: ["Team A", "Team B"] },\n' +
            '  radar: {\n' +
            '    indicator: [\n' +
            '      { name: "Frontend", max: 100 }, { name: "Backend", max: 100 },\n' +
            '      { name: "DevOps", max: 100 }, { name: "Design", max: 100 },\n' +
            '      { name: "Testing", max: 100 }, { name: "Communication", max: 100 }\n' +
            '    ],\n' +
            '    splitArea: { areaStyle: { color: ["rgba(99,102,241,0.05)", "rgba(99,102,241,0.1)"] } }\n' +
            '  },\n' +
            '  series: [{ type: "radar", data: [\n' +
            '    { value: [90,70,60,85,75,80], name: "Team A",\n' +
            '      areaStyle: { color: "rgba(99,102,241,0.3)" }, lineStyle: { color: "#6366f1" }, itemStyle: { color: "#6366f1" } },\n' +
            '    { value: [65,90,85,50,80,70], name: "Team B",\n' +
            '      areaStyle: { color: "rgba(34,197,94,0.3)" }, lineStyle: { color: "#22c55e" }, itemStyle: { color: "#22c55e" } }\n' +
            '  ]}]\n' +
            '};\n' +
            '  }\n' +
            '}}\n'
    },
    {
        name: 'Scatter Plot',
        category: 'charts',
        icon: 'bi-distribute-vertical',
        description: 'Scatter plot with tooltip — visualize correlations and distributions',
        content: '# 🔵 Scatter Plot\n\n' +
            '{{Chart: Height vs Weight\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Height vs Weight", left: "center" },\n' +
            '  tooltip: {},\n' +
            '  xAxis: { name: "Height (cm)" },\n' +
            '  yAxis: { name: "Weight (kg)" },\n' +
            '  series: [{\n' +
            '    type: "scatter", symbolSize: 12,\n' +
            '    itemStyle: { color: "#818cf8", shadowBlur: 10, shadowColor: "rgba(129,140,248,0.4)" },\n' +
            '    data: [\n' +
            '      [155,52],[160,58],[165,62],[168,65],[170,70],\n' +
            '      [172,68],[175,75],[178,78],[180,82],[183,85],\n' +
            '      [158,55],[163,60],[167,63],[173,72],[176,76],\n' +
            '      [169,67],[171,71],[177,79],[181,83],[185,88]\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n'
    },
    {
        name: 'Stacked Area Chart',
        category: 'charts',
        icon: 'bi-layers-fill',
        description: 'Multi-series stacked area — show cumulative trends across categories',
        content: '# 📊 Stacked Area Chart\n\n' +
            '{{Chart: Traffic Sources\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Website Traffic Sources", left: "center" },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "cross" } },\n' +
            '  legend: { bottom: "5%" },\n' +
            '  xAxis: { type: "category", data: ["Jan","Feb","Mar","Apr","May","Jun","Jul"], boundaryGap: false },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [\n' +
            '    { name: "Organic", type: "line", stack: "total", smooth: true,\n' +
            '      areaStyle: { color: "rgba(99,102,241,0.4)" },\n' +
            '      lineStyle: { color: "#6366f1" }, itemStyle: { color: "#6366f1" },\n' +
            '      data: [120,132,101,134,190,230,210] },\n' +
            '    { name: "Social", type: "line", stack: "total", smooth: true,\n' +
            '      areaStyle: { color: "rgba(236,72,153,0.4)" },\n' +
            '      lineStyle: { color: "#ec4899" }, itemStyle: { color: "#ec4899" },\n' +
            '      data: [220,182,191,234,290,330,310] },\n' +
            '    { name: "Direct", type: "line", stack: "total", smooth: true,\n' +
            '      areaStyle: { color: "rgba(34,197,94,0.4)" },\n' +
            '      lineStyle: { color: "#22c55e" }, itemStyle: { color: "#22c55e" },\n' +
            '      data: [150,232,201,154,190,330,410] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n'
    },
    {
        name: 'Gauge Chart',
        category: 'charts',
        icon: 'bi-speedometer2',
        description: 'Dashboard-style gauge — show KPIs, scores, or progress',
        content: '# ⏱️ Gauge Chart\n\n' +
            '{{Chart: Performance\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  series: [{\n' +
            '    type: "gauge", startAngle: 200, endAngle: -20, min: 0, max: 100, splitNumber: 10,\n' +
            '    itemStyle: { color: "#6366f1" },\n' +
            '    progress: { show: true, width: 20, itemStyle: { color: "#6366f1" } },\n' +
            '    pointer: { show: false },\n' +
            '    axisLine: { lineStyle: { width: 20, color: [[1, "#334155"]] } },\n' +
            '    axisTick: { show: false }, splitLine: { show: false },\n' +
            '    axisLabel: { color: "#94a3b8", fontSize: 12, distance: -40 },\n' +
            '    title: { show: true, offsetCenter: [0, "40%"], fontSize: 16 },\n' +
            '    detail: { valueAnimation: true, fontSize: 40, fontWeight: "bold",\n' +
            '      color: "#818cf8", offsetCenter: [0, "-5%"], formatter: "{value}%" },\n' +
            '    data: [{ value: 78, name: "Performance" }]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n'
    },
    {
        name: 'Candlestick (Financial)',
        category: 'charts',
        icon: 'bi-graph-up-arrow',
        description: 'Financial candlestick chart — OHLC data for stock/crypto analysis',
        content: '# 🕯️ Candlestick Chart\n\n' +
            '{{Chart: Stock Price\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Stock Price (OHLC)", left: "center" },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "cross" } },\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Mon2","Tue2","Wed2","Thu2","Fri2"] },\n' +
            '  yAxis: { scale: true },\n' +
            '  series: [{\n' +
            '    type: "candlestick",\n' +
            '    itemStyle: { color: "#22c55e", color0: "#ef4444", borderColor: "#22c55e", borderColor0: "#ef4444" },\n' +
            '    data: [\n' +
            '      [20,34,10,38],[40,35,30,50],[31,38,33,44],[38,15,5,42],[25,36,20,38],\n' +
            '      [30,46,28,48],[42,50,38,56],[48,42,36,52],[44,38,30,46],[40,52,38,58]\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n'
    },
    {
        name: 'Multi-Series Bar Chart',
        category: 'charts',
        icon: 'bi-bar-chart-steps',
        description: 'Side-by-side grouped bars — compare multiple datasets across categories',
        content: '# 📊 Multi-Series Bar Chart\n\n' +
            '{{Chart: Q1 vs Q2\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Q1 vs Q2 Performance", left: "center" },\n' +
            '  tooltip: { trigger: "axis" },\n' +
            '  legend: { bottom: "5%" },\n' +
            '  xAxis: { type: "category", data: ["Sales","Marketing","Engineering","Support","HR"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [\n' +
            '    { name: "Q1", type: "bar", data: [85,72,90,65,50], itemStyle: { color: "#6366f1", borderRadius: [4,4,0,0] } },\n' +
            '    { name: "Q2", type: "bar", data: [95,80,88,78,62], itemStyle: { color: "#22c55e", borderRadius: [4,4,0,0] } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n'
    },
    {
        name: 'Heatmap',
        category: 'charts',
        icon: 'bi-grid-3x3-gap-fill',
        description: 'Weekly heatmap grid — visualize activity patterns across days and hours',
        content: '# 🟩 Heatmap\n\n' +
            '{{Chart: Weekly Activity\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Weekly Activity", left: "center" },\n' +
            '  tooltip: { position: "top", formatter: "{c} events" },\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], splitArea: { show: true } },\n' +
            '  yAxis: { type: "category", data: ["Morning","Afternoon","Evening","Night"], splitArea: { show: true } },\n' +
            '  visualMap: { min: 0, max: 20, calculable: true, orient: "horizontal", left: "center", bottom: "5%",\n' +
            '    inRange: { color: ["#1e293b","#6366f1","#c084fc"] } },\n' +
            '  series: [{\n' +
            '    type: "heatmap",\n' +
            '    data: [\n' +
            '      [0,0,5],[1,0,8],[2,0,12],[3,0,10],[4,0,6],[5,0,2],[6,0,1],\n' +
            '      [0,1,15],[1,1,18],[2,1,14],[3,1,16],[4,1,12],[5,1,4],[6,1,3],\n' +
            '      [0,2,8],[1,2,10],[2,2,6],[3,2,9],[4,2,7],[5,2,12],[6,2,8],\n' +
            '      [0,3,2],[1,3,1],[2,3,3],[3,3,2],[4,3,1],[5,3,8],[6,3,5]\n' +
            '    ],\n' +
            '    label: { show: true },\n' +
            '    emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.5)" } }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n'
    },
    {
        name: 'ECharts Code Catalog',
        category: 'charts',
        icon: 'bi-journal-code',
        description: 'Complete gallery — 15 chart types using {{Chart: @type: echart @code: {}}} (copy-paste from ECharts gallery)',
        content: '# 📊 ECharts Code Catalog\n\n' +
            '> A complete reference of every compatible chart type using `{{Chart:}}` code mode.\n> Copy any example, customize the data, and use in your documents.\n\n---\n\n' +

            '## 1. Line Chart\n\n' +
            '{{Chart: Smoothed Line\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Weekly Traffic", left: "center" },\n' +
            '  tooltip: { trigger: "axis" },\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], boundaryGap: false },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [{\n' +
            '    type: "line", smooth: true,\n' +
            '    data: [820, 932, 901, 1234, 1290, 1530, 1320],\n' +
            '    areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: "rgba(99,102,241,0.4)"}, {offset: 1, color: "rgba(99,102,241,0.02)"}] } },\n' +
            '    lineStyle: { color: "#6366f1", width: 3 },\n' +
            '    itemStyle: { color: "#6366f1" }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 2. Bar Chart\n\n' +
            '{{Chart: Monthly Revenue\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Monthly Revenue", left: "center" },\n' +
            '  tooltip: { trigger: "axis" },\n' +
            '  legend: { bottom: "5%" },\n' +
            '  xAxis: { type: "category", data: ["Jan","Feb","Mar","Apr","May","Jun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [\n' +
            '    { name: "Revenue", type: "bar", data: [120, 200, 150, 280, 190, 340], itemStyle: { color: "#6366f1", borderRadius: [6,6,0,0] } },\n' +
            '    { name: "Profit", type: "bar", data: [40, 80, 60, 120, 70, 180], itemStyle: { color: "#22c55e", borderRadius: [6,6,0,0] } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 3. Pie / Doughnut Chart\n\n' +
            '{{Chart: Market Share\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Market Share", left: "center" },\n' +
            '  tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },\n' +
            '  legend: { bottom: "5%" },\n' +
            '  series: [{\n' +
            '    type: "pie", radius: ["40%", "70%"],\n' +
            '    itemStyle: { borderRadius: 10, borderColor: "#1e293b", borderWidth: 3 },\n' +
            '    data: [\n' +
            '      { value: 1048, name: "Chrome" },\n' +
            '      { value: 735, name: "Safari" },\n' +
            '      { value: 580, name: "Firefox" },\n' +
            '      { value: 484, name: "Edge" },\n' +
            '      { value: 300, name: "Other" }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 4. Radar Chart\n\n' +
            '{{Chart: Skill Comparison\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Team Skills", left: "center" },\n' +
            '  legend: { bottom: "5%", data: ["Team A", "Team B"] },\n' +
            '  radar: {\n' +
            '    indicator: [\n' +
            '      { name: "Frontend", max: 100 }, { name: "Backend", max: 100 },\n' +
            '      { name: "DevOps", max: 100 }, { name: "Design", max: 100 },\n' +
            '      { name: "Testing", max: 100 }, { name: "Communication", max: 100 }\n' +
            '    ]\n' +
            '  },\n' +
            '  series: [{ type: "radar", data: [\n' +
            '    { value: [90, 70, 60, 85, 75, 80], name: "Team A", areaStyle: { color: "rgba(99,102,241,0.3)" } },\n' +
            '    { value: [65, 90, 85, 50, 80, 70], name: "Team B", areaStyle: { color: "rgba(34,197,94,0.3)" } }\n' +
            '  ]}]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 5. Gauge Chart\n\n' +
            '{{Chart: Performance Score\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  series: [{\n' +
            '    type: "gauge", startAngle: 200, endAngle: -20, min: 0, max: 100,\n' +
            '    progress: { show: true, width: 20 },\n' +
            '    pointer: { show: false },\n' +
            '    axisLine: { lineStyle: { width: 20, color: [[1, "#334155"]] } },\n' +
            '    axisTick: { show: false }, splitLine: { show: false },\n' +
            '    detail: { valueAnimation: true, fontSize: 40, fontWeight: "bold", offsetCenter: [0, "-5%"], formatter: "{value}%" },\n' +
            '    title: { show: true, offsetCenter: [0, "40%"], fontSize: 16 },\n' +
            '    data: [{ value: 78, name: "Performance" }]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 6. Funnel Chart\n\n' +
            '{{Chart: Sales Funnel\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Sales Funnel", left: "center" },\n' +
            '  tooltip: { trigger: "item", formatter: "{b}: {c}" },\n' +
            '  series: [{\n' +
            '    type: "funnel", left: "10%", width: "80%", top: 60, bottom: 20,\n' +
            '    min: 0, max: 100, gap: 2, sort: "descending",\n' +
            '    label: { show: true, position: "inside" },\n' +
            '    itemStyle: { borderColor: "#1e293b", borderWidth: 2 },\n' +
            '    data: [\n' +
            '      { value: 100, name: "Visitors" },\n' +
            '      { value: 80, name: "Leads" },\n' +
            '      { value: 60, name: "Prospects" },\n' +
            '      { value: 40, name: "Negotiations" },\n' +
            '      { value: 20, name: "Closed Deals" }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 7. Scatter Plot\n\n' +
            '{{Chart: Height vs Weight\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Height vs Weight", left: "center" },\n' +
            '  xAxis: { name: "Height (cm)" },\n' +
            '  yAxis: { name: "Weight (kg)" },\n' +
            '  series: [{\n' +
            '    type: "scatter", symbolSize: 12,\n' +
            '    itemStyle: { color: "#818cf8", shadowBlur: 10, shadowColor: "rgba(129,140,248,0.4)" },\n' +
            '    data: [[155,52],[160,58],[165,62],[168,65],[170,70],[172,68],[175,75],[178,78],[180,82],[183,85],[158,55],[163,60],[167,63],[173,72],[176,76]]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 8. Heatmap\n\n' +
            '{{Chart: Weekly Activity\n' +
            '  @type: echart\n' +
            '  @height: 300\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Weekly Activity", left: "center" },\n' +
            '  tooltip: { position: "top" },\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], splitArea: { show: true } },\n' +
            '  yAxis: { type: "category", data: ["Morning","Afternoon","Evening","Night"], splitArea: { show: true } },\n' +
            '  visualMap: { min: 0, max: 20, calculable: true, orient: "horizontal", left: "center", bottom: "5%",\n' +
            '    inRange: { color: ["#1e293b", "#6366f1", "#c084fc"] } },\n' +
            '  series: [{ type: "heatmap", label: { show: true },\n' +
            '    data: [[0,0,5],[1,0,8],[2,0,12],[3,0,10],[4,0,6],[5,0,2],[6,0,1],\n' +
            '           [0,1,15],[1,1,18],[2,1,14],[3,1,16],[4,1,12],[5,1,4],[6,1,3],\n' +
            '           [0,2,8],[1,2,10],[2,2,6],[3,2,9],[4,2,7],[5,2,12],[6,2,8],\n' +
            '           [0,3,2],[1,3,1],[2,3,3],[3,3,2],[4,3,1],[5,3,8],[6,3,5]] }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 9. Boxplot\n\n' +
            '{{Chart: Score Distribution\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Exam Score Distribution", left: "center" },\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  xAxis: { type: "category", data: ["Math", "Science", "English", "History", "Art"] },\n' +
            '  yAxis: { type: "value", min: 40, max: 100 },\n' +
            '  series: [{\n' +
            '    type: "boxplot",\n' +
            '    data: [[55,62,74,85,92],[48,58,68,78,88],[60,70,78,86,95],[52,60,72,80,90],[65,72,80,88,98]]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 10. Sankey Diagram\n\n' +
            '{{Chart: Energy Flow\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Energy Flow", left: "center" },\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  series: [{\n' +
            '    type: "sankey", layout: "none", emphasis: { focus: "adjacency" },\n' +
            '    data: [\n' +
            '      { name: "Solar" }, { name: "Wind" }, { name: "Hydro" },\n' +
            '      { name: "Grid" }, { name: "Home" }, { name: "Industry" }, { name: "Transport" }\n' +
            '    ],\n' +
            '    links: [\n' +
            '      { source: "Solar", target: "Grid", value: 40 },\n' +
            '      { source: "Wind", target: "Grid", value: 30 },\n' +
            '      { source: "Hydro", target: "Grid", value: 20 },\n' +
            '      { source: "Grid", target: "Home", value: 35 },\n' +
            '      { source: "Grid", target: "Industry", value: 40 },\n' +
            '      { source: "Grid", target: "Transport", value: 15 }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 11. Sunburst Chart\n\n' +
            '{{Chart: Drink Flavors\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Drink Categories", left: "center" },\n' +
            '  series: [{\n' +
            '    type: "sunburst", radius: [0, "90%"],\n' +
            '    label: { rotate: "radial" },\n' +
            '    data: [\n' +
            '      { name: "Coffee", children: [\n' +
            '        { name: "Espresso", value: 5 }, { name: "Latte", value: 8 },\n' +
            '        { name: "Cappuccino", value: 6 }, { name: "Americano", value: 4 }\n' +
            '      ]},\n' +
            '      { name: "Tea", children: [\n' +
            '        { name: "Green", value: 7 }, { name: "Black", value: 5 },\n' +
            '        { name: "Oolong", value: 3 }, { name: "Herbal", value: 4 }\n' +
            '      ]},\n' +
            '      { name: "Juice", children: [\n' +
            '        { name: "Orange", value: 6 }, { name: "Apple", value: 5 },\n' +
            '        { name: "Mango", value: 4 }\n' +
            '      ]}\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 12. Tree Chart\n\n' +
            '{{Chart: Org Structure\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  series: [{\n' +
            '    type: "tree", orient: "TB", expandAndCollapse: true,\n' +
            '    label: { position: "top", verticalAlign: "middle", align: "center", fontSize: 12 },\n' +
            '    leaves: { label: { position: "bottom" } },\n' +
            '    animationDuration: 550, animationDurationUpdate: 750,\n' +
            '    data: [{\n' +
            '      name: "CEO", children: [\n' +
            '        { name: "CTO", children: [{ name: "Frontend" }, { name: "Backend" }, { name: "DevOps" }] },\n' +
            '        { name: "CFO", children: [{ name: "Accounting" }, { name: "Finance" }] },\n' +
            '        { name: "CMO", children: [{ name: "Marketing" }, { name: "Sales" }, { name: "PR" }] }\n' +
            '      ]\n' +
            '    }]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 13. Treemap\n\n' +
            '{{Chart: Disk Usage\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Disk Usage", left: "center" },\n' +
            '  tooltip: {},\n' +
            '  series: [{\n' +
            '    type: "treemap", roam: false,\n' +
            '    data: [\n' +
            '      { name: "Documents", value: 25, children: [\n' +
            '        { name: "PDFs", value: 10 }, { name: "Docs", value: 8 }, { name: "Sheets", value: 7 }\n' +
            '      ]},\n' +
            '      { name: "Media", value: 40, children: [\n' +
            '        { name: "Photos", value: 20 }, { name: "Videos", value: 15 }, { name: "Music", value: 5 }\n' +
            '      ]},\n' +
            '      { name: "Code", value: 20, children: [\n' +
            '        { name: "JS", value: 8 }, { name: "Python", value: 7 }, { name: "Rust", value: 5 }\n' +
            '      ]},\n' +
            '      { name: "System", value: 15 }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 14. Parallel Coordinates\n\n' +
            '{{Chart: Car Specs\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Car Specifications", left: "center" },\n' +
            '  parallelAxis: [\n' +
            '    { dim: 0, name: "HP" }, { dim: 1, name: "MPG" },\n' +
            '    { dim: 2, name: "Weight (lb)" }, { dim: 3, name: "0-60 (s)" }, { dim: 4, name: "Price ($K)" }\n' +
            '  ],\n' +
            '  series: [{\n' +
            '    type: "parallel", lineStyle: { width: 2, opacity: 0.5 },\n' +
            '    data: [[200,30,3200,6.5,35],[300,22,3800,5.2,52],[150,38,2800,8.0,25],[450,18,4200,4.0,78],[180,34,3000,7.2,30],[350,20,3900,4.8,65]]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 15. ThemeRiver\n\n' +
            '{{Chart: Topic Trends\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Topic Trends", left: "center" },\n' +
            '  tooltip: { trigger: "axis" },\n' +
            '  singleAxis: { type: "time", bottom: 30 },\n' +
            '  series: [{\n' +
            '    type: "themeRiver",\n' +
            '    data: [\n' +
            '      ["2020/01",10,"AI"],["2020/01",20,"Web"],["2020/01",15,"Mobile"],\n' +
            '      ["2020/04",25,"AI"],["2020/04",18,"Web"],["2020/04",12,"Mobile"],\n' +
            '      ["2020/07",40,"AI"],["2020/07",22,"Web"],["2020/07",14,"Mobile"],\n' +
            '      ["2020/10",50,"AI"],["2020/10",25,"Web"],["2020/10",10,"Mobile"],\n' +
            '      ["2021/01",65,"AI"],["2021/01",20,"Web"],["2021/01",8,"Mobile"],\n' +
            '      ["2021/04",80,"AI"],["2021/04",18,"Web"],["2021/04",12,"Mobile"]\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '> **Tip:** Copy any `{{Chart:}}` block above, paste into your document, and edit the data. All 15 types are **copy-paste ready** from the [ECharts Gallery](https://echarts.apache.org/examples/en/index.html).\n'
    },
    {
        name: 'Organ Diagram (Geo SVG)',
        category: 'charts',
        icon: 'bi-heart-pulse-fill',
        description: 'Interactive anatomy diagram linked to a bar chart — hover organs to highlight data',
        content: '# 🫀 Organ Diagram (Geo SVG)\n\n' +
            '> Interactive anatomy chart — hover an organ or bar to cross-highlight.\n\n' +
            '{{Chart: Organ Health\n' +
            '  @type: echart\n' +
            '  @height: 500\n' +
            '  @code: {\n' +
            'var ROOT_PATH = "https://cdn.jsdelivr.net/gh/apache/echarts-examples@gh-pages/public";\n' +
            'var svgResponse = await fetch(ROOT_PATH + "/data/asset/geo/Veins_Medical_Diagram_clip_art.svg");\n' +
            'var svgText = await svgResponse.text();\n' +
            'echarts.registerMap("organ_diagram", { svg: svgText });\n' +
            'option = {\n' +
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
            '}}\n'
    }
];
