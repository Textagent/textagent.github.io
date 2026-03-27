// ============================================
// templates/charts-sunburst-gallery.js — Sunburst Chart Gallery
// 7 sunburst chart variations from ECharts gallery
// ============================================
window.__MDV_TEMPLATES_SUNBURST_GALLERY = [
    {
        name: 'Sunburst Chart Gallery (7 Types)',
        category: 'charts',
        icon: 'bi-sun-fill',
        description: 'Complete Sunburst gallery — 7 variations (basic, rounded, rotate, monochrome, visualMap, drink flavors, book records)',
        content: '# ☀️ Sunburst Chart Gallery\n\n' +
            '> Every sunburst chart variation from the [ECharts Gallery](https://echarts.apache.org/examples/en/index.html#chart-type-sunburst) — copy-paste ready.\n\n---\n\n' +

            '## 1. Basic Sunburst\n\n' +
            '{{Chart: Basic Sunburst\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  { name: "Grandpa", children: [\n' +
            '    { name: "Uncle Leo", value: 15, children: [\n' +
            '      { name: "Cousin Jack", value: 2 },\n' +
            '      { name: "Cousin Mary", value: 5, children: [{ name: "Jackson", value: 2 }] },\n' +
            '      { name: "Cousin Ben", value: 4 }\n' +
            '    ]},\n' +
            '    { name: "Father", value: 10, children: [\n' +
            '      { name: "Me", value: 5 },\n' +
            '      { name: "Brother Peter", value: 1 }\n' +
            '    ]}\n' +
            '  ]},\n' +
            '  { name: "Nancy", children: [\n' +
            '    { name: "Uncle Nike", children: [\n' +
            '      { name: "Cousin Betty", value: 1 },\n' +
            '      { name: "Cousin Jenny", value: 2 }\n' +
            '    ]}\n' +
            '  ]}\n' +
            '];\n' +
            'option = {\n' +
            '  series: { type: "sunburst", data: data, radius: [0, "90%"],\n' +
            '    label: { rotate: "radial" } }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 2. Sunburst with Rounded Corner\n\n' +
            '{{Chart: Rounded Sunburst\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  { name: "Flora", itemStyle: { color: "#da0d68" }, children: [\n' +
            '    { name: "Trees", children: [\n' +
            '      { name: "Birch", value: 4 }, { name: "Oak", value: 6 },\n' +
            '      { name: "Pine", value: 8 }, { name: "Maple", value: 5 }\n' +
            '    ]},\n' +
            '    { name: "Flowers", children: [\n' +
            '      { name: "Rose", value: 7 }, { name: "Lily", value: 3 },\n' +
            '      { name: "Tulip", value: 5 }, { name: "Daisy", value: 4 }\n' +
            '    ]}\n' +
            '  ]},\n' +
            '  { name: "Fauna", itemStyle: { color: "#975e6d" }, children: [\n' +
            '    { name: "Mammals", children: [\n' +
            '      { name: "Dog", value: 8 }, { name: "Cat", value: 7 },\n' +
            '      { name: "Lion", value: 3 }, { name: "Bear", value: 4 }\n' +
            '    ]},\n' +
            '    { name: "Birds", children: [\n' +
            '      { name: "Eagle", value: 3 }, { name: "Parrot", value: 5 },\n' +
            '      { name: "Sparrow", value: 6 }\n' +
            '    ]}\n' +
            '  ]}\n' +
            '];\n' +
            'option = {\n' +
            '  series: { type: "sunburst", data: data, radius: [60, "90%"],\n' +
            '    itemStyle: { borderRadius: 7, borderWidth: 2 },\n' +
            '    label: { rotate: "radial" }\n' +
            '  }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 3. Sunburst Label Rotate\n\n' +
            '{{Chart: Label Rotate\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  { name: "Technology", children: [\n' +
            '    { name: "Frontend", children: [\n' +
            '      { name: "React", value: 10 }, { name: "Vue", value: 8 },\n' +
            '      { name: "Angular", value: 5 }, { name: "Svelte", value: 4 }\n' +
            '    ]},\n' +
            '    { name: "Backend", children: [\n' +
            '      { name: "Node.js", value: 9 }, { name: "Python", value: 8 },\n' +
            '      { name: "Go", value: 6 }, { name: "Rust", value: 5 }\n' +
            '    ]},\n' +
            '    { name: "Database", children: [\n' +
            '      { name: "PostgreSQL", value: 7 }, { name: "MongoDB", value: 5 },\n' +
            '      { name: "Redis", value: 4 }\n' +
            '    ]}\n' +
            '  ]},\n' +
            '  { name: "Design", children: [\n' +
            '    { name: "UI", children: [{ name: "Figma", value: 8 }, { name: "Sketch", value: 3 }] },\n' +
            '    { name: "UX", children: [{ name: "Research", value: 5 }, { name: "Testing", value: 4 }] }\n' +
            '  ]}\n' +
            '];\n' +
            'option = {\n' +
            '  series: {\n' +
            '    type: "sunburst", data: data, radius: [0, "85%"],\n' +
            '    label: { rotate: "tangential", fontSize: 12 },\n' +
            '    levels: [\n' +
            '      {},\n' +
            '      { r0: "15%", r: "40%", itemStyle: { borderWidth: 2 }, label: { rotate: "tangential" } },\n' +
            '      { r0: "40%", r: "65%", label: { rotate: "radial" } },\n' +
            '      { r0: "65%", r: "85%", label: { rotate: 0, position: "outside", padding: 3, silent: false }, itemStyle: { borderWidth: 3 } }\n' +
            '    ]\n' +
            '  }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 4. Monochrome Sunburst\n\n' +
            '{{Chart: Monochrome\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  { name: "Company", children: [\n' +
            '    { name: "Engineering", value: 40, children: [\n' +
            '      { name: "Platform", value: 15 }, { name: "Product", value: 12 },\n' +
            '      { name: "QA", value: 8 }, { name: "DevOps", value: 5 }\n' +
            '    ]},\n' +
            '    { name: "Marketing", value: 25, children: [\n' +
            '      { name: "Content", value: 10 }, { name: "SEO", value: 8 },\n' +
            '      { name: "Social", value: 7 }\n' +
            '    ]},\n' +
            '    { name: "Sales", value: 20, children: [\n' +
            '      { name: "Enterprise", value: 12 }, { name: "SMB", value: 8 }\n' +
            '    ]},\n' +
            '    { name: "HR", value: 15, children: [\n' +
            '      { name: "Recruiting", value: 8 }, { name: "People Ops", value: 7 }\n' +
            '    ]}\n' +
            '  ]}\n' +
            '];\n' +
            'option = {\n' +
            '  series: {\n' +
            '    type: "sunburst", data: data, radius: [0, "90%"],\n' +
            '    label: { rotate: "radial", color: "#fff" },\n' +
            '    itemStyle: { color: "#6366f1", borderColor: "#1e1b4b", borderWidth: 2 },\n' +
            '    levels: [\n' +
            '      {},\n' +
            '      { itemStyle: { color: "#818cf8" } },\n' +
            '      { itemStyle: { color: "#6366f1" } },\n' +
            '      { itemStyle: { color: "#4f46e5" } }\n' +
            '    ]\n' +
            '  }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 5. Sunburst VisualMap\n\n' +
            '{{Chart: VisualMap Sunburst\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  { name: "Asia", children: [\n' +
            '    { name: "China", value: 1400 }, { name: "India", value: 1380 },\n' +
            '    { name: "Indonesia", value: 274 }, { name: "Pakistan", value: 221 },\n' +
            '    { name: "Japan", value: 126 }, { name: "Philippines", value: 110 }\n' +
            '  ]},\n' +
            '  { name: "Europe", children: [\n' +
            '    { name: "Russia", value: 146 }, { name: "Germany", value: 84 },\n' +
            '    { name: "UK", value: 68 }, { name: "France", value: 65 },\n' +
            '    { name: "Italy", value: 60 }\n' +
            '  ]},\n' +
            '  { name: "Americas", children: [\n' +
            '    { name: "USA", value: 331 }, { name: "Brazil", value: 213 },\n' +
            '    { name: "Mexico", value: 129 }, { name: "Colombia", value: 51 }\n' +
            '  ]},\n' +
            '  { name: "Africa", children: [\n' +
            '    { name: "Nigeria", value: 206 }, { name: "Ethiopia", value: 118 },\n' +
            '    { name: "Egypt", value: 102 }, { name: "Congo", value: 90 }\n' +
            '  ]}\n' +
            '];\n' +
            'option = {\n' +
            '  title: { text: "World Population (millions)", left: "center" },\n' +
            '  visualMap: { type: "continuous", min: 50, max: 1400, inRange: { color: ["#2a4858","#005a32","#31a354","#e5f5e0"] },\n' +
            '    orient: "horizontal", left: "center", bottom: 10 },\n' +
            '  series: {\n' +
            '    type: "sunburst", data: data, radius: [20, "80%"],\n' +
            '    label: { rotate: "radial", fontSize: 11 },\n' +
            '    itemStyle: { borderWidth: 2 }\n' +
            '  }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 6. Drink Flavors\n\n' +
            '{{Chart: Drink Flavors\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  { name: "Coffee", itemStyle: { color: "#6F4E37" }, children: [\n' +
            '    { name: "Espresso", value: 5, itemStyle: { color: "#8B6914" } },\n' +
            '    { name: "Latte", value: 8, itemStyle: { color: "#D2B48C" },\n' +
            '      children: [{ name: "Vanilla", value: 3 }, { name: "Caramel", value: 3 }, { name: "Hazelnut", value: 2 }] },\n' +
            '    { name: "Cappuccino", value: 6, itemStyle: { color: "#A0522D" } },\n' +
            '    { name: "Americano", value: 4, itemStyle: { color: "#4E3B2B" } },\n' +
            '    { name: "Cold Brew", value: 5, itemStyle: { color: "#3C1414" },\n' +
            '      children: [{ name: "Nitro", value: 2 }, { name: "Classic", value: 3 }] }\n' +
            '  ]},\n' +
            '  { name: "Tea", itemStyle: { color: "#228B22" }, children: [\n' +
            '    { name: "Green", value: 7, itemStyle: { color: "#32CD32" },\n' +
            '      children: [{ name: "Matcha", value: 4 }, { name: "Sencha", value: 3 }] },\n' +
            '    { name: "Black", value: 5, itemStyle: { color: "#8B0000" },\n' +
            '      children: [{ name: "Earl Grey", value: 2 }, { name: "English Breakfast", value: 3 }] },\n' +
            '    { name: "Oolong", value: 3, itemStyle: { color: "#DAA520" } },\n' +
            '    { name: "Herbal", value: 4, itemStyle: { color: "#98FB98" },\n' +
            '      children: [{ name: "Chamomile", value: 2 }, { name: "Mint", value: 2 }] }\n' +
            '  ]},\n' +
            '  { name: "Juice", itemStyle: { color: "#FF8C00" }, children: [\n' +
            '    { name: "Orange", value: 6, itemStyle: { color: "#FFA500" } },\n' +
            '    { name: "Apple", value: 5, itemStyle: { color: "#8DB600" } },\n' +
            '    { name: "Mango", value: 4, itemStyle: { color: "#FFCC00" } },\n' +
            '    { name: "Berry", value: 3, itemStyle: { color: "#8B008B" },\n' +
            '      children: [{ name: "Blueberry", value: 1 }, { name: "Strawberry", value: 2 }] }\n' +
            '  ]}\n' +
            '];\n' +
            'option = {\n' +
            '  title: { text: "Drink Flavors", left: "center" },\n' +
            '  series: {\n' +
            '    type: "sunburst", data: data, radius: [0, "90%"],\n' +
            '    sort: undefined,\n' +
            '    emphasis: { focus: "ancestor" },\n' +
            '    levels: [\n' +
            '      {},\n' +
            '      { r0: "15%", r: "35%", itemStyle: { borderWidth: 2 }, label: { rotate: "tangential" } },\n' +
            '      { r0: "35%", r: "60%", label: { align: "right" } },\n' +
            '      { r0: "60%", r: "82%", label: { position: "outside", padding: 3, silent: false }, itemStyle: { borderWidth: 3 } }\n' +
            '    ]\n' +
            '  }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 7. Book Records\n\n' +
            '{{Chart: Book Records\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  { name: "Fiction", children: [\n' +
            '    { name: "Sci-Fi", children: [\n' +
            '      { name: "Dune", value: 12 }, { name: "Foundation", value: 8 },\n' +
            '      { name: "Neuromancer", value: 6 }, { name: "Enders Game", value: 9 }\n' +
            '    ]},\n' +
            '    { name: "Fantasy", children: [\n' +
            '      { name: "LOTR", value: 15 }, { name: "Harry Potter", value: 20 },\n' +
            '      { name: "Narnia", value: 7 }, { name: "Wheel of Time", value: 10 }\n' +
            '    ]},\n' +
            '    { name: "Mystery", children: [\n' +
            '      { name: "Sherlock", value: 10 }, { name: "Poirot", value: 8 },\n' +
            '      { name: "Gone Girl", value: 6 }\n' +
            '    ]}\n' +
            '  ]},\n' +
            '  { name: "Non-Fiction", children: [\n' +
            '    { name: "Science", children: [\n' +
            '      { name: "Cosmos", value: 8 }, { name: "Sapiens", value: 12 },\n' +
            '      { name: "Brief History", value: 10 }\n' +
            '    ]},\n' +
            '    { name: "Business", children: [\n' +
            '      { name: "Zero to One", value: 7 }, { name: "Lean Startup", value: 6 },\n' +
            '      { name: "Good to Great", value: 5 }\n' +
            '    ]},\n' +
            '    { name: "History", children: [\n' +
            '      { name: "WWII", value: 9 }, { name: "Rome", value: 6 },\n' +
            '      { name: "Renaissance", value: 4 }\n' +
            '    ]}\n' +
            '  ]},\n' +
            '  { name: "Technical", children: [\n' +
            '    { name: "Programming", children: [\n' +
            '      { name: "Clean Code", value: 11 }, { name: "SICP", value: 5 },\n' +
            '      { name: "Design Patterns", value: 7 }, { name: "CLRS", value: 4 }\n' +
            '    ]},\n' +
            '    { name: "Data", children: [\n' +
            '      { name: "DDIA", value: 9 }, { name: "ML Book", value: 6 }\n' +
            '    ]}\n' +
            '  ]}\n' +
            '];\n' +
            'option = {\n' +
            '  title: { text: "Book Reading Records", left: "center" },\n' +
            '  tooltip: { trigger: "item", formatter: "{b}: {c} books" },\n' +
            '  series: {\n' +
            '    type: "sunburst", data: data, radius: [0, "90%"],\n' +
            '    sort: undefined,\n' +
            '    emphasis: { focus: "ancestor" },\n' +
            '    itemStyle: { borderRadius: 4, borderWidth: 2 },\n' +
            '    levels: [\n' +
            '      {},\n' +
            '      { r0: "10%", r: "30%", label: { fontSize: 14, fontWeight: "bold" } },\n' +
            '      { r0: "30%", r: "55%", label: { rotate: "radial" } },\n' +
            '      { r0: "55%", r: "88%", label: { fontSize: 10 } }\n' +
            '    ]\n' +
            '  }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '> **Tip:** Sunburst charts excel at showing **hierarchical data**. Copy any example, replace the data tree, and instantly visualize your own category breakdowns.\n'
    }
];
