// ============================================
// templates/quiz.js — Quiz & Assessment Templates
// ============================================
window.__MDV_TEMPLATES_QUIZ = [
    {
        name: 'Interactive Quiz',
        category: 'quiz',
        icon: 'bi-patch-question',
        description: 'Full interactive quiz with MCQ, True/False, Fill-in-the-Blanks, Match, and Arrange questions',
        content: '# 📝 Interactive Quiz\n\n' +
            '> Test your knowledge! This quiz uses MDview\'s **HTML sandbox** to create a fully interactive assessment.\n\n' +
            '---\n\n' +
            '```html-autorun\n' +
            '<style>\n' +
            '  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '  body { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; line-height: 1.6; }\n' +
            '  h1 { text-align: center; font-size: 2em; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }\n' +
            '  .subtitle { text-align: center; color: #94a3b8; margin-bottom: 32px; font-size: 1.05em; }\n' +
            '  .section { background: #1e293b; border-radius: 16px; padding: 28px; margin-bottom: 24px; border: 1px solid #334155; }\n' +
            '  .section-title { font-size: 1.25em; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; color: #f1f5f9; }\n' +
            '  .section-title .icon { font-size: 1.4em; }\n' +
            '  .q-card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 16px; transition: border-color .2s; }\n' +
            '  .q-card:hover { border-color: #818cf8; }\n' +
            '  .q-label { font-weight: 600; font-size: 1.05em; margin-bottom: 14px; color: #f8fafc; }\n' +
            '  .q-num { display: inline-block; background: #818cf8; color: #fff; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-size: .85em; margin-right: 8px; }\n' +
            '  /* MCQ & T/F radio options */\n' +
            '  .options label { display: flex; align-items: center; padding: 10px 14px; margin: 6px 0; border-radius: 10px; cursor: pointer; border: 1px solid #334155; transition: all .2s; gap: 10px; }\n' +
            '  .options label:hover { background: #1e293b; border-color: #818cf8; }\n' +
            '  .options input[type="radio"] { accent-color: #818cf8; width: 18px; height: 18px; }\n' +
            '  /* Fill-in-blank inputs */\n' +
            '  .blank-input { background: transparent; border: none; border-bottom: 2px dashed #64748b; color: #f1f5f9; font-size: 1em; padding: 4px 8px; width: 180px; outline: none; transition: border-color .2s; }\n' +
            '  .blank-input:focus { border-color: #818cf8; }\n' +
            '  /* Match columns */\n' +
            '  .match-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: center; }\n' +
            '  .match-item { padding: 10px 14px; border-radius: 10px; border: 1px solid #334155; text-align: center; font-weight: 500; }\n' +
            '  .match-left { background: #1e1b4b; border-color: #6366f1; }\n' +
            '  .match-select { background: #0f172a; color: #e2e8f0; border: 1px solid #475569; border-radius: 8px; padding: 8px 12px; font-size: .95em; cursor: pointer; }\n' +
            '  .match-arrow { color: #64748b; font-size: 1.3em; }\n' +
            '  /* Arrange (sortable) */\n' +
            '  .arrange-list { list-style: none; counter-reset: arrange; }\n' +
            '  .arrange-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin: 6px 0; border-radius: 10px; border: 1px solid #334155; background: #0f172a; cursor: grab; user-select: none; transition: all .2s; }\n' +
            '  .arrange-item:active { cursor: grabbing; border-color: #818cf8; background: #1e1b4b; }\n' +
            '  .arrange-handle { color: #64748b; font-size: 1.2em; }\n' +
            '  .arrange-item.drag-over { border-color: #c084fc; background: #1e1b4b; }\n' +
            '  /* Buttons */\n' +
            '  .btn { padding: 10px 24px; border: none; border-radius: 10px; font-weight: 600; font-size: .95em; cursor: pointer; transition: all .2s; }\n' +
            '  .btn-check { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }\n' +
            '  .btn-check:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(99,102,241,.4); }\n' +
            '  .btn-reset { background: #334155; color: #e2e8f0; margin-left: 10px; }\n' +
            '  .btn-reset:hover { background: #475569; }\n' +
            '  .btn-bar { margin-top: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }\n' +
            '  /* Feedback */\n' +
            '  .fb { font-size: .9em; padding: 4px 12px; border-radius: 6px; margin-top: 8px; display: none; font-weight: 500; }\n' +
            '  .fb.correct { display: block; background: #064e3b; color: #6ee7b7; }\n' +
            '  .fb.wrong { display: block; background: #7f1d1d; color: #fca5a5; }\n' +
            '  /* Scoreboard */\n' +
            '  .scoreboard { text-align: center; padding: 32px; background: linear-gradient(135deg, #1e1b4b, #312e81); border-radius: 16px; margin-top: 12px; border: 1px solid #4f46e5; }\n' +
            '  .score-big { font-size: 3.5em; font-weight: 800; background: linear-gradient(135deg, #818cf8, #c084fc, #f0abfc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n' +
            '  .score-label { color: #a5b4fc; font-size: 1.1em; margin-top: 4px; }\n' +
            '  .score-bar { height: 10px; border-radius: 5px; background: #334155; margin: 20px auto; max-width: 300px; overflow: hidden; }\n' +
            '  .score-fill { height: 100%; border-radius: 5px; background: linear-gradient(90deg, #6366f1, #c084fc); transition: width .6s ease; }\n' +
            '  .hidden { display: none; }\n' +
            '</style>\n\n' +
            '<h1>📝 Knowledge Quiz</h1>\n' +
            '<p class="subtitle">Answer all questions, then check your score!</p>\n\n' +
            '<!-- ─── SECTION 1: MCQ ───────────────────────── -->\n' +
            '<div class="section">\n' +
            '  <div class="section-title"><span class="icon">🔘</span> Multiple Choice</div>\n\n' +
            '  <div class="q-card" id="mcq1">\n' +
            '    <div class="q-label"><span class="q-num">1</span> What does HTML stand for?</div>\n' +
            '    <div class="options">\n' +
            '      <label><input type="radio" name="mcq1" value="a"> Hyper Trainer Marking Language</label>\n' +
            '      <label><input type="radio" name="mcq1" value="b"> Hyper Text Markup Language</label>\n' +
            '      <label><input type="radio" name="mcq1" value="c"> Hyper Text Marketing Language</label>\n' +
            '      <label><input type="radio" name="mcq1" value="d"> High Tech Modern Language</label>\n' +
            '    </div>\n' +
            '    <div class="fb" id="fb-mcq1"></div>\n' +
            '  </div>\n\n' +
            '  <div class="q-card" id="mcq2">\n' +
            '    <div class="q-label"><span class="q-num">2</span> Which planet is known as the Red Planet?</div>\n' +
            '    <div class="options">\n' +
            '      <label><input type="radio" name="mcq2" value="a"> Venus</label>\n' +
            '      <label><input type="radio" name="mcq2" value="b"> Jupiter</label>\n' +
            '      <label><input type="radio" name="mcq2" value="c"> Mars</label>\n' +
            '      <label><input type="radio" name="mcq2" value="d"> Saturn</label>\n' +
            '    </div>\n' +
            '    <div class="fb" id="fb-mcq2"></div>\n' +
            '  </div>\n\n' +
            '  <div class="q-card" id="mcq3">\n' +
            '    <div class="q-label"><span class="q-num">3</span> What is the time complexity of binary search?</div>\n' +
            '    <div class="options">\n' +
            '      <label><input type="radio" name="mcq3" value="a"> O(n)</label>\n' +
            '      <label><input type="radio" name="mcq3" value="b"> O(log n)</label>\n' +
            '      <label><input type="radio" name="mcq3" value="c"> O(n²)</label>\n' +
            '      <label><input type="radio" name="mcq3" value="d"> O(1)</label>\n' +
            '    </div>\n' +
            '    <div class="fb" id="fb-mcq3"></div>\n' +
            '  </div>\n' +
            '</div>\n\n' +
            '<!-- ─── SECTION 2: TRUE / FALSE ────────────── -->\n' +
            '<div class="section">\n' +
            '  <div class="section-title"><span class="icon">✅</span> True or False</div>\n\n' +
            '  <div class="q-card" id="tf1">\n' +
            '    <div class="q-label"><span class="q-num">4</span> The speed of light is approximately 300,000 km/s</div>\n' +
            '    <div class="options">\n' +
            '      <label><input type="radio" name="tf1" value="t"> ✅ True</label>\n' +
            '      <label><input type="radio" name="tf1" value="f"> ❌ False</label>\n' +
            '    </div>\n' +
            '    <div class="fb" id="fb-tf1"></div>\n' +
            '  </div>\n\n' +
            '  <div class="q-card" id="tf2">\n' +
            '    <div class="q-label"><span class="q-num">5</span> JavaScript is a compiled language</div>\n' +
            '    <div class="options">\n' +
            '      <label><input type="radio" name="tf2" value="t"> ✅ True</label>\n' +
            '      <label><input type="radio" name="tf2" value="f"> ❌ False</label>\n' +
            '    </div>\n' +
            '    <div class="fb" id="fb-tf2"></div>\n' +
            '  </div>\n\n' +
            '  <div class="q-card" id="tf3">\n' +
            '    <div class="q-label"><span class="q-num">6</span> Water boils at 100°C at sea level</div>\n' +
            '    <div class="options">\n' +
            '      <label><input type="radio" name="tf3" value="t"> ✅ True</label>\n' +
            '      <label><input type="radio" name="tf3" value="f"> ❌ False</label>\n' +
            '    </div>\n' +
            '    <div class="fb" id="fb-tf3"></div>\n' +
            '  </div>\n' +
            '</div>\n\n' +
            '<!-- ─── SECTION 3: FILL IN THE BLANKS ───────── -->\n' +
            '<div class="section">\n' +
            '  <div class="section-title"><span class="icon">✏️</span> Fill in the Blanks</div>\n\n' +
            '  <div class="q-card" id="fib1">\n' +
            '    <div class="q-label"><span class="q-num">7</span> The chemical symbol for water is <input class="blank-input" id="fib1-ans" placeholder="________" autocomplete="off"></div>\n' +
            '    <div class="fb" id="fb-fib1"></div>\n' +
            '  </div>\n\n' +
            '  <div class="q-card" id="fib2">\n' +
            '    <div class="q-label"><span class="q-num">8</span> The largest ocean on Earth is the <input class="blank-input" id="fib2-ans" placeholder="________" autocomplete="off"> Ocean</div>\n' +
            '    <div class="fb" id="fb-fib2"></div>\n' +
            '  </div>\n\n' +
            '  <div class="q-card" id="fib3">\n' +
            '    <div class="q-label"><span class="q-num">9</span> In CSS, <input class="blank-input" id="fib3-ans" placeholder="________" autocomplete="off"> is used to make text bold</div>\n' +
            '    <div class="fb" id="fb-fib3"></div>\n' +
            '  </div>\n' +
            '</div>\n\n' +
            '<!-- ─── SECTION 4: MATCH THE FOLLOWING ─────── -->\n' +
            '<div class="section">\n' +
            '  <div class="section-title"><span class="icon">🔗</span> Match the Following</div>\n' +
            '  <p style="color:#94a3b8;margin-bottom:16px;">Select the correct match from each dropdown.</p>\n\n' +
            '  <div class="q-card" id="match-card">\n' +
            '    <div class="match-grid">\n' +
            '      <div class="match-item match-left">🐍 Python</div>\n' +
            '      <span class="match-arrow">→</span>\n' +
            '      <select class="match-select" id="m1"><option value="">Select…</option><option value="a">Systems programming</option><option value="b">Scripting & AI/ML</option><option value="c">iOS development</option><option value="d">Database queries</option></select>\n\n' +
            '      <div class="match-item match-left">🦀 Rust</div>\n' +
            '      <span class="match-arrow">→</span>\n' +
            '      <select class="match-select" id="m2"><option value="">Select…</option><option value="a">Systems programming</option><option value="b">Scripting & AI/ML</option><option value="c">iOS development</option><option value="d">Database queries</option></select>\n\n' +
            '      <div class="match-item match-left">🍎 Swift</div>\n' +
            '      <span class="match-arrow">→</span>\n' +
            '      <select class="match-select" id="m3"><option value="">Select…</option><option value="a">Systems programming</option><option value="b">Scripting & AI/ML</option><option value="c">iOS development</option><option value="d">Database queries</option></select>\n\n' +
            '      <div class="match-item match-left">🗄️ SQL</div>\n' +
            '      <span class="match-arrow">→</span>\n' +
            '      <select class="match-select" id="m4"><option value="">Select…</option><option value="a">Systems programming</option><option value="b">Scripting & AI/ML</option><option value="c">iOS development</option><option value="d">Database queries</option></select>\n' +
            '    </div>\n' +
            '    <div class="fb" id="fb-match"></div>\n' +
            '  </div>\n' +
            '</div>\n\n' +
            '<!-- ─── SECTION 5: ARRANGE IN ORDER ──────────── -->\n' +
            '<div class="section">\n' +
            '  <div class="section-title"><span class="icon">🔢</span> Arrange in Order</div>\n' +
            '  <p style="color:#94a3b8;margin-bottom:16px;">Drag and drop to arrange the planets from the Sun outward (closest → farthest).</p>\n\n' +
            '  <div class="q-card" id="arrange-card">\n' +
            '    <ul class="arrange-list" id="arrange-list">\n' +
            '      <li class="arrange-item" draggable="true" data-val="earth"><span class="arrange-handle">☰</span> 🌍 Earth</li>\n' +
            '      <li class="arrange-item" draggable="true" data-val="mars"><span class="arrange-handle">☰</span> 🔴 Mars</li>\n' +
            '      <li class="arrange-item" draggable="true" data-val="mercury"><span class="arrange-handle">☰</span> 🪨 Mercury</li>\n' +
            '      <li class="arrange-item" draggable="true" data-val="venus"><span class="arrange-handle">☰</span> 🌤️ Venus</li>\n' +
            '    </ul>\n' +
            '    <div class="fb" id="fb-arrange"></div>\n' +
            '  </div>\n' +
            '</div>\n\n' +
            '<!-- ─── BUTTONS & SCOREBOARD ─────────────────── -->\n' +
            '<div class="btn-bar">\n' +
            '  <button class="btn btn-check" onclick="checkAll()">✅ Check Answers</button>\n' +
            '  <button class="btn btn-reset" onclick="resetAll()">🔄 Reset Quiz</button>\n' +
            '</div>\n\n' +
            '<div class="scoreboard hidden" id="scoreboard">\n' +
            '  <div class="score-big" id="score-display">0%</div>\n' +
            '  <div class="score-label" id="score-text">0 of 13 correct</div>\n' +
            '  <div class="score-bar"><div class="score-fill" id="score-fill" style="width:0%"></div></div>\n' +
            '</div>\n\n' +
            '<script>\n' +
            '// ─── ANSWER KEY ─────────────────────────────\n' +
            'const ANSWERS = {\n' +
            '  mcq1: "b", mcq2: "c", mcq3: "b",\n' +
            '  tf1: "t", tf2: "f", tf3: "t",\n' +
            '  fib1: "h2o", fib2: "pacific", fib3: "font-weight",\n' +
            '  m1: "b", m2: "a", m3: "c", m4: "d",\n' +
            '  arrange: ["mercury","venus","earth","mars"]\n' +
            '};\n\n' +
            'function fb(id, ok, right) {\n' +
            '  const el = document.getElementById("fb-" + id);\n' +
            '  el.className = "fb " + (ok ? "correct" : "wrong");\n' +
            '  el.textContent = ok ? "✓ Correct!" : "✗ Incorrect — Answer: " + right;\n' +
            '}\n\n' +
            'function checkRadio(name, key, label) {\n' +
            '  const sel = document.querySelector(`input[name="${name}"]:checked`);\n' +
            '  if (!sel) { fb(name, false, label); return 0; }\n' +
            '  const ok = sel.value === ANSWERS[key];\n' +
            '  fb(name, ok, label);\n' +
            '  return ok ? 1 : 0;\n' +
            '}\n\n' +
            'function checkFib(id, label) {\n' +
            '  const el = document.getElementById(id + "-ans");\n' +
            '  const v = el.value.trim().toLowerCase().replace(/[\\s-]+/g, "");\n' +
            '  const ok = v === ANSWERS[id].replace(/[\\s-]+/g, "");\n' +
            '  el.style.borderColor = ok ? "#6ee7b7" : "#fca5a5";\n' +
            '  fb(id, ok, label);\n' +
            '  return ok ? 1 : 0;\n' +
            '}\n\n' +
            'function checkAll() {\n' +
            '  let score = 0;\n' +
            '  // MCQ\n' +
            '  score += checkRadio("mcq1", "mcq1", "Hyper Text Markup Language");\n' +
            '  score += checkRadio("mcq2", "mcq2", "Mars");\n' +
            '  score += checkRadio("mcq3", "mcq3", "O(log n)");\n' +
            '  // T/F\n' +
            '  score += checkRadio("tf1", "tf1", "True");\n' +
            '  score += checkRadio("tf2", "tf2", "False");\n' +
            '  score += checkRadio("tf3", "tf3", "True");\n' +
            '  // Fill in blanks\n' +
            '  score += checkFib("fib1", "H₂O");\n' +
            '  score += checkFib("fib2", "Pacific");\n' +
            '  score += checkFib("fib3", "font-weight");\n' +
            '  // Match\n' +
            '  let matchScore = 0;\n' +
            '  ["m1","m2","m3","m4"].forEach(id => {\n' +
            '    const ok = document.getElementById(id).value === ANSWERS[id];\n' +
            '    if (ok) matchScore++;\n' +
            '  });\n' +
            '  fb("match", matchScore === 4, "Python→Scripting/AI, Rust→Systems, Swift→iOS, SQL→Databases");\n' +
            '  score += matchScore;\n' +
            '  // Arrange\n' +
            '  const items = [...document.querySelectorAll("#arrange-list .arrange-item")];\n' +
            '  const order = items.map(i => i.dataset.val);\n' +
            '  const arrOk = order.every((v,i) => v === ANSWERS.arrange[i]);\n' +
            '  fb("arrange", arrOk, "Mercury → Venus → Earth → Mars");\n' +
            '  if (arrOk) score += 4; else {\n' +
            '    order.forEach((v,i) => { if(v === ANSWERS.arrange[i]) score++; });\n' +
            '  }\n' +
            '  // Scoreboard\n' +
            '  const total = 13;\n' +
            '  const pct = Math.round(score / total * 100);\n' +
            '  document.getElementById("score-display").textContent = pct + "%";\n' +
            '  document.getElementById("score-text").textContent = score + " of " + total + " correct";\n' +
            '  document.getElementById("score-fill").style.width = pct + "%";\n' +
            '  document.getElementById("scoreboard").classList.remove("hidden");\n' +
            '  document.getElementById("scoreboard").scrollIntoView({ behavior: "smooth" });\n' +
            '}\n\n' +
            'function resetAll() {\n' +
            '  document.querySelectorAll("input[type=radio]").forEach(r => r.checked = false);\n' +
            '  document.querySelectorAll(".blank-input").forEach(i => { i.value = ""; i.style.borderColor = "#64748b"; });\n' +
            '  document.querySelectorAll(".match-select").forEach(s => s.value = "");\n' +
            '  document.querySelectorAll(".fb").forEach(f => { f.className = "fb"; f.textContent = ""; });\n' +
            '  document.getElementById("scoreboard").classList.add("hidden");\n' +
            '}\n\n' +
            '// ─── DRAG & DROP for Arrange ────────────────\n' +
            'const list = document.getElementById("arrange-list");\n' +
            'let dragItem = null;\n' +
            'list.addEventListener("dragstart", e => {\n' +
            '  dragItem = e.target.closest(".arrange-item");\n' +
            '  e.dataTransfer.effectAllowed = "move";\n' +
            '  setTimeout(() => dragItem.style.opacity = "0.4", 0);\n' +
            '});\n' +
            'list.addEventListener("dragend", e => {\n' +
            '  e.target.closest(".arrange-item").style.opacity = "1";\n' +
            '  list.querySelectorAll(".arrange-item").forEach(i => i.classList.remove("drag-over"));\n' +
            '});\n' +
            'list.addEventListener("dragover", e => {\n' +
            '  e.preventDefault();\n' +
            '  const target = e.target.closest(".arrange-item");\n' +
            '  if (target && target !== dragItem) {\n' +
            '    list.querySelectorAll(".arrange-item").forEach(i => i.classList.remove("drag-over"));\n' +
            '    target.classList.add("drag-over");\n' +
            '  }\n' +
            '});\n' +
            'list.addEventListener("drop", e => {\n' +
            '  e.preventDefault();\n' +
            '  const target = e.target.closest(".arrange-item");\n' +
            '  if (target && target !== dragItem) {\n' +
            '    const items = [...list.children];\n' +
            '    const dragIdx = items.indexOf(dragItem);\n' +
            '    const targetIdx = items.indexOf(target);\n' +
            '    if (dragIdx < targetIdx) { list.insertBefore(dragItem, target.nextSibling); }\n' +
            '    else { list.insertBefore(dragItem, target); }\n' +
            '  }\n' +
            '  list.querySelectorAll(".arrange-item").forEach(i => i.classList.remove("drag-over"));\n' +
            '});\n' +
            '</script>\n' +
            '```\n\n' +
            '---\n\n' +
            '## 🧩 Quiz Question Types\n\n' +
            'This template demonstrates **5 interactive question types** you can use in MDview:\n\n' +
            '| # | Type | Description |\n' +
            '|:--|:-----|:------------|\n' +
            '| 1 | **🔘 Multiple Choice (MCQ)** | Select one correct answer from several options |\n' +
            '| 2 | **✅ True / False** | Choose whether a statement is true or false |\n' +
            '| 3 | **✏️ Fill in the Blanks** | Type the correct answer into blank fields |\n' +
            '| 4 | **🔗 Match the Following** | Match items from two columns using dropdowns |\n' +
            '| 5 | **🔢 Arrange in Order** | Drag & drop items into the correct sequence |\n\n' +
            '> [!TIP]\n' +
            '> To create your own quiz, copy the HTML block above and modify the questions, options, and answer key in the `ANSWERS` object at the top of the `<script>` section.\n\n' +
            '---\n\n' +
            '## ✍️ How to Customize\n\n' +
            '### Adding an MCQ Question\n\n' +
            '```html\n' +
            '<div class="q-card" id="mcq4">\n' +
            '  <div class="q-label"><span class="q-num">?</span> Your question here</div>\n' +
            '  <div class="options">\n' +
            '    <label><input type="radio" name="mcq4" value="a"> Option A</label>\n' +
            '    <label><input type="radio" name="mcq4" value="b"> Option B</label>\n' +
            '    <label><input type="radio" name="mcq4" value="c"> Option C</label>\n' +
            '  </div>\n' +
            '  <div class="fb" id="fb-mcq4"></div>\n' +
            '</div>\n' +
            '```\n\n' +
            'Then add `mcq4: "b"` to the `ANSWERS` object and call `checkRadio("mcq4", "mcq4", "Correct Answer Text")` in `checkAll()`.\n\n' +
            '### Adding a Fill-in-the-Blank\n\n' +
            '```html\n' +
            '<div class="q-card" id="fib4">\n' +
            '  <div class="q-label"><span class="q-num">?</span> The capital of France is\n' +
            '    <input class="blank-input" id="fib4-ans" placeholder="________">\n' +
            '  </div>\n' +
            '  <div class="fb" id="fb-fib4"></div>\n' +
            '</div>\n' +
            '```\n\n' +
            'Then add `fib4: "paris"` to `ANSWERS` and `checkFib("fib4", "Paris")` in `checkAll()`.\n'
    },
    {
        name: 'MCQ Quiz',
        category: 'quiz',
        icon: 'bi-ui-radios',
        description: 'Simple multiple-choice quiz — just MCQ questions with instant feedback',
        content: '# 🔘 Multiple Choice Quiz\n\n' +
            '> Answer all 5 questions, then check your score!\n\n' +
            '---\n\n' +
            '```html-autorun\n' +
            '<style>\n' +
            '  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '  body { font-family: "Segoe UI", system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; }\n' +
            '  h2 { background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-align: center; margin-bottom: 24px; font-size: 1.6em; }\n' +
            '  .card { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 16px; }\n' +
            '  .card:hover { border-color: #60a5fa; }\n' +
            '  .q { font-weight: 600; margin-bottom: 14px; font-size: 1.05em; }\n' +
            '  .num { display: inline-block; background: #3b82f6; color: #fff; width: 26px; height: 26px; border-radius: 50%; text-align: center; line-height: 26px; font-size: .8em; margin-right: 8px; }\n' +
            '  label { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin: 5px 0; border-radius: 10px; cursor: pointer; border: 1px solid #334155; transition: .2s; }\n' +
            '  label:hover { background: #1e293b; border-color: #60a5fa; }\n' +
            '  input[type="radio"] { accent-color: #60a5fa; width: 17px; height: 17px; }\n' +
            '  .fb { font-size: .9em; padding: 6px 12px; border-radius: 6px; margin-top: 10px; display:none; font-weight: 500; }\n' +
            '  .fb.ok { display:block; background: #064e3b; color: #6ee7b7; }\n' +
            '  .fb.no { display:block; background: #7f1d1d; color: #fca5a5; }\n' +
            '  .bar { display: flex; gap: 10px; margin-top: 20px; }\n' +
            '  button { padding: 10px 22px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; }\n' +
            '  .go { background: linear-gradient(135deg,#3b82f6,#6366f1); color:#fff; }\n' +
            '  .go:hover { box-shadow: 0 4px 16px rgba(59,130,246,.4); }\n' +
            '  .rst { background: #334155; color: #e2e8f0; }\n' +
            '  .score { text-align: center; margin-top: 20px; padding: 24px; background: linear-gradient(135deg,#1e1b4b,#312e81); border-radius: 14px; border: 1px solid #4f46e5; display: none; }\n' +
            '  .score .big { font-size: 3em; font-weight: 800; background: linear-gradient(135deg,#60a5fa,#c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n' +
            '</style>\n' +
            '<h2>🔘 Quick MCQ Quiz</h2>\n\n' +
            '<div class="card"><div class="q"><span class="num">1</span> Which language is used for web page structure?</div>\n' +
            '  <label><input type="radio" name="q1" value="a"> Python</label>\n' +
            '  <label><input type="radio" name="q1" value="b"> HTML</label>\n' +
            '  <label><input type="radio" name="q1" value="c"> Java</label>\n' +
            '  <div class="fb" id="f1"></div></div>\n\n' +
            '<div class="card"><div class="q"><span class="num">2</span> What does CSS stand for?</div>\n' +
            '  <label><input type="radio" name="q2" value="a"> Cascading Style Sheets</label>\n' +
            '  <label><input type="radio" name="q2" value="b"> Computer Style Sheets</label>\n' +
            '  <label><input type="radio" name="q2" value="c"> Creative Styling System</label>\n' +
            '  <div class="fb" id="f2"></div></div>\n\n' +
            '<div class="card"><div class="q"><span class="num">3</span> Which symbol is used for comments in Python?</div>\n' +
            '  <label><input type="radio" name="q3" value="a"> //</label>\n' +
            '  <label><input type="radio" name="q3" value="b"> #</label>\n' +
            '  <label><input type="radio" name="q3" value="c"> /* */</label>\n' +
            '  <div class="fb" id="f3"></div></div>\n\n' +
            '<div class="card"><div class="q"><span class="num">4</span> What is the output of 2 ** 3 in Python?</div>\n' +
            '  <label><input type="radio" name="q4" value="a"> 6</label>\n' +
            '  <label><input type="radio" name="q4" value="b"> 8</label>\n' +
            '  <label><input type="radio" name="q4" value="c"> 9</label>\n' +
            '  <div class="fb" id="f4"></div></div>\n\n' +
            '<div class="card"><div class="q"><span class="num">5</span> Which company developed JavaScript?</div>\n' +
            '  <label><input type="radio" name="q5" value="a"> Microsoft</label>\n' +
            '  <label><input type="radio" name="q5" value="b"> Netscape</label>\n' +
            '  <label><input type="radio" name="q5" value="c"> Google</label>\n' +
            '  <div class="fb" id="f5"></div></div>\n\n' +
            '<div class="bar">\n' +
            '  <button class="go" onclick="check()">✅ Check Answers</button>\n' +
            '  <button class="rst" onclick="reset()">🔄 Reset</button>\n' +
            '</div>\n' +
            '<div class="score" id="sc">\n' +
            '  <div class="big" id="sp">0%</div>\n' +
            '  <div id="st" style="color:#a5b4fc;margin-top:4px;">0 / 5</div>\n' +
            '</div>\n\n' +
            '<script>\n' +
            'const K = {q1:"b", q2:"a", q3:"b", q4:"b", q5:"b"};\n' +
            'function chk(n,i,ans) {\n' +
            '  const s = document.querySelector(`input[name="${n}"]:checked`);\n' +
            '  const el = document.getElementById("f"+i);\n' +
            '  if(!s){el.className="fb no";el.textContent="⚠ Please select an answer";return 0;}\n' +
            '  const ok = s.value===K[n];\n' +
            '  el.className="fb "+(ok?"ok":"no");\n' +
            '  el.textContent=ok?"✓ Correct!":"✗ Answer: "+ans;\n' +
            '  return ok?1:0;\n' +
            '}\n' +
            'function check(){\n' +
            '  let s=0;\n' +
            '  s+=chk("q1",1,"HTML"); s+=chk("q2",2,"Cascading Style Sheets");\n' +
            '  s+=chk("q3",3,"#"); s+=chk("q4",4,"8"); s+=chk("q5",5,"Netscape");\n' +
            '  const p=Math.round(s/5*100);\n' +
            '  document.getElementById("sp").textContent=p+"%";\n' +
            '  document.getElementById("st").textContent=s+" / 5 correct";\n' +
            '  document.getElementById("sc").style.display="block";\n' +
            '}\n' +
            'function reset(){\n' +
            '  document.querySelectorAll("input").forEach(r=>r.checked=false);\n' +
            '  document.querySelectorAll(".fb").forEach(f=>{f.className="fb";f.textContent="";});\n' +
            '  document.getElementById("sc").style.display="none";\n' +
            '}\n' +
            '</script>\n' +
            '```\n\n' +
            '---\n\n' +
            '> [!TIP]\n' +
            '> Edit the questions, options and answer key (`K` object) in the `<script>` to create your own quiz!\n'
    },
    {
        name: 'Flashcards',
        category: 'quiz',
        icon: 'bi-card-text',
        description: 'Interactive flip flashcards — click to reveal the answer',
        content: '# 🃏 Flashcards\n\n' +
            '> Click any card to flip and reveal the answer!\n\n' +
            '---\n\n' +
            '```html-autorun\n' +
            '<style>\n' +
            '  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '  body { font-family: "Segoe UI", system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; text-align: center; }\n' +
            '  h2 { background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }\n' +
            '  .counter { color: #94a3b8; margin-bottom: 20px; }\n' +
            '  .card-container { perspective: 1000px; width: 100%; max-width: 420px; height: 260px; margin: 0 auto 24px; cursor: pointer; }\n' +
            '  .card-inner { position: relative; width: 100%; height: 100%; transition: transform .6s; transform-style: preserve-3d; }\n' +
            '  .card-container.flipped .card-inner { transform: rotateY(180deg); }\n' +
            '  .card-face { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; backface-visibility: hidden; border-radius: 16px; padding: 28px; font-size: 1.15em; line-height: 1.5; }\n' +
            '  .card-front { background: linear-gradient(135deg, #1e293b, #334155); border: 1px solid #475569; }\n' +
            '  .card-front::after { content: "Click to flip"; position: absolute; bottom: 16px; font-size: .8em; color: #64748b; }\n' +
            '  .card-back { background: linear-gradient(135deg, #312e81, #1e1b4b); border: 1px solid #6366f1; transform: rotateY(180deg); }\n' +
            '  .card-back .label { font-size: .75em; color: #a5b4fc; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }\n' +
            '  .nav { display: flex; gap: 12px; justify-content: center; align-items: center; }\n' +
            '  .nav button { padding: 10px 20px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; font-size: .95em; }\n' +
            '  .prev, .next { background: #334155; color: #e2e8f0; }\n' +
            '  .prev:hover, .next:hover { background: #475569; }\n' +
            '  .shuffle { background: linear-gradient(135deg,#f59e0b,#ef4444); color:#fff; }\n' +
            '  .progress { display: flex; gap: 4px; justify-content: center; margin-top: 16px; }\n' +
            '  .dot { width: 10px; height: 10px; border-radius: 50%; background: #334155; transition: .2s; }\n' +
            '  .dot.active { background: #818cf8; transform: scale(1.3); }\n' +
            '</style>\n\n' +
            '<h2>🃏 Flashcards</h2>\n' +
            '<div class="counter" id="counter">1 / 6</div>\n\n' +
            '<div class="card-container" id="card" onclick="flip()">\n' +
            '  <div class="card-inner">\n' +
            '    <div class="card-face card-front" id="front">Loading…</div>\n' +
            '    <div class="card-face card-back"><div class="label">Answer</div><div id="back">Loading…</div></div>\n' +
            '  </div>\n' +
            '</div>\n\n' +
            '<div class="nav">\n' +
            '  <button class="prev" onclick="go(-1)">← Prev</button>\n' +
            '  <button class="shuffle" onclick="shuffle()">🔀 Shuffle</button>\n' +
            '  <button class="next" onclick="go(1)">Next →</button>\n' +
            '</div>\n' +
            '<div class="progress" id="dots"></div>\n\n' +
            '<script>\n' +
            'const cards = [\n' +
            '  { q: "What is the capital of Japan?", a: "🗼 Tokyo" },\n' +
            '  { q: "What does API stand for?", a: "Application Programming Interface" },\n' +
            '  { q: "What year was JavaScript created?", a: "1995 (by Brendan Eich at Netscape)" },\n' +
            '  { q: "What is the chemical formula for table salt?", a: "NaCl (Sodium Chloride)" },\n' +
            '  { q: "What does DNS stand for?", a: "Domain Name System" },\n' +
            '  { q: "What is Big O notation for a linear search?", a: "O(n)" },\n' +
            '];\n' +
            'let idx = 0;\n' +
            'function render() {\n' +
            '  document.getElementById("front").textContent = cards[idx].q;\n' +
            '  document.getElementById("back").textContent = cards[idx].a;\n' +
            '  document.getElementById("counter").textContent = (idx+1)+" / "+cards.length;\n' +
            '  document.getElementById("card").classList.remove("flipped");\n' +
            '  const dots = document.getElementById("dots");\n' +
            '  dots.innerHTML = cards.map((_,i) => `<div class="dot${i===idx?" active":""}"></div>`).join("");\n' +
            '}\n' +
            'function flip() { document.getElementById("card").classList.toggle("flipped"); }\n' +
            'function go(d) { idx = (idx + d + cards.length) % cards.length; render(); }\n' +
            'function shuffle() { for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];} idx=0; render(); }\n' +
            'render();\n' +
            '</script>\n' +
            '```\n\n' +
            '---\n\n' +
            '> [!TIP]\n' +
            '> Edit the `cards` array in the `<script>` section to add your own Q&A pairs!\n'
    },
];
