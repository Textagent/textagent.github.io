// ============================================
// templates/charts-line-gallery.js — Line Chart Gallery
// 25 line chart variations from ECharts gallery
// ============================================
window.__MDV_TEMPLATES_LINE_GALLERY = [
    {
        name: 'Line Chart Gallery (25 Types)',
        category: 'charts',
        icon: 'bi-graph-up',
        description: 'Complete Line chart gallery — 25 variations (area, stacked, gradient, bump, polar, sparkline & more)',
        content: '# 📈 Line Chart Gallery\n\n' +
            '> Every line chart variation from the [ECharts Gallery](https://echarts.apache.org/examples/en/index.html#chart-type-line) — copy-paste ready.\n\n---\n\n' +

            '## 1. Basic Line Chart\n\n' +
            '{{Chart: Basic Line\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [{ data: [150, 230, 224, 218, 135, 147, 260], type: "line" }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 2. Smoothed Line Chart\n\n' +
            '{{Chart: Smoothed Line\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [{ data: [820, 932, 901, 934, 1290, 1330, 1320], type: "line", smooth: true }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 3. Basic Area Chart\n\n' +
            '{{Chart: Basic Area\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  xAxis: { type: "category", boundaryGap: false, data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [{ data: [820, 932, 901, 934, 1290, 1330, 1320], type: "line",\n' +
            '    areaStyle: {}, itemStyle: { color: "#6366f1" } }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 4. Stacked Line Chart\n\n' +
            '{{Chart: Stacked Lines\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Stacked Line" },\n' +
            '  tooltip: { trigger: "axis" },\n' +
            '  legend: { data: ["Email","Union Ads","Video Ads","Direct","Search Engine"] },\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: { type: "category", boundaryGap: false, data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [\n' +
            '    { name: "Email", type: "line", stack: "Total", data: [120,132,101,134,90,230,210] },\n' +
            '    { name: "Union Ads", type: "line", stack: "Total", data: [220,182,191,234,290,330,310] },\n' +
            '    { name: "Video Ads", type: "line", stack: "Total", data: [150,232,201,154,190,330,410] },\n' +
            '    { name: "Direct", type: "line", stack: "Total", data: [320,332,301,334,390,330,320] },\n' +
            '    { name: "Search Engine", type: "line", stack: "Total", data: [820,932,901,934,1290,1330,1320] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 5. Stacked Area Chart\n\n' +
            '{{Chart: Stacked Area\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Stacked Area Chart" },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "cross", label: { backgroundColor: "#6a7985" } } },\n' +
            '  legend: { data: ["Email","Union Ads","Video Ads","Direct","Search Engine"] },\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: [{ type: "category", boundaryGap: false, data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] }],\n' +
            '  yAxis: [{ type: "value" }],\n' +
            '  series: [\n' +
            '    { name: "Email", type: "line", stack: "Total", areaStyle: {}, emphasis: { focus: "series" }, data: [120,132,101,134,90,230,210] },\n' +
            '    { name: "Union Ads", type: "line", stack: "Total", areaStyle: {}, emphasis: { focus: "series" }, data: [220,182,191,234,290,330,310] },\n' +
            '    { name: "Video Ads", type: "line", stack: "Total", areaStyle: {}, emphasis: { focus: "series" }, data: [150,232,201,154,190,330,410] },\n' +
            '    { name: "Direct", type: "line", stack: "Total", areaStyle: {}, emphasis: { focus: "series" }, data: [320,332,301,334,390,330,320] },\n' +
            '    { name: "Search Engine", type: "line", stack: "Total", label: { show: true, position: "top" }, areaStyle: {}, emphasis: { focus: "series" }, data: [820,932,901,934,1290,1330,1320] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 6. Gradient Stacked Area Chart\n\n' +
            '{{Chart: Gradient Stacked Area\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var colors = ["#80FFA5","#00DDFF","#37A2FF","#FF0087","#FFBF00"];\n' +
            'option = {\n' +
            '  color: colors,\n' +
            '  title: { text: "Gradient Stacked Area" },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "cross", label: { backgroundColor: "#6a7985" } } },\n' +
            '  legend: { data: ["Line 1","Line 2","Line 3"] },\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: [{ type: "category", boundaryGap: false, data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] }],\n' +
            '  yAxis: [{ type: "value" }],\n' +
            '  series: [\n' +
            '    { name: "Line 1", type: "line", stack: "Total", smooth: true, lineStyle: { width: 0 }, showSymbol: false,\n' +
            '      areaStyle: { opacity: 0.8, color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(128,255,165)" }, { offset: 1, color: "rgba(1,191,236)" }] } },\n' +
            '      emphasis: { focus: "series" }, data: [140,232,101,264,90,340,250] },\n' +
            '    { name: "Line 2", type: "line", stack: "Total", smooth: true, lineStyle: { width: 0 }, showSymbol: false,\n' +
            '      areaStyle: { opacity: 0.8, color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(0,221,255)" }, { offset: 1, color: "rgba(77,119,255)" }] } },\n' +
            '      emphasis: { focus: "series" }, data: [120,282,111,234,220,340,310] },\n' +
            '    { name: "Line 3", type: "line", stack: "Total", smooth: true, lineStyle: { width: 0 }, showSymbol: false,\n' +
            '      areaStyle: { opacity: 0.8, color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(55,162,255)" }, { offset: 1, color: "rgba(116,21,219)" }] } },\n' +
            '      emphasis: { focus: "series" }, data: [320,132,201,334,190,130,220] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 7. Bump Chart (Ranking)\n\n' +
            '{{Chart: Bump Ranking\n' +
            '  @type: echart\n' +
            '  @height: 450\n' +
            '  @code: {\n' +
            'var names = ["Orange","Tomato","Apple","Sakana","Banana","Iwashi","Snappy Fish","Lemon","Pasta"];\n' +
            'var years = ["2001","2002","2003","2004","2005","2006"];\n' +
            'function shuffle(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }\n' +
            'var seriesList = [], map = {};\n' +
            'for (var y = 0; y < years.length; y++) {\n' +
            '  var ranking = shuffle([1,2,3,4,5,6,7,8,9]);\n' +
            '  for (var n = 0; n < names.length; n++) { if (!map[names[n]]) map[names[n]] = []; map[names[n]].push(ranking[n]); }\n' +
            '}\n' +
            'for (var name in map) seriesList.push({ name: name, symbolSize: 20, type: "line", smooth: true, emphasis: { focus: "series" }, endLabel: { show: true, formatter: "{a}", distance: 20 }, lineStyle: { width: 4 }, data: map[name] });\n' +
            'option = {\n' +
            '  title: { text: "Bump Chart (Ranking)" }, tooltip: { trigger: "item" },\n' +
            '  grid: { left: 30, right: 110, bottom: 30, containLabel: true },\n' +
            '  xAxis: { type: "category", splitLine: { show: true }, boundaryGap: false, data: years },\n' +
            '  yAxis: { type: "value", inverse: true, interval: 1, min: 1, max: names.length },\n' +
            '  series: seriesList\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 8. Temperature Change\n\n' +
            '{{Chart: Temperature\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Temperature Change in the Coming Week" },\n' +
            '  tooltip: { trigger: "axis" }, legend: {},\n' +
            '  xAxis: { type: "category", boundaryGap: false, data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value", axisLabel: { formatter: "{value} °C" } },\n' +
            '  series: [\n' +
            '    { name: "Highest", type: "line", data: [10,11,13,11,12,12,9],\n' +
            '      markPoint: { data: [{ type: "max", name: "Max" }, { type: "min", name: "Min" }] },\n' +
            '      markLine: { data: [{ type: "average", name: "Avg" }] } },\n' +
            '    { name: "Lowest", type: "line", data: [1,-2,2,5,3,2,0],\n' +
            '      markPoint: { data: [{ name: "Low", value: -2, xAxis: 1, yAxis: -1.5 }] },\n' +
            '      markLine: { data: [{ type: "average", name: "Avg" }] } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 9. Area Pieces\n\n' +
            '{{Chart: Area Pieces\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'var data = [["2019-10-10",200],["2019-10-11",560],["2019-10-12",750],["2019-10-13",580],\n' +
            '  ["2019-10-14",250],["2019-10-15",300],["2019-10-16",450],["2019-10-17",300],\n' +
            '  ["2019-10-18",100],["2019-10-19",580],["2019-10-20",350],["2019-10-21",200],\n' +
            '  ["2019-10-22",380],["2019-10-23",510]];\n' +
            'option = {\n' +
            '  xAxis: { type: "category", boundaryGap: false },\n' +
            '  yAxis: { type: "value", boundaryGap: [0, "30%"] },\n' +
            '  visualMap: { type: "piecewise", show: false, dimension: 0, seriesIndex: 0,\n' +
            '    pieces: [{ gt: 1, lt: 3, color: "rgba(0,0,180,0.4)" }, { gt: 5, lt: 7, color: "rgba(0,0,180,0.4)" }] },\n' +
            '  series: [{ type: "line", smooth: 0.6, symbol: "none", lineStyle: { color: "#5470C6", width: 5 },\n' +
            '    areaStyle: {}, data: data }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 10. Line Gradient\n\n' +
            '{{Chart: Line Gradient\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'var data = [["2019-10-10",200],["2019-10-11",560],["2019-10-12",750],["2019-10-13",580],\n' +
            '  ["2019-10-14",250],["2019-10-15",300],["2019-10-16",450],["2019-10-17",300],\n' +
            '  ["2019-10-18",100],["2019-10-19",580],["2019-10-20",350],["2019-10-21",200]];\n' +
            'option = {\n' +
            '  visualMap: [{ show: false, type: "continuous", seriesIndex: 0, min: 0, max: 800 }],\n' +
            '  xAxis: [{ data: data.map(function(d) { return d[0]; }) }],\n' +
            '  yAxis: [{}],\n' +
            '  series: [{ type: "line", showSymbol: false, data: data.map(function(d) { return d[1]; }) }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 11. Distribution of Electricity\n\n' +
            '{{Chart: Electricity Distribution\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Electricity Distribution", subtext: "kWh" },\n' +
            '  tooltip: { trigger: "axis" }, legend: {},\n' +
            '  xAxis: { type: "category", boundaryGap: false, data: ["00:00","03:00","06:00","09:00","12:00","15:00","18:00","21:00"] },\n' +
            '  yAxis: { type: "value", axisLabel: { formatter: "{value} W" } },\n' +
            '  series: [\n' +
            '    { name: "Solar", type: "line", smooth: true, data: [0,0,10,200,450,350,120,0] },\n' +
            '    { name: "Grid", type: "line", smooth: true, data: [300,260,250,150,50,100,350,380] },\n' +
            '    { name: "Consumption", type: "line", smooth: true, data: [300,260,260,350,500,450,380,380] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 12. Rainfall vs Evaporation\n\n' +
            '{{Chart: Rainfall vs Evaporation\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Rainfall vs Evaporation" },\n' +
            '  tooltip: { trigger: "axis" },\n' +
            '  legend: { data: ["Rainfall", "Evaporation"] },\n' +
            '  xAxis: { type: "category", boundaryGap: false, data: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] },\n' +
            '  yAxis: { type: "value", axisLabel: { formatter: "{value} ml" } },\n' +
            '  series: [\n' +
            '    { name: "Rainfall", type: "line", data: [2.6,5.9,9.0,26.4,28.7,70.7,175.6,182.2,48.7,18.8,6.0,2.3], markPoint: { data: [{ type: "max" }, { type: "min" }] } },\n' +
            '    { name: "Evaporation", type: "line", data: [2.0,4.9,7.0,23.2,25.6,76.7,135.6,162.2,32.6,20.0,6.4,3.3], markPoint: { data: [{ type: "max" }, { type: "min" }] } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 13. Multiple X Axes\n\n' +
            '{{Chart: Multiple X Axes\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var colors = ["#5470C6", "#91CC75", "#EE6666"];\n' +
            'option = {\n' +
            '  color: colors, tooltip: { trigger: "none", axisPointer: { type: "cross" } }, legend: {},\n' +
            '  grid: { top: 70, bottom: 50 },\n' +
            '  xAxis: [\n' +
            '    { type: "category", axisTick: { alignWithLabel: true }, axisLine: { onZero: false, lineStyle: { color: colors[2] } }, data: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] },\n' +
            '    { type: "category", axisTick: { alignWithLabel: true }, axisLine: { onZero: false, lineStyle: { color: colors[0] } }, data: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] }\n' +
            '  ],\n' +
            '  yAxis: [{ type: "value" }],\n' +
            '  series: [\n' +
            '    { name: "2015", type: "line", xAxisIndex: 1, smooth: true, emphasis: { focus: "series" }, data: [2.6,5.9,9.0,26.4,28.7,70.7,175.6,182.2,48.7,18.8,6.0,2.3] },\n' +
            '    { name: "2016", type: "line", smooth: true, emphasis: { focus: "series" }, data: [3.9,5.9,11.1,18.7,48.3,69.2,231.6,46.6,55.4,18.4,10.3,0.7] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 14. Step Line\n\n' +
            '{{Chart: Step Line\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Step Line" }, tooltip: { trigger: "axis" },\n' +
            '  legend: { data: ["Step Start","Step Middle","Step End"] },\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [\n' +
            '    { name: "Step Start", type: "line", step: "start", data: [120,132,101,134,90,230,210] },\n' +
            '    { name: "Step Middle", type: "line", step: "middle", data: [220,282,201,234,290,430,410] },\n' +
            '    { name: "Step End", type: "line", step: "end", data: [450,432,401,454,590,530,510] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 15. Log Axis\n\n' +
            '{{Chart: Log Axis\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Log Axis", left: "center" },\n' +
            '  tooltip: { trigger: "item" }, legend: { left: "left" },\n' +
            '  xAxis: { type: "category", name: "x", data: ["1","2","3","4","5","6","7","8"] },\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  yAxis: { type: "log", name: "y" },\n' +
            '  series: [\n' +
            '    { name: "3^x", type: "line", data: [1,3,9,27,81,247,741,2223] },\n' +
            '    { name: "2^x", type: "line", data: [1,2,4,8,16,32,64,128] },\n' +
            '    { name: "1/2^x", type: "line", data: [1,0.5,0.25,0.125,0.0625,0.03125,0.015625,0.0078125] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 16. Function Plot\n\n' +
            '{{Chart: Function Plot\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'function gen(fn) { var d=[]; for(var i=-20;i<=20;i+=0.1) d.push([+i.toFixed(1),+fn(i).toFixed(2)]); return d; }\n' +
            'option = {\n' +
            '  title: { text: "Function Plot" }, tooltip: { trigger: "axis" }, legend: {},\n' +
            '  xAxis: { name: "x", minorTick: { show: true } },\n' +
            '  yAxis: { name: "y", min: -100, max: 100, minorTick: { show: true } },\n' +
            '  series: [\n' +
            '    { name: "sin(x)", type: "line", showSymbol: false, data: gen(Math.sin) },\n' +
            '    { name: "cos(x)", type: "line", showSymbol: false, data: gen(Math.cos) },\n' +
            '    { name: "x²/50", type: "line", showSymbol: false, data: gen(function(x){return x*x/50;}) }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 17. Line Y Category\n\n' +
            '{{Chart: Horizontal Line\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Line Y Category" }, tooltip: { trigger: "axis" }, legend: {},\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: { type: "value" },\n' +
            '  yAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  series: [\n' +
            '    { name: "This Week", type: "line", data: [120,132,101,134,90,230,210] },\n' +
            '    { name: "Last Week", type: "line", data: [220,182,191,234,290,330,310] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 18. Line Style and Item Style\n\n' +
            '{{Chart: Custom Styles\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [{\n' +
            '    data: [120, 200, 150, 80, 70, 110, 130], type: "line", smooth: true,\n' +
            '    lineStyle: { color: "#FF6E76", width: 4, type: "dashed" },\n' +
            '    itemStyle: { borderWidth: 3, borderColor: "#FF6E76", color: "#FDDC6C" }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 19. Line with Marklines\n\n' +
            '{{Chart: Marklines\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Line with Marklines" },\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [{\n' +
            '    data: [150, 230, 224, 218, 135, 147, 260], type: "line",\n' +
            '    markLine: { silent: true, lineStyle: { color: "#333" },\n' +
            '      data: [{ yAxis: 50 }, { yAxis: 100 }, { yAxis: 150 }, { yAxis: 200 }, { yAxis: 300 }] }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 20. Line in Cartesian Coordinate\n\n' +
            '{{Chart: Cartesian Line\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  xAxis: {}, yAxis: {},\n' +
            '  series: [\n' +
            '    { symbolSize: 20, data: [[10.0,8.04],[8.07,6.95],[13.0,7.58],[9.05,8.81],[11.0,8.33],[14.0,7.66],[13.4,6.81],[10.0,6.33],[14.0,8.96],[12.5,6.82],[9.15,7.20],[11.5,7.20],[3.03,4.23],[12.2,7.83],[2.02,4.47],[1.05,3.33],[4.05,4.96],[6.03,7.24],[12.0,6.26],[12.0,8.84],[7.08,5.82],[5.02,5.68]], type: "scatter" },\n' +
            '    { type: "line", smooth: true, data: [[1,3.5],[3,4.5],[5,5.8],[7,6.5],[9,7.2],[11,7.8],[13,7.5],[15,8.0]], showSymbol: false, lineStyle: { width: 3, color: "#EE6666" } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 21. Two Value-Axes in Polar\n\n' +
            '{{Chart: Polar Line\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'var data = [];\n' +
            'for (var i = 0; i <= 100; i++) { var theta = (i/100)*360; data.push([5*(1+Math.sin(theta/180*Math.PI)), theta]); }\n' +
            'option = {\n' +
            '  title: { text: "Two Value-Axes in Polar" },\n' +
            '  polar: { center: ["50%","54%"] },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "cross" } },\n' +
            '  angleAxis: { type: "value", startAngle: 0 },\n' +
            '  radiusAxis: { min: 0 },\n' +
            '  series: [{ coordinateSystem: "polar", name: "line", type: "line", showSymbol: false, data: data }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 22. Share Dataset\n\n' +
            '{{Chart: Shared Dataset\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  legend: {}, tooltip: { trigger: "axis", showContent: false },\n' +
            '  dataset: { source: [\n' +
            '    ["product","2015","2016","2017"],\n' +
            '    ["Matcha Latte",43.3,85.8,93.7],\n' +
            '    ["Milk Tea",83.1,73.4,55.1],\n' +
            '    ["Cheese Cocoa",86.4,65.2,82.5],\n' +
            '    ["Walnut Brownie",72.4,53.9,39.1]\n' +
            '  ]},\n' +
            '  xAxis: { type: "category" }, yAxis: { gridIndex: 0 },\n' +
            '  series: [\n' +
            '    { type: "line", smooth: true, seriesLayoutBy: "row", emphasis: { focus: "series" } },\n' +
            '    { type: "line", smooth: true, seriesLayoutBy: "row", emphasis: { focus: "series" } },\n' +
            '    { type: "line", smooth: true, seriesLayoutBy: "row", emphasis: { focus: "series" } },\n' +
            '    { type: "line", smooth: true, seriesLayoutBy: "row", emphasis: { focus: "series" } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 23. Data Transform Filter\n\n' +
            '{{Chart: Data Transform\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  dataset: [{\n' +
            '    source: [["Year","Country","Income"],[1990,"Germany",20000],[2000,"Germany",25000],[2010,"Germany",35000],[2020,"Germany",42000],\n' +
            '      [1990,"France",18000],[2000,"France",23000],[2010,"France",32000],[2020,"France",38000]]\n' +
            '  },\n' +
            '  { transform: { type: "filter", config: { dimension: "Country", value: "Germany" } } },\n' +
            '  { transform: { type: "filter", config: { dimension: "Country", value: "France" } } }],\n' +
            '  title: { text: "Income by Country" }, tooltip: { trigger: "axis" },\n' +
            '  xAxis: { type: "category", nameLocation: "middle" }, yAxis: { name: "Income" },\n' +
            '  series: [\n' +
            '    { type: "line", datasetIndex: 1, encode: { x: "Year", y: "Income" }, name: "Germany" },\n' +
            '    { type: "line", datasetIndex: 2, encode: { x: "Year", y: "Income" }, name: "France" }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 24. Easing Functions\n\n' +
            '{{Chart: Easing Functions\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'var easings = { linear: function(t){return t;}, quadIn: function(t){return t*t;}, quadOut: function(t){return t*(2-t);}, cubicIn: function(t){return t*t*t;}, cubicOut: function(t){return(--t)*t*t+1;}, sinIn: function(t){return 1-Math.cos(t*Math.PI/2);} };\n' +
            'var series = [];\n' +
            'for (var name in easings) { var data=[]; for(var i=0;i<=50;i++) data.push([i/50,+easings[name](i/50).toFixed(3)]); series.push({name:name,type:"line",showSymbol:false,data:data}); }\n' +
            'option = { title: { text: "Easing Functions" }, tooltip: { trigger: "axis" }, legend: {}, xAxis: { name: "t" }, yAxis: { name: "value" }, series: series };\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 25. Mini Line Charts (Sparklines)\n\n' +
            '{{Chart: Sparkline Matrix\n' +
            '  @type: echart\n' +
            '  @height: 500\n' +
            '  @code: {\n' +
            'function randData() { var d=[]; for(var i=0;i<20;i++) d.push(Math.round(Math.random()*200)); return d; }\n' +
            'var titles = ["Sales","Revenue","Users","Sessions","Bounce","Duration"];\n' +
            'var grids=[], xAxes=[], yAxes=[], sers=[], tits=[];\n' +
            'for (var i=0; i<6; i++) {\n' +
            '  var col=i%3, row=Math.floor(i/3);\n' +
            '  grids.push({left:(col*33+5)+"%",top:(row*45+10)+"%",width:"25%",height:"30%"});\n' +
            '  xAxes.push({type:"category",gridIndex:i,show:false,data:randData().map(function(d,j){return j;})});\n' +
            '  yAxes.push({type:"value",gridIndex:i,show:false});\n' +
            '  tits.push({text:titles[i],left:(col*33+10)+"%",top:(row*45+5)+"%",textStyle:{fontSize:14}});\n' +
            '  sers.push({type:"line",smooth:true,symbol:"none",xAxisIndex:i,yAxisIndex:i,data:randData(),areaStyle:{opacity:0.3}});\n' +
            '}\n' +
            'option = { title: tits, grid: grids, xAxis: xAxes, yAxis: yAxes, series: sers };\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '> **Note:** Some ECharts line examples (Large Scale, Beijing AQI, Confidence Band, Dynamic Data, Line Race, Draggable Points, Fisheye, Intraday, Click to Add) require external data, event handlers, or timers and cannot be used in `@code: {}` mode. The 25 examples above cover all compatible line variations.\n'
    }
];
