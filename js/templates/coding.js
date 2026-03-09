// ============================================
// templates/coding.js — Coding Templates
// ============================================
window.__MDV_TEMPLATES_CODING = [
  {
    name: 'Bash Scripting',
    category: 'coding',
    icon: 'bi-terminal',
    description: 'Learn bash basics with runnable examples — variables, loops, and text processing',
    content: `# 🖥️ Bash Scripting — Interactive Tutorial

> Click **▶ Run** on any code block below to execute it live in your browser.
> Powered by [just-bash](https://justbash.dev/) — a sandboxed bash environment.

---

## 1. Variables & String Operations

Bash variables don't need type declarations. Use \`$VAR\` or \`\${VAR}\` to reference them.

\`\`\`bash
NAME="World"
GREETING="Hello, $NAME!"
echo "$GREETING"
echo "Length of NAME: \${#NAME}"
echo "Uppercase: \${NAME^^}"
\`\`\`

**What this does:**
- Assigns a string to \`NAME\`
- Uses string interpolation with \`$\`
- \`\${#VAR}\` gives the string length
- \`\${VAR^^}\` converts to uppercase

---

## 2. Conditionals

Bash uses \`if / elif / else / fi\` for branching. Use \`[[ ]]\` for modern test syntax.

\`\`\`bash
SCORE=85

if [[ $SCORE -ge 90 ]]; then
GRADE="A"
elif [[ $SCORE -ge 80 ]]; then
GRADE="B"
elif [[ $SCORE -ge 70 ]]; then
GRADE="C"
else
GRADE="F"
fi

echo "Score: $SCORE → Grade: $GRADE"
\`\`\`

**Operators:** \`-eq\` (equal), \`-ne\` (not equal), \`-gt\` (greater), \`-lt\` (less), \`-ge\` (≥), \`-le\` (≤)

---

## 3. Loops

### For Loop — iterating over a range

\`\`\`bash
echo "Counting to 5:"
for i in 1 2 3 4 5; do
echo "  → $i"
done

echo ""
echo "Fruits:"
for fruit in apple banana cherry; do
echo "  🍎 $fruit"
done
\`\`\`

### While Loop — FizzBuzz

\`\`\`bash
i=1
while [[ $i -le 20 ]]; do
if [[ $((i % 15)) -eq 0 ]]; then
  echo "$i: FizzBuzz"
elif [[ $((i % 3)) -eq 0 ]]; then
  echo "$i: Fizz"
elif [[ $((i % 5)) -eq 0 ]]; then
  echo "$i: Buzz"
else
  echo "$i"
fi
((i++))
done
\`\`\`

---

## 4. Functions

Bash functions can take arguments via \`$1\`, \`$2\`, etc.

\`\`\`bash
greet() {
local name="$1"
local time="$2"
echo "Good $time, $name! 👋"
}

greet "Alice" "morning"
greet "Bob" "evening"
\`\`\`

---

## 5. Text Processing with Pipes

Bash excels at chaining commands with \`|\` (pipe).

\`\`\`bash
# Create sample data
echo -e "banana\napple\ncherry\napple\nbanana\nbanana" > /tmp/fruits.txt

echo "=== Raw data ==="
cat /tmp/fruits.txt

echo ""
echo "=== Sorted unique with count ==="
sort /tmp/fruits.txt | uniq -c | sort -rn

echo ""
echo "=== Lines containing 'an' ==="
grep "an" /tmp/fruits.txt
\`\`\`

**Pipeline explained:**
1. \`sort\` — alphabetize lines
2. \`uniq -c\` — count consecutive duplicates
3. \`sort -rn\` — sort numerically in reverse (most frequent first)
4. \`grep\` — filter lines matching a pattern
`
  },
  {
    name: 'Data Processing',
    category: 'coding',
    icon: 'bi-database',
    description: 'CLI data manipulation — CSV parsing, JSON processing, and text transforms',
    content: `# 📊 Data Processing — CLI Toolkit

> Run each block to see real output. All commands execute in a sandboxed bash shell.

---

## 1. CSV Processing

Parse and analyze CSV data using standard Unix tools.

\`\`\`bash
# Create a sample CSV dataset
cat > /tmp/sales.csv << 'EOF'
name,region,q1,q2,q3,q4
Alice,North,1200,1500,1800,2100
Bob,South,900,1100,1300,1600
Carol,North,1500,1400,1700,1900
Dave,South,800,950,1100,1250
Eve,West,2000,2200,2500,2800
EOF

echo "=== Raw CSV ==="
cat /tmp/sales.csv

echo ""
echo "=== Header ==="
head -1 /tmp/sales.csv

echo ""
echo "=== Data rows (no header) ==="
tail -n +2 /tmp/sales.csv
\`\`\`

### Extracting Columns

\`\`\`bash
echo "=== Names and Regions ==="
tail -n +2 /tmp/sales.csv | cut -d',' -f1,2

echo ""
echo "=== Sorted by Q1 revenue (descending) ==="
tail -n +2 /tmp/sales.csv | sort -t',' -k3 -nr | head -5
\`\`\`

---

## 2. Text Transforms with awk

\`awk\` is a powerful text-processing language built into Unix.

\`\`\`bash
# Calculate total annual sales per person
echo "=== Annual Totals ==="
echo "Name | Region | Annual Total"
echo "-----|--------|-------------"
tail -n +2 /tmp/sales.csv | awk -F',' '{
total = $3 + $4 + $5 + $6
printf "%-6s | %-6s | $%d\n", $1, $2, total
}'
\`\`\`

### Filtering with awk

\`\`\`bash
# Find people with Q4 > 1800
echo "=== High Q4 Performers (Q4 > 1800) ==="
tail -n +2 /tmp/sales.csv | awk -F',' '$6 > 1800 { printf "%s: $%d\n", $1, $6 }'
\`\`\`

---

## 3. sed — Stream Editor

\`sed\` transforms text line-by-line using pattern matching.

\`\`\`bash
# Text transformations
TEXT="The quick brown fox jumps over the lazy dog"

echo "Original: $TEXT"
echo "Replace fox→cat: $(echo "$TEXT" | sed 's/fox/cat/')"
echo "Replace all spaces with underscores: $(echo "$TEXT" | sed 's/ /_/g')"
echo "Delete 'the' (case-insensitive): $(echo "$TEXT" | sed 's/[Tt]he //g')"
\`\`\`

---

## 4. Working with JSON (using bash)

Parse simple JSON structures with bash string tools.

\`\`\`bash
# Create JSON-like data and process it
cat > /tmp/users.txt << 'EOF'
{"name": "Alice", "age": 30, "role": "engineer"}
{"name": "Bob", "age": 25, "role": "designer"}
{"name": "Carol", "age": 35, "role": "engineer"}
{"name": "Dave", "age": 28, "role": "manager"}
EOF

echo "=== All Users ==="
cat /tmp/users.txt

echo ""
echo "=== Engineers Only ==="
grep '"engineer"' /tmp/users.txt

echo ""
echo "=== Names ==="
grep -o '"name": "[^"]*"' /tmp/users.txt | cut -d'"' -f4
\`\`\`

---

## 5. Generating Reports

\`\`\`bash
echo "╔══════════════════════════════════╗"
echo "║     SALES SUMMARY REPORT        ║"
echo "╠══════════════════════════════════╣"

# Count by region
echo "║                                  ║"
echo "║ Employees by Region:             ║"
tail -n +2 /tmp/sales.csv | cut -d',' -f2 | sort | uniq -c | while read count region; do
printf "║   %-8s: %d                    ║\n" "$region" "$count"
done

echo "║                                  ║"
echo "╚══════════════════════════════════╝"
\`\`\`
`
  },
  {
    name: 'DevOps Snippets',
    category: 'coding',
    icon: 'bi-gear',
    description: 'Common DevOps commands — system info, disk usage, networking, and process management',
    content: `# ⚙️ DevOps Snippets — Quick Reference

> Runnable bash snippets for common operations tasks.
> These run in a sandboxed environment — safe to experiment!

---

## 1. System Information

\`\`\`bash
echo "=== System Overview ==="
echo "Hostname: $(hostname 2>/dev/null || echo 'sandbox')"
echo "Shell: $SHELL"
echo "User: $(whoami 2>/dev/null || echo 'sandbox-user')"
echo "Date: $(date)"
echo "Uptime: $(uptime 2>/dev/null || echo 'N/A')"
\`\`\`

---

## 2. Working with Environment Variables

\`\`\`bash
# Set and display env vars
export APP_NAME="MyApp"
export APP_ENV="production"
export APP_PORT=8080
export DB_HOST="db.example.com"

echo "=== Application Config ==="
env | grep "^APP_" | sort

echo ""
echo "=== Formatted ==="
for var in APP_NAME APP_ENV APP_PORT DB_HOST; do
printf "  %-12s = %s\n" "$var" "\${!var}"
done
\`\`\`

**Tip:** \`\${!var}\` is bash indirect expansion — it gets the value of the variable whose *name* is stored in \`$var\`.

---

## 3. File System Operations

\`\`\`bash
# Create a project structure
mkdir -p /tmp/myproject/{src,tests,docs,config}

# Create some files
echo '#!/bin/bash' > /tmp/myproject/src/main.sh
echo '# Tests' > /tmp/myproject/tests/test_main.sh
echo '# README' > /tmp/myproject/docs/README.md
echo 'PORT=3000' > /tmp/myproject/config/app.env

echo "=== Project Structure ==="
find /tmp/myproject -type f | sort | while read f; do
size=$(wc -c < "$f")
printf "  %-45s %4d bytes\n" "$f" "$size"
done

echo ""
echo "=== Directory Summary ==="
echo "Files: $(find /tmp/myproject -type f | wc -l)"
echo "Dirs:  $(find /tmp/myproject -type d | wc -l)"
\`\`\`

---

## 4. Log Processing

\`\`\`bash
# Generate sample log entries
cat > /tmp/app.log << 'EOF'
2024-01-15 10:23:01 [INFO] Server started on port 8080
2024-01-15 10:23:05 [INFO] Database connected
2024-01-15 10:24:12 [WARN] Slow query detected (2.3s)
2024-01-15 10:25:30 [ERROR] Connection timeout to redis:6379
2024-01-15 10:25:31 [INFO] Retrying connection...
2024-01-15 10:25:33 [INFO] Redis reconnected
2024-01-15 10:30:45 [ERROR] Out of memory: heap limit reached
2024-01-15 10:30:46 [WARN] GC pause exceeded 500ms
2024-01-15 10:31:00 [INFO] Memory recovered after GC
EOF

echo "=== Log Level Summary ==="
grep -oP '\[\K[A-Z]+' /tmp/app.log 2>/dev/null || grep -o '\[.*\]' /tmp/app.log | tr -d '[]' | sort | uniq -c | sort -rn

echo ""
echo "=== Errors Only ==="
grep "ERROR" /tmp/app.log

echo ""
echo "=== Timeline ==="
awk '{print $2, $3}' /tmp/app.log
\`\`\`

---

## 5. Useful One-Liners

\`\`\`bash
echo "=== Generate a random password ==="
cat /dev/urandom 2>/dev/null | tr -dc 'A-Za-z0-9!@#$%' | head -c 20 || echo "$(date +%s | sha256sum 2>/dev/null || echo $RANDOM$RANDOM | md5sum 2>/dev/null || echo "FallbackPass_$RANDOM")" | head -c 20
echo ""

echo ""
echo "=== Count lines of code in a project ==="
find /tmp/myproject -name '*.sh' -o -name '*.md' -o -name '*.env' | xargs wc -l 2>/dev/null

echo ""
echo "=== Quick math ==="
echo "2^10 = $((2**10))"
echo "Hex FF = $((16#FF))"
echo "Octal 77 = $((8#77))"
\`\`\`
`
  },
  {
    name: 'Python Playground',
    category: 'coding',
    icon: 'bi-filetype-py',
    description: 'Interactive Python examples — algorithms, data processing, and math — runnable in the browser via Pyodide',
    content: '# 🐍 Python Playground\n\n' +
      '> Run Python code **directly in your browser** — no install required!\n' +
      '> Powered by [Pyodide](https://pyodide.org/) (CPython compiled to WebAssembly).\n\n' +
      '> [!TIP]\n' +
      '> Hover over any code block and click **▶ Run** to execute. The first run downloads the Python runtime (~11 MB, cached afterwards).\n\n' +
      '---\n\n' +
      '## 🔢 Math & Constants\n\n' +
      '```python\n' +
      'import math\n\n' +
      'print(f"π  = {math.pi:.15f}")\n' +
      'print(f"e  = {math.e:.15f}")\n' +
      'print(f"τ  = {math.tau:.15f}")\n' +
      'print(f"φ  = {(1 + 5**0.5) / 2:.15f}  (golden ratio)")\n' +
      'print()\n' +
      'print(f"100! = {math.factorial(100)}")\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🧮 Algorithms\n\n' +
      '```python\n' +
      '# Fibonacci — iterative\n' +
      'def fib(n):\n' +
      '    a, b = 0, 1\n' +
      '    for _ in range(n):\n' +
      '        a, b = b, a + b\n' +
      '    return a\n\n' +
      'print("Fibonacci sequence:")\n' +
      'for i in range(1, 16):\n' +
      '    print(f"  fib({i:2d}) = {fib(i)}")\n' +
      '```\n\n' +
      '```python\n' +
      '# Sieve of Eratosthenes\n' +
      'def primes_up_to(n):\n' +
      '    sieve = [True] * (n + 1)\n' +
      '    sieve[0] = sieve[1] = False\n' +
      '    for i in range(2, int(n**0.5) + 1):\n' +
      '        if sieve[i]:\n' +
      '            for j in range(i*i, n + 1, i):\n' +
      '                sieve[j] = False\n' +
      '    return [i for i, v in enumerate(sieve) if v]\n\n' +
      'p = primes_up_to(100)\n' +
      'print(f"Primes up to 100 ({len(p)} total):")\n' +
      'print(p)\n' +
      '```\n\n' +
      '```python\n' +
      '# Sorting algorithms comparison\n' +
      'import random, time\n\n' +
      'def bubble_sort(arr):\n' +
      '    a = arr[:]\n' +
      '    for i in range(len(a)):\n' +
      '        for j in range(len(a) - i - 1):\n' +
      '            if a[j] > a[j+1]:\n' +
      '                a[j], a[j+1] = a[j+1], a[j]\n' +
      '    return a\n\n' +
      'data = [random.randint(1, 1000) for _ in range(500)]\n\n' +
      't1 = time.time()\n' +
      'bubble_sort(data)\n' +
      'bubble_time = time.time() - t1\n\n' +
      't2 = time.time()\n' +
      'sorted(data)\n' +
      'builtin_time = time.time() - t2\n\n' +
      'print(f"Bubble sort (500 items): {bubble_time*1000:.1f} ms")\n' +
      'print(f"Built-in sort:          {builtin_time*1000:.3f} ms")\n' +
      'print(f"Built-in is {bubble_time/builtin_time:.0f}x faster!")\n' +
      '```\n\n' +
      '---\n\n' +
      '## 📊 Data Processing\n\n' +
      '```python\n' +
      '# JSON data analysis\n' +
      'import json\n\n' +
      'students = [\n' +
      '    {"name": "Alice",   "grade": "A",  "score": 95},\n' +
      '    {"name": "Bob",     "grade": "B+", "score": 88},\n' +
      '    {"name": "Carol",   "grade": "A-", "score": 92},\n' +
      '    {"name": "David",   "grade": "B",  "score": 85},\n' +
      '    {"name": "Eve",     "grade": "A+", "score": 98},\n' +
      '    {"name": "Frank",   "grade": "C+", "score": 78},\n' +
      ']\n\n' +
      'scores = [s["score"] for s in students]\n' +
      'avg = sum(scores) / len(scores)\n' +
      'top = max(students, key=lambda s: s["score"])\n\n' +
      'print(f"Students:  {len(students)}")\n' +
      'print(f"Average:   {avg:.1f}")\n' +
      'print(f"Highest:   {top[\'name\']} ({top[\'score\']})")\n' +
      'print(f"Lowest:    {min(scores)}")\n' +
      'print(f"Std Dev:   {(sum((s - avg)**2 for s in scores) / len(scores))**0.5:.2f}")\n' +
      'print()\n' +
      'print("Leaderboard:")\n' +
      'for i, s in enumerate(sorted(students, key=lambda x: -x["score"]), 1):\n' +
      '    medal = ["🥇", "🥈", "🥉"][i-1] if i <= 3 else "  "\n' +
      '    print(f"  {medal} {s[\'name\']: <8} {s[\'grade\']: <3} {s[\'score\']: >3}")\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🎨 String Art\n\n' +
      '```python\n' +
      '# ASCII art generator\n' +
      'import math\n\n' +
      'width, height = 60, 20\n\n' +
      'for y in range(height):\n' +
      '    row = ""\n' +
      '    for x in range(width):\n' +
      '        nx = (x / width - 0.5) * 4\n' +
      '        ny = (y / height - 0.5) * 2\n' +
      '        val = math.sin(nx * 2) * math.cos(ny * 3) + math.sin(nx * ny)\n' +
      '        chars = " .:-=+*#%@"\n' +
      '        idx = int((val + 2) / 4 * (len(chars) - 1))\n' +
      '        idx = max(0, min(len(chars) - 1, idx))\n' +
      '        row += chars[idx]\n' +
      '    print(row)\n' +
      '```\n'
  },
  {
    name: 'HTML Playground',
    category: 'coding',
    icon: 'bi-filetype-html',
    description: 'Interactive HTML/CSS/JS demos — animations, interactive widgets, and canvas drawing — live in the preview',
    content: '# 🌐 HTML Playground\n\n' +
      '> Preview HTML, CSS, and JavaScript **live in your browser** — rendered inside a secure, sandboxed `<iframe>`.\n\n' +
      '> [!TIP]\n' +
      '> Hover over any code block and click **▶ Preview** to see it rendered. Click again to close.\n\n' +
      '---\n\n' +
      '## 🎨 CSS Animation\n\n' +
      '```html\n' +
      '<style>\n' +
      '  body { font-family: system-ui; text-align: center; padding: 20px; margin: 0;\n' +
      '         background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: #fff; }\n' +
      '  .orbit { position: relative; width: 200px; height: 200px; margin: 20px auto; }\n' +
      '  .planet { width: 20px; height: 20px; border-radius: 50%;\n' +
      '            position: absolute; top: 50%; left: 50%; margin: -10px;\n' +
      '            animation: orbit 3s linear infinite; }\n' +
      '  .planet:nth-child(1) { background: #667eea; animation-duration: 2s; }\n' +
      '  .planet:nth-child(2) { background: #f093fb; animation-duration: 3s; animation-delay: -1s; }\n' +
      '  .planet:nth-child(3) { background: #4facfe; animation-duration: 4s; animation-delay: -2s; }\n' +
      '  .sun { width: 40px; height: 40px; background: #ffd700; border-radius: 50%;\n' +
      '         position: absolute; top: 50%; left: 50%; margin: -20px;\n' +
      '         box-shadow: 0 0 30px #ffd700; }\n' +
      '  @keyframes orbit {\n' +
      '    from { transform: rotate(0deg) translateX(80px) rotate(0deg); }\n' +
      '    to   { transform: rotate(360deg) translateX(80px) rotate(-360deg); }\n' +
      '  }\n' +
      '</style>\n' +
      '<h3>🌌 Solar System</h3>\n' +
      '<div class="orbit">\n' +
      '  <div class="sun"></div>\n' +
      '  <div class="planet"></div>\n' +
      '  <div class="planet"></div>\n' +
      '  <div class="planet"></div>\n' +
      '</div>\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🖱️ Interactive Counter\n\n' +
      '```html\n' +
      '<style>\n' +
      '  body { font-family: system-ui; text-align: center; padding: 30px; }\n' +
      '  .counter { font-size: 48px; font-weight: bold; color: #667eea; margin: 20px; }\n' +
      '  button { padding: 12px 24px; font-size: 18px; border: none; border-radius: 8px;\n' +
      '           cursor: pointer; margin: 5px; transition: transform 0.1s; }\n' +
      '  button:active { transform: scale(0.95); }\n' +
      '  .minus { background: #f47067; color: #fff; }\n' +
      '  .plus  { background: #238636; color: #fff; }\n' +
      '  .reset { background: #6f42c1; color: #fff; }\n' +
      '</style>\n' +
      '<div class="counter" id="count">0</div>\n' +
      '<button class="minus" onclick="update(-1)">− 1</button>\n' +
      '<button class="reset" onclick="n=0;update(0)">Reset</button>\n' +
      '<button class="plus" onclick="update(1)">+ 1</button>\n' +
      '<script>\n' +
      '  let n = 0;\n' +
      '  function update(d) { n += d; document.getElementById("count").textContent = n; }\n' +
      '</script>\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🎨 Canvas Drawing\n\n' +
      '```html\n' +
      '<style>\n' +
      '  body { font-family: system-ui; text-align: center; padding: 10px; margin: 0; }\n' +
      '  canvas { border: 2px solid #ddd; border-radius: 8px; cursor: crosshair; display: block; margin: 10px auto; }\n' +
      '  .controls { margin: 10px; }\n' +
      '  button { padding: 8px 16px; margin: 4px; border: none; border-radius: 6px; cursor: pointer; }\n' +
      '  .color-btn { width: 30px; height: 30px; border-radius: 50%; border: 2px solid #ccc; cursor: pointer; }\n' +
      '  .color-btn.active { border-color: #333; box-shadow: 0 0 4px rgba(0,0,0,0.3); }\n' +
      '</style>\n' +
      '<h3>🖌️ Draw Something!</h3>\n' +
      '<div class="controls">\n' +
      '  <button class="color-btn active" style="background:#333" onclick="setColor(this,\'#333\')"></button>\n' +
      '  <button class="color-btn" style="background:#f47067" onclick="setColor(this,\'#f47067\')"></button>\n' +
      '  <button class="color-btn" style="background:#238636" onclick="setColor(this,\'#238636\')"></button>\n' +
      '  <button class="color-btn" style="background:#667eea" onclick="setColor(this,\'#667eea\')"></button>\n' +
      '  <button class="color-btn" style="background:#ffd700" onclick="setColor(this,\'#ffd700\')"></button>\n' +
      '  <button onclick="ctx.clearRect(0,0,cv.width,cv.height)" style="background:#eee">Clear</button>\n' +
      '</div>\n' +
      '<canvas id="cv" width="400" height="250"></canvas>\n' +
      '<script>\n' +
      '  const cv = document.getElementById("cv");\n' +
      '  const ctx = cv.getContext("2d");\n' +
      '  let drawing = false, color = "#333";\n' +
      '  ctx.lineWidth = 3; ctx.lineCap = "round";\n' +
      '  function setColor(btn, c) { color = c; ctx.strokeStyle = c;\n' +
      '    document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));\n' +
      '    btn.classList.add("active"); }\n' +
      '  cv.addEventListener("mousedown", e => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });\n' +
      '  cv.addEventListener("mousemove", e => { if (drawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } });\n' +
      '  cv.addEventListener("mouseup", () => drawing = false);\n' +
      '  cv.addEventListener("mouseleave", () => drawing = false);\n' +
      '</script>\n' +
      '```\n\n' +
      '---\n\n' +
      '## ⏱️ Stopwatch\n\n' +
      '```html\n' +
      '<style>\n' +
      '  body { font-family: \'SF Mono\', monospace; text-align: center; padding: 30px;\n' +
      '         background: #1b1f23; color: #c9d1d9; }\n' +
      '  .time { font-size: 56px; letter-spacing: 4px; margin: 20px; color: #58a6ff; }\n' +
      '  button { padding: 10px 24px; font-size: 16px; border: none; border-radius: 8px;\n' +
      '           cursor: pointer; margin: 5px; color: #fff; }\n' +
      '  .start { background: #238636; }\n' +
      '  .stop  { background: #f47067; }\n' +
      '  .reset { background: #6f42c1; }\n' +
      '</style>\n' +
      '<div class="time" id="display">00:00.00</div>\n' +
      '<button class="start" onclick="start()">Start</button>\n' +
      '<button class="stop" onclick="stop()">Stop</button>\n' +
      '<button class="reset" onclick="reset()">Reset</button>\n' +
      '<script>\n' +
      '  let t = 0, timer = null;\n' +
      '  function fmt(ms) { let s=Math.floor(ms/1000), m=Math.floor(s/60);\n' +
      '    return `${String(m).padStart(2,"0")}:${String(s%60).padStart(2,"0")}.${String(Math.floor(ms%1000/10)).padStart(2,"0")}`; }\n' +
      '  function start() { if(!timer) { let s=Date.now()-t; timer=setInterval(()=>{t=Date.now()-s;document.getElementById("display").textContent=fmt(t)},10); } }\n' +
      '  function stop() { clearInterval(timer); timer=null; }\n' +
      '  function reset() { stop(); t=0; document.getElementById("display").textContent="00:00.00"; }\n' +
      '</script>\n' +
      '```\n'
  },
  {
    name: 'Bash Scripting',
    category: 'coding',
    icon: 'bi-terminal',
    description: 'Executable bash examples — file operations, text processing, loops, and system commands',
    content: '# 🖥️ Bash Scripting Playground\n\n' +
      '> Run bash commands **directly in the browser** — powered by [just-bash](https://justbash.dev/) (WASM).\n\n' +
      '> [!TIP]\n' +
      '> Hover over any code block and click **▶ Run** to execute.\n\n' +
      '---\n\n' +
      '## 📝 Basics\n\n' +
      '```bash\n' +
      'echo "Hello from bash! 🎉"\n' +
      'echo "Today is $(date +%A), $(date +%B\\ %d,\\ %Y)"\n' +
      'echo "Shell: $SHELL"\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🔁 Loops & Logic\n\n' +
      '```bash\n' +
      '# Counting loop\n' +
      'for i in $(seq 1 5); do\n' +
      '  echo "Count: $i"\n' +
      'done\n' +
      '```\n\n' +
      '```bash\n' +
      '# FizzBuzz in bash\n' +
      'for i in $(seq 1 20); do\n' +
      '  if   [ $((i % 15)) -eq 0 ]; then echo "$i: FizzBuzz"\n' +
      '  elif [ $((i % 3))  -eq 0 ]; then echo "$i: Fizz"\n' +
      '  elif [ $((i % 5))  -eq 0 ]; then echo "$i: Buzz"\n' +
      '  else echo "$i"\n' +
      '  fi\n' +
      'done\n' +
      '```\n\n' +
      '---\n\n' +
      '## 📊 Text Processing\n\n' +
      '```bash\n' +
      '# Create sample data and process it\n' +
      'echo -e "Name,Score\\nAlice,95\\nBob,87\\nCarol,92\\nDave,78\\nEve,98" > /tmp/data.csv\n' +
      'echo "=== Student Scores ==="\n' +
      'cat /tmp/data.csv\n' +
      'echo ""\n' +
      'echo "Top scorer:"\n' +
      'sort -t, -k2 -n -r /tmp/data.csv | head -2 | tail -1\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🔧 Functions\n\n' +
      '```bash\n' +
      '# Bash function\n' +
      'greet() {\n' +
      '  local name="$1"\n' +
      '  echo "Hello, $name! Welcome to bash scripting."\n' +
      '}\n\n' +
      'greet "World"\n' +
      'greet "TextAgent"\n' +
      'greet "$(whoami)"\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🎨 ASCII Art\n\n' +
      '```bash\n' +
      '# Draw a box\n' +
      'msg="TextAgent Bash Sandbox"\n' +
      'len=${#msg}\n' +
      'border=$(printf "%0.s─" $(seq 1 $((len + 2))))\n' +
      'echo "┌${border}┐"\n' +
      'echo "│ ${msg} │"\n' +
      'echo "└${border}┘"\n' +
      '```\n'
  },
  {
    name: 'JavaScript Sandbox',
    category: 'coding',
    icon: 'bi-filetype-js',
    description: 'Executable JavaScript examples — algorithms, DOM-free computations, and functional programming',
    content: '# ⚡ JavaScript Sandbox\n\n' +
      '> Run JavaScript **directly in the browser** with full console.log capture.\n\n' +
      '> [!TIP]\n' +
      '> Hover over any code block and click **▶ Run** to execute. Output from `console.log`, `console.warn`, and `console.error` is captured and displayed.\n\n' +
      '---\n\n' +
      '## 🔢 Basics\n\n' +
      '```javascript\n' +
      'console.log("Hello from JavaScript!");\n' +
      'console.log("2 + 2 =", 2 + 2);\n' +
      'console.log("Type of null:", typeof null);\n' +
      'console.log("0.1 + 0.2 =", 0.1 + 0.2);\n' +
      'console.log("NaN === NaN?", NaN === NaN);\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🧮 Algorithms\n\n' +
      '```javascript\n' +
      '// Fibonacci with memoization\n' +
      'function fib(n, memo = {}) {\n' +
      '  if (n <= 1) return n;\n' +
      '  if (memo[n]) return memo[n];\n' +
      '  return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n' +
      '}\n\n' +
      'for (let i = 1; i <= 15; i++) {\n' +
      '  console.log(`fib(${i}) = ${fib(i)}`);\n' +
      '}\n' +
      '```\n\n' +
      '```javascript\n' +
      '// Array methods showcase\n' +
      'const data = [5, 12, 8, 130, 44, 3, 91, 17];\n\n' +
      'console.log("Original:", data);\n' +
      'console.log("Sorted:", [...data].sort((a, b) => a - b));\n' +
      'console.log("Sum:", data.reduce((a, b) => a + b, 0));\n' +
      'console.log("Average:", (data.reduce((a, b) => a + b) / data.length).toFixed(1));\n' +
      'console.log("Even:", data.filter(n => n % 2 === 0));\n' +
      'console.log("Doubled:", data.map(n => n * 2));\n' +
      'console.log("Any > 100?", data.some(n => n > 100));\n' +
      '```\n\n' +
      '---\n\n' +
      '## 📦 Objects & JSON\n\n' +
      '```javascript\n' +
      'const users = [\n' +
      '  { name: "Alice", age: 28, role: "engineer" },\n' +
      '  { name: "Bob", age: 32, role: "designer" },\n' +
      '  { name: "Carol", age: 25, role: "engineer" },\n' +
      '  { name: "Dave", age: 35, role: "manager" },\n' +
      '];\n\n' +
      'const engineers = users.filter(u => u.role === "engineer");\n' +
      'const avgAge = users.reduce((s, u) => s + u.age, 0) / users.length;\n' +
      'const byRole = Object.groupBy?.(users, u => u.role) \n' +
      '  || users.reduce((g, u) => ({...g, [u.role]: [...(g[u.role]||[]), u]}), {});\n\n' +
      'console.log("Engineers:", engineers.map(u => u.name));\n' +
      'console.log("Average age:", avgAge);\n' +
      'console.log("Grouped by role:", byRole);\n' +
      '```\n\n' +
      '---\n\n' +
      '## ⏱️ Async & Promises\n\n' +
      '```javascript\n' +
      '// Promise chain\n' +
      'const delay = ms => new Promise(r => setTimeout(r, ms));\n\n' +
      'console.log("Start");\n\n' +
      'Promise.resolve()\n' +
      '  .then(() => { console.log("Step 1: Processing..."); })\n' +
      '  .then(() => { console.log("Step 2: Analyzing..."); })\n' +
      '  .then(() => {\n' +
      '    const result = Array.from({length: 10}, (_, i) => i * i);\n' +
      '    console.log("Step 3: Results:", result);\n' +
      '  })\n' +
      '  .then(() => console.log("Done! ✅"));\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🎨 String Art\n\n' +
      '```javascript\n' +
      '// Generate a pattern\n' +
      'for (let i = 1; i <= 9; i += 2) {\n' +
      '  const spaces = " ".repeat((9 - i) / 2);\n' +
      '  const stars = "★".repeat(i);\n' +
      '  console.log(spaces + stars);\n' +
      '}\n' +
      'for (let i = 7; i >= 1; i -= 2) {\n' +
      '  const spaces = " ".repeat((9 - i) / 2);\n' +
      '  const stars = "★".repeat(i);\n' +
      '  console.log(spaces + stars);\n' +
      '}\n' +
      '```\n'
  },
  {
    name: 'HTML + JavaScript',
    category: 'coding',
    icon: 'bi-window-stack',
    description: 'Interactive HTML/CSS/JS demos — games, widgets, and visual experiments you can preview live',
    content: '# 🌐 HTML + JavaScript Interactive\n\n' +
      '> Build interactive web demos with HTML, CSS, and JavaScript — all rendered live in a sandboxed iframe.\n\n' +
      '> [!TIP]\n' +
      '> Hover and click **▶ Preview** to render. Each block is a self-contained mini web page.\n\n' +
      '---\n\n' +
      '## 🎯 Click Game\n\n' +
      '```html\n' +
      '<style>\n' +
      '  body { font-family: system-ui; text-align: center; padding: 20px;\n' +
      '         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; margin: 0; }\n' +
      '  .target { width: 50px; height: 50px; background: #ff6b6b; border-radius: 50%;\n' +
      '            position: absolute; cursor: pointer; transition: transform 0.1s;\n' +
      '            box-shadow: 0 4px 15px rgba(0,0,0,0.3); }\n' +
      '  .target:hover { transform: scale(1.1); }\n' +
      '  #score { font-size: 36px; font-weight: bold; }\n' +
      '  #timer { font-size: 18px; opacity: 0.8; }\n' +
      '</style>\n' +
      '<div id="score">Score: 0</div>\n' +
      '<div id="timer">Click the circles! 10s</div>\n' +
      '<div id="area" style="position:relative;height:200px"></div>\n' +
      '<button onclick="startGame()" style="padding:10px 24px;font-size:16px;border:none;border-radius:8px;cursor:pointer;background:#ffd700;color:#333;font-weight:bold">Start!</button>\n' +
      '<script>\n' +
      '  let score=0, timer=null, timeLeft=10;\n' +
      '  function spawn() { let a=document.getElementById("area"); let d=document.createElement("div");\n' +
      '    d.className="target"; d.style.left=Math.random()*(a.offsetWidth-50)+"px";\n' +
      '    d.style.top=Math.random()*(a.offsetHeight-50)+"px";\n' +
      '    d.onclick=function(){score++;document.getElementById("score").textContent="Score: "+score;this.remove();spawn()};\n' +
      '    a.innerHTML="";a.appendChild(d); }\n' +
      '  function startGame() { score=0;timeLeft=10;document.getElementById("score").textContent="Score: 0";spawn();\n' +
      '    clearInterval(timer);timer=setInterval(()=>{timeLeft--;\n' +
      '      document.getElementById("timer").textContent="Time: "+timeLeft+"s";\n' +
      '      if(timeLeft<=0){clearInterval(timer);document.getElementById("area").innerHTML="";\n' +
      '        document.getElementById("timer").textContent="Game Over! Score: "+score}},1000); }\n' +
      '</script>\n' +
      '```\n\n' +
      '---\n\n' +
      '## 📊 Live Chart\n\n' +
      '```html\n' +
      '<style>\n' +
      '  body { font-family: system-ui; padding: 20px; margin: 0; }\n' +
      '  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 150px; padding: 0 20px; }\n' +
      '  .bar { flex: 1; background: linear-gradient(to top, #667eea, #764ba2);\n' +
      '         border-radius: 4px 4px 0 0; transition: height 0.5s ease; min-width: 30px;\n' +
      '         display: flex; align-items: flex-start; justify-content: center;\n' +
      '         color: #fff; font-size: 12px; font-weight: bold; padding-top: 4px; }\n' +
      '  .labels { display: flex; gap: 8px; padding: 4px 20px; }\n' +
      '  .labels span { flex: 1; text-align: center; font-size: 12px; color: #666; min-width: 30px; }\n' +
      '  button { padding: 8px 20px; border: none; border-radius: 6px; cursor: pointer;\n' +
      '           background: #667eea; color: #fff; font-size: 14px; margin-top: 10px; }\n' +
      '</style>\n' +
      '<h3 style="text-align:center;margin:0 0 10px">📊 Random Data</h3>\n' +
      '<div class="bar-chart" id="chart"></div>\n' +
      '<div class="labels" id="labels"></div>\n' +
      '<div style="text-align:center"><button onclick="randomize()">🔄 Randomize</button></div>\n' +
      '<script>\n' +
      '  const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];\n' +
      '  function randomize(){let c=document.getElementById("chart"),l=document.getElementById("labels");\n' +
      '    c.innerHTML="";l.innerHTML="";\n' +
      '    days.forEach(d=>{let v=20+Math.random()*80;\n' +
      '      c.innerHTML+=`<div class="bar" style="height:${v}%">${Math.round(v)}</div>`;\n' +
      '      l.innerHTML+=`<span>${d}</span>`});}\n' +
      '  randomize();\n' +
      '</script>\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🎨 Gradient Generator\n\n' +
      '```html\n' +
      '<style>\n' +
      '  body { font-family: system-ui; padding: 20px; margin: 0; text-align: center; }\n' +
      '  #preview { height: 120px; border-radius: 12px; margin: 15px 0;\n' +
      '             display: flex; align-items: center; justify-content: center;\n' +
      '             color: #fff; font-size: 14px; text-shadow: 0 1px 3px rgba(0,0,0,0.3); }\n' +
      '  .controls { display: flex; gap: 10px; justify-content: center; align-items: center; flex-wrap: wrap; }\n' +
      '  input[type=color] { width: 50px; height: 35px; border: none; cursor: pointer; border-radius: 6px; }\n' +
      '  select, button { padding: 8px 12px; border-radius: 6px; border: 1px solid #ddd; font-size: 14px; }\n' +
      '  button { background: #333; color: #fff; border: none; cursor: pointer; }\n' +
      '  code { background: #f0f0f0; padding: 6px 12px; border-radius: 6px; font-size: 13px; display: inline-block; margin-top: 10px; }\n' +
      '</style>\n' +
      '<h3>🎨 CSS Gradient Generator</h3>\n' +
      '<div class="controls">\n' +
      '  <input type="color" id="c1" value="#667eea" onchange="update()">\n' +
      '  <input type="color" id="c2" value="#764ba2" onchange="update()">\n' +
      '  <select id="dir" onchange="update()">\n' +
      '    <option value="to right">→</option><option value="to left">←</option>\n' +
      '    <option value="to bottom">↓</option><option value="to top">↑</option>\n' +
      '    <option value="135deg" selected>↘</option><option value="45deg">↗</option>\n' +
      '  </select>\n' +
      '  <button onclick="navigator.clipboard.writeText(document.getElementById(\'css\').textContent)">📋 Copy CSS</button>\n' +
      '</div>\n' +
      '<div id="preview"></div>\n' +
      '<code id="css"></code>\n' +
      '<script>\n' +
      '  function update(){ let g=`linear-gradient(${document.getElementById("dir").value}, ${document.getElementById("c1").value}, ${document.getElementById("c2").value})`;\n' +
      '    document.getElementById("preview").style.background=g;\n' +
      '    document.getElementById("css").textContent=`background: ${g};`;\n' +
      '    document.getElementById("preview").textContent=g; }\n' +
      '  update();\n' +
      '</script>\n' +
      '```\n'
  },
  {
    name: 'SQL Playground',
    category: 'coding',
    icon: 'bi-database',
    description: 'Interactive SQL tutorial with CREATE, INSERT, SELECT, JOIN, and aggregate queries on in-memory SQLite',
    content: '# 🗄️ SQL Playground\n\n' +
      '> Run SQL queries on an **in-memory SQLite database** — powered by [sql.js](https://sql.js.org/).\n\n' +
      '> [!TIP]\n' +
      '> Tables persist across blocks on the same page. Run blocks in order to build up your database!\n\n' +
      '> [!NOTE]\n' +
      '> The database resets when you reload the page.\n\n' +
      '---\n\n' +
      '## 📋 Create Tables\n\n' +
      '```sql\n' +
      'CREATE TABLE IF NOT EXISTS employees (\n' +
      '  id INTEGER PRIMARY KEY,\n' +
      '  name TEXT NOT NULL,\n' +
      '  department TEXT,\n' +
      '  salary REAL,\n' +
      '  hire_date TEXT\n' +
      ');\n\n' +
      'CREATE TABLE IF NOT EXISTS departments (\n' +
      '  name TEXT PRIMARY KEY,\n' +
      '  budget REAL,\n' +
      '  location TEXT\n' +
      ')\n' +
      '```\n\n' +
      '---\n\n' +
      '## 📝 Insert Data\n\n' +
      '```sql\n' +
      'INSERT OR REPLACE INTO departments VALUES\n' +
      '  (\'Engineering\', 500000, \'Floor 3\'),\n' +
      '  (\'Marketing\',   200000, \'Floor 2\'),\n' +
      '  (\'Sales\',       300000, \'Floor 1\'),\n' +
      '  (\'HR\',          150000, \'Floor 2\');\n\n' +
      'INSERT OR REPLACE INTO employees VALUES\n' +
      '  (1, \'Alice\',   \'Engineering\', 95000, \'2022-03-15\'),\n' +
      '  (2, \'Bob\',     \'Marketing\',   72000, \'2021-07-01\'),\n' +
      '  (3, \'Carol\',   \'Engineering\', 102000,\'2020-01-10\'),\n' +
      '  (4, \'Dave\',    \'Sales\',       68000, \'2023-06-20\'),\n' +
      '  (5, \'Eve\',     \'Engineering\', 115000,\'2019-11-05\'),\n' +
      '  (6, \'Frank\',   \'HR\',          65000, \'2022-09-12\'),\n' +
      '  (7, \'Grace\',   \'Marketing\',   78000, \'2021-03-28\'),\n' +
      '  (8, \'Hank\',    \'Sales\',       71000, \'2020-08-14\')\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🔍 Basic Queries\n\n' +
      '```sql\n' +
      'SELECT * FROM employees ORDER BY salary DESC\n' +
      '```\n\n' +
      '```sql\n' +
      'SELECT * FROM employees WHERE department = \'Engineering\' ORDER BY hire_date\n' +
      '```\n\n' +
      '---\n\n' +
      '## 📊 Aggregates & GROUP BY\n\n' +
      '```sql\n' +
      'SELECT \n' +
      '  department,\n' +
      '  COUNT(*) as headcount,\n' +
      '  ROUND(AVG(salary), 0) as avg_salary,\n' +
      '  MIN(salary) as min_salary,\n' +
      '  MAX(salary) as max_salary\n' +
      'FROM employees\n' +
      'GROUP BY department\n' +
      'ORDER BY avg_salary DESC\n' +
      '```\n\n' +
      '---\n\n' +
      '## 🔗 JOINs\n\n' +
      '```sql\n' +
      'SELECT \n' +
      '  e.name,\n' +
      '  e.department,\n' +
      '  e.salary,\n' +
      '  d.budget,\n' +
      '  d.location,\n' +
      '  ROUND(e.salary * 100.0 / d.budget, 1) as pct_of_budget\n' +
      'FROM employees e\n' +
      'JOIN departments d ON e.department = d.name\n' +
      'ORDER BY pct_of_budget DESC\n' +
      '```\n'
  },
  {
    name: 'Linux Terminal',
    category: 'coding',
    icon: 'bi-terminal-fill',
    description: 'Full Debian Linux in the browser — install packages, run commands, browse the web with terminal tools',
    content: '# 🐧 Linux Terminal — WebVM\n\n' +
      '> A **full Debian Linux environment** running entirely in your browser via [WebVM](https://webvm.io).\n' +
      '> No backend required — everything runs client-side using WebAssembly.\n\n' +
      '> [!TIP]\n' +
      '> Click **▶ Launch** to boot the Linux terminal. First load may take 30-60 seconds.\n\n' +
      '---\n\n' +
      '## Basic Terminal\n\n' +
      'A minimal Linux terminal with no extra packages:\n\n' +
      '{{Linux:\n}}\n\n' +
      '---\n\n' +
      '## Web Browsing Terminal\n\n' +
      'Terminal with web browsing and API tools pre-installed:\n\n' +
      '{{Linux:\n  Packages: lynx, curl, wget, jq\n}}\n\n' +
      '---\n\n' +
      '## Developer Terminal\n\n' +
      'Full development environment with common tools:\n\n' +
      '{{Linux:\n  Packages: vim, htop, git, python3, curl, jq\n}}\n\n' +
      '---\n\n' +
      '## What You Can Do\n\n' +
      '| Action | Example Command |\n' +
      '|--------|----------------|\n' +
      '| Browse the web | `lynx https://lite.duckduckgo.com` |\n' +
      '| Download files | `wget https://example.com/data.csv` |\n' +
      '| Call APIs | `curl -s https://api.github.com/users/octocat \\| jq .name` |\n' +
      '| Edit files | `vim hello.py` or `nano hello.py` |\n' +
      '| Run Python | `python3 -c "print(42 ** 0.5)"` |\n' +
      '| System info | `uname -a && cat /etc/os-release` |\n' +
      '| Install more | `apt-get install -y nodejs` |\n\n' +
      '> [!NOTE]\n' +
      '> Installed packages persist via IndexedDB — they survive page reloads!\n'
  },
  {
    name: 'Compile & Run',
    category: 'coding',
    icon: 'bi-play-circle',
    description: 'Compile & run C++, Rust, Go, and 25+ languages — results appear inline via Judge0 CE',
    content: '# ⚡ Compile & Run — Multi-Language\n\n' +
      '> Write programs in **C++, Rust, Go, Java**, and 25+ compiled/interpreted languages.\n' +
      '> Click **▶ Run** to compile and execute — output appears inline with execution stats.\n' +
      '> Powered by [Judge0 CE](https://ce.judge0.com) — free, open-source code execution engine.\n\n' +
      '> [!TIP]\n' +
      '> Use `Language:` to set the language and `Script: |` for multi-line code.\n\n' +
      '---\n\n' +
      '## 🔷 C++ — Sort & Sum\n\n' +
      '{{Linux:\n' +
      '  Language: cpp\n' +
      '  Script: |\n' +
      '    #include <iostream>\n' +
      '    #include <vector>\n' +
      '    #include <algorithm>\n\n' +
      '    int main() {\n' +
      '        std::vector<int> nums = {5, 3, 8, 1, 9, 2, 7};\n' +
      '        std::sort(nums.begin(), nums.end());\n\n' +
      '        std::cout << "Sorted: ";\n' +
      '        for (int n : nums) std::cout << n << " ";\n' +
      '        std::cout << std::endl;\n\n' +
      '        int sum = 0;\n' +
      '        for (int n : nums) sum += n;\n' +
      '        std::cout << "Sum: " << sum << std::endl;\n' +
      '        return 0;\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## 🦀 Rust — Fibonacci\n\n' +
      '{{Linux:\n' +
      '  Language: rust\n' +
      '  Script: |\n' +
      '    fn fibonacci(n: u32) -> u64 {\n' +
      '        let (mut a, mut b) = (0u64, 1u64);\n' +
      '        for _ in 0..n {\n' +
      '            let temp = b;\n' +
      '            b = a + b;\n' +
      '            a = temp;\n' +
      '        }\n' +
      '        a\n' +
      '    }\n\n' +
      '    fn main() {\n' +
      '        println!("Fibonacci sequence:");\n' +
      '        for i in 1..=15 {\n' +
      '            println!("  fib({:2}) = {}", i, fibonacci(i));\n' +
      '        }\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## 🐹 Go — Prime Finder\n\n' +
      '{{Linux:\n' +
      '  Language: go\n' +
      '  Script: |\n' +
      '    package main\n\n' +
      '    import (\n' +
      '        "fmt"\n' +
      '        "math"\n' +
      '    )\n\n' +
      '    func isPrime(n int) bool {\n' +
      '        if n < 2 { return false }\n' +
      '        for i := 2; i <= int(math.Sqrt(float64(n))); i++ {\n' +
      '            if n%i == 0 { return false }\n' +
      '        }\n' +
      '        return true\n' +
      '    }\n\n' +
      '    func main() {\n' +
      '        fmt.Println("Primes up to 50:")\n' +
      '        for i := 2; i <= 50; i++ {\n' +
      '            if isPrime(i) {\n' +
      '                fmt.Printf("%d ", i)\n' +
      '            }\n' +
      '        }\n' +
      '        fmt.Println()\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Supported Languages\n\n' +
      '| Language | Tag | Language | Tag |\n' +
      '|----------|-----|----------|-----|\n' +
      '| C | `c` | Kotlin | `kotlin` |\n' +
      '| C++ | `cpp` | Swift | `swift` |\n' +
      '| Rust | `rust` | Haskell | `haskell` |\n' +
      '| Go | `go` | Ruby | `ruby` |\n' +
      '| Java | `java` | Perl | `perl` |\n' +
      '| TypeScript | `ts` | Lua | `lua` |\n' +
      '| Python | `python` | PHP | `php` |\n' +
      '| Bash | `bash` | C# | `csharp` |\n' +
      '| Dart | `dart` | Scala | `scala` |\n' +
      '| R | `r` | JavaScript | `js` |\n'
  },
  // ─── 10 Linux-based language templates ─────────────────────
  {
    name: 'C Programming',
    category: 'coding',
    icon: 'bi-braces',
    description: 'Learn C fundamentals — memory, pointers, structs, and I/O with runnable examples',
    content: '# 🔵 C Programming — Compile & Run\n\n' +
      '> Classic systems programming language. Click **▶ Run** to compile and execute.\n\n' +
      '---\n\n' +
      '## Hello World\n\n' +
      '{{Linux:\n' +
      '  Language: c\n' +
      '  Script: |\n' +
      '    #include <stdio.h>\n\n' +
      '    int main() {\n' +
      '        printf("Hello from C!\\n");\n' +
      '        return 0;\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Arrays & Pointers\n\n' +
      '{{Linux:\n' +
      '  Language: c\n' +
      '  Script: |\n' +
      '    #include <stdio.h>\n\n' +
      '    void swap(int *a, int *b) {\n' +
      '        int temp = *a;\n' +
      '        *a = *b;\n' +
      '        *b = temp;\n' +
      '    }\n\n' +
      '    void bubble_sort(int arr[], int n) {\n' +
      '        for (int i = 0; i < n-1; i++)\n' +
      '            for (int j = 0; j < n-i-1; j++)\n' +
      '                if (arr[j] > arr[j+1])\n' +
      '                    swap(&arr[j], &arr[j+1]);\n' +
      '    }\n\n' +
      '    int main() {\n' +
      '        int nums[] = {64, 25, 12, 22, 11};\n' +
      '        int n = sizeof(nums) / sizeof(nums[0]);\n\n' +
      '        printf("Before: ");\n' +
      '        for (int i = 0; i < n; i++) printf("%d ", nums[i]);\n\n' +
      '        bubble_sort(nums, n);\n\n' +
      '        printf("\\nAfter:  ");\n' +
      '        for (int i = 0; i < n; i++) printf("%d ", nums[i]);\n' +
      '        printf("\\n");\n' +
      '        return 0;\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Structs & Functions\n\n' +
      '{{Linux:\n' +
      '  Language: c\n' +
      '  Script: |\n' +
      '    #include <stdio.h>\n' +
      '    #include <string.h>\n\n' +
      '    typedef struct {\n' +
      '        char name[50];\n' +
      '        int age;\n' +
      '        float gpa;\n' +
      '    } Student;\n\n' +
      '    void print_student(Student s) {\n' +
      '        printf("%-10s  Age: %d  GPA: %.1f\\n", s.name, s.age, s.gpa);\n' +
      '    }\n\n' +
      '    int main() {\n' +
      '        Student students[] = {\n' +
      '            {"Alice", 20, 3.8},\n' +
      '            {"Bob", 22, 3.5},\n' +
      '            {"Carol", 21, 3.9},\n' +
      '        };\n' +
      '        int n = sizeof(students) / sizeof(students[0]);\n\n' +
      '        printf("--- Student Records ---\\n");\n' +
      '        for (int i = 0; i < n; i++)\n' +
      '            print_student(students[i]);\n' +
      '        return 0;\n' +
      '    }\n' +
      '}}\n'
  },
  {
    name: 'C++ Modern',
    category: 'coding',
    icon: 'bi-braces-asterisk',
    description: 'Modern C++ with STL containers, lambdas, smart pointers — compile & run inline',
    content: '# 🔷 C++ Modern — Compile & Run\n\n' +
      '> Modern C++ features with STL. Click **▶ Run** to compile and execute.\n\n' +
      '---\n\n' +
      '## STL Containers & Algorithms\n\n' +
      '{{Linux:\n' +
      '  Language: cpp\n' +
      '  Script: |\n' +
      '    #include <iostream>\n' +
      '    #include <vector>\n' +
      '    #include <algorithm>\n' +
      '    #include <numeric>\n\n' +
      '    int main() {\n' +
      '        std::vector<int> v = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3};\n\n' +
      '        std::sort(v.begin(), v.end());\n' +
      '        auto it = std::unique(v.begin(), v.end());\n' +
      '        v.erase(it, v.end());\n\n' +
      '        std::cout << "Unique sorted: ";\n' +
      '        for (int x : v) std::cout << x << " ";\n' +
      '        std::cout << std::endl;\n\n' +
      '        int sum = std::accumulate(v.begin(), v.end(), 0);\n' +
      '        std::cout << "Sum: " << sum << std::endl;\n' +
      '        std::cout << "Mean: " << (double)sum / v.size() << std::endl;\n' +
      '        return 0;\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Lambdas & Functional\n\n' +
      '{{Linux:\n' +
      '  Language: cpp\n' +
      '  Script: |\n' +
      '    #include <iostream>\n' +
      '    #include <vector>\n' +
      '    #include <algorithm>\n' +
      '    #include <functional>\n\n' +
      '    int main() {\n' +
      '        std::vector<int> nums = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};\n\n' +
      '        // Filter evens with lambda\n' +
      '        std::vector<int> evens;\n' +
      '        std::copy_if(nums.begin(), nums.end(),\n' +
      '            std::back_inserter(evens), [](int n) { return n % 2 == 0; });\n\n' +
      '        std::cout << "Evens: ";\n' +
      '        for (int n : evens) std::cout << n << " ";\n' +
      '        std::cout << std::endl;\n\n' +
      '        // Transform with lambda\n' +
      '        std::vector<int> squares;\n' +
      '        std::transform(nums.begin(), nums.end(),\n' +
      '            std::back_inserter(squares), [](int n) { return n * n; });\n\n' +
      '        std::cout << "Squares: ";\n' +
      '        for (int n : squares) std::cout << n << " ";\n' +
      '        std::cout << std::endl;\n' +
      '        return 0;\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Maps & String Processing\n\n' +
      '{{Linux:\n' +
      '  Language: cpp\n' +
      '  Script: |\n' +
      '    #include <iostream>\n' +
      '    #include <map>\n' +
      '    #include <string>\n' +
      '    #include <sstream>\n\n' +
      '    int main() {\n' +
      '        std::string text = "the quick brown fox jumps over the lazy dog the fox";\n' +
      '        std::map<std::string, int> freq;\n\n' +
      '        std::istringstream iss(text);\n' +
      '        std::string word;\n' +
      '        while (iss >> word) freq[word]++;\n\n' +
      '        std::cout << "Word frequencies:" << std::endl;\n' +
      '        for (auto& [w, c] : freq)\n' +
      '            std::cout << "  " << w << ": " << c << std::endl;\n' +
      '        return 0;\n' +
      '    }\n' +
      '}}\n'
  },
  {
    name: 'Rust Essentials',
    category: 'coding',
    icon: 'bi-gear-wide-connected',
    description: 'Rust ownership, pattern matching, iterators, and error handling — compile & run',
    content: '# 🦀 Rust Essentials — Compile & Run\n\n' +
      '> Memory-safe systems programming. Click **▶ Run** to compile and execute.\n\n' +
      '---\n\n' +
      '## Ownership & Borrowing\n\n' +
      '{{Linux:\n' +
      '  Language: rust\n' +
      '  Script: |\n' +
      '    fn main() {\n' +
      '        let names = vec!["Alice", "Bob", "Carol", "David"];\n\n' +
      '        // Borrowing (read-only)\n' +
      '        let greeting = greet(&names);\n' +
      '        println!("{}", greeting);\n' +
      '        println!("Names still accessible: {:?}", names);\n' +
      '    }\n\n' +
      '    fn greet(names: &[&str]) -> String {\n' +
      '        names.iter()\n' +
      '            .map(|n| format!("Hello, {}!", n))\n' +
      '            .collect::<Vec<_>>()\n' +
      '            .join("\\n")\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Pattern Matching & Enums\n\n' +
      '{{Linux:\n' +
      '  Language: rust\n' +
      '  Script: |\n' +
      '    #[derive(Debug)]\n' +
      '    enum Shape {\n' +
      '        Circle(f64),\n' +
      '        Rectangle(f64, f64),\n' +
      '        Triangle(f64, f64),\n' +
      '    }\n\n' +
      '    impl Shape {\n' +
      '        fn area(&self) -> f64 {\n' +
      '            match self {\n' +
      '                Shape::Circle(r) => std::f64::consts::PI * r * r,\n' +
      '                Shape::Rectangle(w, h) => w * h,\n' +
      '                Shape::Triangle(b, h) => 0.5 * b * h,\n' +
      '            }\n' +
      '        }\n' +
      '    }\n\n' +
      '    fn main() {\n' +
      '        let shapes = vec![\n' +
      '            Shape::Circle(5.0),\n' +
      '            Shape::Rectangle(4.0, 6.0),\n' +
      '            Shape::Triangle(3.0, 8.0),\n' +
      '        ];\n\n' +
      '        for s in &shapes {\n' +
      '            println!("{:?} -> area = {:.2}", s, s.area());\n' +
      '        }\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Iterators & Closures\n\n' +
      '{{Linux:\n' +
      '  Language: rust\n' +
      '  Script: |\n' +
      '    fn main() {\n' +
      '        let data = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n\n' +
      '        let sum_of_squares: i32 = data.iter()\n' +
      '            .filter(|&&x| x % 2 == 0)\n' +
      '            .map(|&x| x * x)\n' +
      '            .sum();\n\n' +
      '        println!("Even numbers: {:?}",\n' +
      '            data.iter().filter(|&&x| x % 2 == 0).collect::<Vec<_>>());\n' +
      '        println!("Sum of their squares: {}", sum_of_squares);\n\n' +
      '        // Fizzbuzz with iterators\n' +
      '        let fizzbuzz: Vec<String> = (1..=20).map(|n| match (n % 3, n % 5) {\n' +
      '            (0, 0) => "FizzBuzz".into(),\n' +
      '            (0, _) => "Fizz".into(),\n' +
      '            (_, 0) => "Buzz".into(),\n' +
      '            _ => n.to_string(),\n' +
      '        }).collect();\n' +
      '        println!("FizzBuzz: {:?}", fizzbuzz);\n' +
      '    }\n' +
      '}}\n'
  },
  {
    name: 'Go Programming',
    category: 'coding',
    icon: 'bi-arrow-right-circle',
    description: 'Go programming with goroutines, channels, slices, and maps — compile & run',
    content: '# 🐹 Go Programming — Compile & Run\n\n' +
      '> Simple, fast, concurrent. Click **▶ Run** to compile and execute.\n\n' +
      '---\n\n' +
      '## Slices & Maps\n\n' +
      '{{Linux:\n' +
      '  Language: go\n' +
      '  Script: |\n' +
      '    package main\n\n' +
      '    import "fmt"\n\n' +
      '    func main() {\n' +
      '        // Slice operations\n' +
      '        fruits := []string{"apple", "banana", "cherry", "date", "elderberry"}\n' +
      '        fmt.Println("Fruits:", fruits)\n' +
      '        fmt.Println("First 3:", fruits[:3])\n\n' +
      '        // Map\n' +
      '        prices := map[string]float64{\n' +
      '            "apple": 1.20, "banana": 0.50,\n' +
      '            "cherry": 2.00, "date": 3.50,\n' +
      '        }\n\n' +
      '        total := 0.0\n' +
      '        for fruit, price := range prices {\n' +
      '            fmt.Printf("  %-10s $%.2f\\n", fruit, price)\n' +
      '            total += price\n' +
      '        }\n' +
      '        fmt.Printf("Total: $%.2f\\n", total)\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Structs & Methods\n\n' +
      '{{Linux:\n' +
      '  Language: go\n' +
      '  Script: |\n' +
      '    package main\n\n' +
      '    import (\n' +
      '        "fmt"\n' +
      '        "math"\n' +
      '    )\n\n' +
      '    type Point struct {\n' +
      '        X, Y float64\n' +
      '    }\n\n' +
      '    func (p Point) Distance(q Point) float64 {\n' +
      '        return math.Sqrt(math.Pow(p.X-q.X, 2) + math.Pow(p.Y-q.Y, 2))\n' +
      '    }\n\n' +
      '    func (p Point) String() string {\n' +
      '        return fmt.Sprintf("(%.1f, %.1f)", p.X, p.Y)\n' +
      '    }\n\n' +
      '    func main() {\n' +
      '        points := []Point{{0, 0}, {3, 4}, {6, 8}, {1, 1}}\n\n' +
      '        for i := 0; i < len(points)-1; i++ {\n' +
      '            d := points[i].Distance(points[i+1])\n' +
      '            fmt.Printf("%s -> %s = %.2f\\n", points[i], points[i+1], d)\n' +
      '        }\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Error Handling\n\n' +
      '{{Linux:\n' +
      '  Language: go\n' +
      '  Script: |\n' +
      '    package main\n\n' +
      '    import (\n' +
      '        "errors"\n' +
      '        "fmt"\n' +
      '        "math"\n' +
      '    )\n\n' +
      '    func sqrt(x float64) (float64, error) {\n' +
      '        if x < 0 {\n' +
      '            return 0, errors.New("cannot compute square root of negative number")\n' +
      '        }\n' +
      '        return math.Sqrt(x), nil\n' +
      '    }\n\n' +
      '    func main() {\n' +
      '        values := []float64{16, 25, -4, 100, 0}\n' +
      '        for _, v := range values {\n' +
      '            result, err := sqrt(v)\n' +
      '            if err != nil {\n' +
      '                fmt.Printf("sqrt(%.0f) -> Error: %s\\n", v, err)\n' +
      '            } else {\n' +
      '                fmt.Printf("sqrt(%.0f) -> %.2f\\n", v, result)\n' +
      '            }\n' +
      '        }\n' +
      '    }\n' +
      '}}\n'
  },
  {
    name: 'Java OOP',
    category: 'coding',
    icon: 'bi-cup-hot',
    description: 'Java classes, inheritance, collections, and streams — compile & run inline',
    content: '# ☕ Java OOP — Compile & Run\n\n' +
      '> Object-oriented programming in Java. Click **▶ Run** to compile and execute.\n\n' +
      '---\n\n' +
      '## Classes & Inheritance\n\n' +
      '{{Linux:\n' +
      '  Language: java\n' +
      '  Script: |\n' +
      '    import java.util.*;\n\n' +
      '    abstract class Animal {\n' +
      '        String name;\n' +
      '        Animal(String name) { this.name = name; }\n' +
      '        abstract String speak();\n' +
      '        public String toString() {\n' +
      '            return name + " says " + speak();\n' +
      '        }\n' +
      '    }\n\n' +
      '    class Dog extends Animal {\n' +
      '        Dog(String n) { super(n); }\n' +
      '        String speak() { return "Woof!"; }\n' +
      '    }\n\n' +
      '    class Cat extends Animal {\n' +
      '        Cat(String n) { super(n); }\n' +
      '        String speak() { return "Meow!"; }\n' +
      '    }\n\n' +
      '    public class Main {\n' +
      '        public static void main(String[] args) {\n' +
      '            List<Animal> animals = List.of(\n' +
      '                new Dog("Rex"), new Cat("Whiskers"),\n' +
      '                new Dog("Buddy"), new Cat("Luna")\n' +
      '            );\n' +
      '            animals.forEach(System.out::println);\n' +
      '        }\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Collections & Streams\n\n' +
      '{{Linux:\n' +
      '  Language: java\n' +
      '  Script: |\n' +
      '    import java.util.*;\n' +
      '    import java.util.stream.*;\n\n' +
      '    public class Main {\n' +
      '        public static void main(String[] args) {\n' +
      '            List<String> words = List.of(\n' +
      '                "hello", "world", "java", "streams",\n' +
      '                "are", "powerful", "and", "elegant"\n' +
      '            );\n\n' +
      '            // Filter, transform, collect\n' +
      '            String result = words.stream()\n' +
      '                .filter(w -> w.length() > 3)\n' +
      '                .map(String::toUpperCase)\n' +
      '                .sorted()\n' +
      '                .collect(Collectors.joining(", "));\n\n' +
      '            System.out.println("Long words (uppercase): " + result);\n\n' +
      '            // Statistics\n' +
      '            IntSummaryStatistics stats = words.stream()\n' +
      '                .mapToInt(String::length)\n' +
      '                .summaryStatistics();\n\n' +
      '            System.out.printf("Word lengths -> min: %d, max: %d, avg: %.1f%n",\n' +
      '                stats.getMin(), stats.getMax(), stats.getAverage());\n' +
      '        }\n' +
      '    }\n' +
      '}}\n'
  },
  {
    name: 'Python Algorithms',
    category: 'coding',
    icon: 'bi-graph-up',
    description: 'Python data structures, algorithms, and comprehensions — compile & run via Judge0',
    content: '# 🐍 Python Algorithms — Compile & Run\n\n' +
      '> Python via Judge0 CE (server-side CPython). Click **▶ Run** to execute.\n\n' +
      '> [!TIP]\n' +
      '> For in-browser Python (Pyodide WASM), use regular \\`\\`\\`python code fences instead.\n\n' +
      '---\n\n' +
      '## Sorting Algorithms\n\n' +
      '{{Linux:\n' +
      '  Language: python\n' +
      '  Script: |\n' +
      '    import time\n\n' +
      '    def quicksort(arr):\n' +
      '        if len(arr) <= 1: return arr\n' +
      '        pivot = arr[len(arr) // 2]\n' +
      '        left = [x for x in arr if x < pivot]\n' +
      '        mid = [x for x in arr if x == pivot]\n' +
      '        right = [x for x in arr if x > pivot]\n' +
      '        return quicksort(left) + mid + quicksort(right)\n\n' +
      '    import random\n' +
      '    data = random.sample(range(1, 101), 20)\n' +
      '    print(f"Input:  {data}")\n\n' +
      '    start = time.perf_counter()\n' +
      '    sorted_data = quicksort(data)\n' +
      '    elapsed = time.perf_counter() - start\n\n' +
      '    print(f"Sorted: {sorted_data}")\n' +
      '    print(f"Time:   {elapsed*1000:.3f} ms")\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Data Processing\n\n' +
      '{{Linux:\n' +
      '  Language: python\n' +
      '  Script: |\n' +
      '    from collections import Counter\n\n' +
      '    text = """To be or not to be that is the question\n' +
      '    Whether tis nobler in the mind to suffer\n' +
      '    The slings and arrows of outrageous fortune"""\n\n' +
      '    words = text.lower().split()\n' +
      '    freq = Counter(words)\n\n' +
      '    print("Top 10 words:")\n' +
      '    for word, count in freq.most_common(10):\n' +
      '        bar = "█" * count\n' +
      '        print(f"  {word:12} {count:2} {bar}")\n\n' +
      '    print(f"\\nTotal words: {len(words)}")\n' +
      '    print(f"Unique words: {len(freq)}")\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Matrix Operations\n\n' +
      '{{Linux:\n' +
      '  Language: python\n' +
      '  Script: |\n' +
      '    def matrix_multiply(A, B):\n' +
      '        rows_A, cols_A = len(A), len(A[0])\n' +
      '        rows_B, cols_B = len(B), len(B[0])\n' +
      '        result = [[0] * cols_B for _ in range(rows_A)]\n' +
      '        for i in range(rows_A):\n' +
      '            for j in range(cols_B):\n' +
      '                for k in range(cols_A):\n' +
      '                    result[i][j] += A[i][k] * B[k][j]\n' +
      '        return result\n\n' +
      '    def print_matrix(name, m):\n' +
      '        print(f"{name}:")\n' +
      '        for row in m:\n' +
      '            print("  [" + ", ".join(f"{x:4}" for x in row) + "]")\n\n' +
      '    A = [[1, 2, 3], [4, 5, 6]]\n' +
      '    B = [[7, 8], [9, 10], [11, 12]]\n' +
      '    C = matrix_multiply(A, B)\n\n' +
      '    print_matrix("A (2x3)", A)\n' +
      '    print_matrix("B (3x2)", B)\n' +
      '    print_matrix("A × B (2x2)", C)\n' +
      '}}\n'
  },
  {
    name: 'TypeScript',
    category: 'coding',
    icon: 'bi-filetype-tsx',
    description: 'TypeScript generics, interfaces, and utility types — compile & run inline',
    content: '# 📘 TypeScript — Compile & Run\n\n' +
      '> Type-safe JavaScript. Click **▶ Run** to compile and execute.\n\n' +
      '---\n\n' +
      '## Generics & Interfaces\n\n' +
      '{{Linux:\n' +
      '  Language: typescript\n' +
      '  Script: |\n' +
      '    interface Comparable<T> {\n' +
      '      compareTo(other: T): number;\n' +
      '    }\n\n' +
      '    class Temperature implements Comparable<Temperature> {\n' +
      '      constructor(public celsius: number) {}\n' +
      '      compareTo(other: Temperature): number {\n' +
      '        return this.celsius - other.celsius;\n' +
      '      }\n' +
      '      toString(): string {\n' +
      '        return `${this.celsius}°C (${(this.celsius * 9/5 + 32).toFixed(1)}°F)`;\n' +
      '      }\n' +
      '    }\n\n' +
      '    function findMinMax<T extends Comparable<T>>(items: T[]): [T, T] {\n' +
      '      let min = items[0], max = items[0];\n' +
      '      for (const item of items) {\n' +
      '        if (item.compareTo(min) < 0) min = item;\n' +
      '        if (item.compareTo(max) > 0) max = item;\n' +
      '      }\n' +
      '      return [min, max];\n' +
      '    }\n\n' +
      '    const temps = [22, 35, -5, 18, 40, 0, 15].map(c => new Temperature(c));\n' +
      '    const [coldest, hottest] = findMinMax(temps);\n' +
      '    console.log(`Coldest: ${coldest}`);\n' +
      '    console.log(`Hottest: ${hottest}`);\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Utility Types & Type Guards\n\n' +
      '{{Linux:\n' +
      '  Language: typescript\n' +
      '  Script: |\n' +
      '    type Result<T> = { ok: true; value: T } | { ok: false; error: string };\n\n' +
      '    function divide(a: number, b: number): Result<number> {\n' +
      '      if (b === 0) return { ok: false, error: "Division by zero" };\n' +
      '      return { ok: true, value: a / b };\n' +
      '    }\n\n' +
      '    function safeSqrt(x: number): Result<number> {\n' +
      '      if (x < 0) return { ok: false, error: "Negative input" };\n' +
      '      return { ok: true, value: Math.sqrt(x) };\n' +
      '    }\n\n' +
      '    const tests: [string, Result<number>][] = [\n' +
      '      ["10 / 3", divide(10, 3)],\n' +
      '      ["10 / 0", divide(10, 0)],\n' +
      '      ["sqrt(16)", safeSqrt(16)],\n' +
      '      ["sqrt(-4)", safeSqrt(-4)],\n' +
      '    ];\n\n' +
      '    for (const [expr, result] of tests) {\n' +
      '      if (result.ok) {\n' +
      '        console.log(`${expr} = ${result.value.toFixed(4)}`);\n' +
      '      } else {\n' +
      '        console.log(`${expr} -> ERROR: ${result.error}`);\n' +
      '      }\n' +
      '    }\n' +
      '}}\n'
  },
  {
    name: 'Ruby Scripting',
    category: 'coding',
    icon: 'bi-gem',
    description: 'Ruby blocks, symbols, hashes, and OOP — compile & run inline',
    content: '# 💎 Ruby Scripting — Compile & Run\n\n' +
      '> Elegant and expressive. Click **▶ Run** to execute.\n\n' +
      '---\n\n' +
      '## Blocks & Enumerable\n\n' +
      '{{Linux:\n' +
      '  Language: ruby\n' +
      '  Script: |\n' +
      '    numbers = (1..20).to_a\n\n' +
      '    evens = numbers.select(&:even?)\n' +
      '    puts "Evens: #{evens.inspect}"\n\n' +
      '    squares = numbers.map { |n| n ** 2 }\n' +
      '    puts "Squares: #{squares.inspect}"\n\n' +
      '    sum = numbers.reduce(:+)\n' +
      '    puts "Sum 1..20: #{sum}"\n\n' +
      '    grouped = numbers.group_by { |n| n % 3 }\n' +
      '    grouped.each do |remainder, nums|\n' +
      '      puts "  mod 3 = #{remainder}: #{nums.inspect}"\n' +
      '    end\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Classes & Mixins\n\n' +
      '{{Linux:\n' +
      '  Language: ruby\n' +
      '  Script: |\n' +
      '    module Printable\n' +
      '      def display\n' +
      '        puts to_s\n' +
      '      end\n' +
      '    end\n\n' +
      '    class Product\n' +
      '      include Printable\n' +
      '      include Comparable\n\n' +
      '      attr_reader :name, :price\n\n' +
      '      def initialize(name, price)\n' +
      '        @name = name\n' +
      '        @price = price\n' +
      '      end\n\n' +
      '      def <=>(other)\n' +
      '        price <=> other.price\n' +
      '      end\n\n' +
      '      def to_s\n' +
      '        "#{name}: $#{"%.2f" % price}"\n' +
      '      end\n' +
      '    end\n\n' +
      '    products = [\n' +
      '      Product.new("Laptop", 999.99),\n' +
      '      Product.new("Mouse", 29.99),\n' +
      '      Product.new("Keyboard", 79.99),\n' +
      '      Product.new("Monitor", 449.99),\n' +
      '    ]\n\n' +
      '    puts "Sorted by price:"\n' +
      '    products.sort.each(&:display)\n' +
      '    puts "\\nCheapest: #{products.min}"\n' +
      '    puts "Most expensive: #{products.max}"\n' +
      '}}\n'
  },
  {
    name: 'Kotlin Playground',
    category: 'coding',
    icon: 'bi-hexagon',
    description: 'Kotlin data classes, null safety, and functional idioms — compile & run',
    content: '# 🟣 Kotlin Playground — Compile & Run\n\n' +
      '> Modern, concise JVM language. Click **▶ Run** to compile and execute.\n\n' +
      '---\n\n' +
      '## Data Classes & Null Safety\n\n' +
      '{{Linux:\n' +
      '  Language: kotlin\n' +
      '  Script: |\n' +
      '    data class User(val name: String, val email: String?, val age: Int)\n\n' +
      '    fun main() {\n' +
      '        val users = listOf(\n' +
      '            User("Alice", "alice@example.com", 28),\n' +
      '            User("Bob", null, 35),\n' +
      '            User("Carol", "carol@example.com", 22),\n' +
      '            User("David", null, 40),\n' +
      '        )\n\n' +
      '        println("All users:")\n' +
      '        users.forEach { u ->\n' +
      '            val email = u.email ?: "(no email)"\n' +
      '            println("  ${u.name}, age ${u.age} — $email")\n' +
      '        }\n\n' +
      '        val avgAge = users.map { it.age }.average()\n' +
      '        println("\\nAverage age: ${"%.1f".format(avgAge)}")\n\n' +
      '        val withEmail = users.filter { it.email != null }\n' +
      '        println("Users with email: ${withEmail.map { it.name }}")\n' +
      '    }\n' +
      '}}\n\n' +
      '---\n\n' +
      '## When Expressions & Extension Functions\n\n' +
      '{{Linux:\n' +
      '  Language: kotlin\n' +
      '  Script: |\n' +
      '    fun Int.toRoman(): String {\n' +
      '        val romanNumerals = listOf(\n' +
      '            1000 to "M", 900 to "CM", 500 to "D", 400 to "CD",\n' +
      '            100 to "C", 90 to "XC", 50 to "L", 40 to "XL",\n' +
      '            10 to "X", 9 to "IX", 5 to "V", 4 to "IV", 1 to "I"\n' +
      '        )\n' +
      '        var remaining = this\n' +
      '        return buildString {\n' +
      '            for ((value, symbol) in romanNumerals) {\n' +
      '                while (remaining >= value) {\n' +
      '                    append(symbol)\n' +
      '                    remaining -= value\n' +
      '                }\n' +
      '            }\n' +
      '        }\n' +
      '    }\n\n' +
      '    fun main() {\n' +
      '        val years = listOf(1990, 2000, 2024, 2026, 42, 1776)\n' +
      '        for (year in years) {\n' +
      '            println("$year -> ${year.toRoman()}")\n' +
      '        }\n' +
      '    }\n' +
      '}}\n'
  },
  {
    name: 'Scala Functional',
    category: 'coding',
    icon: 'bi-diamond',
    description: 'Scala case classes, pattern matching, and higher-order functions — compile & run',
    content: '# 🔴 Scala Functional — Compile & Run\n\n' +
      '> FP + OOP on the JVM. Click **▶ Run** to compile and execute.\n\n' +
      '---\n\n' +
      '## Case Classes & Pattern Matching\n\n' +
      '{{Linux:\n' +
      '  Language: scala\n' +
      '  Script: |\n' +
      '    sealed trait Expr\n' +
      '    case class Num(n: Double) extends Expr\n' +
      '    case class Add(a: Expr, b: Expr) extends Expr\n' +
      '    case class Mul(a: Expr, b: Expr) extends Expr\n\n' +
      '    def eval(e: Expr): Double = e match {\n' +
      '      case Num(n) => n\n' +
      '      case Add(a, b) => eval(a) + eval(b)\n' +
      '      case Mul(a, b) => eval(a) * eval(b)\n' +
      '    }\n\n' +
      '    def show(e: Expr): String = e match {\n' +
      '      case Num(n) => n.toString\n' +
      '      case Add(a, b) => s"(${show(a)} + ${show(b)})"\n' +
      '      case Mul(a, b) => s"(${show(a)} * ${show(b)})"\n' +
      '    }\n\n' +
      '    // (2 + 3) * (4 + 5)\n' +
      '    val expr = Mul(Add(Num(2), Num(3)), Add(Num(4), Num(5)))\n' +
      '    println(s"${show(expr)} = ${eval(expr)}")\n\n' +
      '    // 1 + 2 * 3\n' +
      '    val expr2 = Add(Num(1), Mul(Num(2), Num(3)))\n' +
      '    println(s"${show(expr2)} = ${eval(expr2)}")\n' +
      '}}\n\n' +
      '---\n\n' +
      '## Higher-Order Functions & Collections\n\n' +
      '{{Linux:\n' +
      '  Language: scala\n' +
      '  Script: |\n' +
      '    val data = List(3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5)\n\n' +
      '    val unique = data.distinct.sorted\n' +
      '    println(s"Unique sorted: $unique")\n\n' +
      '    val stats = Map(\n' +
      '      "sum" -> data.sum,\n' +
      '      "min" -> data.min,\n' +
      '      "max" -> data.max,\n' +
      '      "mean" -> data.sum.toDouble / data.length\n' +
      '    )\n' +
      '    stats.foreach { case (k, v) => println(s"  $k: $v") }\n\n' +
      '    // Group and count\n' +
      '    val freq = data.groupBy(identity).map { case (k, v) => (k, v.length) }\n' +
      '    println(s"\\nFrequency: $freq")\n\n' +
      '    // FizzBuzz\n' +
      '    val fizzbuzz = (1 to 15).map {\n' +
      '      case n if n % 15 == 0 => "FizzBuzz"\n' +
      '      case n if n % 3 == 0 => "Fizz"\n' +
      '      case n if n % 5 == 0 => "Buzz"\n' +
      '      case n => n.toString\n' +
      '    }\n' +
      '    println(s"\\nFizzBuzz: ${fizzbuzz.mkString(", ")}")\n' +
      '}}\n'
  },
];

