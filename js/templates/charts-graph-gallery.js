// ============================================
// templates/charts-graph-gallery.js — Graph Chart Gallery
// 8 graph/network chart variations from ECharts gallery
// ============================================
window.__MDV_TEMPLATES_GRAPH_GALLERY = [
    {
        name: 'Graph Chart Gallery (8 Types)',
        category: 'charts',
        icon: 'bi-share-fill',
        description: 'Complete Graph/Network gallery — force layout, cartesian, circular, categories, dynamic & more',
        content: '# 🕸️ Graph / Network Gallery\n\n' +
            '> Graph and network visualisations from the [ECharts Gallery](https://echarts.apache.org/examples/en/index.html#chart-type-graph) — copy-paste ready.\n\n---\n\n' +

            // ─── 1. Simple Graph ───
            '## 1. Simple Graph\n\n' +
            '> Basic node-link graph with fixed positions.\n\n' +
            '{{Chart: Simple Graph\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Simple Graph", left: "center" },\n' +
            '  tooltip: {},\n' +
            '  series: [{\n' +
            '    type: "graph", layout: "none",\n' +
            '    symbolSize: 50,\n' +
            '    roam: true,\n' +
            '    label: { show: true },\n' +
            '    edgeSymbol: ["circle", "arrow"],\n' +
            '    edgeSymbolSize: [4, 10],\n' +
            '    data: [\n' +
            '      { name: "Node 1", x: 300, y: 300 },\n' +
            '      { name: "Node 2", x: 800, y: 300 },\n' +
            '      { name: "Node 3", x: 550, y: 100 },\n' +
            '      { name: "Node 4", x: 550, y: 500 }\n' +
            '    ],\n' +
            '    links: [\n' +
            '      { source: "Node 1", target: "Node 2" },\n' +
            '      { source: "Node 1", target: "Node 3" },\n' +
            '      { source: "Node 1", target: "Node 4" },\n' +
            '      { source: "Node 2", target: "Node 3" },\n' +
            '      { source: "Node 3", target: "Node 4" }\n' +
            '    ],\n' +
            '    lineStyle: { opacity: 0.9, width: 2, curveness: 0 }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 2. Force Layout ───
            '## 2. Force Layout\n\n' +
            '> Physics-based force-directed layout with draggable nodes.\n\n' +
            '{{Chart: Force Layout\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var categories = [\n' +
            '  { name: "Core" }, { name: "Frontend" }, { name: "Backend" }, { name: "Data" }\n' +
            '];\n' +
            'var nodes = [\n' +
            '  { name: "App", symbolSize: 55, category: 0 },\n' +
            '  { name: "React", symbolSize: 35, category: 1 },\n' +
            '  { name: "Vue", symbolSize: 30, category: 1 },\n' +
            '  { name: "CSS", symbolSize: 25, category: 1 },\n' +
            '  { name: "Node.js", symbolSize: 40, category: 2 },\n' +
            '  { name: "Express", symbolSize: 30, category: 2 },\n' +
            '  { name: "FastAPI", symbolSize: 28, category: 2 },\n' +
            '  { name: "PostgreSQL", symbolSize: 35, category: 3 },\n' +
            '  { name: "Redis", symbolSize: 28, category: 3 },\n' +
            '  { name: "MongoDB", symbolSize: 30, category: 3 },\n' +
            '  { name: "Kafka", symbolSize: 25, category: 3 },\n' +
            '  { name: "Auth", symbolSize: 22, category: 2 },\n' +
            '  { name: "GraphQL", symbolSize: 26, category: 2 }\n' +
            '];\n' +
            'var links = [\n' +
            '  { source: "App", target: "React" }, { source: "App", target: "Vue" },\n' +
            '  { source: "App", target: "Node.js" }, { source: "App", target: "PostgreSQL" },\n' +
            '  { source: "React", target: "CSS" }, { source: "Vue", target: "CSS" },\n' +
            '  { source: "Node.js", target: "Express" }, { source: "Node.js", target: "FastAPI" },\n' +
            '  { source: "Node.js", target: "Auth" }, { source: "Node.js", target: "GraphQL" },\n' +
            '  { source: "Express", target: "PostgreSQL" }, { source: "FastAPI", target: "MongoDB" },\n' +
            '  { source: "GraphQL", target: "PostgreSQL" }, { source: "App", target: "Redis" },\n' +
            '  { source: "App", target: "Kafka" }, { source: "Kafka", target: "MongoDB" }\n' +
            '];\n' +
            'option = {\n' +
            '  title: { text: "Tech Stack Dependencies", left: "center" },\n' +
            '  tooltip: {},\n' +
            '  legend: [{ data: categories.map(function(c){ return c.name; }), bottom: "5%" }],\n' +
            '  series: [{\n' +
            '    type: "graph", layout: "force",\n' +
            '    data: nodes, links: links, categories: categories,\n' +
            '    roam: true, draggable: true,\n' +
            '    label: { show: true, position: "right" },\n' +
            '    force: { repulsion: 200, edgeLength: [80, 160] },\n' +
            '    emphasis: { focus: "adjacency", lineStyle: { width: 5 } }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 3. Graph on Cartesian ───
            '## 3. Graph on Cartesian\n\n' +
            '> Graph nodes placed on an X/Y coordinate system.\n\n' +
            '{{Chart: Graph Cartesian\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'var axisData = ["Mon","Tue","Wed","Thu","Fri"];\n' +
            'option = {\n' +
            '  title: { text: "Workflow Graph", left: "center" },\n' +
            '  xAxis: { type: "category", data: axisData, boundaryGap: false },\n' +
            '  yAxis: { type: "value", min: 0, max: 100 },\n' +
            '  series: [{\n' +
            '    type: "graph", layout: "none",\n' +
            '    coordinateSystem: "cartesian2d",\n' +
            '    symbolSize: 30,\n' +
            '    label: { show: true },\n' +
            '    edgeSymbol: ["circle", "arrow"],\n' +
            '    edgeSymbolSize: [4, 8],\n' +
            '    data: [\n' +
            '      { name: "Start", value: ["Mon", 20] },\n' +
            '      { name: "Plan", value: ["Tue", 50] },\n' +
            '      { name: "Build", value: ["Wed", 80] },\n' +
            '      { name: "Test", value: ["Thu", 60] },\n' +
            '      { name: "Ship", value: ["Fri", 90] }\n' +
            '    ],\n' +
            '    links: [\n' +
            '      { source: "Start", target: "Plan" },\n' +
            '      { source: "Plan", target: "Build" },\n' +
            '      { source: "Build", target: "Test" },\n' +
            '      { source: "Test", target: "Ship" },\n' +
            '      { source: "Test", target: "Build" }\n' +
            '    ],\n' +
            '    lineStyle: { curveness: 0.1 }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 4. Circular Layout ───
            '## 4. Circular Layout\n\n' +
            '> Nodes arranged in a circle with bundled edges.\n\n' +
            '{{Chart: Circular Graph\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var depts = ["HR","Finance","Engineering","Marketing","Sales","Legal","Product","Design"];\n' +
            'var nodes = depts.map(function(d, i) {\n' +
            '  return { name: d, symbolSize: 30 + Math.round(Math.random() * 20) };\n' +
            '});\n' +
            'var links = [];\n' +
            'for (var i = 0; i < depts.length; i++) {\n' +
            '  for (var j = i + 1; j < depts.length; j++) {\n' +
            '    if (Math.random() > 0.4) links.push({ source: depts[i], target: depts[j] });\n' +
            '  }\n' +
            '}\n' +
            'option = {\n' +
            '  title: { text: "Department Communication", left: "center" },\n' +
            '  tooltip: {},\n' +
            '  series: [{\n' +
            '    type: "graph", layout: "circular",\n' +
            '    circular: { rotateLabel: true },\n' +
            '    data: nodes, links: links,\n' +
            '    roam: true,\n' +
            '    label: { show: true, position: "right" },\n' +
            '    lineStyle: { curveness: 0.3, opacity: 0.5, color: "source" },\n' +
            '    emphasis: { focus: "adjacency", lineStyle: { width: 4 } }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 5. Hide Overlapped Label ───
            '## 5. Hide Overlapped Labels\n\n' +
            '> Dense graph with `labelLayout` to automatically hide overlapping labels.\n\n' +
            '{{Chart: Hide Overlapped Labels\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var names = ["API","Auth","Cache","DB","DNS","Email","Frontend","Gateway","Logger","Monitor","Queue","Router","Search","Store","Worker"];\n' +
            'var nodes = names.map(function(n, i) {\n' +
            '  return { name: n, symbolSize: 15 + Math.floor(Math.random() * 25), category: i % 3 };\n' +
            '});\n' +
            'var links = [];\n' +
            'for (var i = 0; i < names.length; i++) {\n' +
            '  var count = 1 + Math.floor(Math.random() * 3);\n' +
            '  for (var k = 0; k < count; k++) {\n' +
            '    var j = Math.floor(Math.random() * names.length);\n' +
            '    if (j !== i) links.push({ source: names[i], target: names[j] });\n' +
            '  }\n' +
            '}\n' +
            'option = {\n' +
            '  title: { text: "Microservices Network", left: "center" },\n' +
            '  tooltip: {},\n' +
            '  legend: [{ data: ["Group A","Group B","Group C"], bottom: "5%" }],\n' +
            '  series: [{\n' +
            '    type: "graph", layout: "force",\n' +
            '    data: nodes, links: links,\n' +
            '    categories: [{ name: "Group A" }, { name: "Group B" }, { name: "Group C" }],\n' +
            '    roam: true, draggable: true,\n' +
            '    label: { show: true, position: "right" },\n' +
            '    labelLayout: { hideOverlap: true },\n' +
            '    force: { repulsion: 120, edgeLength: [60, 120] },\n' +
            '    lineStyle: { opacity: 0.4, curveness: 0.1, color: "source" },\n' +
            '    emphasis: { focus: "adjacency" }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 6. Graph Dynamic ───
            '## 6. Graph Dynamic (Animated)\n\n' +
            '> New nodes are added dynamically every 2 seconds using `setInterval`.\n\n' +
            '{{Chart: Dynamic Graph\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var nodes = [\n' +
            '  { name: "Root", symbolSize: 40, x: 400, y: 300, category: 0 }\n' +
            '];\n' +
            'var links = [];\n' +
            'var idx = 1;\n' +
            'var categories = [{ name: "Core" }, { name: "Module" }];\n' +
            'function getOption() {\n' +
            '  return {\n' +
            '    title: { text: "Growing Network (" + nodes.length + " nodes)", left: "center" },\n' +
            '    tooltip: {},\n' +
            '    legend: [{ data: categories.map(function(c) { return c.name; }), bottom: "5%" }],\n' +
            '    series: [{\n' +
            '      type: "graph", layout: "force",\n' +
            '      data: nodes, links: links, categories: categories,\n' +
            '      roam: true, draggable: true,\n' +
            '      label: { show: true, position: "right", fontSize: 10 },\n' +
            '      force: { repulsion: 120, edgeLength: [50, 100] },\n' +
            '      emphasis: { focus: "adjacency" }\n' +
            '    }],\n' +
            '    animationDurationUpdate: 500\n' +
            '  };\n' +
            '}\n' +
            'myChart.setOption(getOption());\n' +
            'setInterval(function() {\n' +
            '  if (idx > 20) return;\n' +
            '  var parent = nodes[Math.floor(Math.random() * nodes.length)].name;\n' +
            '  var name = "N" + idx;\n' +
            '  nodes.push({ name: name, symbolSize: 15 + Math.floor(Math.random() * 15), category: 1 });\n' +
            '  links.push({ source: parent, target: name });\n' +
            '  idx++;\n' +
            '  myChart.setOption(getOption());\n' +
            '}, 2000);\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 7. Calendar Graph ───
            '## 7. Calendar Graph\n\n' +
            '> Nodes sized by value placed on a calendar heatmap — combining `calendar` coordinate system with `graph`.\n\n' +
            '{{Chart: Calendar Graph\n' +
            '  @type: echart\n' +
            '  @height: 250\n' +
            '  @code: {\n' +
            'var calData = [];\n' +
            'var graphData = [];\n' +
            'var links = [];\n' +
            'var start = new Date("2024-01-01");\n' +
            'for (var i = 0; i < 365; i++) {\n' +
            '  var d = new Date(start.getTime() + i * 86400000);\n' +
            '  var date = d.toISOString().split("T")[0];\n' +
            '  var val = Math.floor(Math.random() * 10);\n' +
            '  calData.push([date, val]);\n' +
            '  if (val > 0) graphData.push({ name: date, value: [date, val], symbolSize: val * 2 });\n' +
            '}\n' +
            'for (var i = 1; i < graphData.length; i++) {\n' +
            '  if (Math.random() > 0.95) links.push({ source: graphData[i-1].name, target: graphData[i].name });\n' +
            '}\n' +
            'option = {\n' +
            '  tooltip: { formatter: function(p) { return p.name + ": " + (p.value ? p.value[1] : 0); } },\n' +
            '  calendar: {\n' +
            '    top: 30, left: 50, right: 30,\n' +
            '    cellSize: ["auto", 13], range: "2024",\n' +
            '    itemStyle: { borderWidth: 0.5, borderColor: "#334155" },\n' +
            '    yearLabel: { show: false },\n' +
            '    dayLabel: { color: "#94a3b8", fontSize: 10 },\n' +
            '    monthLabel: { color: "#94a3b8" }\n' +
            '  },\n' +
            '  visualMap: { min: 0, max: 10, show: false,\n' +
            '    inRange: { color: ["#1e293b", "#6366f1", "#a855f7", "#22c55e"] } },\n' +
            '  series: [\n' +
            '    { type: "heatmap", coordinateSystem: "calendar", data: calData },\n' +
            '    { type: "graph", layout: "none", coordinateSystem: "calendar",\n' +
            '      data: graphData, links: links,\n' +
            '      lineStyle: { color: "#f59e0b", opacity: 0.5, width: 1 },\n' +
            '      z: 10 }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 8. Force Layout with Categories ───
            '## 8. Categorized Force Graph\n\n' +
            '> Large categorized graph with legend filtering and styled groups.\n\n' +
            '{{Chart: Categorized Graph\n' +
            '  @type: echart\n' +
            '  @height: 500\n' +
            '  @code: {\n' +
            'var cats = [\n' +
            '  { name: "Team Lead", itemStyle: { color: "#ef4444" } },\n' +
            '  { name: "Senior Dev", itemStyle: { color: "#6366f1" } },\n' +
            '  { name: "Junior Dev", itemStyle: { color: "#22c55e" } },\n' +
            '  { name: "Designer", itemStyle: { color: "#f59e0b" } },\n' +
            '  { name: "QA", itemStyle: { color: "#ec4899" } }\n' +
            '];\n' +
            'var people = [\n' +
            '  { name: "Alice", symbolSize: 50, category: 0 },\n' +
            '  { name: "Bob", symbolSize: 38, category: 1 },\n' +
            '  { name: "Carol", symbolSize: 36, category: 1 },\n' +
            '  { name: "Dave", symbolSize: 28, category: 2 },\n' +
            '  { name: "Eve", symbolSize: 28, category: 2 },\n' +
            '  { name: "Frank", symbolSize: 26, category: 2 },\n' +
            '  { name: "Grace", symbolSize: 30, category: 3 },\n' +
            '  { name: "Heidi", symbolSize: 28, category: 3 },\n' +
            '  { name: "Ivan", symbolSize: 26, category: 4 },\n' +
            '  { name: "Judy", symbolSize: 24, category: 4 },\n' +
            '  { name: "Kai", symbolSize: 30, category: 2 },\n' +
            '  { name: "Liam", symbolSize: 22, category: 4 },\n' +
            '  { name: "Mia", symbolSize: 34, category: 1 }\n' +
            '];\n' +
            'var edges = [\n' +
            '  { source: "Alice", target: "Bob" }, { source: "Alice", target: "Carol" },\n' +
            '  { source: "Alice", target: "Grace" }, { source: "Alice", target: "Ivan" },\n' +
            '  { source: "Bob", target: "Dave" }, { source: "Bob", target: "Eve" },\n' +
            '  { source: "Carol", target: "Frank" }, { source: "Carol", target: "Kai" },\n' +
            '  { source: "Grace", target: "Heidi" }, { source: "Ivan", target: "Judy" },\n' +
            '  { source: "Ivan", target: "Liam" }, { source: "Mia", target: "Dave" },\n' +
            '  { source: "Mia", target: "Kai" }, { source: "Bob", target: "Mia" },\n' +
            '  { source: "Dave", target: "Ivan" }, { source: "Frank", target: "Judy" },\n' +
            '  { source: "Alice", target: "Mia" }\n' +
            '];\n' +
            'option = {\n' +
            '  title: { text: "Engineering Team Graph", left: "center" },\n' +
            '  tooltip: {},\n' +
            '  legend: [{ data: cats.map(function(c) { return c.name; }), bottom: "5%" }],\n' +
            '  series: [{\n' +
            '    type: "graph", layout: "force",\n' +
            '    data: people, links: edges, categories: cats,\n' +
            '    roam: true, draggable: true,\n' +
            '    label: { show: true, position: "right" },\n' +
            '    force: { repulsion: 180, edgeLength: [60, 140], gravity: 0.1 },\n' +
            '    lineStyle: { opacity: 0.6, curveness: 0.1, color: "source" },\n' +
            '    emphasis: { focus: "adjacency", lineStyle: { width: 4 } }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '> **Tip:** Graph charts support `roam` (zoom/pan), `draggable` nodes, and `emphasis.focus: "adjacency"` to highlight connected nodes on hover.\n'
    }
];
