// ============================================
// templates/charts-parallel-gallery.js — Parallel Chart Gallery
// 4 parallel chart variations from ECharts gallery
// ============================================
window.__MDV_TEMPLATES_PARALLEL_GALLERY = [
    {
        name: 'Parallel Chart Gallery (4 Types)',
        category: 'charts',
        icon: 'bi-layout-three-columns',
        description: 'Complete Parallel Coordinates gallery — basic, AQI, nutrients, scatter matrix',
        content: '# ⫴ Parallel Coordinates Gallery\n\n' +
            '> Parallel coordinate plots from the [ECharts Gallery](https://echarts.apache.org/examples/en/index.html#chart-type-parallel) — copy-paste ready.\n\n---\n\n' +

            // ─── 1. Basic Parallel ───
            '## 1. Basic Parallel\n\n' +
            '{{Chart: Basic Parallel\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  parallelAxis: [\n' +
            '    { dim: 0, name: "Price" },\n' +
            '    { dim: 1, name: "Net Weight" },\n' +
            '    { dim: 2, name: "Amount" },\n' +
            '    { dim: 3, name: "Score", type: "category", data: ["Excellent","Good","OK","Bad"] }\n' +
            '  ],\n' +
            '  series: [{\n' +
            '    type: "parallel",\n' +
            '    lineStyle: { width: 2 },\n' +
            '    data: [\n' +
            '      [12.99, 100, 82, "Good"],\n' +
            '      [9.99, 80, 77, "OK"],\n' +
            '      [20, 120, 60, "Excellent"],\n' +
            '      [6.99, 53, 35, "Bad"],\n' +
            '      [15.50, 95, 70, "Good"],\n' +
            '      [18.75, 110, 90, "Excellent"],\n' +
            '      [8.25, 65, 45, "OK"],\n' +
            '      [22.00, 130, 88, "Excellent"]\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 2. Parallel AQI ───
            '## 2. Parallel AQI (Air Quality Index)\n\n' +
            '> Multi-city air quality comparison across 6 pollutant dimensions.\n\n' +
            '{{Chart: Parallel AQI\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var schema = [\n' +
            '  { name: "AQI", index: 0 }, { name: "PM2.5", index: 1 },\n' +
            '  { name: "PM10", index: 2 }, { name: "CO", index: 3 },\n' +
            '  { name: "NO2", index: 4 }, { name: "SO2", index: 5 }\n' +
            '];\n' +
            'var lineStyle = { width: 1.5, opacity: 0.5 };\n' +
            'option = {\n' +
            '  title: { text: "Air Quality Multi-City Comparison", left: "center" },\n' +
            '  legend: { bottom: "3%", data: ["Beijing", "Shanghai", "Guangzhou"] },\n' +
            '  parallelAxis: schema.map(function(s) { return { dim: s.index, name: s.name }; }),\n' +
            '  parallel: { left: "5%", right: "13%", bottom: "15%", top: "15%" },\n' +
            '  series: [\n' +
            '    { name: "Beijing", type: "parallel", lineStyle: lineStyle,\n' +
            '      data: [[130,95,152,1.8,62,25],[115,78,120,1.5,55,20],[155,112,185,2.2,73,32],[88,60,95,1.1,42,15],[140,100,160,1.9,65,28]] },\n' +
            '    { name: "Shanghai", type: "parallel", lineStyle: lineStyle,\n' +
            '      data: [[75,42,68,0.9,38,12],[82,55,80,1.0,40,14],[60,35,55,0.7,30,10],[95,65,90,1.2,48,18],[70,40,62,0.8,35,11]] },\n' +
            '    { name: "Guangzhou", type: "parallel", lineStyle: lineStyle,\n' +
            '      data: [[55,30,45,0.6,25,8],[65,38,58,0.8,32,10],[48,25,38,0.5,20,6],[72,45,65,0.9,36,12],[50,28,42,0.6,22,7]] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 3. Parallel Nutrients ───
            '## 3. Parallel Nutrients\n\n' +
            '> Nutrient profile of common foods across multiple dimensions.\n\n' +
            '{{Chart: Parallel Nutrients\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Food Nutrient Profiles", left: "center" },\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  parallelAxis: [\n' +
            '    { dim: 0, name: "Calories", min: 0, max: 600 },\n' +
            '    { dim: 1, name: "Protein (g)", min: 0, max: 50 },\n' +
            '    { dim: 2, name: "Fat (g)", min: 0, max: 40 },\n' +
            '    { dim: 3, name: "Carbs (g)", min: 0, max: 80 },\n' +
            '    { dim: 4, name: "Fiber (g)", min: 0, max: 15 },\n' +
            '    { dim: 5, name: "Sugar (g)", min: 0, max: 30 },\n' +
            '    { dim: 6, name: "Sodium (mg)", min: 0, max: 1500 }\n' +
            '  ],\n' +
            '  parallel: { left: "5%", right: "13%", bottom: "10%", top: "12%" },\n' +
            '  legend: { bottom: "0%", data: ["Grains", "Proteins", "Fruits"] },\n' +
            '  series: [\n' +
            '    { name: "Grains", type: "parallel", lineStyle: { width: 2, opacity: 0.6 },\n' +
            '      data: [[350,12,2,72,3,1,500],[265,8,3,55,2,2,400],[380,13,5,65,8,3,200],[150,5,1,32,1,0,180]] },\n' +
            '    { name: "Proteins", type: "parallel", lineStyle: { width: 2, opacity: 0.6 },\n' +
            '      data: [[250,42,8,0,0,0,75],[165,31,4,0,0,0,70],[200,25,10,1,0,0,320],[290,26,20,2,0,1,850]] },\n' +
            '    { name: "Fruits", type: "parallel", lineStyle: { width: 2, opacity: 0.6 },\n' +
            '      data: [[95,0.5,0.3,25,4,19,2],[105,1.3,0.4,27,3,14,1],[62,1.2,0.4,15,3,10,0],[46,1,0.2,12,2,8,1]] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 4. Scatter Matrix ───
            '## 4. Scatter Matrix\n\n' +
            '> Pairwise scatter matrix using parallel axes as a multi-dimensional view.\n\n' +
            '{{Chart: Scatter Matrix\n' +
            '  @type: echart\n' +
            '  @height: 500\n' +
            '  @code: {\n' +
            'var data = [];\n' +
            'for (var i = 0; i < 80; i++) {\n' +
            '  data.push([\n' +
            '    Math.round(Math.random() * 100),\n' +
            '    Math.round(Math.random() * 50 + 20),\n' +
            '    Math.round(Math.random() * 200 + 50),\n' +
            '    Math.round(Math.random() * 80 + 10),\n' +
            '    Math.round(Math.random() * 60)\n' +
            '  ]);\n' +
            '}\n' +
            'option = {\n' +
            '  title: { text: "Multi-Dimensional Scatter View", left: "center" },\n' +
            '  parallelAxis: [\n' +
            '    { dim: 0, name: "Metric A" },\n' +
            '    { dim: 1, name: "Metric B" },\n' +
            '    { dim: 2, name: "Metric C" },\n' +
            '    { dim: 3, name: "Metric D" },\n' +
            '    { dim: 4, name: "Metric E" }\n' +
            '  ],\n' +
            '  parallel: { left: "5%", right: "13%", bottom: "10%", top: "12%",\n' +
            '    parallelAxisDefault: { type: "value", nameLocation: "end", nameGap: 20,\n' +
            '      nameTextStyle: { fontSize: 12 },\n' +
            '      axisLine: { lineStyle: { color: "#94a3b8" } },\n' +
            '      axisTick: { lineStyle: { color: "#94a3b8" } }\n' +
            '    }\n' +
            '  },\n' +
            '  series: [{\n' +
            '    type: "parallel",\n' +
            '    lineStyle: { width: 1, opacity: 0.3, color: "#6366f1" },\n' +
            '    smooth: true,\n' +
            '    data: data\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '> **Tip:** Parallel coordinates excel at showing patterns across many dimensions simultaneously. Drag along an axis to create range filters.\n'
    }
];
