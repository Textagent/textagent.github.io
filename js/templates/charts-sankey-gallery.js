// ============================================
// templates/charts-sankey-gallery.js — Sankey Chart Gallery
// 7 sankey chart variations from ECharts gallery
// ============================================
window.__MDV_TEMPLATES_SANKEY_GALLERY = [
    {
        name: 'Sankey Chart Gallery (7 Types)',
        category: 'charts',
        icon: 'bi-diagram-3-fill',
        description: 'Complete Sankey chart gallery — 7 variations (basic, vertical, styled nodes, levels, gradient, align left/right)',
        content: '# 🔀 Sankey Chart Gallery\n\n' +
            '> Every Sankey chart variation from the [ECharts Gallery](https://echarts.apache.org/examples/en/index.html#chart-type-sankey) — copy-paste ready.\n\n---\n\n' +

            // ─── 1. Basic Sankey ───
            '## 1. Basic Sankey\n\n' +
            '{{Chart: Basic Sankey\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  series: [{\n' +
            '    type: "sankey", layout: "none",\n' +
            '    emphasis: { focus: "adjacency" },\n' +
            '    data: [\n' +
            '      { name: "Category A" }, { name: "Category B" }, { name: "Category C" },\n' +
            '      { name: "Category D" }, { name: "Category E" }, { name: "Category F" },\n' +
            '      { name: "Category G" }, { name: "Category H" }\n' +
            '    ],\n' +
            '    links: [\n' +
            '      { source: "Category A", target: "Category E", value: 5 },\n' +
            '      { source: "Category A", target: "Category F", value: 3 },\n' +
            '      { source: "Category B", target: "Category E", value: 8 },\n' +
            '      { source: "Category B", target: "Category G", value: 3 },\n' +
            '      { source: "Category C", target: "Category F", value: 5 },\n' +
            '      { source: "Category C", target: "Category H", value: 2 },\n' +
            '      { source: "Category D", target: "Category G", value: 6 },\n' +
            '      { source: "Category D", target: "Category H", value: 4 }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 2. Sankey Orient Vertical ───
            '## 2. Sankey Orient Vertical\n\n' +
            '> Vertical layout with flow going top to bottom.\n\n' +
            '{{Chart: Sankey Vertical\n' +
            '  @type: echart\n' +
            '  @height: 500\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  series: [{\n' +
            '    type: "sankey", layout: "none",\n' +
            '    orient: "vertical",\n' +
            '    emphasis: { focus: "adjacency" },\n' +
            '    nodeAlign: "justify",\n' +
            '    label: { position: "top" },\n' +
            '    data: [\n' +
            '      { name: "Revenue" }, { name: "Costs" },\n' +
            '      { name: "Product Sales" }, { name: "Services" }, { name: "Licensing" },\n' +
            '      { name: "Fixed Costs" }, { name: "Variable Costs" }, { name: "R&D" }\n' +
            '    ],\n' +
            '    links: [\n' +
            '      { source: "Revenue", target: "Product Sales", value: 40 },\n' +
            '      { source: "Revenue", target: "Services", value: 35 },\n' +
            '      { source: "Revenue", target: "Licensing", value: 25 },\n' +
            '      { source: "Costs", target: "Fixed Costs", value: 30 },\n' +
            '      { source: "Costs", target: "Variable Costs", value: 25 },\n' +
            '      { source: "Costs", target: "R&D", value: 20 }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 3. Specify ItemStyle for Each Node ───
            '## 3. Specify ItemStyle for Each Node\n\n' +
            '> Custom colors and border for individual nodes.\n\n' +
            '{{Chart: Styled Sankey Nodes\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  series: [{\n' +
            '    type: "sankey", layout: "none",\n' +
            '    emphasis: { focus: "adjacency" },\n' +
            '    data: [\n' +
            '      { name: "Solar", itemStyle: { color: "#f59e0b", borderColor: "#d97706" } },\n' +
            '      { name: "Wind", itemStyle: { color: "#06b6d4", borderColor: "#0891b2" } },\n' +
            '      { name: "Hydro", itemStyle: { color: "#3b82f6", borderColor: "#2563eb" } },\n' +
            '      { name: "Grid Storage", itemStyle: { color: "#8b5cf6", borderColor: "#7c3aed" } },\n' +
            '      { name: "Residential", itemStyle: { color: "#22c55e", borderColor: "#16a34a" } },\n' +
            '      { name: "Commercial", itemStyle: { color: "#ef4444", borderColor: "#dc2626" } },\n' +
            '      { name: "Industrial", itemStyle: { color: "#ec4899", borderColor: "#db2777" } }\n' +
            '    ],\n' +
            '    links: [\n' +
            '      { source: "Solar", target: "Grid Storage", value: 30 },\n' +
            '      { source: "Solar", target: "Residential", value: 20 },\n' +
            '      { source: "Wind", target: "Grid Storage", value: 25 },\n' +
            '      { source: "Wind", target: "Commercial", value: 15 },\n' +
            '      { source: "Hydro", target: "Industrial", value: 35 },\n' +
            '      { source: "Hydro", target: "Grid Storage", value: 10 },\n' +
            '      { source: "Grid Storage", target: "Residential", value: 25 },\n' +
            '      { source: "Grid Storage", target: "Commercial", value: 20 },\n' +
            '      { source: "Grid Storage", target: "Industrial", value: 20 }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 4. Sankey with Levels Setting ───
            '## 4. Sankey with Levels Setting\n\n' +
            '> Different styles per depth level — color, opacity, and label alignment.\n\n' +
            '{{Chart: Sankey Levels\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  series: [{\n' +
            '    type: "sankey", layout: "none",\n' +
            '    emphasis: { focus: "adjacency" },\n' +
            '    levels: [\n' +
            '      { depth: 0, itemStyle: { color: "#6366f1" }, lineStyle: { color: "source", opacity: 0.6 } },\n' +
            '      { depth: 1, itemStyle: { color: "#a855f7" }, lineStyle: { color: "source", opacity: 0.4 } },\n' +
            '      { depth: 2, itemStyle: { color: "#ec4899" }, lineStyle: { color: "source", opacity: 0.3 } }\n' +
            '    ],\n' +
            '    data: [\n' +
            '      { name: "Traffic" }, { name: "Organic" }, { name: "Paid" }, { name: "Social" },\n' +
            '      { name: "Landing Page" }, { name: "Blog" }, { name: "Product" },\n' +
            '      { name: "Sign Up" }, { name: "Purchase" }, { name: "Bounce" }\n' +
            '    ],\n' +
            '    links: [\n' +
            '      { source: "Traffic", target: "Organic", value: 45 },\n' +
            '      { source: "Traffic", target: "Paid", value: 35 },\n' +
            '      { source: "Traffic", target: "Social", value: 20 },\n' +
            '      { source: "Organic", target: "Landing Page", value: 20 },\n' +
            '      { source: "Organic", target: "Blog", value: 25 },\n' +
            '      { source: "Paid", target: "Landing Page", value: 25 },\n' +
            '      { source: "Paid", target: "Product", value: 10 },\n' +
            '      { source: "Social", target: "Blog", value: 12 },\n' +
            '      { source: "Social", target: "Product", value: 8 },\n' +
            '      { source: "Landing Page", target: "Sign Up", value: 30 },\n' +
            '      { source: "Landing Page", target: "Bounce", value: 15 },\n' +
            '      { source: "Blog", target: "Sign Up", value: 20 },\n' +
            '      { source: "Blog", target: "Bounce", value: 17 },\n' +
            '      { source: "Product", target: "Purchase", value: 12 },\n' +
            '      { source: "Product", target: "Bounce", value: 6 }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 5. Gradient Edge ───
            '## 5. Gradient Edge\n\n' +
            '> Link lines use a gradient from source to target node color.\n\n' +
            '{{Chart: Gradient Sankey\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  series: [{\n' +
            '    type: "sankey", layout: "none",\n' +
            '    emphasis: { focus: "adjacency" },\n' +
            '    lineStyle: { color: "gradient", curveness: 0.5 },\n' +
            '    data: [\n' +
            '      { name: "Brazil", itemStyle: { color: "#22c55e" } },\n' +
            '      { name: "Portugal", itemStyle: { color: "#ef4444" } },\n' +
            '      { name: "France", itemStyle: { color: "#3b82f6" } },\n' +
            '      { name: "Spain", itemStyle: { color: "#f59e0b" } },\n' +
            '      { name: "USA", itemStyle: { color: "#6366f1" } },\n' +
            '      { name: "England", itemStyle: { color: "#ec4899" } },\n' +
            '      { name: "Canada", itemStyle: { color: "#a855f7" } },\n' +
            '      { name: "Mexico", itemStyle: { color: "#14b8a6" } },\n' +
            '      { name: "North America" }, { name: "Europe" }, { name: "South America" }\n' +
            '    ],\n' +
            '    links: [\n' +
            '      { source: "Brazil", target: "South America", value: 30 },\n' +
            '      { source: "Portugal", target: "Europe", value: 10 },\n' +
            '      { source: "France", target: "Europe", value: 25 },\n' +
            '      { source: "Spain", target: "Europe", value: 18 },\n' +
            '      { source: "England", target: "Europe", value: 22 },\n' +
            '      { source: "USA", target: "North America", value: 45 },\n' +
            '      { source: "Canada", target: "North America", value: 20 },\n' +
            '      { source: "Mexico", target: "North America", value: 15 }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 6. Node Align Left ───
            '## 6. Node Align Left\n\n' +
            '> All leaf nodes aligned to the left side using `nodeAlign: "left"`.\n\n' +
            '{{Chart: Sankey Align Left\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  series: [{\n' +
            '    type: "sankey", layout: "none",\n' +
            '    nodeAlign: "left",\n' +
            '    emphasis: { focus: "adjacency" },\n' +
            '    lineStyle: { color: "source", opacity: 0.5 },\n' +
            '    data: [\n' +
            '      { name: "Total Budget" },\n' +
            '      { name: "Engineering" }, { name: "Marketing" }, { name: "Operations" },\n' +
            '      { name: "Frontend" }, { name: "Backend" }, { name: "QA" },\n' +
            '      { name: "Digital" }, { name: "Events" },\n' +
            '      { name: "Support" }, { name: "Logistics" }\n' +
            '    ],\n' +
            '    links: [\n' +
            '      { source: "Total Budget", target: "Engineering", value: 45 },\n' +
            '      { source: "Total Budget", target: "Marketing", value: 30 },\n' +
            '      { source: "Total Budget", target: "Operations", value: 25 },\n' +
            '      { source: "Engineering", target: "Frontend", value: 18 },\n' +
            '      { source: "Engineering", target: "Backend", value: 20 },\n' +
            '      { source: "Engineering", target: "QA", value: 7 },\n' +
            '      { source: "Marketing", target: "Digital", value: 20 },\n' +
            '      { source: "Marketing", target: "Events", value: 10 },\n' +
            '      { source: "Operations", target: "Support", value: 15 },\n' +
            '      { source: "Operations", target: "Logistics", value: 10 }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            // ─── 7. Node Align Right ───
            '## 7. Node Align Right\n\n' +
            '> All root/source nodes aligned to the right side using `nodeAlign: "right"`.\n\n' +
            '{{Chart: Sankey Align Right\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  series: [{\n' +
            '    type: "sankey", layout: "none",\n' +
            '    nodeAlign: "right",\n' +
            '    emphasis: { focus: "adjacency" },\n' +
            '    lineStyle: { color: "gradient", curveness: 0.5 },\n' +
            '    data: [\n' +
            '      { name: "Awareness" },\n' +
            '      { name: "Interest" }, { name: "Ignored" },\n' +
            '      { name: "Consideration" }, { name: "Dropped" },\n' +
            '      { name: "Intent" }, { name: "Delayed" },\n' +
            '      { name: "Purchase" }\n' +
            '    ],\n' +
            '    links: [\n' +
            '      { source: "Awareness", target: "Interest", value: 70 },\n' +
            '      { source: "Awareness", target: "Ignored", value: 30 },\n' +
            '      { source: "Interest", target: "Consideration", value: 50 },\n' +
            '      { source: "Interest", target: "Dropped", value: 20 },\n' +
            '      { source: "Consideration", target: "Intent", value: 35 },\n' +
            '      { source: "Consideration", target: "Delayed", value: 15 },\n' +
            '      { source: "Intent", target: "Purchase", value: 30 },\n' +
            '      { source: "Intent", target: "Delayed", value: 5 }\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '> **Tip:** Sankey diagrams are ideal for visualising flow, allocation, and conversion data. Hover over links to highlight adjacent nodes.\n'
    }
];
