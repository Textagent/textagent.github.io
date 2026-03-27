// ============================================
// templates/charts-scatter-gallery.js — Scatter Chart Gallery
// 20 scatter chart variations from ECharts gallery
// ============================================
window.__MDV_TEMPLATES_SCATTER_GALLERY = [
    {
        name: 'Scatter Chart Gallery (20 Types)',
        category: 'charts',
        icon: 'bi-distribute-vertical',
        description: 'Complete Scatter gallery — 20 variations (basic, bubble, effect, punch card, regression, nebula & more)',
        content: '# 🔵 Scatter Chart Gallery\n\n' +
            '> Every scatter chart variation from the [ECharts Gallery](https://echarts.apache.org/examples/en/index.html#chart-type-scatter) — copy-paste ready.\n\n---\n\n' +

            '## 1. Basic Scatter Chart\n\n' +
            '{{Chart: Basic Scatter\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  xAxis: {}, yAxis: {},\n' +
            '  series: [{\n' +
            '    symbolSize: 20, type: "scatter",\n' +
            '    data: [[10.0,8.04],[8.07,6.95],[13.0,7.58],[9.05,8.81],[11.0,8.33],\n' +
            '      [14.0,7.66],[13.4,6.81],[10.0,6.33],[14.0,8.96],[12.5,6.82],\n' +
            '      [9.15,7.20],[11.5,7.20],[3.03,4.23],[12.2,7.83],[2.02,4.47],\n' +
            '      [1.05,3.33],[4.05,4.96],[6.03,7.24],[12.0,6.26],[12.0,8.84],\n' +
            '      [7.08,5.82],[5.02,5.68]]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            "## 2. Anscombe's Quartet\n\n" +
            '{{Chart: Anscombe Quartet\n' +
            '  @type: echart\n' +
            '  @height: 500\n' +
            '  @code: {\n' +
            'var dataAll = [\n' +
            '  [[10.0,8.04],[8.0,6.95],[13.0,7.58],[9.0,8.81],[11.0,8.33],[14.0,9.96],[6.0,7.24],[4.0,4.26],[12.0,10.84],[7.0,4.82],[5.0,5.68]],\n' +
            '  [[10.0,9.14],[8.0,8.14],[13.0,8.74],[9.0,8.77],[11.0,9.26],[14.0,8.10],[6.0,6.13],[4.0,3.10],[12.0,9.13],[7.0,7.26],[5.0,4.74]],\n' +
            '  [[10.0,7.46],[8.0,6.77],[13.0,12.74],[9.0,7.11],[11.0,7.81],[14.0,8.84],[6.0,6.08],[4.0,5.39],[12.0,8.15],[7.0,6.42],[5.0,5.73]],\n' +
            '  [[8.0,6.58],[8.0,5.76],[8.0,7.71],[8.0,8.84],[8.0,8.47],[8.0,7.04],[8.0,5.25],[19.0,12.50],[8.0,5.56],[8.0,7.91],[8.0,6.89]]\n' +
            '];\n' +
            'var grids = [], xAxes = [], yAxes = [], series = [], titles = [];\n' +
            'for (var i = 0; i < 4; i++) {\n' +
            '  var col = i % 2, row = Math.floor(i / 2);\n' +
            '  grids.push({ left: (col*50+8)+"%", top: (row*45+10)+"%", width: "35%", height: "35%" });\n' +
            '  xAxes.push({ gridIndex: i, min: 0, max: 20 });\n' +
            '  yAxes.push({ gridIndex: i, min: 0, max: 15 });\n' +
            '  titles.push({ text: "Set " + (i+1), left: (col*50+20)+"%", top: (row*45+5)+"%", textAlign: "center", textStyle: { fontSize: 14 } });\n' +
            '  series.push({ type: "scatter", xAxisIndex: i, yAxisIndex: i, data: dataAll[i], symbolSize: 10 });\n' +
            '}\n' +
            'option = { title: titles, grid: grids, xAxis: xAxes, yAxis: yAxes, tooltip: {}, series: series };\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 3. Effect Scatter Chart\n\n' +
            '{{Chart: Effect Scatter\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  xAxis: {}, yAxis: {},\n' +
            '  series: [{\n' +
            '    type: "effectScatter", symbolSize: 20,\n' +
            '    data: [[172.7,105.2],[153.4,42]],\n' +
            '    rippleEffect: { brushType: "stroke" }\n' +
            '  }, {\n' +
            '    type: "scatter",\n' +
            '    data: [[161.2,51.6],[167.5,59.0],[159.5,49.2],[157.0,63.0],[155.8,53.6],\n' +
            '      [170.0,59.0],[159.1,47.6],[166.0,69.8],[176.2,66.8],[160.2,75.2],\n' +
            '      [172.5,55.2],[170.9,54.2],[172.9,62.5],[153.4,42.0],[160.0,50.0],\n' +
            '      [147.2,49.8],[168.2,49.2],[175.0,73.2],[157.0,47.8],[167.6,68.8],\n' +
            '      [159.5,50.6],[175.0,82.5],[166.8,57.2],[176.5,87.8],[170.2,72.8]]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 4. Scatter with Jittering\n\n' +
            '{{Chart: Jittered Scatter\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'var categories = ["A","B","C","D","E"];\n' +
            'var data = [];\n' +
            'for (var c = 0; c < categories.length; c++) {\n' +
            '  for (var i = 0; i < 20; i++) {\n' +
            '    data.push([c + (Math.random()-0.5)*0.6, Math.random()*100]);\n' +
            '  }\n' +
            '}\n' +
            'option = {\n' +
            '  title: { text: "Scatter with Jittering" },\n' +
            '  xAxis: { type: "category", data: categories },\n' +
            '  yAxis: {},\n' +
            '  series: [{ type: "scatter", symbolSize: 8, data: data, itemStyle: { opacity: 0.6 } }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 5. Punch Card of GitHub\n\n' +
            '{{Chart: Punch Card\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'var hours = ["12a","1a","2a","3a","4a","5a","6a","7a","8a","9a","10a","11a","12p","1p","2p","3p","4p","5p","6p","7p","8p","9p","10p","11p"];\n' +
            'var days = ["Saturday","Friday","Thursday","Wednesday","Tuesday","Monday","Sunday"];\n' +
            'var rawData = [[0,0,5],[0,1,1],[0,2,0],[0,3,0],[0,4,0],[0,5,0],[0,6,0],[0,7,0],[0,8,0],[0,9,0],[0,10,0],[0,11,2],\n' +
            '  [0,12,4],[0,13,1],[0,14,1],[0,15,3],[0,16,4],[0,17,6],[0,18,4],[0,19,4],[0,20,3],[0,21,3],[0,22,2],[0,23,5],\n' +
            '  [1,0,7],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[1,5,0],[1,6,0],[1,7,0],[1,8,0],[1,9,0],[1,10,5],[1,11,2],\n' +
            '  [1,12,2],[1,13,6],[1,14,9],[1,15,11],[1,16,6],[1,17,7],[1,18,8],[1,19,12],[1,20,5],[1,21,5],[1,22,7],[1,23,2],\n' +
            '  [2,0,1],[2,1,1],[2,2,0],[2,3,0],[2,4,0],[2,5,0],[2,6,0],[2,7,0],[2,8,0],[2,9,0],[2,10,3],[2,11,2],\n' +
            '  [2,12,1],[2,13,9],[2,14,8],[2,15,10],[2,16,6],[2,17,5],[2,18,5],[2,19,5],[2,20,7],[2,21,4],[2,22,2],[2,23,4],\n' +
            '  [3,0,7],[3,1,3],[3,2,0],[3,3,0],[3,4,0],[3,5,0],[3,6,0],[3,7,0],[3,8,1],[3,9,0],[3,10,5],[3,11,4],\n' +
            '  [3,12,7],[3,13,14],[3,14,13],[3,15,12],[3,16,9],[3,17,5],[3,18,5],[3,19,10],[3,20,6],[3,21,4],[3,22,4],[3,23,1]];\n' +
            'var data = rawData.map(function(item) { return [item[1], item[0], item[2] || "-"]; });\n' +
            'option = {\n' +
            '  title: { text: "Punch Card" },\n' +
            '  tooltip: { position: "top", formatter: function(p) { return p.data[2] + " commits"; } },\n' +
            '  xAxis: { type: "category", data: hours, splitArea: { show: true } },\n' +
            '  yAxis: { type: "category", data: days, splitArea: { show: true } },\n' +
            '  series: [{ type: "scatter", symbolSize: function(val) { return val[2] * 3; }, data: data,\n' +
            '    animationDelay: function(idx) { return idx * 5; } }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 6. Scatter on Single Axis\n\n' +
            '{{Chart: Single Axis\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'var hours = ["12a","1a","2a","3a","4a","5a","6a","7a","8a","9a","10a","11a","12p","1p","2p","3p","4p","5p","6p","7p","8p","9p","10p","11p"];\n' +
            'var days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];\n' +
            'var singles = [], xAxes = [], series = [];\n' +
            'for (var i = 0; i < 7; i++) {\n' +
            '  singles.push({ left: 100, type: "category", boundaryGap: false, data: hours,\n' +
            '    top: (i * 12 + 10) + "%", height: "6%", axisLabel: { interval: 2 } });\n' +
            '  var data = [];\n' +
            '  for (var j = 0; j < 24; j++) data.push([j, Math.round(Math.random() * 10)]);\n' +
            '  series.push({ singleAxisIndex: i, coordinateSystem: "singleAxis", type: "scatter",\n' +
            '    data: data, symbolSize: function(d) { return d[1] * 4; } });\n' +
            '}\n' +
            'option = {\n' +
            '  title: { text: "Commits per Hour" },\n' +
            '  tooltip: { position: "top" },\n' +
            '  singleAxis: singles, series: series\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 7. Distribution of Height and Weight\n\n' +
            '{{Chart: Height Weight\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var male = [[174.0,65.6],[175.3,71.8],[193.5,80.7],[186.5,72.6],[187.2,78.8],[181.5,74.8],[184.0,86.4],[184.5,78.4],[175.0,62.0],[184.0,81.6],[180.0,76.6],[177.8,83.6],[192.0,90.0],[176.0,74.6],[174.0,71.0],[184.0,79.6],[192.7,93.8],[171.5,70.0],[173.0,72.4],[176.0,85.9]];\n' +
            'var female = [[161.2,51.6],[167.5,59.0],[159.5,49.2],[157.0,63.0],[155.8,53.6],[170.0,59.0],[159.1,47.6],[166.0,69.8],[176.2,66.8],[160.2,75.2],[172.5,55.2],[170.9,54.2],[172.9,62.5],[153.4,42.0],[160.0,50.0],[147.2,49.8],[168.2,49.2],[175.0,73.2],[157.0,47.8],[167.6,68.8]];\n' +
            'option = {\n' +
            '  title: { text: "Height & Weight Distribution" },\n' +
            '  tooltip: { trigger: "item" }, legend: {},\n' +
            '  xAxis: { name: "Height (cm)" }, yAxis: { name: "Weight (kg)" },\n' +
            '  series: [\n' +
            '    { name: "Male", type: "scatter", data: male, symbolSize: 10, itemStyle: { color: "#5470c6" } },\n' +
            '    { name: "Female", type: "scatter", data: female, symbolSize: 10, itemStyle: { color: "#ee6666" } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 8. Exponential Regression\n\n' +
            '{{Chart: Exponential\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var data = [];\n' +
            'for (var i = 0; i < 30; i++) data.push([i, Math.exp(i*0.1) * (1 + (Math.random()-0.5)*0.5)]);\n' +
            'var regData = [];\n' +
            'for (var i = 0; i < 30; i++) regData.push([i, Math.exp(i*0.1)]);\n' +
            'option = {\n' +
            '  title: { text: "Exponential Regression" },\n' +
            '  tooltip: {},\n' +
            '  xAxis: { name: "x" }, yAxis: { name: "y" },\n' +
            '  series: [\n' +
            '    { type: "scatter", data: data, symbolSize: 8 },\n' +
            '    { type: "line", data: regData, showSymbol: false, lineStyle: { color: "#ee6666", width: 3 }, name: "Exp fit" }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 9. Linear Regression\n\n' +
            '{{Chart: Linear Regression\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var data = [];\n' +
            'for (var i = 0; i < 30; i++) data.push([i, i*2.5 + 10 + (Math.random()-0.5)*20]);\n' +
            'option = {\n' +
            '  title: { text: "Linear Regression" },\n' +
            '  tooltip: {}, xAxis: {}, yAxis: {},\n' +
            '  dataset: [{ source: data },\n' +
            '    { transform: { type: "ecStat:regression", config: { method: "linear" } } }],\n' +
            '  series: [\n' +
            '    { type: "scatter", datasetIndex: 0 },\n' +
            '    { type: "line", datasetIndex: 1, symbolSize: 0.1, symbol: "circle",\n' +
            '      label: { show: true, fontSize: 14 }, labelLayout: { dx: -20 },\n' +
            '      encode: { label: 2, tooltip: 1 } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 10. Polynomial Regression\n\n' +
            '{{Chart: Polynomial\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var data = [];\n' +
            'for (var i = -30; i <= 30; i++) {\n' +
            '  var x = i * 0.1;\n' +
            '  data.push([x, x*x*x - 3*x*x + 2*x + (Math.random()-0.5)*10]);\n' +
            '}\n' +
            'var fitData = [];\n' +
            'for (var i = -30; i <= 30; i++) { var x = i*0.1; fitData.push([x, x*x*x - 3*x*x + 2*x]); }\n' +
            'option = {\n' +
            '  title: { text: "Polynomial Regression" },\n' +
            '  tooltip: {}, xAxis: { name: "x" }, yAxis: { name: "y" },\n' +
            '  series: [\n' +
            '    { type: "scatter", data: data, symbolSize: 6, itemStyle: { opacity: 0.5 } },\n' +
            '    { type: "line", data: fitData, showSymbol: false, lineStyle: { color: "#91cc75", width: 3 }, name: "y = x³ - 3x² + 2x" }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 11. Bubble Chart\n\n' +
            '{{Chart: Bubble Chart\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'var data = [\n' +
            '  [[28604,77,17096869,"Australia"],[31163,77.4,27662440,"Canada"],[1516,68,1154605773,"China"],\n' +
            '   [13670,74.7,10582082,"Cuba"],[28599,75,4986705,"Finland"],[29476,77.1,56943299,"France"],\n' +
            '   [31476,75.4,78958237,"Germany"],[28666,78.1,254830,"Iceland"],[1777,57.7,870601776,"India"],\n' +
            '   [29550,79.1,122249285,"Japan"],[2076,67.9,20194354,"North Korea"],\n' +
            '   [12087,72,42972254,"South Korea"],[24021,75.4,3397534,"New Zealand"],\n' +
            '   [43296,76.8,4240375,"Norway"],[10088,70.8,38195258,"Poland"],\n' +
            '   [19349,69.6,147568552,"Russia"],[10670,67.3,53994605,"South Africa"],\n' +
            '   [26424,75.7,57110117,"United Kingdom"],[37062,75.4,252847810,"United States"]]\n' +
            '];\n' +
            'option = {\n' +
            '  title: { text: "Life Expectancy vs GDP" },\n' +
            '  legend: { right: 10, data: ["2015"] },\n' +
            '  xAxis: { name: "GDP (PPP)" }, yAxis: { name: "Life Expectancy" },\n' +
            '  series: [{\n' +
            '    name: "2015", type: "scatter",\n' +
            '    data: data[0],\n' +
            '    symbolSize: function(d) { return Math.sqrt(d[2]) / 5e2; },\n' +
            '    emphasis: { focus: "series", label: { show: true, formatter: function(p) { return p.data[3]; }, position: "top" } },\n' +
            '    itemStyle: { shadowBlur: 10, shadowColor: "rgba(120,36,50,0.5)", shadowOffsetY: 5, color: { type: "radial", x: 0.4, y: 0.3, r: 1, colorStops: [{ offset: 0, color: "rgb(251,118,123)" }, { offset: 1, color: "rgb(204,46,72)" }] } }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 12. Scatter AQI Color\n\n' +
            '{{Chart: AQI Colors\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'var data = [];\n' +
            'for (var i = 0; i < 50; i++) {\n' +
            '  data.push([Math.random()*24, Math.round(Math.random()*300), Math.round(Math.random()*200 + 50)]);\n' +
            '}\n' +
            'option = {\n' +
            '  title: { text: "AQI Scatter" },\n' +
            '  xAxis: { name: "Hour", max: 24 },\n' +
            '  yAxis: { name: "AQI" },\n' +
            '  visualMap: { min: 0, max: 300, dimension: 1, orient: "vertical", right: 10, top: "center", text: ["High","Low"],\n' +
            '    inRange: { color: ["#50a3ba","#eac736","#d94e5d"] } },\n' +
            '  series: [{ type: "scatter", symbolSize: function(d) { return d[2] / 10; }, data: data }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 13. Scatter Nebula\n\n' +
            '{{Chart: Nebula\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'function genNebula(cx, cy, count, spread) {\n' +
            '  var d = [];\n' +
            '  for (var i = 0; i < count; i++) {\n' +
            '    var angle = Math.random() * Math.PI * 2;\n' +
            '    var r = Math.random() * spread;\n' +
            '    d.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);\n' +
            '  }\n' +
            '  return d;\n' +
            '}\n' +
            'option = {\n' +
            '  backgroundColor: "#111",\n' +
            '  xAxis: { show: false }, yAxis: { show: false },\n' +
            '  series: [\n' +
            '    { type: "scatter", data: genNebula(50,50,300,30), symbolSize: 3, itemStyle: { color: "rgba(99,102,241,0.6)" } },\n' +
            '    { type: "scatter", data: genNebula(70,30,200,20), symbolSize: 2, itemStyle: { color: "rgba(236,72,153,0.5)" } },\n' +
            '    { type: "scatter", data: genNebula(30,70,250,25), symbolSize: 2.5, itemStyle: { color: "rgba(34,197,94,0.5)" } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 14. Scatter Symbol Shape\n\n' +
            '{{Chart: Symbol Shapes\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'var symbols = ["circle","rect","roundRect","triangle","diamond","pin","arrow"];\n' +
            'var series = symbols.map(function(s, i) {\n' +
            '  var data = [];\n' +
            '  for (var j = 0; j < 10; j++) data.push([Math.random()*100, Math.random()*100]);\n' +
            '  return { name: s, type: "scatter", symbol: s, symbolSize: 16, data: data };\n' +
            '});\n' +
            'option = {\n' +
            '  title: { text: "Symbol Shapes" }, tooltip: {}, legend: { type: "scroll", bottom: 5 },\n' +
            '  xAxis: {}, yAxis: {}, series: series\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 15. Scatter Label on Top\n\n' +
            '{{Chart: Label on Top\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var cities = ["Munich","Berlin","Paris","London","Tokyo","NYC","Sydney","Dubai"];\n' +
            'var data = cities.map(function(c) { return { value: [Math.random()*100, Math.random()*100], name: c }; });\n' +
            'option = {\n' +
            '  title: { text: "Scatter with Labels" },\n' +
            '  tooltip: {}, xAxis: {}, yAxis: {},\n' +
            '  series: [{\n' +
            '    type: "scatter", symbolSize: 30, data: data,\n' +
            '    label: { show: true, formatter: "{b}", position: "top", fontSize: 12 },\n' +
            '    emphasis: { label: { show: true, fontSize: 16, fontWeight: "bold" } }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 16. Scatter Nutrients Matrix\n\n' +
            '{{Chart: Nutrients\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var foods = ["Apple","Banana","Chicken","Salmon","Rice","Broccoli","Egg","Milk","Cheese","Bread"];\n' +
            'var data = foods.map(function(f) { return [Math.round(Math.random()*500), Math.round(Math.random()*50), Math.round(Math.random()*30), f]; });\n' +
            'option = {\n' +
            '  title: { text: "Nutrient Analysis" },\n' +
            '  tooltip: { formatter: function(p) { return p.data[3] + "<br/>Calories: " + p.data[0] + "<br/>Protein: " + p.data[1] + "g<br/>Fat: " + p.data[2] + "g"; } },\n' +
            '  xAxis: { name: "Calories" }, yAxis: { name: "Protein (g)" },\n' +
            '  visualMap: { min: 0, max: 30, dimension: 2, text: ["High Fat","Low Fat"],\n' +
            '    inRange: { color: ["#22c55e","#f59e0b","#ef4444"] } },\n' +
            '  series: [{ type: "scatter", symbolSize: function(d) { return d[2] + 10; }, data: data,\n' +
            '    label: { show: true, formatter: function(p) { return p.data[3]; }, position: "right", fontSize: 10 } }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 17. Aggregate Scatter to Bar\n\n' +
            '{{Chart: Scatter to Bar\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'var cats = ["A","B","C","D","E"];\n' +
            'var scatter = [], bar = [];\n' +
            'for (var c = 0; c < cats.length; c++) {\n' +
            '  var sum = 0;\n' +
            '  for (var i = 0; i < 15; i++) { var v = Math.random()*100; sum += v; scatter.push([c, v]); }\n' +
            '  bar.push(Math.round(sum / 15));\n' +
            '}\n' +
            'option = {\n' +
            '  title: { text: "Aggregate Scatter to Bar" },\n' +
            '  tooltip: {}, legend: {},\n' +
            '  xAxis: { type: "category", data: cats },\n' +
            '  yAxis: {},\n' +
            '  series: [\n' +
            '    { name: "Points", type: "scatter", data: scatter, symbolSize: 6, itemStyle: { opacity: 0.5 } },\n' +
            '    { name: "Average", type: "bar", data: bar, barWidth: "40%", itemStyle: { color: "rgba(99,102,241,0.4)" } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 18. Calendar Scatter\n\n' +
            '{{Chart: Calendar Scatter\n' +
            '  @type: echart\n' +
            '  @height: 300\n' +
            '  @code: {\n' +
            'function getVirtualData(year) {\n' +
            '  var date = +new Date(year + "/01/01");\n' +
            '  var end = +new Date((year+1) + "/01/01");\n' +
            '  var day = 86400000; var data = [];\n' +
            '  for (var t = date; t < end; t += day) {\n' +
            '    var d = new Date(t);\n' +
            '    data.push([d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(), Math.floor(Math.random()*10000)]);\n' +
            '  }\n' +
            '  return data;\n' +
            '}\n' +
            'option = {\n' +
            '  visualMap: { min: 0, max: 10000, type: "piecewise", orient: "horizontal", left: "center", top: 15 },\n' +
            '  calendar: { top: 80, left: 30, right: 30, cellSize: ["auto", 15], range: "2024",\n' +
            '    itemStyle: { borderWidth: 0.5 }, yearLabel: { show: false } },\n' +
            '  series: { type: "scatter", coordinateSystem: "calendar", data: getVirtualData(2024), symbolSize: function(val) { return val[1] / 1500; } }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 19. Logarithmic Regression\n\n' +
            '{{Chart: Log Regression\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var data = [];\n' +
            'for (var i = 1; i <= 40; i++) data.push([i, Math.log(i)*20 + (Math.random()-0.5)*15]);\n' +
            'var fitData = [];\n' +
            'for (var i = 1; i <= 40; i++) fitData.push([i, Math.log(i)*20]);\n' +
            'option = {\n' +
            '  title: { text: "Logarithmic Regression" },\n' +
            '  tooltip: {}, xAxis: { name: "x" }, yAxis: { name: "y" },\n' +
            '  series: [\n' +
            '    { type: "scatter", data: data, symbolSize: 8 },\n' +
            '    { type: "line", data: fitData, showSymbol: false, lineStyle: { color: "#fac858", width: 3, type: "dashed" }, name: "Log fit" }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 20. Scatter Dataset\n\n' +
            '{{Chart: Dataset Scatter\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  legend: {},\n' +
            '  tooltip: {},\n' +
            '  dataset: {\n' +
            '    source: [\n' +
            '      ["Score","Salary","City"],\n' +
            '      [70, 52000, "NYC"], [85, 68000, "NYC"], [60, 45000, "NYC"], [92, 82000, "NYC"],\n' +
            '      [55, 48000, "SF"], [78, 75000, "SF"], [88, 95000, "SF"], [65, 58000, "SF"],\n' +
            '      [72, 55000, "London"], [90, 72000, "London"], [58, 42000, "London"], [82, 65000, "London"]\n' +
            '    ]\n' +
            '  },\n' +
            '  xAxis: { name: "Score" }, yAxis: { name: "Salary ($)" },\n' +
            '  series: [\n' +
            '    { type: "scatter", encode: { x: "Score", y: "Salary", tooltip: [0,1,2] }, symbolSize: 15 }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '> **Note:** Some ECharts scatter examples (Large Scatter, Clustering Process, Visual Interaction, Geo Choropleth, Master Painter) require external data, WebGL, or heavy computation and cannot be used in `@code: {}` mode. The 20 examples above cover all compatible scatter variations.\n'
    }
];
