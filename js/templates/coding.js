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
];
