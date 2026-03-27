// ============================================
// templates/charts-pie-gallery.js — Pie Chart Gallery
// 20 pie chart variations from ECharts gallery
// ============================================
window.__MDV_TEMPLATES_PIE_GALLERY = [
    {
        name: 'Pie Chart Gallery (20 Types)',
        category: 'charts',
        icon: 'bi-pie-chart-fill',
        description: 'Complete Pie chart gallery — 20 variations (doughnut, nightingale, nested, label, half, pattern & more)',
        content: '# 🥧 Pie Chart Gallery\n\n' +
            '> Every pie chart variation from the [ECharts Gallery](https://echarts.apache.org/examples/en/index.html#chart-type-pie) — copy-paste ready.\n\n---\n\n' +

            '## 1. Referer of a Website\n\n' +
            '{{Chart: Referer\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Referer of a Website", subtext: "Fake Data", left: "center" },\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  legend: { orient: "vertical", left: "left" },\n' +
            '  series: [{\n' +
            '    name: "Access From", type: "pie", radius: "50%",\n' +
            '    data: [\n' +
            '      { value: 1048, name: "Search Engine" },\n' +
            '      { value: 735, name: "Direct" },\n' +
            '      { value: 580, name: "Email" },\n' +
            '      { value: 484, name: "Union Ads" },\n' +
            '      { value: 300, name: "Video Ads" }\n' +
            '    ],\n' +
            '    emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" } }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 2. Doughnut Chart\n\n' +
            '{{Chart: Doughnut\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  legend: { top: "5%", left: "center" },\n' +
            '  series: [{\n' +
            '    name: "Access From", type: "pie", radius: ["40%","70%"],\n' +
            '    avoidLabelOverlap: false,\n' +
            '    itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },\n' +
            '    label: { show: false, position: "center" },\n' +
            '    emphasis: { label: { show: true, fontSize: 40, fontWeight: "bold" } },\n' +
            '    labelLine: { show: false },\n' +
            '    data: [\n' +
            '      { value: 1048, name: "Search Engine" },\n' +
            '      { value: 735, name: "Direct" },\n' +
            '      { value: 580, name: "Email" },\n' +
            '      { value: 484, name: "Union Ads" },\n' +
            '      { value: 300, name: "Video Ads" }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 3. Nightingale Chart (Rose)\n\n' +
            '{{Chart: Nightingale\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  legend: { top: "bottom" },\n' +
            '  toolbox: { show: true, feature: { mark: { show: true }, dataView: { show: true, readOnly: false }, restore: { show: true }, saveAsImage: { show: true } } },\n' +
            '  series: [{\n' +
            '    name: "Nightingale Chart", type: "pie", radius: [50, 200],\n' +
            '    center: ["50%","50%"], roseType: "area",\n' +
            '    itemStyle: { borderRadius: 8 },\n' +
            '    data: [\n' +
            '      { value: 40, name: "rose 1" }, { value: 38, name: "rose 2" },\n' +
            '      { value: 32, name: "rose 3" }, { value: 30, name: "rose 4" },\n' +
            '      { value: 28, name: "rose 5" }, { value: 26, name: "rose 6" },\n' +
            '      { value: 22, name: "rose 7" }, { value: 18, name: "rose 8" }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 4. Customized Pie\n\n' +
            '{{Chart: Customized Pie\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  backgroundColor: "#2c343c",\n' +
            '  title: { text: "Customized Pie", left: "center", top: 20, textStyle: { color: "#ccc" } },\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  visualMap: { show: false, min: 80, max: 600, inRange: { colorLightness: [0, 1] } },\n' +
            '  series: [{\n' +
            '    name: "Access From", type: "pie", radius: "55%", center: ["50%","50%"],\n' +
            '    data: [\n' +
            '      { value: 335, name: "Direct" }, { value: 310, name: "Email" },\n' +
            '      { value: 274, name: "Union Ads" }, { value: 235, name: "Video Ads" },\n' +
            '      { value: 400, name: "Search Engine" }\n' +
            '    ].sort(function(a,b) { return a.value - b.value; }),\n' +
            '    roseType: "radius",\n' +
            '    label: { color: "rgba(255,255,255,0.3)" },\n' +
            '    labelLine: { lineStyle: { color: "rgba(255,255,255,0.3)" }, smooth: 0.2, length: 10, length2: 20 },\n' +
            '    itemStyle: { color: "#c23531", shadowBlur: 200, shadowColor: "rgba(0,0,0,0.5)" },\n' +
            '    animationType: "scale", animationEasing: "elasticOut", animationDelay: function(idx) { return Math.random() * 200; }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 5. Pie Label Align\n\n' +
            '{{Chart: Label Align\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  { value: 1048, name: "Baidu" }, { value: 735, name: "Direct" },\n' +
            '  { value: 580, name: "Email" }, { value: 484, name: "Google" },\n' +
            '  { value: 300, name: "Union Ads" }, { value: 200, name: "Bing" },\n' +
            '  { value: 150, name: "Video Ads" }, { value: 100, name: "Others" }\n' +
            '];\n' +
            'option = {\n' +
            '  title: [{ text: "Left Align", left: "25%", textAlign: "center" },\n' +
            '    { text: "Right Align", left: "75%", textAlign: "center" }],\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  series: [\n' +
            '    { type: "pie", radius: [30, 100], center: ["25%","55%"],\n' +
            '      label: { alignTo: "labelLine", formatter: "{name|{b}}\\n{time|{c} ({d}%)}",\n' +
            '        minMargin: 5, edgeDistance: 10, lineHeight: 15,\n' +
            '        rich: { time: { fontSize: 10, color: "#999" } } },\n' +
            '      labelLine: { length: 15, length2: 0, maxSurfaceAngle: 80 },\n' +
            '      labelLayout: function(params) { var isLeft = params.labelRect.x < 400/2; return { align: isLeft ? "right" : "left" }; },\n' +
            '      data: data },\n' +
            '    { type: "pie", radius: [30, 100], center: ["75%","55%"],\n' +
            '      label: { alignTo: "edge", formatter: "{name|{b}}\\n{time|{c} ({d}%)}",\n' +
            '        minMargin: 5, edgeDistance: 10, lineHeight: 15,\n' +
            '        rich: { time: { fontSize: 10, color: "#999" } } },\n' +
            '      labelLine: { length: 15, length2: 0, maxSurfaceAngle: 80 },\n' +
            '      data: data }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 6. Half Doughnut Chart\n\n' +
            '{{Chart: Half Doughnut\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  legend: { top: "5%", left: "center" },\n' +
            '  series: [{\n' +
            '    name: "Access From", type: "pie", radius: ["40%","70%"],\n' +
            '    center: ["50%","70%"], startAngle: 180,\n' +
            '    label: { show: true, formatter: function(p) { return p.name + "\\n" + p.percent * 2 + "%"; } },\n' +
            '    data: [\n' +
            '      { value: 1048, name: "Search Engine" },\n' +
            '      { value: 735, name: "Direct" },\n' +
            '      { value: 580, name: "Email" },\n' +
            '      { value: 484, name: "Union Ads" },\n' +
            '      { value: 300, name: "Video Ads" },\n' +
            '      { value: 1048+735+580+484+300, itemStyle: { color: "none", decal: { symbol: "none" } }, label: { show: false } }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 7. Nested Pie\n\n' +
            '{{Chart: Nested Rings\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  tooltip: { trigger: "item", formatter: "{a} <br/>{b}: {c} ({d}%)" },\n' +
            '  legend: { top: "5%" },\n' +
            '  series: [\n' +
            '    { name: "Category", type: "pie", selectedMode: "single", radius: [0, "30%"],\n' +
            '      label: { position: "inner", fontSize: 12 },\n' +
            '      data: [\n' +
            '        { value: 1548, name: "Search" },\n' +
            '        { value: 775, name: "Direct" },\n' +
            '        { value: 679, name: "Marketing" }\n' +
            '      ] },\n' +
            '    { name: "Source", type: "pie", radius: ["45%", "60%"],\n' +
            '      labelLine: { length: 30 },\n' +
            '      label: { formatter: "{a|{a}}{abg|}\\n{hr|}\\n  {b|{b}:}  {c}  {per|{d}%}  ",\n' +
            '        backgroundColor: "#F6F8FC", borderColor: "#8C8D8E", borderWidth: 1, borderRadius: 4,\n' +
            '        rich: { a: { color: "#6E7079", lineHeight: 22, align: "center" }, hr: { borderColor: "#8C8D8E", width: "100%", borderWidth: 1, height: 0 }, b: { color: "#4C5058", fontSize: 14, fontWeight: "bold", lineHeight: 33 }, per: { color: "#fff", backgroundColor: "#4C5058", padding: [3,4], borderRadius: 4 } } },\n' +
            '      data: [\n' +
            '        { value: 1048, name: "Baidu" }, { value: 335, name: "Google" }, { value: 165, name: "Yahoo" },\n' +
            '        { value: 310, name: "Direct" }, { value: 251, name: "Links" }, { value: 234, name: "Bookmarks" },\n' +
            '        { value: 135, name: "Email" }, { value: 148, name: "Ads" }, { value: 396, name: "Video" }\n' +
            '      ] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 8. Pie with Rich Label\n\n' +
            '{{Chart: Rich Label\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Browser Market Share", left: "center" },\n' +
            '  tooltip: { trigger: "item", formatter: "{b}: {d}%" },\n' +
            '  series: [{\n' +
            '    type: "pie", radius: [50, 130],\n' +
            '    itemStyle: { borderRadius: 8 },\n' +
            '    label: {\n' +
            '      formatter: "{name|{b}}\\n{value|{c}} ({d}%)",\n' +
            '      rich: {\n' +
            '        name: { fontSize: 14, fontWeight: "bold", lineHeight: 26 },\n' +
            '        value: { fontSize: 12, color: "#999", lineHeight: 20 }\n' +
            '      }\n' +
            '    },\n' +
            '    data: [\n' +
            '      { value: 63, name: "Chrome" }, { value: 19, name: "Safari" },\n' +
            '      { value: 5, name: "Firefox" }, { value: 4, name: "Edge" },\n' +
            '      { value: 3, name: "Samsung" }, { value: 3, name: "Opera" },\n' +
            '      { value: 3, name: "Other" }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 9. Pie with Variable Radius\n\n' +
            '{{Chart: Variable Radius\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Pie with Variable Radius" },\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  series: [{\n' +
            '    type: "pie", roseType: "area", radius: [20, 140],\n' +
            '    center: ["50%","50%"],\n' +
            '    itemStyle: { borderRadius: 5 },\n' +
            '    data: [\n' +
            '      { value: 26, name: "China" }, { value: 18, name: "India" },\n' +
            '      { value: 12, name: "USA" }, { value: 10, name: "Indonesia" },\n' +
            '      { value: 8, name: "Pakistan" }, { value: 5, name: "Brazil" },\n' +
            '      { value: 4, name: "Nigeria" }, { value: 3, name: "Bangladesh" }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 10. Multi-Pie (Side by Side)\n\n' +
            '{{Chart: Side by Side\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: [{ text: "2023", left: "25%", textAlign: "center" },\n' +
            '          { text: "2024", left: "75%", textAlign: "center" }],\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  series: [\n' +
            '    { type: "pie", radius: "35%", center: ["25%","55%"],\n' +
            '      data: [{ value: 45, name: "TypeScript" }, { value: 30, name: "Python" }, { value: 15, name: "Rust" }, { value: 10, name: "Go" }] },\n' +
            '    { type: "pie", radius: "35%", center: ["75%","55%"],\n' +
            '      data: [{ value: 50, name: "TypeScript" }, { value: 28, name: "Python" }, { value: 14, name: "Rust" }, { value: 8, name: "Go" }] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 11. Pie with Emphasis\n\n' +
            '{{Chart: Emphasis Pie\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  legend: { top: "5%", left: "center" },\n' +
            '  series: [{\n' +
            '    name: "Budget", type: "pie", radius: ["40%","70%"],\n' +
            '    avoidLabelOverlap: false,\n' +
            '    padAngle: 5,\n' +
            '    itemStyle: { borderRadius: 10 },\n' +
            '    label: { show: false, position: "center" },\n' +
            '    emphasis: { label: { show: true, fontSize: 28, fontWeight: "bold" }, itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" } },\n' +
            '    labelLine: { show: false },\n' +
            '    data: [\n' +
            '      { value: 35, name: "Marketing" }, { value: 25, name: "Engineering" },\n' +
            '      { value: 20, name: "Operations" }, { value: 10, name: "Sales" },\n' +
            '      { value: 10, name: "HR" }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 12. Pie Chart with Scroll Legend\n\n' +
            '{{Chart: Scroll Legend\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var names = ["React","Vue","Angular","Svelte","Next.js","Nuxt","Ember","Backbone","jQuery","Solid","Qwik","Lit","Alpine","Stimulus","Htmx","Astro","Remix","Gatsby","Preact","Stencil"];\n' +
            'var data = names.map(function(n,i) { return { value: Math.round(Math.random() * 1000 + 200), name: n }; });\n' +
            'option = {\n' +
            '  title: { text: "JS Frameworks", left: "center" },\n' +
            '  tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },\n' +
            '  legend: { type: "scroll", orient: "vertical", right: 10, top: 20, bottom: 20 },\n' +
            '  series: [{ name: "Framework", type: "pie", radius: ["20%","50%"], center: ["40%","55%"],\n' +
            '    itemStyle: { borderRadius: 5 }, data: data }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 13. Pie Chart with Pattern Fill\n\n' +
            '{{Chart: Pattern Fill\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Pattern Fill Pie" },\n' +
            '  tooltip: {},\n' +
            '  aria: { enabled: true, decal: { show: true } },\n' +
            '  series: [{\n' +
            '    type: "pie", radius: "60%",\n' +
            '    data: [\n' +
            '      { value: 120, name: "Mon" }, { value: 200, name: "Tue" },\n' +
            '      { value: 150, name: "Wed" }, { value: 80, name: "Thu" },\n' +
            '      { value: 70, name: "Fri" }, { value: 110, name: "Sat" },\n' +
            '      { value: 130, name: "Sun" }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 14. Doughnut with Center Text\n\n' +
            '{{Chart: Center Text\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  series: [{\n' +
            '    type: "pie", radius: ["50%","70%"],\n' +
            '    avoidLabelOverlap: false,\n' +
            '    label: { show: true, position: "center",\n' +
            '      formatter: function() { return "Total\\n3,147"; },\n' +
            '      fontSize: 24, fontWeight: "bold" },\n' +
            '    emphasis: { label: { show: true, fontSize: 20, formatter: "{b}\\n{c}" } },\n' +
            '    labelLine: { show: false },\n' +
            '    data: [\n' +
            '      { value: 1048, name: "Organic" }, { value: 735, name: "Paid" },\n' +
            '      { value: 580, name: "Social" }, { value: 484, name: "Referral" },\n' +
            '      { value: 300, name: "Direct" }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 15. Ring Progress Gauge\n\n' +
            '{{Chart: Ring Progress\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'var pct = 72;\n' +
            'option = {\n' +
            '  series: [{\n' +
            '    type: "pie", radius: ["60%","75%"], startAngle: 90,\n' +
            '    label: { show: true, position: "center",\n' +
            '      formatter: pct + "%", fontSize: 48, fontWeight: "bold", color: "#6366f1" },\n' +
            '    labelLine: { show: false },\n' +
            '    data: [\n' +
            '      { value: pct, itemStyle: { color: "#6366f1" } },\n' +
            '      { value: 100-pct, itemStyle: { color: "#334155" } }\n' +
            '    ],\n' +
            '    emphasis: { disabled: true }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 16. Multi-Ring Dashboard\n\n' +
            '{{Chart: Dashboard Rings\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'function makeRing(name, pct, color, radius) {\n' +
            '  return { type: "pie", radius: radius, center: ["50%","50%"], startAngle: 90,\n' +
            '    label: { show: false }, labelLine: { show: false }, emphasis: { disabled: true },\n' +
            '    data: [{ value: pct, name: name, itemStyle: { color: color } }, { value: 100-pct, itemStyle: { color: "#1e293b" } }] };\n' +
            '}\n' +
            'option = {\n' +
            '  title: { text: "Dashboard KPIs", left: "center" },\n' +
            '  tooltip: { trigger: "item", formatter: "{b}: {c}%" },\n' +
            '  legend: { bottom: 10, data: ["CPU","RAM","Disk"] },\n' +
            '  series: [\n' +
            '    makeRing("CPU", 85, "#ef4444", ["65%","75%"]),\n' +
            '    makeRing("RAM", 62, "#f59e0b", ["50%","60%"]),\n' +
            '    makeRing("Disk", 45, "#22c55e", ["35%","45%"])\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 17. Pie in Pie (Sunburst-like)\n\n' +
            '{{Chart: Pie in Pie\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  series: [\n' +
            '    { type: "pie", radius: [0, "35%"], label: { position: "inner" }, labelLine: { show: false },\n' +
            '      data: [\n' +
            '        { value: 55, name: "Asia", itemStyle: { color: "#5470c6" } },\n' +
            '        { value: 25, name: "Europe", itemStyle: { color: "#91cc75" } },\n' +
            '        { value: 20, name: "Americas", itemStyle: { color: "#fac858" } }\n' +
            '      ] },\n' +
            '    { type: "pie", radius: ["45%", "60%"],\n' +
            '      data: [\n' +
            '        { value: 20, name: "China" }, { value: 18, name: "India" },\n' +
            '        { value: 10, name: "Japan" }, { value: 7, name: "Others" },\n' +
            '        { value: 10, name: "Germany" }, { value: 8, name: "France" },\n' +
            '        { value: 7, name: "UK" },\n' +
            '        { value: 12, name: "USA" }, { value: 5, name: "Brazil" }, { value: 3, name: "Others" }\n' +
            '      ] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 18. Pie Dataset\n\n' +
            '{{Chart: Dataset Pie\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  legend: { top: "bottom" },\n' +
            '  tooltip: {},\n' +
            '  dataset: {\n' +
            '    source: [\n' +
            '      ["Product", "Sales"],\n' +
            '      ["Laptop", 580], ["Phone", 920], ["Tablet", 350],\n' +
            '      ["Watch", 250], ["Headphones", 180], ["Monitor", 120]\n' +
            '    ]\n' +
            '  },\n' +
            '  series: [{\n' +
            '    type: "pie", radius: "60%",\n' +
            '    encode: { itemName: "Product", value: "Sales" },\n' +
            '    itemStyle: { borderRadius: 5 }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 19. Pie with Padding Angle\n\n' +
            '{{Chart: Padded Pie\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Padded Segments", left: "center" },\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  series: [{\n' +
            '    type: "pie", radius: ["35%","65%"],\n' +
            '    padAngle: 5,\n' +
            '    itemStyle: { borderRadius: 8 },\n' +
            '    data: [\n' +
            '      { value: 40, name: "Q1" }, { value: 32, name: "Q2" },\n' +
            '      { value: 28, name: "Q3" }, { value: 25, name: "Q4" }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 20. Full Dashboard (Multi-Pie Layout)\n\n' +
            '{{Chart: Dashboard Layout\n' +
            '  @type: echart\n' +
            '  @height: 500\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: [{ text: "Revenue", left: "25%", top: "5%", textAlign: "center", textStyle: { fontSize: 14 } },\n' +
            '          { text: "Users", left: "75%", top: "5%", textAlign: "center", textStyle: { fontSize: 14 } },\n' +
            '          { text: "Engagement", left: "25%", top: "53%", textAlign: "center", textStyle: { fontSize: 14 } },\n' +
            '          { text: "Retention", left: "75%", top: "53%", textAlign: "center", textStyle: { fontSize: 14 } }],\n' +
            '  tooltip: { trigger: "item" },\n' +
            '  series: [\n' +
            '    { type: "pie", radius: ["18%","30%"], center: ["25%","30%"],\n' +
            '      data: [{ value: 35, name: "Subscriptions" },{ value: 25, name: "Ads" },{ value: 20, name: "Services" },{ value: 20, name: "Other" }] },\n' +
            '    { type: "pie", radius: ["18%","30%"], center: ["75%","30%"],\n' +
            '      data: [{ value: 45, name: "Organic" },{ value: 30, name: "Referral" },{ value: 15, name: "Social" },{ value: 10, name: "Paid" }] },\n' +
            '    { type: "pie", radius: ["18%","30%"], center: ["25%","78%"], roseType: "area",\n' +
            '      data: [{ value: 40, name: "Mobile" },{ value: 35, name: "Web" },{ value: 15, name: "Tablet" },{ value: 10, name: "Desktop" }] },\n' +
            '    { type: "pie", radius: ["18%","30%"], center: ["75%","78%"], roseType: "radius",\n' +
            '      data: [{ value: 55, name: "Daily" },{ value: 25, name: "Weekly" },{ value: 12, name: "Monthly" },{ value: 8, name: "Rare" }] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '> **Note:** Some ECharts pie examples (Pie Drilldown, Calendar Pie) require event handlers or async operations and cannot be used in `@code: {}` mode. The 20 examples above cover all compatible pie variations.\n'
    }
];
