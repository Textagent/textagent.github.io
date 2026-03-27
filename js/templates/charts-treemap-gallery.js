// ============================================
// templates/charts-treemap-gallery.js — Treemap Chart Gallery
// 7 treemap chart variations from ECharts gallery
// ============================================
window.__MDV_TEMPLATES_TREEMAP_GALLERY = [
    {
        name: 'Treemap Chart Gallery (7 Types)',
        category: 'charts',
        icon: 'bi-grid-3x3-gap-fill',
        description: 'Complete Treemap gallery — 7 variations (basic, disk usage, budget, gradient, parent labels, option query & more)',
        content: '# 🟩 Treemap Chart Gallery\n\n' +
            '> Every treemap chart variation from the [ECharts Gallery](https://echarts.apache.org/examples/en/index.html#chart-type-treemap) — copy-paste ready.\n\n---\n\n' +

            '## 1. Basic Treemap\n\n' +
            '{{Chart: Basic Treemap\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  series: [{\n' +
            '    type: "treemap",\n' +
            '    data: [\n' +
            '      { name: "nodeA", value: 10, children: [\n' +
            '        { name: "nodeAa", value: 4 },\n' +
            '        { name: "nodeAb", value: 6 }\n' +
            '      ]},\n' +
            '      { name: "nodeB", value: 20, children: [\n' +
            '        { name: "nodeBa", value: 20, children: [\n' +
            '          { name: "nodeBa1", value: 20 }\n' +
            '        ]}\n' +
            '      ]}\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 2. Disk Usage\n\n' +
            '{{Chart: Disk Usage\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Disk Usage (GB)", left: "center" },\n' +
            '  tooltip: { formatter: function(info) { return info.name + ": " + info.value + " GB"; } },\n' +
            '  series: [{\n' +
            '    type: "treemap", roam: false,\n' +
            '    label: { show: true, formatter: "{b}\\n{c} GB" },\n' +
            '    upperLabel: { show: true, height: 30 },\n' +
            '    itemStyle: { borderColor: "#fff", borderWidth: 2, gapWidth: 2 },\n' +
            '    levels: [\n' +
            '      { itemStyle: { borderColor: "#777", borderWidth: 0, gapWidth: 1 } },\n' +
            '      { itemStyle: { borderColor: "#555", borderWidth: 5, gapWidth: 1 }, emphasis: { itemStyle: { borderColor: "#ddd" } } },\n' +
            '      { colorSaturation: [0.35, 0.5], itemStyle: { borderWidth: 5, gapWidth: 1, borderColorSaturation: 0.6 } }\n' +
            '    ],\n' +
            '    data: [\n' +
            '      { name: "System", value: 85, children: [\n' +
            '        { name: "macOS", value: 35 }, { name: "Library", value: 28 },\n' +
            '        { name: "Logs", value: 12 }, { name: "Cache", value: 10 }\n' +
            '      ]},\n' +
            '      { name: "Applications", value: 120, children: [\n' +
            '        { name: "Xcode", value: 35 }, { name: "Docker", value: 25 },\n' +
            '        { name: "Chrome", value: 15 }, { name: "VS Code", value: 12 },\n' +
            '        { name: "Slack", value: 8 }, { name: "Figma", value: 7 },\n' +
            '        { name: "Others", value: 18 }\n' +
            '      ]},\n' +
            '      { name: "User Data", value: 200, children: [\n' +
            '        { name: "Documents", value: 45 }, { name: "Photos", value: 55 },\n' +
            '        { name: "Music", value: 30 }, { name: "Videos", value: 40 },\n' +
            '        { name: "Downloads", value: 30 }\n' +
            '      ]},\n' +
            '      { name: "Developer", value: 95, children: [\n' +
            '        { name: "node_modules", value: 40 }, { name: "Git repos", value: 25 },\n' +
            '        { name: "Docker images", value: 20 }, { name: "Conda envs", value: 10 }\n' +
            '      ]}\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 3. How $3.7 Trillion is Spent\n\n' +
            '{{Chart: Budget Breakdown\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "How $3.7 Trillion is Spent", left: "center", textStyle: { fontSize: 16 } },\n' +
            '  tooltip: { formatter: function(info) { return info.name + ": $" + info.value + "B"; } },\n' +
            '  series: [{\n' +
            '    type: "treemap", roam: false, width: "95%", height: "85%",\n' +
            '    label: { show: true, formatter: "{b}\\n${c}B", fontSize: 11 },\n' +
            '    upperLabel: { show: true, height: 28, fontSize: 13, fontWeight: "bold" },\n' +
            '    itemStyle: { borderColor: "#1e293b", gapWidth: 2, borderWidth: 2 },\n' +
            '    levels: [\n' +
            '      { itemStyle: { borderWidth: 3, borderColor: "#0f172a", gapWidth: 3 } },\n' +
            '      { colorSaturation: [0.3, 0.6], itemStyle: { borderColorSaturation: 0.7, gapWidth: 2, borderWidth: 2 } },\n' +
            '      { colorSaturation: [0.3, 0.5], itemStyle: { borderColorSaturation: 0.6, gapWidth: 1 } }\n' +
            '    ],\n' +
            '    data: [\n' +
            '      { name: "Healthcare", value: 1200, itemStyle: { color: "#ef4444" }, children: [\n' +
            '        { name: "Medicare", value: 500 }, { name: "Medicaid", value: 400 },\n' +
            '        { name: "VA Health", value: 150 }, { name: "Other", value: 150 }\n' +
            '      ]},\n' +
            '      { name: "Social Security", value: 1000, itemStyle: { color: "#3b82f6" }, children: [\n' +
            '        { name: "Retirement", value: 700 }, { name: "Disability", value: 200 },\n' +
            '        { name: "Survivors", value: 100 }\n' +
            '      ]},\n' +
            '      { name: "Defense", value: 750, itemStyle: { color: "#64748b" }, children: [\n' +
            '        { name: "Army", value: 200 }, { name: "Navy", value: 180 },\n' +
            '        { name: "Air Force", value: 170 }, { name: "Other", value: 200 }\n' +
            '      ]},\n' +
            '      { name: "Interest", value: 350, itemStyle: { color: "#f59e0b" } },\n' +
            '      { name: "Education", value: 200, itemStyle: { color: "#22c55e" }, children: [\n' +
            '        { name: "K-12", value: 120 }, { name: "Higher Ed", value: 80 }\n' +
            '      ]},\n' +
            '      { name: "Other", value: 200, itemStyle: { color: "#8b5cf6" } }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 4. Show Parent Labels\n\n' +
            '{{Chart: Parent Labels\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Show Parent Labels", left: "center" },\n' +
            '  tooltip: {},\n' +
            '  series: [{\n' +
            '    type: "treemap",\n' +
            '    upperLabel: { show: true, height: 30, color: "#fff", fontSize: 14, fontWeight: "bold",\n' +
            '      backgroundColor: "transparent" },\n' +
            '    label: { show: true, formatter: "{b}: {c}" },\n' +
            '    itemStyle: { borderColor: "#0f172a", borderWidth: 2 },\n' +
            '    levels: [\n' +
            '      { itemStyle: { borderWidth: 3 } },\n' +
            '      { itemStyle: { borderWidth: 2 }, upperLabel: { show: true } },\n' +
            '      { itemStyle: { borderWidth: 1 } }\n' +
            '    ],\n' +
            '    data: [\n' +
            '      { name: "Frontend", children: [\n' +
            '        { name: "React", value: 40 }, { name: "Vue", value: 25 },\n' +
            '        { name: "Angular", value: 15 }, { name: "Svelte", value: 10 },\n' +
            '        { name: "Other", value: 10 }\n' +
            '      ]},\n' +
            '      { name: "Backend", children: [\n' +
            '        { name: "Node.js", value: 30 }, { name: "Python", value: 28 },\n' +
            '        { name: "Java", value: 20 }, { name: "Go", value: 12 },\n' +
            '        { name: "Rust", value: 10 }\n' +
            '      ]},\n' +
            '      { name: "Mobile", children: [\n' +
            '        { name: "React Native", value: 22 }, { name: "Flutter", value: 18 },\n' +
            '        { name: "Swift", value: 15 }, { name: "Kotlin", value: 12 }\n' +
            '      ]}\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 5. ECharts Option Query\n\n' +
            '{{Chart: Option Query\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "ECharts Option Structure", left: "center" },\n' +
            '  tooltip: { formatter: function(p) { return p.name + " (" + p.value + " sub-options)"; } },\n' +
            '  series: [{\n' +
            '    type: "treemap", roam: "move",\n' +
            '    label: { show: true, formatter: "{b}", fontSize: 11 },\n' +
            '    upperLabel: { show: true, height: 28, fontWeight: "bold" },\n' +
            '    itemStyle: { borderColor: "#334155", borderWidth: 2, gapWidth: 1 },\n' +
            '    breadcrumb: { show: true },\n' +
            '    data: [\n' +
            '      { name: "series", value: 40, children: [\n' +
            '        { name: "line", value: 12 }, { name: "bar", value: 10 },\n' +
            '        { name: "pie", value: 8 }, { name: "scatter", value: 5 },\n' +
            '        { name: "other", value: 5 }\n' +
            '      ]},\n' +
            '      { name: "xAxis/yAxis", value: 20, children: [\n' +
            '        { name: "type", value: 4 }, { name: "data", value: 6 },\n' +
            '        { name: "axisLabel", value: 5 }, { name: "splitLine", value: 5 }\n' +
            '      ]},\n' +
            '      { name: "tooltip", value: 12, children: [\n' +
            '        { name: "trigger", value: 4 }, { name: "formatter", value: 5 },\n' +
            '        { name: "axisPointer", value: 3 }\n' +
            '      ]},\n' +
            '      { name: "legend", value: 8 },\n' +
            '      { name: "grid", value: 6 },\n' +
            '      { name: "dataZoom", value: 5 },\n' +
            '      { name: "visualMap", value: 5 },\n' +
            '      { name: "toolbox", value: 4 }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 6. Gradient Mapping\n\n' +
            '{{Chart: Gradient Treemap\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  { name: "US", value: 25462, children: [\n' +
            '    { name: "California", value: 3598 }, { name: "Texas", value: 1987 },\n' +
            '    { name: "New York", value: 1857 }, { name: "Florida", value: 1227 },\n' +
            '    { name: "Illinois", value: 879 }, { name: "Pennsylvania", value: 803 },\n' +
            '    { name: "Ohio", value: 702 }, { name: "Other", value: 5409 }\n' +
            '  ]},\n' +
            '  { name: "China", value: 17963, children: [\n' +
            '    { name: "Guangdong", value: 1960 }, { name: "Jiangsu", value: 1810 },\n' +
            '    { name: "Shandong", value: 1520 }, { name: "Zhejiang", value: 1180 },\n' +
            '    { name: "Other", value: 11493 }\n' +
            '  ]},\n' +
            '  { name: "Japan", value: 4231, children: [\n' +
            '    { name: "Tokyo", value: 1100 }, { name: "Osaka", value: 400 },\n' +
            '    { name: "Other", value: 2731 }\n' +
            '  ]},\n' +
            '  { name: "Germany", value: 4072, children: [\n' +
            '    { name: "Bavaria", value: 680 }, { name: "NRW", value: 730 },\n' +
            '    { name: "Other", value: 2662 }\n' +
            '  ]},\n' +
            '  { name: "UK", value: 3070 },\n' +
            '  { name: "India", value: 3385 },\n' +
            '  { name: "France", value: 2778 }\n' +
            '];\n' +
            'option = {\n' +
            '  title: { text: "GDP by Country ($B)", left: "center" },\n' +
            '  tooltip: { formatter: function(p) { return p.name + ": $" + p.value + "B"; } },\n' +
            '  visualMap: { type: "continuous", min: 500, max: 25000,\n' +
            '    inRange: { color: ["#1e3a5f","#2563eb","#60a5fa","#93c5fd","#dbeafe"] },\n' +
            '    orient: "horizontal", left: "center", bottom: 10, text: ["High","Low"] },\n' +
            '  series: [{\n' +
            '    type: "treemap",\n' +
            '    label: { show: true, formatter: "{b}\\n${c}B", fontSize: 11 },\n' +
            '    upperLabel: { show: true, height: 28, fontWeight: "bold" },\n' +
            '    itemStyle: { borderColor: "#0f172a", borderWidth: 2, gapWidth: 2 },\n' +
            '    levels: [\n' +
            '      { itemStyle: { borderWidth: 3 } },\n' +
            '      { colorSaturation: [0.2, 0.6], itemStyle: { borderWidth: 2, borderColorSaturation: 0.7 } }\n' +
            '    ],\n' +
            '    data: data\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 7. Treemap-Sunburst Transition\n\n' +
            '{{Chart: Treemap View\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  { name: "Engineering", children: [\n' +
            '    { name: "Frontend", children: [\n' +
            '      { name: "React", value: 35 }, { name: "Vue", value: 20 },\n' +
            '      { name: "Angular", value: 12 }, { name: "Svelte", value: 8 }\n' +
            '    ]},\n' +
            '    { name: "Backend", children: [\n' +
            '      { name: "Python", value: 30 }, { name: "Node.js", value: 25 },\n' +
            '      { name: "Go", value: 15 }, { name: "Rust", value: 10 }\n' +
            '    ]},\n' +
            '    { name: "DevOps", children: [\n' +
            '      { name: "Docker", value: 18 }, { name: "K8s", value: 15 },\n' +
            '      { name: "Terraform", value: 10 }\n' +
            '    ]}\n' +
            '  ]},\n' +
            '  { name: "Design", children: [\n' +
            '    { name: "UI", children: [\n' +
            '      { name: "Figma", value: 25 }, { name: "Sketch", value: 10 }\n' +
            '    ]},\n' +
            '    { name: "UX", children: [\n' +
            '      { name: "Research", value: 15 }, { name: "Prototyping", value: 12 }\n' +
            '    ]}\n' +
            '  ]},\n' +
            '  { name: "Data", children: [\n' +
            '    { name: "Analytics", children: [\n' +
            '      { name: "Tableau", value: 12 }, { name: "Looker", value: 8 }\n' +
            '    ]},\n' +
            '    { name: "ML", children: [\n' +
            '      { name: "PyTorch", value: 20 }, { name: "TensorFlow", value: 15 },\n' +
            '      { name: "scikit-learn", value: 10 }\n' +
            '    ]}\n' +
            '  ]}\n' +
            '];\n' +
            'option = {\n' +
            '  title: { text: "Tech Skills Map (Treemap)", left: "center" },\n' +
            '  tooltip: { formatter: "{b}: {c} engineers" },\n' +
            '  series: [{\n' +
            '    type: "treemap",\n' +
            '    label: { show: true, formatter: "{b}" },\n' +
            '    upperLabel: { show: true, height: 30, color: "#fff", fontWeight: "bold" },\n' +
            '    itemStyle: { borderColor: "#1e293b", borderWidth: 2, gapWidth: 2 },\n' +
            '    breadcrumb: { show: true },\n' +
            '    roam: false,\n' +
            '    levels: [\n' +
            '      { itemStyle: { borderWidth: 4, borderColor: "#0f172a" } },\n' +
            '      { colorSaturation: [0.3, 0.6], itemStyle: { borderWidth: 3, borderColorSaturation: 0.7 } },\n' +
            '      { colorSaturation: [0.3, 0.5], itemStyle: { borderWidth: 2, gapWidth: 1 } }\n' +
            '    ],\n' +
            '    data: data\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '> **Tip:** Treemaps are ideal for visualizing **proportional hierarchical data** like file sizes, budgets, or organizational breakdowns. Use `upperLabel` to show parent category names.\n'
    }
];
