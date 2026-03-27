// ============================================
// templates/charts-bar-gallery.js — Bar Chart Gallery
// 25 bar chart variations from ECharts gallery
// ============================================
window.__MDV_TEMPLATES_BAR_GALLERY = [
    {
        name: 'Bar Chart Gallery (25 Types)',
        category: 'charts',
        icon: 'bi-bar-chart-fill',
        description: 'Complete Bar chart gallery — 25 variations (stacked, polar, waterfall, negative, drilldown & more)',
        content: '# 📊 Bar Chart Gallery\n\n' +
            '> Every bar chart variation from the [ECharts Gallery](https://echarts.apache.org/examples/en/index.html#chart-type-bar) — copy-paste ready.\n\n---\n\n' +

            '## 1. Basic Bar\n\n' +
            '{{Chart: Basic Bar\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [{ data: [120, 200, 150, 80, 70, 110, 130], type: "bar" }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 2. Axis Align with Tick\n\n' +
            '{{Chart: Axis Align\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: [{ type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], axisTick: { alignWithLabel: true } }],\n' +
            '  yAxis: [{ type: "value" }],\n' +
            '  series: [{ name: "Direct", type: "bar", barWidth: "60%", data: [10,52,200,334,390,330,220] }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 3. Bar with Background\n\n' +
            '{{Chart: Bar Background\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [{\n' +
            '    data: [120, 200, 150, 80, 70, 110, 130], type: "bar",\n' +
            '    showBackground: true, backgroundStyle: { color: "rgba(180,180,180,0.2)" }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 4. Set Style of Single Bar\n\n' +
            '{{Chart: Single Bar Style\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [{\n' +
            '    type: "bar",\n' +
            '    data: [\n' +
            '      120, { value: 200, itemStyle: { color: "#a90000" } }, 150, 80, 70,\n' +
            '      110, 130\n' +
            '    ]\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 5. Waterfall Chart\n\n' +
            '{{Chart: Waterfall\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Waterfall Chart", subtext: "Living Expenses" },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "shadow" },\n' +
            '    formatter: function(params) { var tar = params[1]; return tar.name + "<br/>" + tar.seriesName + " : " + tar.value; } },\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: { type: "category", splitLine: { show: false }, data: ["Total","Rent","Utilities","Transport","Meals","Other"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [\n' +
            '    { name: "Placeholder", type: "bar", stack: "Total", silent: true,\n' +
            '      itemStyle: { borderColor: "transparent", color: "transparent" },\n' +
            '      emphasis: { itemStyle: { borderColor: "transparent", color: "transparent" } },\n' +
            '      data: [0,1700,1400,1200,300,0] },\n' +
            '    { name: "Life Cost", type: "bar", stack: "Total",\n' +
            '      label: { show: true, position: "inside" },\n' +
            '      data: [2900,1200,300,200,900,300] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 6. Bar with Negative Value\n\n' +
            '{{Chart: Negative Values\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Bar Chart with Negative Value" },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },\n' +
            '  legend: { data: ["Profit", "Expenses", "Income"] },\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: [{ type: "value" }],\n' +
            '  yAxis: [{ type: "category", axisTick: { show: false }, data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] }],\n' +
            '  series: [\n' +
            '    { name: "Profit", type: "bar", stack: "Total", label: { show: true }, emphasis: { focus: "series" }, data: [200,170,240,244,200,220,210] },\n' +
            '    { name: "Income", type: "bar", stack: "Total", label: { show: true }, emphasis: { focus: "series" }, data: [320,302,341,374,390,450,420] },\n' +
            '    { name: "Expenses", type: "bar", stack: "Total", label: { show: true }, emphasis: { focus: "series" }, data: [-120,-132,-101,-134,-190,-230,-210] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 7. Radial Polar Bar\n\n' +
            '{{Chart: Radial Polar Bar\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Radial Polar Bar Label Position" },\n' +
            '  polar: { radius: [30, "80%"] },\n' +
            '  radiusAxis: { max: 4 },\n' +
            '  angleAxis: { type: "category", data: ["a","b","c","d"], startAngle: 75 },\n' +
            '  tooltip: {},\n' +
            '  series: {\n' +
            '    type: "bar", data: [2, 1.2, 2.4, 3.6],\n' +
            '    coordinateSystem: "polar",\n' +
            '    label: { show: true, position: "middle", formatter: "{b}: {c}" }\n' +
            '  }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 8. Tangential Polar Bar\n\n' +
            '{{Chart: Tangential Polar\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Tangential Polar Bar" },\n' +
            '  polar: { radius: [30, "80%"] },\n' +
            '  angleAxis: { max: 4, startAngle: 75 },\n' +
            '  radiusAxis: { type: "category", data: ["a","b","c","d"] },\n' +
            '  tooltip: {},\n' +
            '  series: {\n' +
            '    type: "bar", data: [2, 1.2, 2.4, 3.6],\n' +
            '    coordinateSystem: "polar",\n' +
            '    label: { show: true, position: "middle", formatter: "{b}: {c}" }\n' +
            '  }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 9. World Population\n\n' +
            '{{Chart: World Population\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "World Population (2011)", subtext: "Data from World Bank" },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },\n' +
            '  legend: {},\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: { type: "value", boundaryGap: [0, 0.01] },\n' +
            '  yAxis: { type: "category", data: ["Brazil","Indonesia","USA","India","China","World"] },\n' +
            '  series: [\n' +
            '    { name: "2011", type: "bar", data: [18203,23489,29034,104970,131744,630230] },\n' +
            '    { name: "2012", type: "bar", data: [19325,23438,31000,121594,134141,681807] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 10. Clickable Column with Gradient\n\n' +
            '{{Chart: Gradient Columns\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var dataAxis = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T"];\n' +
            'var data = [220,182,191,234,290,330,310,123,442,321,90,149,210,122,133,334,198,123,125,220];\n' +
            'option = {\n' +
            '  title: { text: "Gradient Bar" },\n' +
            '  xAxis: { data: dataAxis, axisLabel: { inside: true }, axisTick: { show: false }, z: 10 },\n' +
            '  yAxis: { axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "#999" } },\n' +
            '  dataZoom: [{ type: "inside" }],\n' +
            '  series: [{\n' +
            '    type: "bar", showBackground: true,\n' +
            '    itemStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#83bff6" }, { offset: 0.5, color: "#188df0" }, { offset: 1, color: "#188df0" }] } },\n' +
            '    emphasis: { itemStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#2378f7" }, { offset: 0.7, color: "#2378f7" }, { offset: 1, color: "#83bff6" }] } } },\n' +
            '    data: data\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 11. Bar Label Rotation\n\n' +
            '{{Chart: Label Rotation\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'var labelRight = { position: "right" };\n' +
            'option = {\n' +
            '  title: { text: "Bar Label Rotation", subtext: "Positive/Negative Split" },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },\n' +
            '  grid: { top: 80, bottom: 30 },\n' +
            '  xAxis: { type: "value", position: "top", splitLine: { lineStyle: { type: "dashed" } } },\n' +
            '  yAxis: { type: "category", axisLine: { show: false }, axisLabel: { show: false }, axisTick: { show: false }, splitLine: { show: false },\n' +
            '    data: ["ten","nine","eight","seven","six","five","four","three","two","one"] },\n' +
            '  series: [{ name: "Cost", type: "bar", stack: "Total", label: { show: true, formatter: "{b}" },\n' +
            '    data: [-0.07,-0.09,0.2,0.44,-0.23,0.08,-0.17,0.47,-0.36,0.18] }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 12. Stacked Column Chart\n\n' +
            '{{Chart: Stacked Columns\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },\n' +
            '  legend: {},\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: [{ type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] }],\n' +
            '  yAxis: [{ type: "value" }],\n' +
            '  series: [\n' +
            '    { name: "Direct", type: "bar", emphasis: { focus: "series" }, data: [320,332,301,334,390,330,320] },\n' +
            '    { name: "Mail Ad", type: "bar", stack: "Ad", emphasis: { focus: "series" }, data: [120,132,101,134,90,230,210] },\n' +
            '    { name: "Affiliate Ad", type: "bar", stack: "Ad", emphasis: { focus: "series" }, data: [220,182,191,234,290,330,310] },\n' +
            '    { name: "Video Ad", type: "bar", stack: "Ad", emphasis: { focus: "series" }, data: [150,232,201,154,190,330,410] },\n' +
            '    { name: "Search", type: "bar", data: [862,1018,964,1026,1679,1600,1570], emphasis: { focus: "series" }, markLine: { lineStyle: { type: "dashed" }, data: [[{ type: "min" }, { type: "max" }]] } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 13. Stacked Bar with borderRadius\n\n' +
            '{{Chart: Rounded Stacked\n' +
            '  @type: echart\n' +
            '  @height: 350\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  yAxis: { type: "value" },\n' +
            '  series: [\n' +
            '    { data: [120,200,150,80,70,110,130], type: "bar", stack: "a", name: "a", itemStyle: { borderRadius: [0,0,0,0] } },\n' +
            '    { data: [10,46,64,-20,-4,28,26], type: "bar", stack: "a", name: "b" },\n' +
            '    { data: [30,-20,18,35,30,20,35], type: "bar", stack: "a", name: "c", itemStyle: { borderRadius: [5,5,0,0] } }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 14. Stacked Bar Normalization\n\n' +
            '{{Chart: 100% Stacked\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var rawData = [[100,302,301,334,390,330,320],[120,132,101,134,90,230,210],[220,182,191,234,290,330,310],[150,212,201,154,190,330,410],[820,832,901,934,1290,1330,1320]];\n' +
            'var totalData = [];\n' +
            'for (var i = 0; i < rawData[0].length; i++) { var sum = 0; for (var j = 0; j < rawData.length; j++) sum += rawData[j][i]; totalData.push(sum); }\n' +
            'var names = ["Direct","Mail Ad","Affiliate","Video","Search"];\n' +
            'var series = names.map(function(name, sid) {\n' +
            '  return { name: name, type: "bar", stack: "total", barWidth: "60%", emphasis: { focus: "series" },\n' +
            '    label: { show: true, formatter: function(p) { return Math.round(p.value / totalData[p.dataIndex] * 100) + "%"; } },\n' +
            '    data: rawData[sid] };\n' +
            '});\n' +
            'option = {\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } }, legend: {},\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  yAxis: { type: "value" },\n' +
            '  xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  series: series\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 15. Stacked Horizontal Bar\n\n' +
            '{{Chart: Horizontal Stacked\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },\n' +
            '  legend: {},\n' +
            '  grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: { type: "value" },\n' +
            '  yAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  series: [\n' +
            '    { name: "Direct", type: "bar", stack: "total", label: { show: true }, emphasis: { focus: "series" }, data: [320,302,301,334,390,330,320] },\n' +
            '    { name: "Mail Ad", type: "bar", stack: "total", label: { show: true }, emphasis: { focus: "series" }, data: [120,132,101,134,90,230,210] },\n' +
            '    { name: "Affiliate", type: "bar", stack: "total", label: { show: true }, emphasis: { focus: "series" }, data: [220,182,191,234,290,330,310] },\n' +
            '    { name: "Video Ad", type: "bar", stack: "total", label: { show: true }, emphasis: { focus: "series" }, data: [150,212,201,154,190,330,410] },\n' +
            '    { name: "Search", type: "bar", stack: "total", label: { show: true }, emphasis: { focus: "series" }, data: [820,832,901,934,1290,1330,1320] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 16. Rainfall and Evaporation\n\n' +
            '{{Chart: Rainfall Evaporation\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Rainfall and Evaporation" },\n' +
            '  tooltip: { trigger: "axis" },\n' +
            '  legend: { data: ["Rainfall","Evaporation"] },\n' +
            '  xAxis: [{ type: "category", data: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] }],\n' +
            '  yAxis: [{ type: "value", name: "Rainfall (ml)" }, { type: "value", name: "Evaporation (ml)" }],\n' +
            '  series: [\n' +
            '    { name: "Rainfall", type: "bar", data: [2.0,4.9,7.0,23.2,25.6,76.7,135.6,162.2,32.6,20.0,6.4,3.3] },\n' +
            '    { name: "Evaporation", type: "bar", data: [2.6,5.9,9.0,26.4,28.7,70.7,175.6,182.2,48.7,18.8,6.0,2.3] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 17. Mixed Line and Bar\n\n' +
            '{{Chart: Mixed Line Bar\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "cross", crossStyle: { color: "#999" } } },\n' +
            '  legend: { data: ["Evaporation","Precipitation","Temperature"] },\n' +
            '  xAxis: [{ type: "category", data: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], axisPointer: { type: "shadow" } }],\n' +
            '  yAxis: [{ type: "value", name: "Precipitation", axisLabel: { formatter: "{value} ml" } }, { type: "value", name: "Temperature", axisLabel: { formatter: "{value} °C" } }],\n' +
            '  series: [\n' +
            '    { name: "Evaporation", type: "bar", data: [2.0,4.9,7.0,23.2,25.6,76.7,135.6,162.2,32.6,20.0,6.4,3.3] },\n' +
            '    { name: "Precipitation", type: "bar", data: [2.6,5.9,9.0,26.4,28.7,70.7,175.6,182.2,48.7,18.8,6.0,2.3] },\n' +
            '    { name: "Temperature", type: "line", yAxisIndex: 1, data: [2.0,2.2,3.3,4.5,6.3,10.2,20.3,23.4,23.0,16.5,12.0,6.2] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 18. Multiple Y Axes\n\n' +
            '{{Chart: Multiple Y Axes\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var colors = ["#5470C6","#91CC75","#EE6666"];\n' +
            'option = {\n' +
            '  color: colors, tooltip: { trigger: "axis", axisPointer: { type: "cross" } }, legend: {},\n' +
            '  grid: { right: "20%" },\n' +
            '  xAxis: [{ type: "category", axisTick: { alignWithLabel: true }, data: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] }],\n' +
            '  yAxis: [\n' +
            '    { type: "value", name: "Evaporation", position: "right", axisLine: { lineStyle: { color: colors[0] } }, axisLabel: { formatter: "{value} ml" } },\n' +
            '    { type: "value", name: "Precipitation", position: "right", offset: 80, axisLine: { lineStyle: { color: colors[1] } }, axisLabel: { formatter: "{value} ml" } },\n' +
            '    { type: "value", name: "Temperature", position: "left", axisLine: { lineStyle: { color: colors[2] } }, axisLabel: { formatter: "{value} °C" } }\n' +
            '  ],\n' +
            '  series: [\n' +
            '    { name: "Evaporation", type: "bar", data: [2.0,4.9,7.0,23.2,25.6,76.7,135.6,162.2,32.6,20.0,6.4,3.3] },\n' +
            '    { name: "Precipitation", type: "bar", yAxisIndex: 1, data: [2.6,5.9,9.0,26.4,28.7,70.7,175.6,182.2,48.7,18.8,6.0,2.3] },\n' +
            '    { name: "Temperature", type: "line", yAxisIndex: 2, data: [2.0,2.2,3.3,4.5,6.3,10.2,20.3,23.4,23.0,16.5,12.0,6.2] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 19. Polar Bar Chart\n\n' +
            '{{Chart: Polar Bar\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Bar Chart on Polar" },\n' +
            '  angleAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },\n' +
            '  radiusAxis: {},\n' +
            '  polar: {},\n' +
            '  series: [{ type: "bar", data: [1,2,3,4,3,5,1], coordinateSystem: "polar", name: "A", stack: "a" },\n' +
            '    { type: "bar", data: [2,4,6,1,3,2,1], coordinateSystem: "polar", name: "B", stack: "a" },\n' +
            '    { type: "bar", data: [1,2,3,4,1,2,5], coordinateSystem: "polar", name: "C", stack: "a" }],\n' +
            '  legend: { show: true, data: ["A","B","C"] }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 20. Stacked Bar on Polar\n\n' +
            '{{Chart: Stacked Polar\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  angleAxis: {},\n' +
            '  radiusAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri"], z: 10 },\n' +
            '  polar: {},\n' +
            '  series: [\n' +
            '    { type: "bar", data: [1,2,3,4,5], coordinateSystem: "polar", name: "A", stack: "a" },\n' +
            '    { type: "bar", data: [2,4,6,1,3], coordinateSystem: "polar", name: "B", stack: "a" },\n' +
            '    { type: "bar", data: [1,2,3,4,1], coordinateSystem: "polar", name: "C", stack: "a" }\n' +
            '  ],\n' +
            '  legend: { show: true, data: ["A","B","C"] }\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 21. Rounded Bar on Polar\n\n' +
            '{{Chart: Rounded Polar Bar\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  angleAxis: { max: 2, startAngle: 30, splitLine: { show: false } },\n' +
            '  radiusAxis: { type: "category", data: ["v","w","x","y","z"], z: 10 },\n' +
            '  polar: {},\n' +
            '  series: [{\n' +
            '    type: "bar", data: [4,3,2,1,0.5], coordinateSystem: "polar", name: "A",\n' +
            '    roundCap: true, itemStyle: { borderColor: "green", opacity: 0.8, borderWidth: 1 }\n' +
            '  }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 22. Sort Data in Bar Chart\n\n' +
            '{{Chart: Sorted Bar\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'var data = [{ name: "Chrome", value: 63 }, { name: "Safari", value: 19 }, { name: "Firefox", value: 4 }, { name: "Edge", value: 4 }, { name: "Opera", value: 3 }, { name: "Samsung", value: 3 }, { name: "Other", value: 4 }];\n' +
            'data.sort(function(a, b) { return a.value - b.value; });\n' +
            'option = {\n' +
            '  title: { text: "Browser Market Share (Sorted)" },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },\n' +
            '  grid: { left: "3%", right: "10%", bottom: "3%", containLabel: true },\n' +
            '  xAxis: { type: "value" },\n' +
            '  yAxis: { type: "category", data: data.map(function(d) { return d.name; }) },\n' +
            '  series: [{ type: "bar", data: data.map(function(d) { return d.value; }),\n' +
            '    label: { show: true, position: "right", formatter: "{c}%" } }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 23. Dataset Simple Example\n\n' +
            '{{Chart: Dataset Bar\n' +
            '  @type: echart\n' +
            '  @height: 380\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  legend: {},\n' +
            '  tooltip: {},\n' +
            '  dataset: {\n' +
            '    source: [\n' +
            '      ["product","2015","2016","2017"],\n' +
            '      ["Matcha Latte",43.3,85.8,93.7],\n' +
            '      ["Milk Tea",83.1,73.4,55.1],\n' +
            '      ["Cheese Cocoa",86.4,65.2,82.5],\n' +
            '      ["Walnut Brownie",72.4,53.9,39.1]\n' +
            '    ]\n' +
            '  },\n' +
            '  xAxis: { type: "category" },\n' +
            '  yAxis: {},\n' +
            '  series: [{ type: "bar" }, { type: "bar" }, { type: "bar" }]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 24. Series Layout By Column or Row\n\n' +
            '{{Chart: Series Layout\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  legend: {},\n' +
            '  tooltip: {},\n' +
            '  dataset: {\n' +
            '    source: [\n' +
            '      ["product","2012","2013","2014","2015"],\n' +
            '      ["Matcha Latte",41.1,30.4,65.1,53.3],\n' +
            '      ["Milk Tea",86.5,92.1,85.7,83.1],\n' +
            '      ["Cheese Cocoa",24.1,67.2,79.5,86.4]\n' +
            '    ]\n' +
            '  },\n' +
            '  xAxis: [{ type: "category", gridIndex: 0 }, { type: "category", gridIndex: 1 }],\n' +
            '  yAxis: [{ gridIndex: 0 }, { gridIndex: 1 }],\n' +
            '  grid: [{ bottom: "55%" }, { top: "55%" }],\n' +
            '  series: [\n' +
            '    { type: "bar", seriesLayoutBy: "row" },\n' +
            '    { type: "bar", seriesLayoutBy: "row" },\n' +
            '    { type: "bar", seriesLayoutBy: "row" },\n' +
            '    { type: "bar", xAxisIndex: 1, yAxisIndex: 1 },\n' +
            '    { type: "bar", xAxisIndex: 1, yAxisIndex: 1 },\n' +
            '    { type: "bar", xAxisIndex: 1, yAxisIndex: 1 },\n' +
            '    { type: "bar", xAxisIndex: 1, yAxisIndex: 1 }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '## 25. Weather Statistics\n\n' +
            '{{Chart: Weather Stats\n' +
            '  @type: echart\n' +
            '  @height: 400\n' +
            '  @code: {\n' +
            'option = {\n' +
            '  title: { text: "Weather Statistics" },\n' +
            '  tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },\n' +
            '  legend: { data: ["City Alpha","City Beta"] },\n' +
            '  xAxis: [{ type: "value" }],\n' +
            '  yAxis: [{ type: "category", axisTick: { show: false },\n' +
            '    data: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] }],\n' +
            '  series: [\n' +
            '    { name: "City Alpha", type: "bar", label: { show: true, position: "inside" },\n' +
            '      emphasis: { focus: "series" }, data: [165,170,130,200,250,290,310,280,220,190,150,140] },\n' +
            '    { name: "City Beta", type: "bar", label: { show: true, position: "inside" },\n' +
            '      emphasis: { focus: "series" }, data: [-120,-140,-100,-150,-200,-250,-280,-260,-200,-150,-110,-100] }\n' +
            '  ]\n' +
            '};\n' +
            '  }\n' +
            '}}\n\n---\n\n' +

            '> **Note:** Some ECharts bar examples (Bar Race, Drilldown Animation, Large Scale, Dynamic Data, Brush Select, Finance Indices, Watermark) require timers, event handlers, or external data and cannot be used in `@code: {}` mode. The 25 examples above cover all compatible bar variations.\n'
    }
];
