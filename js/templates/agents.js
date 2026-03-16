// ============================================
// templates/agents.js — Complex Agent Templates
// Showcases: Code, Math, SQL, HTML, Tables,
// AI/Think tags, Mermaid, Variables, and more
// ============================================
window.__MDV_TEMPLATES_AGENTS = [
    {
        name: 'Data Science Pipeline',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-diagram-3',
        description: 'End-to-end data science workflow — Python code, statistical math, data tables, and pipeline diagrams',
        variables: [
            { name: 'datasetName', value: 'Customer Churn Dataset', desc: 'Name of the dataset' },
            { name: 'authorName', value: 'Data Scientist', desc: 'Author name' },
        ],
        content: `# 🔬 Data Science Pipeline — $(datasetName)

**Author:** $(authorName)
**Date:** $(date)
**Status:** In Progress

---

## Pipeline Architecture

\`\`\`mermaid
flowchart LR
    A[📥 Raw Data] --> B[🧹 Cleaning]
    B --> C[🔍 EDA]
    C --> D[⚙️ Feature Eng.]
    D --> E[🤖 Model Training]
    E --> F[📊 Evaluation]
    F --> G{Accuracy > 90%?}
    G -->|Yes| H[🚀 Deploy]
    G -->|No| D
\`\`\`

---

## 1. Data Loading & Exploration

\`\`\`python
import json, math, random

# Simulate dataset
random.seed(42)
n = 200
data = []
for i in range(n):
    age = random.randint(18, 70)
    tenure = random.randint(0, 72)
    monthly = round(random.uniform(20, 120), 2)
    churned = 1 if (tenure < 12 and monthly > 80) or random.random() < 0.15 else 0
    data.append({"age": age, "tenure": tenure, "monthly_charge": monthly, "churned": churned})

print(f"Dataset: {n} records")
print(f"Churn rate: {sum(d['churned'] for d in data)/n*100:.1f}%")
print(f"Avg age: {sum(d['age'] for d in data)/n:.1f}")
print(f"Avg tenure: {sum(d['tenure'] for d in data)/n:.1f} months")
print(f"Avg monthly charge: \${sum(d['monthly_charge'] for d in data)/n:.2f}")
\`\`\`

---

## 2. Statistical Analysis

### Key Formulas

**Mean:** $\\mu = \\frac{1}{n}\\sum_{i=1}^{n} x_i$

**Standard Deviation:** $\\sigma = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(x_i - \\mu)^2}$

**Pearson Correlation:** $r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i-\\bar{x})^2 \\sum(y_i-\\bar{y})^2}}$

\`\`\`math
// Descriptive statistics
data = [85, 90, 78, 92, 88, 76, 95, 89, 84, 91]
mean(data)
std(data)
variance(data)
median(data)
\`\`\`

---

## 3. Feature Importance

| Feature | Correlation | Importance | Type |
|---------|----------:|----------:|------|
| Tenure | -0.72 | 0.341 | Numeric |
| Monthly Charges | 0.65 | 0.287 | Numeric |
| Contract Type | -0.58 | 0.198 | Categorical |
| Age | -0.12 | 0.089 | Numeric |
| Support Tickets | 0.45 | 0.085 | Numeric |

---

## 4. Model Training

\`\`\`python
# Logistic Regression from scratch
import math, random

def sigmoid(z):
    return 1 / (1 + math.exp(-max(-500, min(500, z))))

def predict(weights, x):
    z = sum(w * xi for w, xi in zip(weights, x))
    return sigmoid(z)

# Generate training data
random.seed(42)
X = [[random.gauss(0, 1), random.gauss(0, 1)] for _ in range(100)]
y = [1 if (x[0] + x[1] > 0.5) else 0 for x in X]

# Train: gradient descent
weights = [0.0, 0.0]
lr = 0.1
for epoch in range(100):
    for xi, yi in zip(X, y):
        pred = predict(weights, xi)
        error = yi - pred
        for j in range(len(weights)):
            weights[j] += lr * error * xi[j]

# Evaluate
correct = sum(1 for xi, yi in zip(X, y) if (predict(weights, xi) > 0.5) == yi)
print(f"Accuracy: {correct/len(y)*100:.1f}%")
print(f"Weights: {[round(w, 4) for w in weights]}")
\`\`\`

---

## 5. Results Summary

{{AI: Based on the data science pipeline above, write a comprehensive results summary. Include model performance metrics, key insights from feature importance, and actionable recommendations for reducing customer churn. Use bullet points and a summary table.}}

---

## 🔗 Agent Pipeline — Automated Analysis

{{Agent:
  Step 1: Analyze the customer churn dataset described above. Identify the top 5 features most correlated with churn based on the data schema.
  Step 2: Using the features from Step 1, propose a machine learning pipeline with preprocessing, model selection, and hyperparameter tuning.
  Step 3: Write a complete Python script implementing the pipeline from Step 2 with train/test split, training, evaluation metrics, and a classification report.
}}

> 💡 **How to use:** Set your dataset name in the variables, run the Python blocks to see live results, evaluate the math blocks, then click **✨ Fill** for the AI summary.
`
    },
    {
        name: 'SQL Database Workshop',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-database-gear',
        description: 'Interactive SQL workshop — schema design, queries, ERD diagrams, and sample data tables',
        variables: [
            { name: 'dbName', value: 'ecommerce_db', desc: 'Database name' },
            { name: 'authorName', value: 'DBA', desc: 'Author name' },
        ],
        content: `# 🗄️ SQL Database Workshop — $(dbName)

**Author:** $(authorName)
**Date:** $(date)
**Engine:** PostgreSQL 16

---

## Entity Relationship Diagram

\`\`\`mermaid
erDiagram
    CUSTOMERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : "listed in"
    CATEGORIES ||--o{ PRODUCTS : categorizes
    CUSTOMERS {
        int id PK
        varchar name
        varchar email
        timestamp created_at
    }
    ORDERS {
        int id PK
        int customer_id FK
        decimal total
        varchar status
        timestamp order_date
    }
    PRODUCTS {
        int id PK
        varchar name
        decimal price
        int category_id FK
        int stock
    }
    ORDER_ITEMS {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal unit_price
    }
    CATEGORIES {
        int id PK
        varchar name
        varchar description
    }
\`\`\`

---

## 1. Schema Definition

\`\`\`sql
-- Create the database schema (SQLite)
CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    price       REAL NOT NULL CHECK (price > 0),
    category_id INTEGER REFERENCES categories(id),
    stock       INTEGER DEFAULT 0 CHECK (stock >= 0)
);

CREATE TABLE IF NOT EXISTS customers (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    city  TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    total       REAL DEFAULT 0,
    status      TEXT DEFAULT 'pending'
                CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
    order_date  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL
);

-- Insert sample data
INSERT OR IGNORE INTO categories VALUES (1,'Electronics','Tech gadgets'),(2,'Furniture','Office furniture'),(3,'Audio','Headphones & speakers');
INSERT OR IGNORE INTO products VALUES (1,'Wireless Mouse',29.99,1,150),(2,'USB-C Hub',49.99,1,80),(3,'Standing Desk',399.00,2,25),(4,'Ergonomic Chair',599.00,2,18),(5,'Noise-Cancel Headphones',249.99,3,60);
INSERT OR IGNORE INTO customers VALUES (1,'Alice Johnson','alice@example.com','New York'),(2,'Bob Smith','bob@example.com','London'),(3,'Carol Williams','carol@example.com','Tokyo'),(4,'David Kim','david@example.com','Seoul'),(5,'Eve Martinez','eve@example.com','São Paulo');
INSERT OR IGNORE INTO orders VALUES (1,1,329.98,'delivered','2024-01-15'),(2,2,449.99,'shipped','2024-02-10'),(3,1,599.00,'delivered','2024-03-05'),(4,3,79.98,'processing','2024-03-12'),(5,4,848.99,'shipped','2024-03-18'),(6,5,29.99,'cancelled','2024-03-20');
INSERT OR IGNORE INTO order_items VALUES (1,1,1,2,29.99),(2,1,2,1,49.99),(3,1,5,1,249.99),(4,2,4,1,449.99),(5,3,4,1,599.00),(6,4,1,1,29.99),(7,4,2,1,49.99),(8,5,4,1,599.00),(9,5,5,1,249.99),(10,6,1,1,29.99);

SELECT 'Schema created & data loaded!' AS status, COUNT(*) AS total_orders FROM orders;
\`\`\`

---

## 2. Sample Data

| Customer | Email | City |
|----------|-------|------|
| Alice Johnson | alice@example.com | New York |
| Bob Smith | bob@example.com | London |
| Carol Williams | carol@example.com | Tokyo |
| David Kim | david@example.com | Seoul |
| Eve Martinez | eve@example.com | São Paulo |

| Product | Price | Category | Stock |
|---------|------:|----------|------:|
| Wireless Mouse | 29.99 | Electronics | 150 |
| USB-C Hub | 49.99 | Electronics | 80 |
| Standing Desk | 399.00 | Furniture | 25 |
| Ergonomic Chair | 599.00 | Furniture | 18 |
| Noise-Cancel Headphones | 249.99 | Audio | 60 |

---

## 3. Analytical Queries

\`\`\`sql
-- Top 5 customers by total spending
SELECT c.name, c.email,
       COUNT(o.id) AS total_orders,
       ROUND(SUM(o.total), 2) AS total_spent,
       ROUND(AVG(o.total), 2) AS avg_order
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status != 'cancelled'
GROUP BY c.id, c.name, c.email
ORDER BY total_spent DESC
LIMIT 5;
\`\`\`

\`\`\`sql
-- Monthly revenue trend
SELECT strftime('%Y-%m', order_date) AS month,
       COUNT(*) AS orders,
       ROUND(SUM(total), 2) AS revenue,
       ROUND(AVG(total), 2) AS avg_order_value
FROM orders
WHERE status IN ('shipped', 'delivered')
GROUP BY month
ORDER BY month;
\`\`\`

\`\`\`sql
-- Product sales with category breakdown
SELECT cat.name AS category,
       p.name AS product,
       SUM(oi.quantity) AS units_sold,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN categories cat ON p.category_id = cat.id
GROUP BY cat.name, p.name
ORDER BY category, revenue DESC;
\`\`\`

---

## 4. Performance Optimization

{{@AI:
  @think: yes
  @prompt: Analyze the SQL queries above and recommend performance optimizations. Consider:
1. Query execution plans and potential bottlenecks
2. Missing indexes that could improve performance
3. Query rewriting opportunities (e.g., CTEs, materialized views)
4. Partitioning strategy for the orders table
5. Caching recommendations for frequently-run analytical queries

Provide specific, actionable recommendations with expected performance improvements.}}

---

## 🔗 Agent Pipeline — Database Optimization

{{Agent:
  Step 1: Review the e-commerce database schema above and identify potential performance bottlenecks for the top 5 queries.
  Step 2: For each bottleneck from Step 1, propose index strategies, query rewrites, or schema changes with exact CREATE INDEX statements.
  Step 3: Generate a migration script implementing all optimizations from Step 2 with rollback procedures and performance estimates.
}}

> 💡 **How to use:** Review the schema, study the queries, then click **✨ Fill** for AI-powered optimization analysis.
`
    },
    {
        name: 'Full-Stack App Blueprint',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-layers',
        description: 'Complete app architecture — interactive HTML preview, API design, JS logic, and deployment diagram',
        content: '# 🏗️ Full-Stack App Blueprint — Task Manager\n\n' +
            '**Date:** $(date)\n' +
            '**Stack:** HTML + CSS + JavaScript (Frontend) · Node.js (Backend) · PostgreSQL (DB)\n\n' +
            '---\n\n' +
            '## Architecture Overview\n\n' +
            '```mermaid\n' +
            'flowchart TB\n' +
            '    subgraph Frontend\n' +
            '        A[React SPA] --> B[State Manager]\n' +
            '        B --> C[API Client]\n' +
            '    end\n' +
            '    subgraph Backend\n' +
            '        D[Express API] --> E[Auth Middleware]\n' +
            '        D --> F[Task Controller]\n' +
            '        D --> G[User Controller]\n' +
            '    end\n' +
            '    subgraph Data\n' +
            '        H[(PostgreSQL)]\n' +
            '        I[(Redis Cache)]\n' +
            '    end\n' +
            '    C --> D\n' +
            '    F --> H\n' +
            '    G --> H\n' +
            '    E --> I\n' +
            '```\n\n' +
            '---\n\n' +
            '## Interactive UI Prototype\n\n' +
            '```html\n' +
            '<style>\n' +
            '  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '  body { font-family: "Segoe UI", system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }\n' +
            '  h2 { background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px; }\n' +
            '  .input-row { display: flex; gap: 8px; margin-bottom: 16px; }\n' +
            '  input[type="text"] { flex: 1; padding: 10px 14px; border: 1px solid #334155; border-radius: 10px; background: #1e293b; color: #e2e8f0; font-size: 1em; outline: none; }\n' +
            '  input[type="text"]:focus { border-color: #6366f1; }\n' +
            '  .add-btn { padding: 10px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; }\n' +
            '  .task { display: flex; align-items: center; gap: 10px; padding: 12px 14px; margin: 6px 0; border-radius: 10px; border: 1px solid #334155; background: #1e293b; }\n' +
            '  .task.done span { text-decoration: line-through; opacity: 0.5; }\n' +
            '  .task input[type="checkbox"] { accent-color: #6366f1; width: 18px; height: 18px; }\n' +
            '  .task span { flex: 1; }\n' +
            '  .task .del { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 1.2em; }\n' +
            '  .stats { color: #94a3b8; font-size: .9em; margin-top: 12px; }\n' +
            '</style>\n' +
            '<h2>✅ Task Manager</h2>\n' +
            '<div class="input-row">\n' +
            '  <input type="text" id="inp" placeholder="Add a new task..." onkeydown="if(event.key===\'Enter\')add()">\n' +
            '  <button class="add-btn" onclick="add()">+ Add</button>\n' +
            '</div>\n' +
            '<div id="list"></div>\n' +
            '<div class="stats" id="stats"></div>\n' +
            '<script>\n' +
            '  let tasks = [{text:"Design landing page",done:true},{text:"Implement auth API",done:false},{text:"Write unit tests",done:false}];\n' +
            '  function render() {\n' +
            '    const el = document.getElementById("list");\n' +
            '    el.innerHTML = tasks.map((t,i) => `<div class="task${t.done?" done":""}"><input type="checkbox" ${t.done?"checked":""} onchange="toggle(${i})"><span>${t.text}</span><button class="del" onclick="del(${i})">×</button></div>`).join("");\n' +
            '    const done = tasks.filter(t=>t.done).length;\n' +
            '    document.getElementById("stats").textContent = `${done}/${tasks.length} completed`;\n' +
            '  }\n' +
            '  function add() { const v=document.getElementById("inp"); if(v.value.trim()){tasks.push({text:v.value.trim(),done:false});v.value="";render();} }\n' +
            '  function toggle(i) { tasks[i].done=!tasks[i].done; render(); }\n' +
            '  function del(i) { tasks.splice(i,1); render(); }\n' +
            '  render();\n' +
            '</script>\n' +
            '```\n\n' +
            '---\n\n' +
            '## API Endpoints\n\n' +
            '| Method | Endpoint | Description | Auth |\n' +
            '|--------|----------|-------------|------|\n' +
            '| POST | `/api/auth/register` | Register new user | No |\n' +
            '| POST | `/api/auth/login` | Login, returns JWT | No |\n' +
            '| GET | `/api/tasks` | List all tasks | JWT |\n' +
            '| POST | `/api/tasks` | Create a task | JWT |\n' +
            '| PATCH | `/api/tasks/:id` | Update a task | JWT |\n' +
            '| DELETE | `/api/tasks/:id` | Delete a task | JWT |\n' +
            '| GET | `/api/tasks/stats` | Task statistics | JWT |\n\n' +
            '---\n\n' +
            '## Backend Logic\n\n' +
            '```javascript\n' +
            '// Express route handler example\n' +
            'const tasks = [\n' +
            '  { id: 1, text: "Design landing page", done: true, priority: "high" },\n' +
            '  { id: 2, text: "Implement auth API", done: false, priority: "high" },\n' +
            '  { id: 3, text: "Write unit tests", done: false, priority: "medium" },\n' +
            '  { id: 4, text: "Deploy to staging", done: false, priority: "low" },\n' +
            '];\n\n' +
            '// Statistics\n' +
            'const total = tasks.length;\n' +
            'const done = tasks.filter(t => t.done).length;\n' +
            'const byPriority = tasks.reduce((acc, t) => {\n' +
            '  acc[t.priority] = (acc[t.priority] || 0) + 1;\n' +
            '  return acc;\n' +
            '}, {});\n\n' +
            'console.log(`Total: ${total}, Done: ${done}, Pending: ${total - done}`);\n' +
            'console.log("By priority:", byPriority);\n' +
            'console.log(`Completion rate: ${(done/total*100).toFixed(1)}%`);\n' +
            '```\n\n' +
            '---\n\n' +
            '## Database Schema\n\n' +
            '```sql\n' +
            'CREATE TABLE IF NOT EXISTS users (\n' +
            '    id         INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
            '    email      TEXT UNIQUE NOT NULL,\n' +
            '    password   TEXT NOT NULL,\n' +
            '    name       TEXT\n' +
            ');\n\n' +
            'CREATE TABLE IF NOT EXISTS tasks (\n' +
            '    id         INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
            '    user_id    INTEGER REFERENCES users(id),\n' +
            '    text       TEXT NOT NULL,\n' +
            '    done       INTEGER DEFAULT 0,\n' +
            '    priority   TEXT DEFAULT \'medium\',\n' +
            '    due_date   TEXT\n' +
            ');\n\n' +
            'INSERT OR IGNORE INTO users VALUES (1,\'admin@example.com\',\'hashed_pw\',\'Admin\');\n' +
            'INSERT OR IGNORE INTO tasks VALUES (1,1,\'Design landing page\',1,\'high\',NULL),(2,1,\'Implement auth API\',0,\'high\',NULL),(3,1,\'Write unit tests\',0,\'medium\',NULL);\n' +
            'SELECT t.text, CASE t.done WHEN 1 THEN \'✅\' ELSE \'⬜\' END AS status, t.priority FROM tasks t;\n' +
            '```\n\n' +
            '---\n\n' +
            '## Deployment\n\n' +
            '{{AI: Create a deployment checklist and CI/CD pipeline description for this full-stack app. Include steps for Docker containerization, environment variable management, database migrations, and cloud deployment (AWS/Vercel). Format as a numbered checklist.}}\n\n' +
            '\n\n## 🔗 Agent Pipeline — Architecture Review\n\n{{Agent:\n  Step 1: Review the full-stack architecture above. Identify security vulnerabilities and architectural weaknesses in the API, database, and HTML prototype.\n  Step 2: Design a comprehensive improvement plan covering authentication, input validation, error handling, and database security based on Step 1.\n  Step 3: Generate implementation code for the top 3 critical improvements from Step 2 with before/after comparisons and testing strategies.\n}}\n\n' +
            '> 💡 **How to use:** Preview the HTML prototype, review the API design, run the JS stats, then click **✨ Fill** for the deployment plan.\n'
    },
    {
        name: 'AI Research Agent',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-robot',
        description: 'Multi-step AI research workflow — AI/Think reasoning, LaTeX math, chain-of-thought analysis, and citations',
        variables: [
            { name: 'researchTopic', value: 'Transformer Architecture Optimization', desc: 'Research topic' },
            { name: 'researcherName', value: 'AI Researcher', desc: 'Researcher name' },
        ],
        content: `# 🧠 AI Research Agent — $(researchTopic)

**Researcher:** $(researcherName)
**Date:** $(date)
**Status:** Active Research

---

## Research Pipeline

\`\`\`mermaid
flowchart TD
    A[📖 Literature Review] --> B[🔬 Hypothesis Formation]
    B --> C[📐 Mathematical Framework]
    C --> D[💻 Experiment Design]
    D --> E[📊 Results Analysis]
    E --> F{Significant?}
    F -->|Yes| G[📝 Paper Draft]
    F -->|No| B
    G --> H[🔄 Peer Review]
\`\`\`

---

## 1. Literature Review

{{@AI:
  @think: yes
  @prompt: Conduct a comprehensive literature review on $(researchTopic). Analyze:
1. Foundational papers and their key contributions
2. Recent advances (2023-2024) and emerging trends
3. Identified gaps in current research
4. Competing approaches and their trade-offs
5. Open problems that this research could address

Structure the review thematically, citing key authors and methodologies. Identify exactly where this research fits in the broader landscape.}}

---

## 2. Mathematical Foundation

### Attention Mechanism

The scaled dot-product attention is defined as:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

where $Q \\in \\mathbb{R}^{n \\times d_k}$, $K \\in \\mathbb{R}^{m \\times d_k}$, $V \\in \\mathbb{R}^{m \\times d_v}$

### Multi-Head Attention

$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h)W^O$$

where $\\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$

### Complexity Analysis

\`\`\`math
// Standard attention: O(n²·d)
n = 1024
d = 512
standard_ops = n^2 * d

// Linear attention: O(n·d²)
linear_ops = n * d^2

// Speedup ratio
speedup = standard_ops / linear_ops
\`\`\`

---

## 3. Experimental Design

| Experiment | Model | Parameters | Dataset | Metric |
|-----------|-------|----------:|---------|--------|
| Baseline | Transformer-Base | 110M | WikiText-103 | Perplexity |
| Exp-1 | Linear Attention | 108M | WikiText-103 | Perplexity |
| Exp-2 | Sparse Attention | 112M | WikiText-103 | Perplexity |
| Exp-3 | Flash Attention v2 | 110M | WikiText-103 | Perplexity |
| Exp-4 | Hybrid (Ours) | 111M | WikiText-103 | Perplexity |

---

## 4. Benchmarking

\`\`\`python
import math, random

# Simulated benchmark results
models = ["Baseline", "Linear Attn", "Sparse Attn", "Flash Attn v2", "Hybrid (Ours)"]
perplexity = [18.7, 21.3, 19.2, 18.5, 17.9]
throughput = [1250, 3800, 2100, 3200, 3500]  # tokens/sec
memory_gb = [12.4, 5.2, 8.1, 6.8, 6.1]

print("=" * 65)
print(f"{'Model':<18} {'PPL':>8} {'Tokens/s':>10} {'Memory (GB)':>12}")
print("-" * 65)
for m, p, t, mem in zip(models, perplexity, throughput, memory_gb):
    best_ppl = " ★" if p == min(perplexity) else ""
    print(f"{m:<18} {p:>8.1f}{best_ppl:<3} {t:>10,} {mem:>12.1f}")
print("=" * 65)

# Statistical significance (paired t-test approximation)
improvement = (perplexity[0] - perplexity[4]) / perplexity[0] * 100
print(f"\\nOur model improves perplexity by {improvement:.1f}% over baseline")
print(f"Throughput gain: {throughput[4]/throughput[0]:.1f}x")
print(f"Memory reduction: {(1-memory_gb[4]/memory_gb[0])*100:.0f}%")
\`\`\`

---

## 5. Analysis & Conclusions

{{AI: Based on the experimental results above, write a detailed analysis section for a research paper. Include:
1. **Key Findings** — What did the experiments reveal?
2. **Ablation Study** — Which components contributed most to the improvements?
3. **Limitations** — What are the known limitations of the proposed approach?
4. **Future Work** — 3-4 specific research directions to pursue
5. **Broader Impact** — Implications for the field

Use formal academic language and reference the specific metrics from the benchmark table.}}

---

## 🔗 Agent Pipeline — Literature Survey

{{Agent:
  Step 1: Search for the latest research on transformer architecture improvements from 2024-2025. List the top 10 papers with their key contributions.
  Step 2: From the papers in Step 1, identify the 3 most promising innovations. Compare computational costs, accuracy improvements, and practical applicability.
  Step 3: Write a research proposal for combining the best innovations from Step 2 into a novel hybrid architecture with hypothesis, methodology, and expected results.
}}

> 💡 **How to use:** Fill in your research topic, run the Python benchmarks and math blocks, then click **✨ Fill** for AI-generated analysis.
`
    },
    {
        name: 'DevOps Runbook',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-hdd-rack',
        description: 'Production runbook — bash scripts, monitoring dashboards, incident response tables, and escalation flows',
        variables: [
            { name: 'serviceName', value: 'api-gateway', desc: 'Service name' },
            { name: 'teamName', value: 'Platform Engineering', desc: 'Owning team' },
        ],
        content: '# 🛡️ Production Runbook — $(serviceName)\n\n' +
            '**Team:** $(teamName)\n' +
            '**Last Updated:** $(date)\n' +
            '**On-Call Rotation:** Weekly, Monday 09:00 UTC\n\n' +
            '---\n\n' +
            '## Escalation Flow\n\n' +
            '```mermaid\n' +
            'flowchart TD\n' +
            '    A[🚨 Alert Fired] --> B{Severity?}\n' +
            '    B -->|P1 Critical| C[Page On-Call]\n' +
            '    B -->|P2 High| D[Slack #incidents]\n' +
            '    B -->|P3 Medium| E[Create Ticket]\n' +
            '    C --> F{Resolved < 15min?}\n' +
            '    F -->|No| G[Escalate to Lead]\n' +
            '    G --> H{Resolved < 30min?}\n' +
            '    H -->|No| I[Page VP Engineering]\n' +
            '    F -->|Yes| J[Post-mortem]\n' +
            '    H -->|Yes| J\n' +
            '    I --> J\n' +
            '```\n\n' +
            '---\n\n' +
            '## Service Health Checks\n\n' +
            '```bash\n' +
            '# Quick health check suite\n' +
            'echo "=== Service Health Check ==="\n' +
            'echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date)"\n' +
            'echo ""\n\n' +
            '# Simulate health endpoints\n' +
            'for svc in api-gateway auth-service user-service payment-service; do\n' +
            '  status=$((RANDOM % 10))\n' +
            '  if [ $status -lt 8 ]; then\n' +
            '    echo "  ✅ $svc: healthy (${RANDOM}ms)"\n' +
            '  else\n' +
            '    echo "  ❌ $svc: unhealthy (timeout)"\n' +
            '  fi\n' +
            'done\n' +
            '```\n\n' +
            '---\n\n' +
            '## SLA & Alert Thresholds\n\n' +
            '| Metric | Warning | Critical | SLA Target | Current |\n' +
            '|--------|--------:|----------|:----------:|--------:|\n' +
            '| Uptime | < 99.95% | < 99.9% | 99.99% | 99.97% |\n' +
            '| P50 Latency | > 100ms | > 250ms | < 80ms | 67ms |\n' +
            '| P99 Latency | > 500ms | > 1000ms | < 400ms | 342ms |\n' +
            '| Error Rate | > 0.5% | > 1.0% | < 0.1% | 0.08% |\n' +
            '| CPU Usage | > 70% | > 85% | < 60% | 52% |\n' +
            '| Memory Usage | > 75% | > 90% | < 65% | 61% |\n' +
            '| Request Queue | > 100 | > 500 | < 50 | 23 |\n' +
            '| DB Connections | > 80% | > 95% | < 70% | 45% |\n\n' +
            '---\n\n' +
            '## Common Incident Response\n\n' +
            '### 🔴 High CPU Usage\n\n' +
            '```bash\n' +
            '# Diagnose high CPU\n' +
            'echo "=== CPU Diagnostics ==="\n' +
            'echo ""\n' +
            'echo "Top processes by CPU:"\n' +
            'echo "  PID   CPU%   MEM%   COMMAND"\n' +
            'echo "  1234  85.2   12.3   node api-gateway"\n' +
            'echo "  5678  42.1   8.7    postgres"\n' +
            'echo "  9012  15.3   4.2    redis-server"\n' +
            'echo ""\n' +
            'echo "Load average: 3.72 2.89 2.15"\n' +
            'echo "CPU cores: 4"\n' +
            'echo ""\n' +
            'echo "Recommendation:"\n' +
            'echo "  Load/cores = 0.93 → CPU is near saturation"\n' +
            'echo "  Action: Scale horizontally or optimize hot paths"\n' +
            '```\n\n' +
            '### 🔴 Memory Leak Detection\n\n' +
            '```bash\n' +
            '# Memory trend simulation\n' +
            'echo "=== Memory Trend (Last 6 Hours) ==="\n' +
            'echo ""\n' +
            'echo "Time         RSS (MB)  Heap (MB)  External"\n' +
            'echo "─────────────────────────────────────────"\n' +
            'for h in 6 5 4 3 2 1 0; do\n' +
            '  rss=$((512 + (6-h) * 85 + RANDOM % 20))\n' +
            '  heap=$((400 + (6-h) * 72 + RANDOM % 15))\n' +
            '  ext=$((50 + (6-h) * 5))\n' +
            '  printf "  %dh ago      %4d      %4d       %3d\\n" "$h" "$rss" "$heap" "$ext"\n' +
            'done\n' +
            'echo ""\n' +
            'echo "⚠️  Memory increasing ~85 MB/hour → likely memory leak"\n' +
            '```\n\n' +
            '---\n\n' +
            '## Rollback Procedure\n\n' +
            '| Step | Action | Command | Verify |\n' +
            '|-----:|--------|---------|--------|\n' +
            '| 1 | Identify bad version | `kubectl get deploy -o wide` | Check image tag |\n' +
            '| 2 | Rollback deployment | `kubectl rollout undo deploy/$(serviceName)` | Wait for pods |\n' +
            '| 3 | Verify health | `curl -s /health \\| jq .status` | Returns "ok" |\n' +
            '| 4 | Check error rates | `grafana dashboard` | Error rate < 0.1% |\n' +
            '| 5 | Notify team | Post in #incidents | Acknowledge |\n\n' +
            '---\n\n' +
            '## Post-Incident Review\n\n' +
            '{{AI: Generate a post-incident review template for a production outage of $(serviceName). Include:\n' +
            '1. **Timeline** — Key events from detection to resolution\n' +
            '2. **Root Cause** — What failed and why\n' +
            '3. **Impact** — Duration, affected users, revenue impact\n' +
            '4. **Action Items** — Preventive measures with owners and deadlines\n' +
            '5. **Lessons Learned** — What went well and what to improve\n\n' +
            'Use a blameless tone focused on system improvement.}}\n\n' +
            '\n\n## 🔗 Agent Pipeline — Incident Response\n\n{{Agent:\n  Step 1: Analyze the service health checks and SLA metrics above. Identify services at risk of breaching SLA targets and calculate remaining error budget.\n  Step 2: For each at-risk service from Step 1, create a root cause analysis template and propose remediation steps with estimated time to resolution.\n  Step 3: Generate a post-incident review document from Step 2 with timeline, impact assessment, action items with owners, and preventive measures.\n}}\n\n' +
            '> 💡 **How to use:** Set your service name in variables, run the bash health checks, then click **✨ Fill** for the incident review template.\n'
    },
    {
        name: 'Financial Modeling Agent',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-cash-stack',
        description: 'Financial analysis toolkit — compound interest math, Python projections, financial tables, and growth charts',
        variables: [
            { name: 'companyName', value: 'TechCorp Inc.', desc: 'Company name' },
            { name: 'analystName', value: 'Financial Analyst', desc: 'Analyst name' },
        ],
        content: '# 💰 Financial Modeling Agent — $(companyName)\n' +
            '\n' +
            '**Analyst:** $(analystName)\n' +
            '**Date:** $(date)\n' +
            '**Fiscal Year:** FY2025\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Revenue Projection Model\n' +
            '\n' +
            '```mermaid\n' +
            'flowchart LR\n' +
            '    A[Historical Data] --> B[Trend Analysis]\n' +
            '    B --> C[Growth Model]\n' +
            '    C --> D{Scenario}\n' +
            '    D -->|Bull| E["+25% YoY"]\n' +
            '    D -->|Base| F["+15% YoY"]\n' +
            '    D -->|Bear| G["+5% YoY"]\n' +
            '    E --> H[5-Year Forecast]\n' +
            '    F --> H\n' +
            '    G --> H\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Key Financial Formulas\n' +
            '\n' +
            '**Compound Annual Growth Rate:**\n' +
            '$$CAGR = \\left(\\frac{V_{final}}{V_{initial}}\\right)^{\\frac{1}{t}} - 1$$\n' +
            '\n' +
            '**Net Present Value:**\n' +
            '$$NPV = \\sum_{t=0}^{n} \\frac{C_t}{(1+r)^t}$$\n' +
            '\n' +
            '```math\n' +
            '// CAGR calculation\n' +
            'V_initial = 10000000\n' +
            'V_final = 28500000\n' +
            't = 5\n' +
            'CAGR = (V_final / V_initial) ^ (1/t) - 1\n' +
            '\n' +
            '// Compound interest\n' +
            'P = 1000000\n' +
            'r = 0.08\n' +
            'n = 12\n' +
            'years = 10\n' +
            'FV = P * (1 + r/n)^(n * years)\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Income Statement Forecast\n' +
            '\n' +
            '| Line Item | FY2023 | FY2024 | FY2025E | FY2026E | FY2027E |\n' +
            '|-----------|-------:|-------:|--------:|--------:|--------:|\n' +
            '| Revenue | 8,500 | 10,000 | 11,500 | 13,225 | 15,209 |\n' +
            '| COGS | -3,400 | -4,000 | -4,600 | -5,290 | -6,084 |\n' +
            '| **Gross Profit** | **5,100** | **6,000** | **6,900** | **7,935** | **9,125** |\n' +
            '| R&D | -1,700 | -2,000 | -2,300 | -2,645 | -3,042 |\n' +
            '| Sales & Mktg | -1,020 | -1,200 | -1,380 | -1,587 | -1,825 |\n' +
            '| G&A | -680 | -800 | -920 | -1,058 | -1,217 |\n' +
            '| **EBITDA** | **1,700** | **2,000** | **2,300** | **2,645** | **3,042** |\n' +
            '\n' +
            '> All values in USD thousands\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Valuation Analysis\n' +
            '\n' +
            '{{AI: Based on the financial projections above, perform a comprehensive valuation analysis for $(companyName). Include:\n' +
            '1. **DCF Analysis** — Using a 10% discount rate\n' +
            '2. **Comparable Company Analysis** — Suggest 4-5 comp companies with multiples\n' +
            '3. **Implied Valuation Range** — Bull/base/bear\n' +
            '4. **Key Assumptions** — Critical assumptions and their sensitivity\n' +
            '5. **Investment Recommendation**\n' +
            '\n' +
            'Use professional financial language and present key findings in tables.}}\n' +
            '\n' +
            '\n\n## 🔗 Agent Pipeline — Investment Analysis\n\n{{Agent:\n  Step 1: Using the financial projections above, calculate key ratios: P/E, EV/EBITDA, Debt/Equity, Current Ratio, and ROE for each forecast year.\n  Step 2: Perform a comparable company analysis using ratios from Step 1. Identify 5 peer companies and compare multiples to derive a fair valuation range.\n  Step 3: Synthesize the DCF model and comparable analysis from Step 2 into a final investment recommendation with target price, risk factors, and sensitivity analysis.\n}}\n\n' +
            '> 💡 **How to use:** Set your company name, evaluate the math blocks, then click **✨ Fill** for the AI valuation analysis.\n' +
            ''
    },
    {
        name: 'ML Model Evaluation',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-graph-up',
        description: 'Machine learning evaluation suite — confusion matrices, Python metrics, ROC analysis, and comparison tables',
        content: '# 🤖 ML Model Evaluation Report\n' +
            '\n' +
            '**Date:** $(date)\n' +
            '**Task:** Binary Classification\n' +
            '**Dataset:** Customer Churn (10,000 samples)\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Model Architecture\n' +
            '\n' +
            '```mermaid\n' +
            'flowchart LR\n' +
            '    A[Input Features] --> B[Feature Scaling]\n' +
            '    B --> C[Model]\n' +
            '    C --> D[Sigmoid]\n' +
            '    D --> E{Threshold}\n' +
            '    E -->|Above 0.5| F[Positive]\n' +
            '    E -->|Below 0.5| G[Negative]\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Classification Metrics\n' +
            '\n' +
            '**Precision:** $P = \\frac{TP}{TP + FP}$\n' +
            '\n' +
            '**Recall:** $R = \\frac{TP}{TP + FN}$\n' +
            '\n' +
            '**F1 Score:** $F_1 = 2 \\cdot \\frac{P \\cdot R}{P + R}$\n' +
            '\n' +
            '```math\n' +
            '// Confusion matrix values\n' +
            'TP = 842\n' +
            'TN = 7123\n' +
            'FP = 234\n' +
            'FN = 301\n' +
            '\n' +
            '// Metrics\n' +
            'precision = TP / (TP + FP)\n' +
            'recall = TP / (TP + FN)\n' +
            'f1 = 2 * precision * recall / (precision + recall)\n' +
            'accuracy = (TP + TN) / (TP + TN + FP + FN)\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Model Comparison\n' +
            '\n' +
            '| Model | Accuracy | Precision | Recall | F1 | AUC-ROC | Train Time |\n' +
            '|-------|--------:|----------:|-------:|---:|--------:|-----------:|\n' +
            '| Logistic Regression | 89.2% | 78.4% | 72.1% | 75.1% | 0.891 | 2.3s |\n' +
            '| Random Forest | 92.1% | 84.7% | 79.3% | 81.9% | 0.934 | 15.8s |\n' +
            '| XGBoost | 93.5% | 87.2% | 82.6% | 84.8% | 0.952 | 8.4s |\n' +
            '| **Neural Network** | **94.1%** | **88.5%** | **83.9%** | **86.1%** | **0.961** | **45.2s** |\n' +
            '| SVM (RBF) | 91.8% | 83.1% | 76.8% | 79.8% | 0.918 | 32.1s |\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Analysis\n' +
            '\n' +
            '{{@AI:\\n  @think: yes\\n  @prompt: Analyze the model evaluation results above. Consider:\\n' +
            '1. Which model offers the best trade-off between performance and training time?\n' +
            '2. Is the class imbalance (30% positive) a concern?\n' +
            '3. The precision-recall trade-off — which metric matters more for churn prediction?\n' +
            '4. Would an ensemble of the top 2-3 models improve performance?\n' +
            '5. What threshold optimization could improve the F1 score?\n' +
            '\n' +
            'Provide specific, actionable recommendations.}}\n' +
            '\n' +
            '\n\n## 🔗 Agent Pipeline — Model Optimization\n\n{{Agent:\n  Step 1: Analyze the model comparison table above. Identify why the Neural Network achieves highest AUC-ROC but has longest training time. Suggest 3 optimization techniques.\n  Step 2: Design an ensemble combining the top 3 models from Step 1. Specify the stacking architecture, meta-learner, and cross-validation strategy.\n  Step 3: Write a Python implementation of the ensemble from Step 2 with training pipeline, prediction function, and performance comparison vs individual models.\n}}\n\n' +
            '> 💡 **How to use:** Evaluate the math metrics, review the comparison table, then click **✨ Fill** for AI analysis.\n' +
            ''
    },
    {
        name: 'API Testing Suite',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-plug',
        description: 'REST API test suite — curl commands, response validation, status code tables, and sequence diagrams',
        variables: [
            { name: 'apiBaseUrl', value: 'https://api.example.com/v2', desc: 'API base URL' },
            { name: 'apiName', value: 'User Management API', desc: 'API name' },
        ],
        content: '# 🔌 API Testing Suite — $(apiName)\n' +
            '\n' +
            '**Base URL:** $(apiBaseUrl)\n' +
            '**Date:** $(date)\n' +
            '**Version:** v2.1.0\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## API Request Flow\n' +
            '\n' +
            '```mermaid\n' +
            'sequenceDiagram\n' +
            '    participant C as Client\n' +
            '    participant G as API Gateway\n' +
            '    participant A as Auth Service\n' +
            '    participant D as Database\n' +
            '\n' +
            '    C->>G: POST /auth/login\n' +
            '    G->>A: Validate credentials\n' +
            '    A->>D: Query user\n' +
            '    D-->>A: User record\n' +
            '    A-->>G: JWT token\n' +
            '    G-->>C: 200 OK + token\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## HTTP Status Code Reference\n' +
            '\n' +
            '| Code | Status | Description | When Used |\n' +
            '|-----:|--------|-------------|-----------|\n' +
            '| 200 | OK | Successful GET/PUT | Data retrieved |\n' +
            '| 201 | Created | Resource created | Successful POST |\n' +
            '| 204 | No Content | Success, no body | Successful DELETE |\n' +
            '| 400 | Bad Request | Invalid input | Validation failure |\n' +
            '| 401 | Unauthorized | No/invalid token | Missing auth |\n' +
            '| 403 | Forbidden | Insufficient perms | Role restriction |\n' +
            '| 404 | Not Found | Resource missing | Invalid ID |\n' +
            '| 429 | Too Many Requests | Rate limited | Exceeded quota |\n' +
            '| 500 | Server Error | Internal failure | Unexpected error |\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Test Cases\n' +
            '\n' +
            '```bash\n' +
            '# Test: Login with valid credentials\n' +
            'echo "=== Test: POST /auth/login ==="\n' +
            'echo ""\n' +
            'echo "Request:"\n' +
            'echo \'  POST /auth/login\'\n' +
            'echo \'  Content-Type: application/json\'\n' +
            'echo \'  Body: {"email":"admin@test.com","password":"secret123"}\'\n' +
            'echo ""\n' +
            'echo "Expected Response: 200 OK"\n' +
            'echo \'  {"token":"eyJhbG...","user":{"id":1}}\'\n' +
            'echo ""\n' +
            'echo "✅ PASS — Token received"\n' +
            '\n' +
            'echo ""\n' +
            'echo "=== Test: Login with invalid password ==="\n' +
            'echo "Expected Response: 401 Unauthorized"\n' +
            'echo "✅ PASS — Correctly rejected"\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Test Results\n' +
            '\n' +
            '| Suite | Pass | Fail | Skip | Status |\n' +
            '|-------|-----:|-----:|-----:|--------|\n' +
            '| Authentication | 5 | 0 | 0 | ✅ |\n' +
            '| User CRUD | 8 | 1 | 0 | ❌ |\n' +
            '| Permissions | 6 | 0 | 1 | ✅ |\n' +
            '| Validation | 12 | 0 | 0 | ✅ |\n' +
            '| Rate Limiting | 3 | 0 | 0 | ✅ |\n' +
            '| Error Handling | 7 | 0 | 0 | ✅ |\n' +
            '| **Total** | **41** | **1** | **1** | **95.3%** |\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Recommendations\n' +
            '\n' +
            '{{AI: Based on the API test results above, provide recommendations for improving the API. Cover:\n' +
            '1. The failed test case in User CRUD — potential causes and fixes\n' +
            '2. Rate limiting strategy enhancement\n' +
            '3. Security hardening measures\n' +
            '4. Performance optimization suggestions\n' +
            '\n' +
            'Format as prioritized action items.}}\n' +
            '\n' +
            '\n\n## 🔗 Agent Pipeline — Security Audit\n\n{{Agent:\n  Step 1: Review the API endpoints and test results above. Identify security vulnerabilities including auth bypass, injection, rate limiting gaps, and data exposure.\n  Step 2: For each vulnerability from Step 1, create proof-of-concept test cases with curl commands demonstrating the issue and expected vs actual behavior.\n  Step 3: Generate a security hardening checklist from Step 2 with middleware code, configuration changes, and updated test cases to verify fixes.\n}}\n\n' +
            '> 💡 **How to use:** Run the bash test cases, review the results table, then click **✨ Fill** for AI recommendations.\n' +
            ''
    },
    {
        name: 'HTML Dashboard Builder',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-speedometer2',
        description: 'Interactive analytics dashboard — live HTML charts, KPI cards, and real-time data visualization',
        content: '# 📊 Interactive Dashboard Builder\n' +
            '\n' +
            '> A fully interactive analytics dashboard built with HTML, CSS, and JavaScript.\n' +
            '\n' +
            '---\n' +
            '\n' +
            '```html-autorun\n' +
            '<style>\n' +
            '  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '  body { font-family: "Segoe UI", system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }\n' +
            '  h2 { text-align: center; background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; font-size: 1.6em; }\n' +
            '  .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 24px; }\n' +
            '  .kpi { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 18px; text-align: center; }\n' +
            '  .kpi .value { font-size: 2em; font-weight: 800; background: linear-gradient(135deg, #60a5fa, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }\n' +
            '  .kpi .label { color: #94a3b8; font-size: .85em; margin-top: 4px; }\n' +
            '  .kpi .change { font-size: .8em; margin-top: 6px; }\n' +
            '  .up { color: #34d399; } .down { color: #f87171; }\n' +
            '  .chart-section { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin-bottom: 16px; }\n' +
            '  .chart-title { font-weight: 600; margin-bottom: 14px; color: #f1f5f9; }\n' +
            '  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 180px; padding: 10px 0; }\n' +
            '  .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; }\n' +
            '  .bar { width: 100%; max-width: 48px; border-radius: 6px 6px 0 0; cursor: pointer; }\n' +
            '  .bar:hover { opacity: 0.85; }\n' +
            '  .bar-label { font-size: .75em; color: #94a3b8; margin-top: 6px; }\n' +
            '  .bar-value { font-size: .7em; color: #e2e8f0; margin-bottom: 4px; }\n' +
            '  .tbl { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 20px; }\n' +
            '  table { width: 100%; border-collapse: collapse; }\n' +
            '  th { text-align: left; padding: 10px 12px; border-bottom: 2px solid #334155; color: #94a3b8; font-size: .85em; }\n' +
            '  td { padding: 10px 12px; border-bottom: 1px solid #1e293b; }\n' +
            '  tr:hover td { background: #0f172a; }\n' +
            '  .badge { padding: 3px 10px; border-radius: 20px; font-size: .8em; font-weight: 600; }\n' +
            '  .badge-green { background: #064e3b; color: #6ee7b7; }\n' +
            '  .badge-blue { background: #1e1b4b; color: #a5b4fc; }\n' +
            '  .badge-amber { background: #451a03; color: #fbbf24; }\n' +
            '</style>\n' +
            '\n' +
            '<h2>📊 Analytics Dashboard</h2>\n' +
            '\n' +
            '<div class="kpi-grid">\n' +
            '  <div class="kpi"><div class="value">$1.2M</div><div class="label">Revenue</div><div class="change up">↑ 18.2%</div></div>\n' +
            '  <div class="kpi"><div class="value">8,429</div><div class="label">Users</div><div class="change up">↑ 12.5%</div></div>\n' +
            '  <div class="kpi"><div class="value">99.97%</div><div class="label">Uptime</div><div class="change up">↑ 0.02%</div></div>\n' +
            '  <div class="kpi"><div class="value">67ms</div><div class="label">P50 Latency</div><div class="change up">↑ 15%</div></div>\n' +
            '</div>\n' +
            '\n' +
            '<div class="chart-section">\n' +
            '  <div class="chart-title">📈 Monthly Revenue (2024)</div>\n' +
            '  <div class="bar-chart" id="rc"></div>\n' +
            '</div>\n' +
            '\n' +
            '<div class="tbl">\n' +
            '  <div class="chart-title">🏆 Top Pages</div>\n' +
            '  <table>\n' +
            '    <thead><tr><th>Page</th><th>Views</th><th>Bounce</th><th>Status</th></tr></thead>\n' +
            '    <tbody>\n' +
            '      <tr><td>/dashboard</td><td>12,450</td><td>24%</td><td><span class="badge badge-green">High</span></td></tr>\n' +
            '      <tr><td>/pricing</td><td>8,230</td><td>38%</td><td><span class="badge badge-green">High</span></td></tr>\n' +
            '      <tr><td>/docs</td><td>6,890</td><td>42%</td><td><span class="badge badge-blue">Medium</span></td></tr>\n' +
            '      <tr><td>/blog</td><td>4,567</td><td>55%</td><td><span class="badge badge-blue">Medium</span></td></tr>\n' +
            '      <tr><td>/signup</td><td>3,210</td><td>62%</td><td><span class="badge badge-amber">Low</span></td></tr>\n' +
            '    </tbody>\n' +
            '  </table>\n' +
            '</div>\n' +
            '\n' +
            '<script>\n' +
            'var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];\n' +
            'var rev=[65,78,82,71,95,88,102,97,110,105,118,125];\n' +
            'var mx=Math.max.apply(null,rev);\n' +
            'var ch=document.getElementById("rc");\n' +
            'var cols=["#6366f1","#818cf8","#a5b4fc"];\n' +
            'for(var i=0;i<rev.length;i++){\n' +
            '  var g=document.createElement("div");g.className="bar-group";\n' +
            '  var h=(rev[i]/mx*150);\n' +
            '  g.innerHTML=\'<div class="bar-value">$\'+rev[i]+\'k</div><div class="bar" style="height:\'+h+\'px;background:\'+cols[i%3]+\'"></div><div class="bar-label">\'+months[i]+\'</div>\';\n' +
            '  ch.appendChild(g);\n' +
            '}\n' +
            '</script>\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Customization Guide\n' +
            '\n' +
            '| Component | How to Modify |\n' +
            '|-----------|--------------|\n' +
            '| KPI Cards | Change values in `.kpi .value` elements |\n' +
            '| Bar Chart | Edit `rev` array in script |\n' +
            '| Data Table | Add/edit rows in tbody |\n' +
            '| Colors | Modify CSS color codes |\n' +
            '\n' +
            '\n\n## 🔗 Agent Pipeline — Dashboard Enhancement\n\n{{Agent:\n  Step 1: Analyze the dashboard metrics above (Revenue, Users, Uptime, Latency). Calculate growth rates and identify concerning trends.\n  Step 2: Based on Step 1 trends, recommend 3 new KPI cards and 2 new chart types that would provide better business insights.\n  Step 3: Generate complete HTML/CSS/JavaScript code implementing the new dashboard components from Step 2, matching the existing dark theme.\n}}\n\n' +
            '> 💡 **How to use:** The dashboard renders automatically! Edit the data and HTML to customize.\n' +
            ''
    },
    {
        name: 'Competitive Intel Agent',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-binoculars',
        description: 'Market intelligence report — AI-powered SWOT, competitor tables, positioning diagrams, and strategy',
        variables: [
            { name: 'productName', value: 'Our Product', desc: 'Your product name' },
            { name: 'industry', value: 'Cloud SaaS', desc: 'Industry/market' },
        ],
        content: '# 🔍 Competitive Intelligence Report — $(productName)\n' +
            '\n' +
            '**Industry:** $(industry)\n' +
            '**Date:** $(date)\n' +
            '**Classification:** Internal Use Only\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Market Positioning\n' +
            '\n' +
            '```mermaid\n' +
            'quadrantChart\n' +
            '    title Market Position\n' +
            '    x-axis "Low Innovation" --> "High Innovation"\n' +
            '    y-axis "Low Market Share" --> "High Market Share"\n' +
            '    quadrant-1 "Leaders"\n' +
            '    quadrant-2 "Established"\n' +
            '    quadrant-3 "Emerging"\n' +
            '    quadrant-4 "Innovators"\n' +
            '    "CloudFirst": [0.85, 0.9]\n' +
            '    "DataScale": [0.7, 0.75]\n' +
            '    "Our Product": [0.8, 0.45]\n' +
            '    "InfraHub": [0.4, 0.35]\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Competitor Landscape\n' +
            '\n' +
            '| Company | Market Share | Revenue ($M) | Growth | Employees | Founded |\n' +
            '|---------|:----------:|-------------:|-------:|----------:|--------:|\n' +
            '| CloudFirst | 28.5% | 2,840 | +18% | 12,000 | 2010 |\n' +
            '| DataScale | 22.2% | 2,210 | +14% | 8,500 | 2012 |\n' +
            '| **$(productName)** | **8.5%** | **850** | **+42%** | **350** | **2020** |\n' +
            '| SecureOps | 5.2% | 520 | +10% | 2,100 | 2013 |\n' +
            '| InfraHub | 6.3% | 630 | +8% | 2,800 | 2015 |\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Feature Comparison (1-5 scale)\n' +
            '\n' +
            '| Feature | $(productName) | CloudFirst | DataScale | SecureOps |\n' +
            '|---------|:----------:|:----------:|:---------:|:--------:|\n' +
            '| Auto-scaling | 5 | 5 | 4 | 3 |\n' +
            '| CI/CD Integration | 5 | 4 | 3 | 3 |\n' +
            '| AI/ML Tools | 5 | 4 | 5 | 2 |\n' +
            '| Security | 4 | 5 | 4 | 5 |\n' +
            '| Developer Experience | 5 | 3 | 3 | 3 |\n' +
            '| Pricing | 5 | 3 | 3 | 4 |\n' +
            '| Support SLA | 4 | 5 | 4 | 3 |\n' +
            '| **Total** | **33** | **29** | **26** | **23** |\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## SWOT Analysis\n' +
            '\n' +
            '| | Positive | Negative |\n' +
            '|---|---|---|\n' +
            '| **Internal** | **Strengths** | **Weaknesses** |\n' +
            '| | • Fastest growth (+42%) | • Smallest market share |\n' +
            '| | • Best developer experience | • Limited multi-region |\n' +
            '| | • AI/ML leadership | • Smaller sales team |\n' +
            '| **External** | **Opportunities** | **Threats** |\n' +
            '| | • Enterprise segment growing | • CloudFirst acquisition risk |\n' +
            '| | • AI demand surging | • Price war potential |\n' +
            '| | • APAC market expansion | • Regulatory changes |\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Strategic Recommendations\n' +
            '\n' +
            '{{@AI:\\n  @think: yes\\n  @prompt: Based on the competitive intelligence data above, develop a competitive strategy for $(productName). Analyze:\\n' +
            '\n' +
            '1. **Market Entry Strategy** — How to grow from 8.5% to 15% market share\n' +
            '2. **Competitive Moats** — Which advantages are sustainable\n' +
            '3. **Product Roadmap** — Which features to build next based on gaps\n' +
            '4. **Go-to-Market** — Specific channels and campaigns\n' +
            '\n' +
            'Provide 3 concrete strategic initiatives with timelines and expected outcomes.}}\n' +
            '\n' +
            '\n\n## 🔗 Agent Pipeline — Market Strategy\n\n{{Agent:\n  Step 1: Search for latest market research on the cloud SaaS industry. Identify market size, growth rate, key trends, and disruptive technologies.\n  Step 2: Using market data from Step 1 and the competitor table above, identify top 3 strategic opportunities with risk-reward analysis.\n  Step 3: Create a 12-month go-to-market plan based on Step 2 opportunities with quarterly milestones, budget, team requirements, and KPIs.\n}}\n\n' +
            '> 💡 **How to use:** Set your product name, review the tables, then click **✨ Fill** for strategic AI analysis.\n' +
            ''
    },
    {
        name: 'Algorithm Visualizer',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-cpu',
        description: 'Algorithm analysis — Big-O math, Python implementations, complexity comparison tables, and flowcharts',
        content: '# ⚡ Algorithm Visualizer\n' +
            '\n' +
            '**Date:** $(date)\n' +
            '**Topic:** Sorting & Searching Algorithms\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Complexity Overview\n' +
            '\n' +
            '```mermaid\n' +
            'flowchart TD\n' +
            '    A[Algorithm Analysis] --> B[Time Complexity]\n' +
            '    A --> C[Space Complexity]\n' +
            '    B --> D["O(1) Constant"]\n' +
            '    B --> E["O(log n) Logarithmic"]\n' +
            '    B --> F["O(n) Linear"]\n' +
            '    B --> G["O(n log n) Linearithmic"]\n' +
            '    B --> H["O(n²) Quadratic"]\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Big-O Calculations\n' +
            '\n' +
            '$$T(n) = O(n \\log n) \\text{ — Merge Sort average case}$$\n' +
            '\n' +
            '$$T(n) = O(n^2) \\text{ — Bubble Sort worst case}$$\n' +
            '\n' +
            '```math\n' +
            '// Compare operations at different scales\n' +
            'n = 1000\n' +
            'constant = 1\n' +
            'logarithmic = log2(n)\n' +
            'linear = n\n' +
            'linearithmic = n * log2(n)\n' +
            'quadratic = n^2\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Complexity Comparison\n' +
            '\n' +
            '| Algorithm | Best | Average | Worst | Space | Stable |\n' +
            '|-----------|:----:|:-------:|:-----:|:-----:|:------:|\n' +
            '| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |\n' +
            '| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | ❌ |\n' +
            '| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |\n' +
            '| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |\n' +
            '| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |\n' +
            '| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |\n' +
            '| Tim Sort | O(n) | O(n log n) | O(n log n) | O(n) | ✅ |\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Implementation\n' +
            '\n' +
            '```python\n' +
            'import random, time\n' +
            '\n' +
            'def bubble_sort(arr):\n' +
            '    a = arr[:]\n' +
            '    n = len(a)\n' +
            '    for i in range(n):\n' +
            '        for j in range(n - i - 1):\n' +
            '            if a[j] > a[j+1]:\n' +
            '                a[j], a[j+1] = a[j+1], a[j]\n' +
            '    return a\n' +
            '\n' +
            'def merge_sort(arr):\n' +
            '    if len(arr) <= 1: return arr\n' +
            '    mid = len(arr) // 2\n' +
            '    left = merge_sort(arr[:mid])\n' +
            '    right = merge_sort(arr[mid:])\n' +
            '    result = []\n' +
            '    i = j = 0\n' +
            '    while i < len(left) and j < len(right):\n' +
            '        if left[i] <= right[j]:\n' +
            '            result.append(left[i]); i += 1\n' +
            '        else:\n' +
            '            result.append(right[j]); j += 1\n' +
            '    result.extend(left[i:])\n' +
            '    result.extend(right[j:])\n' +
            '    return result\n' +
            '\n' +
            '# Benchmark\n' +
            'sizes = [100, 500, 1000]\n' +
            'for n in sizes:\n' +
            '    data = [random.randint(1, 10000) for _ in range(n)]\n' +
            '\n' +
            '    t1 = time.time()\n' +
            '    bubble_sort(data)\n' +
            '    bt = (time.time() - t1) * 1000\n' +
            '\n' +
            '    t2 = time.time()\n' +
            '    merge_sort(data)\n' +
            '    mt = (time.time() - t2) * 1000\n' +
            '\n' +
            '    t3 = time.time()\n' +
            '    sorted(data)\n' +
            '    st = (time.time() - t3) * 1000\n' +
            '\n' +
            '    print(f"n={n:5d}  Bubble: {bt:8.2f}ms  Merge: {mt:7.2f}ms  Built-in: {st:6.3f}ms")\n' +
            '```\n' +
            '\n' +
            '\n\n## 🔗 Agent Pipeline — Algorithm Deep Dive\n\n{{Agent:\n  Step 1: Compare the sorting benchmark results above. Explain why merge sort outperforms bubble sort at larger inputs using Big-O analysis with concrete operation counts.\n  Step 2: Design a hybrid sorting algorithm using insertion sort for small subarrays and merge sort for larger ones. Define the optimal crossover point.\n  Step 3: Implement the hybrid algorithm from Step 2 in Python, benchmark it against standard algorithms, and present results as a comparison table.\n}}\n\n' +
            '> 💡 **How to use:** Run the Python benchmark, evaluate the math blocks, and review the complexity table.\n' +
            ''
    },
    {
        name: 'System Design Document',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-diagram-2',
        description: 'Architecture design — mermaid system diagrams, SQL schemas, capacity math, and trade-off tables',
        variables: [
            { name: 'systemName', value: 'URL Shortener', desc: 'System to design' },
            { name: 'authorName', value: 'System Architect', desc: 'Author name' },
        ],
        content: '# 🏛️ System Design — $(systemName)\n' +
            '\n' +
            '**Author:** $(authorName)\n' +
            '**Date:** $(date)\n' +
            '**Status:** Design Review\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## High-Level Architecture\n' +
            '\n' +
            '```mermaid\n' +
            'flowchart TB\n' +
            '    subgraph Clients\n' +
            '        A[Web App]\n' +
            '        B[Mobile App]\n' +
            '        C[API Consumers]\n' +
            '    end\n' +
            '    subgraph "Load Balancer"\n' +
            '        D[Nginx / ALB]\n' +
            '    end\n' +
            '    subgraph "Application Tier"\n' +
            '        E[API Server 1]\n' +
            '        F[API Server 2]\n' +
            '        G[API Server N]\n' +
            '    end\n' +
            '    subgraph "Data Tier"\n' +
            '        H[(Primary DB)]\n' +
            '        I[(Read Replica)]\n' +
            '        J[(Redis Cache)]\n' +
            '    end\n' +
            '    A --> D\n' +
            '    B --> D\n' +
            '    C --> D\n' +
            '    D --> E\n' +
            '    D --> F\n' +
            '    D --> G\n' +
            '    E --> H\n' +
            '    F --> I\n' +
            '    G --> J\n' +
            '    H --> I\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Capacity Estimation\n' +
            '\n' +
            '```math\n' +
            '// Daily active users\n' +
            'DAU = 10000000\n' +
            '\n' +
            '// Read:Write ratio = 100:1\n' +
            'writes_per_day = DAU * 0.1\n' +
            'reads_per_day = DAU * 10\n' +
            '\n' +
            '// QPS (Queries Per Second)\n' +
            'write_qps = writes_per_day / 86400\n' +
            'read_qps = reads_per_day / 86400\n' +
            '\n' +
            '// Storage (5 years)\n' +
            'record_size_bytes = 500\n' +
            'total_records = writes_per_day * 365 * 5\n' +
            'storage_tb = total_records * record_size_bytes / (1024^4)\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Database Schema\n' +
            '\n' +
            '```sql\n' +
            'CREATE TABLE IF NOT EXISTS urls (\n' +
            '    id          INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
            '    short_code  TEXT UNIQUE NOT NULL,\n' +
            '    original_url TEXT NOT NULL,\n' +
            '    user_id     INTEGER,\n' +
            '    clicks      INTEGER DEFAULT 0,\n' +
            '    created_at  TEXT DEFAULT (datetime(\'now\')),\n' +
            '    expires_at  TEXT\n' +
            ');\n' +
            '\n' +
            'CREATE TABLE IF NOT EXISTS clicks (\n' +
            '    id         INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
            '    url_id     INTEGER REFERENCES urls(id),\n' +
            '    ip_address TEXT,\n' +
            '    user_agent TEXT,\n' +
            '    referrer   TEXT,\n' +
            '    country    TEXT,\n' +
            '    clicked_at TEXT DEFAULT (datetime(\'now\'))\n' +
            ');\n' +
            '\n' +
            'INSERT OR IGNORE INTO urls VALUES (1,\'abc123\',\'https://example.com/very-long-article\',NULL,42,datetime(\'now\'),NULL);\n' +
            'INSERT OR IGNORE INTO urls VALUES (2,\'def456\',\'https://docs.example.com/api-reference\',NULL,128,datetime(\'now\'),NULL);\n' +
            'SELECT short_code, clicks, original_url FROM urls ORDER BY clicks DESC;\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Trade-off Analysis\n' +
            '\n' +
            '| Decision | Option A | Option B | Choice |\n' +
            '|----------|----------|----------|--------|\n' +
            '| ID Generation | Auto-increment | Base62 hash | Base62 — no sequential guessing |\n' +
            '| Database | PostgreSQL | DynamoDB | PostgreSQL — ACID + analytics |\n' +
            '| Cache Strategy | Write-through | Write-back | Write-through — consistency |\n' +
            '| Scaling | Vertical | Horizontal | Horizontal — cost-effective |\n' +
            '| CDN | CloudFront | Fastly | CloudFront — AWS integration |\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Scalability Plan\n' +
            '\n' +
            '{{AI: Based on the system design above for $(systemName), create a detailed scalability plan. Include:\n' +
            '1. **Phase 1 (0-1M users)** — Single region, basic setup\n' +
            '2. **Phase 2 (1-10M users)** — Multi-AZ, read replicas, caching\n' +
            '3. **Phase 3 (10-100M users)** — Multi-region, sharding, CDN\n' +
            '4. **Bottleneck Analysis** — Where will the system break first?\n' +
            '5. **Cost Estimates** — Monthly infrastructure costs per phase\n' +
            '\n' +
            'Format as a phased table with specific AWS/cloud service recommendations.}}\n' +
            '\n' +
            '\n\n## 🔗 Agent Pipeline — Architecture Review\n\n{{Agent:\n  Step 1: Review the system architecture and capacity estimates above. Calculate exact infrastructure requirements (CPU, memory, storage, bandwidth) for 10M DAU.\n  Step 2: Design auto-scaling policies, failover procedures, and disaster recovery plan based on Step 1 requirements with specific cloud service configs.\n  Step 3: Generate infrastructure-as-code templates from Step 2 provisioning VPC, load balancers, database clusters, Redis cache, and monitoring alerts.\n}}\n\n' +
            '> 💡 **How to use:** Review the architecture, run the capacity math, then click **✨ Fill** for the AI scalability plan.\n' +
            ''
    },
    {
        name: 'Data Cleaning Toolkit',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-funnel',
        description: 'Data quality pipeline — Python cleaning scripts, validation tables, bash processing, and quality metrics',
        content: '# 🧹 Data Cleaning Toolkit\n' +
            '\n' +
            '**Date:** $(date)\n' +
            '**Dataset:** Raw Customer Records\n' +
            '**Goal:** Production-ready clean dataset\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Cleaning Pipeline\n' +
            '\n' +
            '```mermaid\n' +
            'flowchart LR\n' +
            '    A[Raw Data] --> B[Deduplication]\n' +
            '    B --> C[Missing Values]\n' +
            '    C --> D[Type Validation]\n' +
            '    D --> E[Outlier Detection]\n' +
            '    E --> F[Normalization]\n' +
            '    F --> G[Clean Data]\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## 1. Data Quality Assessment\n' +
            '\n' +
            '```python\n' +
            'import random\n' +
            '\n' +
            '# Simulate raw dataset with quality issues\n' +
            'random.seed(42)\n' +
            'n = 500\n' +
            'issues = {\n' +
            '    "Missing emails": 0,\n' +
            '    "Invalid ages": 0,\n' +
            '    "Duplicate names": 0,\n' +
            '    "Inconsistent formats": 0,\n' +
            '    "Outlier values": 0,\n' +
            '}\n' +
            '\n' +
            'for i in range(n):\n' +
            '    if random.random() < 0.08: issues["Missing emails"] += 1\n' +
            '    if random.random() < 0.05: issues["Invalid ages"] += 1\n' +
            '    if random.random() < 0.12: issues["Duplicate names"] += 1\n' +
            '    if random.random() < 0.15: issues["Inconsistent formats"] += 1\n' +
            '    if random.random() < 0.03: issues["Outlier values"] += 1\n' +
            '\n' +
            'total_issues = sum(issues.values())\n' +
            'print("=" * 45)\n' +
            'print("  DATA QUALITY REPORT")\n' +
            'print("=" * 45)\n' +
            'print(f"  Total records:     {n}")\n' +
            'print(f"  Total issues:      {total_issues}")\n' +
            'print(f"  Quality score:     {(1 - total_issues/n)*100:.1f}%")\n' +
            'print("-" * 45)\n' +
            'for issue, count in issues.items():\n' +
            '    pct = count / n * 100\n' +
            '    bar = "█" * int(pct) + "░" * (20 - int(pct))\n' +
            '    print(f"  {issue:<25} {count:>3} ({pct:4.1f}%) {bar}")\n' +
            'print("=" * 45)\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## 2. Text Processing\n' +
            '\n' +
            '```bash\n' +
            '# CSV data cleaning with bash\n' +
            'echo "=== Text Cleaning Pipeline ==="\n' +
            'echo ""\n' +
            '\n' +
            '# Create sample dirty data\n' +
            'cat > /tmp/dirty.csv << \'EOF\'\n' +
            'Name,Email,City\n' +
            '  John Doe  ,JOHN@EXAMPLE.COM,new york\n' +
            'Jane Smith,jane@test.com,  Los Angeles\n' +
            'Bob Jones,BOB@test.COM,chicago\n' +
            '  Alice Brown ,alice@example.com,NEW YORK\n' +
            'EOF\n' +
            '\n' +
            'echo "=== Before Cleaning ==="\n' +
            'cat /tmp/dirty.csv\n' +
            '\n' +
            'echo ""\n' +
            'echo "=== After Cleaning ==="\n' +
            '# Trim whitespace, lowercase emails, title case cities\n' +
            'tail -n +2 /tmp/dirty.csv | while IFS=\',\' read name email city; do\n' +
            '  name=$(echo "$name" | sed \'s/^[[:space:]]*//;s/[[:space:]]*$//\')\n' +
            '  email=$(echo "$email" | tr \'[:upper:]\' \'[:lower:]\' | sed \'s/^[[:space:]]*//;s/[[:space:]]*$//\')\n' +
            '  city=$(echo "$city" | sed \'s/^[[:space:]]*//;s/[[:space:]]*$//\')\n' +
            '  echo "$name,$email,$city"\n' +
            'done\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Quality Metrics\n' +
            '\n' +
            '| Metric | Before | After | Target | Status |\n' +
            '|--------|-------:|------:|-------:|--------|\n' +
            '| Completeness | 87.2% | 99.1% | 99.0% | ✅ |\n' +
            '| Uniqueness | 82.5% | 100% | 100% | ✅ |\n' +
            '| Validity | 91.3% | 98.7% | 98.0% | ✅ |\n' +
            '| Consistency | 78.4% | 97.5% | 95.0% | ✅ |\n' +
            '| Accuracy | 85.0% | 96.2% | 95.0% | ✅ |\n' +
            '| **Overall** | **84.9%** | **98.3%** | **97.0%** | **✅** |\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Recommendations\n' +
            '\n' +
            '{{AI: Based on the data cleaning results above, provide recommendations for maintaining data quality going forward. Cover:\n' +
            '1. Input validation rules to prevent dirty data at the source\n' +
            '2. Automated monitoring alerts for data quality degradation\n' +
            '3. A data governance framework for the team\n' +
            '4. Tools and libraries for ongoing data quality management\n' +
            '\n' +
            'Format as actionable items with priority levels.}}\n' +
            '\n' +
            '\n\n## 🔗 Agent Pipeline — Data Quality Automation\n\n{{Agent:\n  Step 1: Analyze the data quality report above. Prioritize issues by business impact — which problems are most likely to cause incorrect decisions?\n  Step 2: Design automated validation rules for each issue from Step 1 using a data quality framework. Define expectations for each column type.\n  Step 3: Generate a Python monitoring script from Step 2 that validates data on schedule, sends alerts on failures, and produces a daily quality scorecard.\n}}\n\n' +
            '> 💡 **How to use:** Run the Python quality assessment and bash cleaning scripts, then click **✨ Fill** for AI recommendations.\n' +
            ''
    },
    {
        name: 'Project Retrospective Agent',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-arrow-counterclockwise',
        description: 'Sprint/project retro — AI analysis, metrics tables, timeline diagrams, and interactive HTML survey',
        variables: [
            { name: 'sprintName', value: 'Sprint 24.3', desc: 'Sprint or project name' },
            { name: 'teamName', value: 'Engineering Team', desc: 'Team name' },
        ],
        content: '# 🔄 Project Retrospective — $(sprintName)\n' +
            '\n' +
            '**Team:** $(teamName)\n' +
            '**Date:** $(date)\n' +
            '**Duration:** 2 weeks\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Sprint Timeline\n' +
            '\n' +
            '```mermaid\n' +
            'gantt\n' +
            '    title $(sprintName) Timeline\n' +
            '    dateFormat YYYY-MM-DD\n' +
            '    section Planning\n' +
            '    Sprint Planning    :a1, 2024-03-01, 1d\n' +
            '    Design Review      :a2, after a1, 2d\n' +
            '    section Development\n' +
            '    Feature A          :b1, after a2, 4d\n' +
            '    Feature B          :b2, after a2, 5d\n' +
            '    Bug Fixes          :b3, after b1, 2d\n' +
            '    section QA\n' +
            '    Testing            :c1, after b2, 2d\n' +
            '    UAT                :c2, after c1, 1d\n' +
            '    section Release\n' +
            '    Deployment         :d1, after c2, 1d\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Sprint Metrics\n' +
            '\n' +
            '| Metric | Planned | Actual | Delta | Status |\n' +
            '|--------|--------:|-------:|------:|--------|\n' +
            '| Story Points | 34 | 29 | -5 | ⚠️ |\n' +
            '| Features Delivered | 5 | 4 | -1 | ⚠️ |\n' +
            '| Bugs Fixed | 8 | 11 | +3 | ✅ |\n' +
            '| Code Reviews | 15 | 18 | +3 | ✅ |\n' +
            '| Test Coverage | 85% | 87% | +2% | ✅ |\n' +
            '| Build Failures | 0 | 3 | +3 | ❌ |\n' +
            '| Deployment Issues | 0 | 1 | +1 | ⚠️ |\n' +
            '| On-Call Pages | 2 | 5 | +3 | ❌ |\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Velocity Trend\n' +
            '\n' +
            '```math\n' +
            '// Sprint velocity (story points)\n' +
            'sprints = [28, 32, 30, 34, 29]\n' +
            'avg = mean(sprints)\n' +
            'std_dev = std(sprints)\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Team Feedback\n' +
            '\n' +
            '```html-autorun\n' +
            '<style>\n' +
            '  * { margin: 0; padding: 0; box-sizing: border-box; }\n' +
            '  body { font-family: "Segoe UI", system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 20px; }\n' +
            '  h3 { text-align: center; color: #818cf8; margin-bottom: 16px; }\n' +
            '  .category { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin: 10px 0; }\n' +
            '  .cat-title { font-weight: 600; margin-bottom: 10px; }\n' +
            '  .emoji-row { display: flex; gap: 8px; }\n' +
            '  .emoji-btn { font-size: 1.6em; padding: 8px 12px; border: 2px solid #334155; border-radius: 10px; cursor: pointer; background: none; transition: all .2s; }\n' +
            '  .emoji-btn:hover { border-color: #818cf8; transform: scale(1.1); }\n' +
            '  .emoji-btn.selected { border-color: #6366f1; background: #1e1b4b; }\n' +
            '  .result { color: #94a3b8; font-size: .9em; margin-top: 8px; }\n' +
            '  button.submit { margin-top: 16px; padding: 10px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; width: 100%; }\n' +
            '  .msg { text-align: center; margin-top: 12px; color: #6ee7b7; display: none; }\n' +
            '</style>\n' +
            '\n' +
            '<h3>📝 Quick Team Survey</h3>\n' +
            '\n' +
            '<div class="category">\n' +
            '  <div class="cat-title">😊 Team Morale</div>\n' +
            '  <div class="emoji-row" data-cat="morale">\n' +
            '    <button class="emoji-btn" onclick="sel(this)">😫</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">😕</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">😐</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">🙂</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">🤩</button>\n' +
            '  </div>\n' +
            '  <div class="result" id="r-morale"></div>\n' +
            '</div>\n' +
            '\n' +
            '<div class="category">\n' +
            '  <div class="cat-title">⚡ Sprint Pace</div>\n' +
            '  <div class="emoji-row" data-cat="pace">\n' +
            '    <button class="emoji-btn" onclick="sel(this)">🐌</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">🚶</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">🏃</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">🚀</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">🔥</button>\n' +
            '  </div>\n' +
            '  <div class="result" id="r-pace"></div>\n' +
            '</div>\n' +
            '\n' +
            '<div class="category">\n' +
            '  <div class="cat-title">🤝 Collaboration</div>\n' +
            '  <div class="emoji-row" data-cat="collab">\n' +
            '    <button class="emoji-btn" onclick="sel(this)">👎</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">🤷</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">👍</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">💪</button>\n' +
            '    <button class="emoji-btn" onclick="sel(this)">🎯</button>\n' +
            '  </div>\n' +
            '  <div class="result" id="r-collab"></div>\n' +
            '</div>\n' +
            '\n' +
            '<button class="submit" onclick="submit()">Submit Feedback</button>\n' +
            '<div class="msg" id="msg">✅ Thank you for your feedback!</div>\n' +
            '\n' +
            '<script>\n' +
            'function sel(btn) {\n' +
            '  btn.parentElement.querySelectorAll(\'.emoji-btn\').forEach(function(b){b.classList.remove(\'selected\')});\n' +
            '  btn.classList.add(\'selected\');\n' +
            '}\n' +
            'function submit() {\n' +
            '  document.getElementById(\'msg\').style.display=\'block\';\n' +
            '}\n' +
            '</script>\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Retrospective Analysis\n' +
            '\n' +
            '{{AI: Based on the sprint metrics above, conduct a thorough retrospective analysis. Include:\n' +
            '1. **What went well** — 3-4 positive observations from the metrics\n' +
            '2. **What didn\'t go well** — 3-4 areas of concern\n' +
            '3. **Root cause analysis** — Why did we miss 5 story points?\n' +
            '4. **Action items** — 5 specific improvements for next sprint with owners\n' +
            '5. **Risks** — Emerging risks to watch\n' +
            '\n' +
            'Use a constructive, forward-looking tone. Format action items as a table with columns: Action, Owner, Deadline, Priority.}}\n' +
            '\n' +
            '\n\n## 🔗 Agent Pipeline — Sprint Improvement\n\n{{Agent:\n  Step 1: Analyze the sprint metrics and velocity trend above. Identify root causes for missing 5 story points and the 3 build failures.\n  Step 2: Propose 5 specific process improvements based on Step 1 with expected impact on velocity, build stability, and on-call burden.\n  Step 3: Create an implementation plan for the top 3 improvements from Step 2 with action items, owners, deadlines, success metrics, and follow-up schedule.\n}}\n\n' +
            '> 💡 **How to use:** Review the metrics, fill in the HTML survey, evaluate the velocity math, then click **✨ Fill** for the AI retrospective.\n' +
            ''
    },
    {
        name: 'Science Lab Notebook',
        category: 'ai',
        displayTag: 'AI · Agent',
        icon: 'bi-mortarboard',
        description: 'Scientific experiment notebook — LaTeX equations, Python simulations, data tables, and experiment diagrams',
        content: '# 🔬 Science Lab Notebook\n' +
            '\n' +
            '**Date:** $(date)\n' +
            '**Experiment:** Projectile Motion Analysis\n' +
            '**Subject:** Physics — Kinematics\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Experimental Setup\n' +
            '\n' +
            '```mermaid\n' +
            'flowchart LR\n' +
            '    A[Hypothesis] --> B[Setup]\n' +
            '    B --> C[Data Collection]\n' +
            '    C --> D[Analysis]\n' +
            '    D --> E{Hypothesis Confirmed?}\n' +
            '    E -->|Yes| F[Conclusion]\n' +
            '    E -->|No| G[Revise Hypothesis]\n' +
            '    G --> A\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Theoretical Background\n' +
            '\n' +
            '### Projectile Motion Equations\n' +
            '\n' +
            '**Horizontal displacement:**\n' +
            '$$x(t) = v_0 \\cos(\\theta) \\cdot t$$\n' +
            '\n' +
            '**Vertical displacement:**\n' +
            '$$y(t) = v_0 \\sin(\\theta) \\cdot t - \\frac{1}{2}g t^2$$\n' +
            '\n' +
            '**Maximum height:**\n' +
            '$$H = \\frac{v_0^2 \\sin^2(\\theta)}{2g}$$\n' +
            '\n' +
            '**Range:**\n' +
            '$$R = \\frac{v_0^2 \\sin(2\\theta)}{g}$$\n' +
            '\n' +
            '```math\n' +
            '// Calculate projectile parameters\n' +
            'v0 = 20\n' +
            'g = 9.81\n' +
            'theta_deg = 45\n' +
            '\n' +
            '// Convert to radians\n' +
            'theta = theta_deg * pi / 180\n' +
            '\n' +
            '// Max height\n' +
            'H = v0^2 * sin(theta)^2 / (2 * g)\n' +
            '\n' +
            '// Range\n' +
            'R = v0^2 * sin(2 * theta) / g\n' +
            '\n' +
            '// Time of flight\n' +
            'T = 2 * v0 * sin(theta) / g\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Data Collection\n' +
            '\n' +
            '### Trial Results\n' +
            '\n' +
            '| Trial | Angle (°) | Velocity (m/s) | Measured Range (m) | Predicted Range (m) | Error (%) |\n' +
            '|------:|----------:|--------------:|---------:|---------:|----------:|\n' +
            '| 1 | 30 | 20.0 | 34.8 | 35.3 | 1.4% |\n' +
            '| 2 | 45 | 20.0 | 40.2 | 40.8 | 1.5% |\n' +
            '| 3 | 60 | 20.0 | 34.5 | 35.3 | 2.3% |\n' +
            '| 4 | 45 | 25.0 | 63.1 | 63.7 | 0.9% |\n' +
            '| 5 | 45 | 30.0 | 90.5 | 91.7 | 1.3% |\n' +
            '| 6 | 30 | 30.0 | 79.0 | 79.4 | 0.5% |\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Simulation\n' +
            '\n' +
            '```python\n' +
            'import math\n' +
            '\n' +
            '# Projectile motion simulation\n' +
            'g = 9.81\n' +
            '\n' +
            'def simulate(v0, angle_deg, dt=0.01):\n' +
            '    angle = math.radians(angle_deg)\n' +
            '    vx = v0 * math.cos(angle)\n' +
            '    vy = v0 * math.sin(angle)\n' +
            '    x, y, t = 0, 0, 0\n' +
            '    max_h = 0\n' +
            '    while y >= 0 or t == 0:\n' +
            '        x = vx * t\n' +
            '        y = vy * t - 0.5 * g * t * t\n' +
            '        if y > max_h: max_h = y\n' +
            '        t += dt\n' +
            '    return {"range": x, "max_height": max_h, "time": t}\n' +
            '\n' +
            'print("=" * 55)\n' +
            'print(f"{\'Angle\':>6} {\'Range\':>10} {\'Max H\':>10} {\'Time\':>8}")\n' +
            'print("-" * 55)\n' +
            'for angle in [15, 30, 45, 60, 75]:\n' +
            '    r = simulate(20, angle)\n' +
            '    optimal = " ← max range" if angle == 45 else ""\n' +
            '    print(f"{angle:>5}° {r[\'range\']:>9.2f}m {r[\'max_height\']:>9.2f}m {r[\'time\']:>7.2f}s{optimal}")\n' +
            'print("=" * 55)\n' +
            '\n' +
            '# Verify theory\n' +
            'print(f"\\nTheoretical range at 45°: {20**2 * math.sin(math.radians(90)) / g:.2f}m")\n' +
            'print(f"Simulated range at 45°:  {simulate(20, 45)[\'range\']:.2f}m")\n' +
            'print(f"Error: {abs(simulate(20, 45)[\'range\'] - 20**2/g) / (20**2/g) * 100:.2f}%")\n' +
            '```\n' +
            '\n' +
            '---\n' +
            '\n' +
            '## Analysis & Conclusions\n' +
            '\n' +
            '{{AI: Based on the experimental data and simulation results above, write a scientific analysis. Include:\n' +
            '1. **Data Analysis** — Compare measured vs predicted ranges, calculate average error\n' +
            '2. **Sources of Error** — Identify at least 3 sources of experimental error\n' +
            '3. **Conclusion** — Was the hypothesis confirmed? Summarize key findings\n' +
            '4. **Future Work** — 2-3 extensions of this experiment (air resistance, wind, etc.)\n' +
            '\n' +
            'Use formal scientific language appropriate for a lab report.}}\n' +
            '\n' +
            '\n\n## 🔗 Agent Pipeline — Extended Analysis\n\n{{Agent:\n  Step 1: Analyze experimental data and simulation results above. Calculate mean absolute error between measured and predicted ranges. Identify systematic vs random error.\n  Step 2: Develop a corrected model accounting for air resistance using a drag coefficient. Derive the modified equations of motion.\n  Step 3: Write a Python simulation of the air-resistance model from Step 2. Compare predictions against both ideal model and experimental data in a results table.\n}}\n\n' +
            '> 💡 **How to use:** Evaluate the math blocks, run the Python simulation, review the data table, then click **✨ Fill** for the AI analysis.\n' +
            ''
    },

    // ============================================
    // Agent Templates — Specialized AI Agents
    // These use category: 'agents' for the Agents tab
    // ============================================
    {
        name: 'Plan a Feature',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-kanban',
        description: 'Full ECC-style planner — phased implementation, dependency graphs, red flags, risk analysis, and testing strategy',
        variables: [
            { name: 'featureName', value: 'User Authentication with OAuth', desc: 'Feature to plan' },
            { name: 'techStack', value: 'React, Node.js, PostgreSQL', desc: 'Tech stack (helps tailor the plan)' },
            { name: 'projectContext', value: 'Existing web app with REST API', desc: 'Brief project context' },
        ],
        content: `# 📋 Feature Planner — $(featureName)

**Date:** $(date)
**Status:** 🟡 Planning — awaiting review
**Stack:** $(techStack)
**Context:** $(projectContext)

---

## 1. Implementation Plan

{{@AI:
  @think: yes
  @prompt: You are a senior software architect and implementation planner. Create a detailed, actionable implementation plan for the following feature.

**Feature:** $(featureName)
**Tech Stack:** $(techStack)
**Project Context:** $(projectContext)

Follow this EXACT output format:

---

### Overview
[2-3 sentence summary of what this feature does and why it matters]

### Requirements
- [Requirement 1 — be specific, not vague]
- [Requirement 2]
- [Assumption 1]
- [Constraint 1]

### Architecture Changes
For each affected file/component:
- **[NEW/MODIFY]** \`path/to/file\` — what changes and why

### Implementation Steps

#### Phase 1: Minimum Viable (smallest slice that provides value)
1. **[Step Name]** (File: \`path/to/file\`)
   - **Action:** Specific action to take
   - **Why:** Reason this step is needed
   - **Dependencies:** None / Requires step X
   - **Risk:** Low / Medium / High
   - **Estimated effort:** X hours

2. **[Step Name]** (File: \`path/to/file\`)
   ...

#### Phase 2: Core Experience (complete happy path)
...

#### Phase 3: Edge Cases & Error Handling
...

#### Phase 4: Optimization & Polish
...

**CRITICAL: Each phase MUST be independently deliverable and testable. Never require all phases to complete before anything works.**

### Testing Strategy
- **Unit tests:** [specific functions/files to test]
- **Integration tests:** [specific flows to test]
- **E2E tests:** [specific user journeys to test]

### Risks & Mitigations
For each risk:
- **Risk:** [What could go wrong]
  - **Impact:** High / Medium / Low
  - **Mitigation:** [Specific action to prevent or handle]
  - **Fallback:** [What to do if mitigation fails]

### Red Flags Checklist
Before implementation, verify NONE of these apply:
- [ ] Functions longer than 50 lines
- [ ] Nesting deeper than 4 levels
- [ ] Duplicated code across files
- [ ] Missing error handling for network/DB calls
- [ ] Hardcoded values that should be config
- [ ] Missing input validation at boundaries
- [ ] No testing strategy for a phase
- [ ] Steps without specific file paths
- [ ] Phases that can't be delivered independently

### Success Criteria
- [ ] [Specific, verifiable outcome 1]
- [ ] [Specific, verifiable outcome 2]
- [ ] All tests pass
- [ ] No red flags from checklist above

### Complexity Estimate
- **Overall:** Low / Medium / High
- **Backend:** X hours
- **Frontend:** X hours
- **Testing:** X hours
- **Total:** X-Y hours

---

Rules:
1. **Be specific** — Use exact file paths, function names, variable names. Never say "update the component" without naming it.
2. **Minimize changes** — Prefer extending existing code over rewriting. Follow existing project patterns.
3. **Think incrementally** — Each step should be verifiable on its own.
4. **Document WHY** — Every step explains its rationale, not just what to do.
5. **Consider failure** — What happens when the network is down? When input is null? When the DB is slow?}}

---

## 2. Dependency Graph

{{@AI:
  @think: yes
  @prompt: Based on the implementation plan above, create a Mermaid flowchart diagram showing the dependency graph between ALL implementation steps. Use this format:

\\\`\\\`\\\`mermaid
flowchart TD
    S1[Step 1: Name] --> S2[Step 2: Name]
    S1 --> S3[Step 3: Name]
    S2 --> S4[Step 4: Name]
    S3 --> S4
    ...
\\\`\\\`\\\`

Color-code by phase:
- Phase 1 steps: default
- Phase 2 steps: use a different style
- Phase 3 steps: use a different style
- Phase 4 steps: use a different style

Also show which steps can be parallelized (no dependencies between them).

After the diagram, provide:
1. **Critical path** — The longest chain of dependent steps (this determines minimum timeline)
2. **Parallelizable groups** — Steps that can be worked on simultaneously
3. **Suggested implementation order** — Optimal order considering dependencies, risk, and context switching}}

---

## 3. Testing Checklist

{{Agent:
  Step 1: From the implementation plan, extract every testable behavior. For each phase, create a specific testing checklist with test case name, input, expected output, and priority (P0/P1/P2). Include edge cases like null inputs, empty states, concurrent access, network timeouts, and invalid data.
  Step 2: Identify the 3 highest-risk items in the plan. For each, propose a specific mitigation strategy with: preventive action, detection mechanism, and recovery procedure. Consider failure modes like data corruption, race conditions, backwards compatibility, and deployment rollback.
  Step 3: Generate a sprint/task breakdown suitable for project management. Group steps into logical work units of 2-4 hours each. For each task include: description, acceptance criteria, dependencies, and estimated hours. Present as a markdown table.
}}

> 💡 **How to use:** Set your feature name, tech stack, and project context in the variables. Click **▶ Run All** to generate the full plan with dependency graph and testing checklist.
`
    },
    {
        name: 'Review My Code',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-search',
        description: 'ECC-style code review — confidence-filtered findings, framework-specific checks, BAD→GOOD examples, and summary verdict',
        variables: [
            { name: 'language', value: 'JavaScript', desc: 'Programming language' },
            { name: 'framework', value: 'React / Node.js', desc: 'Framework (React, Vue, Express, Django, etc.)' },
            { name: 'codeToReview', value: 'Paste your code here', desc: 'Code to review' },
        ],
        content: `# 🔍 Code Review — $(language)

**Date:** $(date)
**Language:** $(language)
**Framework:** $(framework)
**Reviewer:** AI Code Review Agent

---

## Code Under Review

\\\`\\\`\\\`
$(codeToReview)
\\\`\\\`\\\`

---

## Review Results

{{@AI:
  @think: yes
  @prompt: You are a senior code reviewer with deep expertise in $(language) and $(framework). Perform a thorough code review.

\\\`\\\`\\\`
$(codeToReview)
\\\`\\\`\\\`

**CONFIDENCE FILTER — IMPORTANT:**
- ONLY report issues you are >80% confident are real problems
- SKIP stylistic nitpicks unless they violate $(language) conventions
- CONSOLIDATE similar issues (e.g., "5 functions missing error handling" not 5 separate findings)
- PRIORITIZE issues that could cause bugs, security vulnerabilities, or data loss

Work through each category in order (CRITICAL → LOW):

---

### 🔴 CRITICAL — Security
These MUST be flagged — they cause real damage:
- Hardcoded credentials (API keys, passwords, tokens in source)
- SQL/NoSQL injection (string concatenation in queries)
- XSS vulnerabilities (unescaped user input in HTML/JSX)
- Path traversal (user-controlled file paths without sanitization)
- CSRF on state-changing endpoints
- Authentication bypasses (missing auth checks on protected routes)
- Exposed secrets in logs (logging tokens, passwords, PII)
- Insecure dependencies with known CVEs

### 🟠 HIGH — Code Quality
- Functions >50 lines → split into focused helpers
- Files >800 lines → extract modules by responsibility
- Deep nesting >4 levels → use early returns, extract helpers
- Missing error handling (unhandled promise rejections, empty catch blocks)
- Mutation patterns → prefer immutable (spread, map, filter)
- Console.log / debug statements left in
- Missing tests for new code paths
- Dead code (commented-out code, unused imports, unreachable branches)

### 🟠 HIGH — Framework-Specific ($(framework))
Check patterns specific to $(framework):
- React: missing useEffect dependency arrays, state updates in render, index as key, prop drilling >3 levels, missing loading/error states, stale closures
- Node.js: unvalidated request body, missing rate limiting, unbounded SELECT *, N+1 queries, missing timeouts on HTTP calls, error message leakage to clients, CORS misconfiguration
- General: missing input validation at boundaries, no schema validation

### 🟡 MEDIUM — Performance
- Inefficient algorithms (O(n²) when O(n log n) possible)
- Unnecessary re-renders / re-computations
- Large bundle imports (full library when tree-shakeable exists)
- Missing caching for expensive computations
- Synchronous I/O in async context
- Unoptimized images without lazy loading

### 🟢 LOW — Best Practices
- TODO/FIXME without issue numbers
- Missing JSDoc/docstrings on public APIs
- Poor naming (single-letter variables in non-trivial context)
- Magic numbers without named constants
- Inconsistent formatting

---

**OUTPUT FORMAT — For each finding, use this EXACT structure:**

\\\`\\\`\\\`
[SEVERITY] Issue Title
Line: [line number or range]
Issue: [What's wrong and why it matters]
Fix: [Exact corrected code]

  // BAD (current)
  [problematic code]

  // GOOD (fixed)
  [corrected code]
\\\`\\\`\\\`

---

**End with this EXACT summary:**

## Review Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | ? | pass/fail |
| HIGH | ? | pass/warn |
| MEDIUM | ? | info |
| LOW | ? | note |

**Verdict:** [one of]
- ✅ **APPROVE** — No CRITICAL or HIGH issues. Ready to ship.
- ⚠️ **WARNING** — HIGH issues found. Can merge with caution after fixing noted items.
- ❌ **BLOCK** — CRITICAL issues found. Must fix before merge.}}

---

## De-Sloppify Pass

{{@AI:
  @think: yes
  @prompt: You are a code cleanup specialist. Perform a "de-sloppify" pass on this code — a focused cleanup that removes noise without changing behavior.

\\\`\\\`\\\`
$(codeToReview)
\\\`\\\`\\\`

This is SEPARATE from the review above. Focus only on:
1. Remove console.log / print debugging statements
2. Remove commented-out code (it belongs in git, not in files)
3. Remove unused imports and variables
4. Replace magic numbers with named constants
5. Flatten deep nesting with early returns / guard clauses
6. Simplify overly defensive checks for impossible states

Output the cleaned version of the code as a drop-in replacement. Then list every change you made with a one-line rationale.

RULE: The cleaned code MUST have identical behavior. Never change business logic.}}

> 💡 **How to use:** Set language, framework, and paste your code. Click **▶ Run All** for the review + cleaned version.
`
    },
    {
        name: 'Security Scan',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-shield-lock',
        description: 'Multi-layer security audit — OWASP Top 10, red-team attack simulation, remediation plan, and pre-deployment checklist',
        variables: [
            { name: 'codeToScan', value: 'Paste your code here', desc: 'Code to scan for vulnerabilities' },
            { name: 'language', value: 'JavaScript', desc: 'Programming language (JavaScript, Python, Go, etc.)' },
            { name: 'framework', value: 'Node.js / Express', desc: 'Framework (React, Express, Django, Flask, etc.)' },
            { name: 'scanDepth', value: 'Standard', desc: 'Scan depth: Quick (top issues only), Standard (full OWASP), Deep (+ attack simulation)' },
        ],
        content: `# 🛡️ Security Scan — $(language) / $(framework)

**Date:** $(date)
**Scanner:** AI Security Audit Agent
**Language:** $(language)
**Framework:** $(framework)
**Depth:** $(scanDepth)

---

## Code Under Scan

\\\`\\\`\\\`
$(codeToScan)
\\\`\\\`\\\`

---

## 1. Vulnerability Scan

{{@AI:
  @think: yes
  @prompt: You are a senior security auditor specializing in $(language) and $(framework). Perform a thorough OWASP Top 10 security audit on the code below.

\\\`\\\`\\\`
$(codeToScan)
\\\`\\\`\\\`

**CONFIDENCE FILTER — IMPORTANT:**
- ONLY report issues you are >80% confident are real vulnerabilities
- SKIP stylistic preferences unless they have security implications
- CONSOLIDATE similar issues (e.g., "5 endpoints missing auth" not 5 separate findings)
- PRIORITIZE issues that could lead to data breach, unauthorized access, or service compromise

Scan the code systematically through each OWASP category:

---

### 🔴 CRITICAL — Immediate Threats

**A01: Broken Access Control**
- Missing authentication checks on protected routes
- IDOR (Insecure Direct Object References) — user can access other users' data by changing IDs
- Privilege escalation — regular user can perform admin actions
- Missing authorization after authentication

**A02: Cryptographic Failures**
- Hardcoded API keys, passwords, tokens, or secrets in source code
- Weak hashing (MD5, SHA1 for passwords — use bcrypt/argon2)
- Plaintext storage of sensitive data
- Insecure random number generation for security-critical values

**A03: Injection**
- SQL injection via string concatenation in queries
- NoSQL injection (MongoDB operator injection)
- Command injection (user input in shell commands)
- XSS via unescaped user input in HTML/JSX
- LDAP injection, template injection

---

### 🟠 HIGH — Must Fix Before Production

**A04: Insecure Design**
- Missing rate limiting on login, API endpoints, expensive operations
- No input validation or schema validation (use Zod, Joi, etc.)
- Missing bounds checking on pagination, file sizes, request bodies

**A05: Security Misconfiguration**
- Debug mode enabled in production
- Default credentials or unchanged secrets
- Verbose error messages exposing internals (stack traces, SQL errors)
- Missing security headers (CSP, X-Frame-Options, HSTS)
- CORS misconfiguration (overly permissive origins)

**A07: Authentication Failures**
- Tokens in localStorage (vulnerable to XSS — use httpOnly cookies)
- Missing session expiration or token rotation
- No account lockout after failed login attempts
- Weak password policies

---

### 🟡 MEDIUM — Address Before Release

**A06: Vulnerable Components** — Known CVEs in dependencies
**A08: Data Integrity** — Unsafe deserialization, unsigned updates
**A09: Logging Failures** — Logging passwords/tokens, missing audit trail
**A10: SSRF** — Unvalidated user-provided URLs, internal resource access

---

### Framework-Specific Checks ($(framework))

Check patterns specific to $(framework):
- **Express/Node.js**: Missing helmet(), no express-rate-limit, unvalidated req.body, unbounded queries (SELECT *), missing timeouts on HTTP calls, error messages leaking to clients
- **React/Next.js**: dangerouslySetInnerHTML without DOMPurify, missing CSP, API routes without auth middleware, exposed server-side secrets in client bundle
- **Django/Flask**: DEBUG=True in production, CSRF disabled, raw SQL queries, SECRET_KEY hardcoded
- **General**: Missing CSRF protection on state-changing endpoints, unsafe file uploads (no type/size validation)

---

**OUTPUT FORMAT — For each finding, use EXACTLY this structure:**

**[SEVERITY] Finding Title**
- **Category:** OWASP A01-A10
- **Line:** [line number or range]
- **Issue:** What's vulnerable and why it matters
- **Exploit:** How an attacker would abuse this (specific attack scenario)
- **Confidence:** High / Medium

\\\`\\\`\\\`
// ❌ BAD (current)
[the vulnerable code]

// ✅ GOOD (fixed)
[the corrected code with explanation]
\\\`\\\`\\\`

---

**End with this EXACT summary:**

## Scan Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 CRITICAL | ? | ❌ BLOCK — must fix |
| 🟠 HIGH | ? | ⚠️ WARN — fix before prod |
| 🟡 MEDIUM | ? | 📝 NOTE — address soon |
| 🟢 LOW | ? | ℹ️ INFO — awareness |

**Security Grade:** [A through F]

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 90-100 | Secure — no critical or high issues |
| B | 75-89 | Good — minor issues only |
| C | 60-74 | Needs attention — high-severity findings |
| D | 40-59 | Significant risk — multiple high/critical |
| F | 0-39 | Critical — immediate remediation required |

**Top 3 priorities to fix immediately:**
1. [Most critical finding]
2. [Second most critical]
3. [Third most critical]}}

---

## 2. Attack Simulation (Red Team)

{{@AI:
  @think: yes
  @prompt: You are a penetration tester and red-team operator. You've just reviewed the security audit above. Now think like an attacker targeting this $(language)/$(framework) application.

\\\`\\\`\\\`
$(codeToScan)
\\\`\\\`\\\`

Your task is to find **exploit chains** — sequences of vulnerabilities that, when combined, lead to critical compromise.

### Attack Surface Analysis
1. **Entry points** — List every way an attacker can interact with this code (API endpoints, form inputs, file uploads, URL params, headers, websockets)
2. **Trust boundaries** — Where does the code trust data it shouldn't? (user input, third-party APIs, browser storage)
3. **Data flows** — Trace how user-controlled data flows through the system. Where does it reach dangerous sinks (DB queries, HTML output, file system, shell commands)?

### Exploit Scenarios
For the top 3 most dangerous attack paths, provide:

**Attack [N]: [Name]**
- **Target:** What the attacker is after (data theft, account takeover, privilege escalation, service disruption)
- **Prerequisites:** What the attacker needs (authenticated? specific role? network access?)
- **Steps:**
  1. [First action the attacker takes]
  2. [How they exploit the vulnerability]
  3. [What they achieve]
- **Impact:** What damage results (data breach scope, affected users, financial impact)
- **Difficulty:** Easy / Medium / Hard
- **Proof of Concept:** Describe (do NOT provide executable exploit code) the request/payload that would trigger the vulnerability

### Attack Chain Diagram
Create a Mermaid diagram showing how vulnerabilities chain together:
\\\`\\\`\\\`mermaid
flowchart TD
    A[Entry Point] --> B[Vulnerability 1]
    B --> C[Escalation]
    C --> D[Impact]
\\\`\\\`\\\`

### Defense Gaps
- What defenses are MISSING that would stop these attacks?
- What monitoring would detect these attacks in progress?}}

---

## 3. Remediation Plan & Pre-Deployment Checklist

{{Agent:
  Step 1: Based on the vulnerability scan and attack simulation above, create a PRIORITIZED remediation plan. For each finding, provide: priority (P0 = fix now, P1 = fix this sprint, P2 = fix next sprint), the specific code fix as a drop-in replacement, estimated effort (minutes/hours), and which attack scenarios it blocks. Group fixes by category and order by impact. Present as a markdown table with columns: Priority, Finding, Fix Summary, Effort, Blocks Attack.

  Step 2: Generate security test cases that verify each fix works. For each critical and high finding, write a test description covering: test name, what it validates, input (the attack payload), expected behavior (the fix blocks it), and the test type (unit/integration/E2E). Also include regression tests to ensure fixes don't break existing functionality. Present as a numbered list with code examples where helpful.

  Step 3: Generate a pre-deployment security checklist tailored to $(language)/$(framework). Include these categories with specific checkboxes:

**Secrets & Configuration**
- [ ] No hardcoded API keys, tokens, or passwords in source
- [ ] All secrets loaded from environment variables
- [ ] .env files in .gitignore
- [ ] Debug mode disabled in production config
- [ ] Production secrets stored in hosting platform (not repo)

**Input & Data**
- [ ] All user inputs validated with schema validation
- [ ] File uploads restricted (size, type, extension)
- [ ] SQL queries parameterized (no string concatenation)
- [ ] User-provided HTML sanitized (DOMPurify or equivalent)

**Authentication & Authorization**
- [ ] Auth checks on every protected route
- [ ] Tokens in httpOnly cookies (not localStorage)
- [ ] Session expiration and token rotation configured
- [ ] Role-based access control verified
- [ ] CSRF protection on all state-changing endpoints

**Network & Headers**
- [ ] HTTPS enforced in production
- [ ] Security headers set (CSP, X-Frame-Options, HSTS, X-Content-Type-Options)
- [ ] CORS properly scoped (not wildcard *)
- [ ] Rate limiting on all API endpoints (stricter on auth endpoints)

**Monitoring & Response**
- [ ] Security events logged (failed logins, permission denials, suspicious patterns)
- [ ] No sensitive data in logs (passwords, tokens, PII)
- [ ] Error messages generic for users (detailed only in server logs)
- [ ] Dependency audit clean (npm audit / pip audit / go vet)

End with an overall security readiness verdict: ✅ READY / ⚠️ CONDITIONAL (list blockers) / ❌ NOT READY (list critical gaps).
}}

> 💡 **How to use:** Set your language, framework, and scan depth. Paste your code, then click **▶ Run All** for the full 3-step security audit: vulnerability scan → attack simulation → remediation plan.
`
    },
    {
        name: 'Clean Up Code',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-eraser',
        description: 'ECC-style refactor — risk-categorized dead code removal, batch processing, duplicate consolidation, and safety verification',
        variables: [
            { name: 'codeToClean', value: 'Paste your code here', desc: 'Code to clean up' },
            { name: 'language', value: 'JavaScript', desc: 'Programming language' },
        ],
        content: `# 🧹 Code Cleanup — De-Sloppify

**Date:** $(date)
**Language:** $(language)
**Agent:** Refactor & Dead Code Cleaner

---

## Original Code

\\\`\\\`\\\`
$(codeToClean)
\\\`\\\`\\\`

---

## Phase 1: Dead Code Analysis

{{@AI:
  @think: yes
  @prompt: You are an expert refactoring specialist focused on code cleanup and consolidation. Analyze this $(language) code for dead code, unused elements, and cleanup opportunities.

\\\`\\\`\\\`
$(codeToClean)
\\\`\\\`\\\`

**Step 1 — Categorize every finding by removal risk:**

### 🟢 SAFE — Remove immediately
Items with zero risk of breaking anything:
- Unused imports / require statements
- Unused local variables
- Commented-out code blocks (belongs in git, not in files)
- Console.log / print / debug statements
- Unused eslint-disable directives
- Empty catch blocks with no purpose
- Redundant type assertions the type system already enforces

### 🟡 CAREFUL — Verify before removing
Items that MIGHT be used dynamically or externally:
- Unused exported functions (could be used by other modules)
- Unused function parameters (could be required by interface contracts)
- Functions called only via dynamic imports / string patterns
- Config values that might be read at runtime
- CSS classes that might be applied dynamically

### 🔴 RISKY — Do NOT remove without full project search
Items that could break other code:
- Public API exports
- Shared utilities imported by other files
- Event handler registrations
- Database migration code
- Anything accessed via reflection or string-based lookups

**Step 2 — For the SAFE items, list each one in this format:**

\\\`\\\`\\\`
[SAFE] Description
Line: [line number]
Type: import / variable / function / statement / comment
Action: Remove / Replace with X
\\\`\\\`\\\`

**Step 3 — Structural improvements (SAFE only):**
- Magic numbers → named constants
- Deep nesting (>4 levels) → flatten with early returns / guard clauses
- Long functions (>50 lines) → split into focused helpers
- Mutation patterns → immutable alternatives (spread, map, filter)
- Overly defensive guards for impossible states → simplify

**Step 4 — Summary table:**

| Category | Count | Risk | Action |
|----------|-------|------|--------|
| Unused imports | ? | 🟢 SAFE | Remove |
| Unused variables | ? | 🟢 SAFE | Remove |
| Debug statements | ? | 🟢 SAFE | Remove |
| Commented-out code | ? | 🟢 SAFE | Remove |
| Dead functions | ? | 🟡 CAREFUL | Verify |
| Structural issues | ? | 🟢 SAFE | Refactor |
| **Total lines removable** | **?** | | |

**CRITICAL SAFETY RULES:**
1. ONLY recommend removing items in the 🟢 SAFE category
2. Flag 🟡 CAREFUL items but do NOT remove them — ask for verification
3. Never touch 🔴 RISKY items
4. Never change business logic
5. Start with deps → imports → variables → functions → statements (this order)}}

---

## Phase 2: Duplicate Detection

{{@AI:
  @think: yes
  @prompt: Analyze this $(language) code for duplicate and near-duplicate patterns. Your goal is to consolidate repeated logic into reusable functions.

\\\`\\\`\\\`
$(codeToClean)
\\\`\\\`\\\`

Look for:

1. **Exact duplicates** — Identical code blocks in multiple places
2. **Near duplicates** — Code blocks that differ by only 1-2 lines (parameterize the difference)
3. **Repeated patterns** — Same sequence of operations done in multiple functions
4. **Copy-paste artifacts** — Similar error handling, validation, or data transformation repeated

For each duplicate found:

| Location A | Location B | Similarity | Suggested Consolidation |
|-----------|-----------|------------|------------------------|
| Lines X-Y | Lines X-Y | 90% | Extract to \`helperName()\` |

Then for the top 3 most impactful consolidations, show:
1. The repeated code (before)
2. The extracted helper function
3. The call sites after consolidation (after)
4. Lines saved

Pick the **most complete, best-tested** version when choosing which implementation to keep.}}

---

## Phase 3: Cleaned Code

{{Agent:
  Step 1: Apply ALL 🟢 SAFE removals from Phase 1 and consolidate the top duplicates from Phase 2. Output the COMPLETE cleaned code as a drop-in replacement. The cleaned code MUST have identical behavior — never change business logic, API contracts, or observable outputs.
  Step 2: Generate a detailed changelog of every change made. For each change list: what was removed/changed, which line, and a one-line rationale. End with a metrics summary — lines before, lines after, lines removed, percentage reduction, and a confidence rating (High/Medium/Low) that behavior is preserved.
  Step 3: Generate a safety verification checklist. List specific things to test after applying this cleanup to ensure nothing broke. Include: function calls to verify, edge cases to re-test, and any 🟡 CAREFUL items that need manual verification before the next cleanup pass.
}}

> ⚠️ **When NOT to clean:** During active feature development, right before deploys, without test coverage, or on code you don't fully understand.

> 💡 **How to use:** Paste your code and set the language. Click **▶ Run All** for risk-categorized analysis → duplicate detection → cleaned code with safety checklist.
`
    },
    {
        name: 'Generate Docs',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-file-earmark-text',
        description: 'ECC-style doc generator — codemap, README, API reference, inline JSDoc, and quality-validated examples',
        variables: [
            { name: 'codeToDocument', value: 'Paste your code here', desc: 'Code to generate documentation for' },
            { name: 'language', value: 'JavaScript', desc: 'Programming language' },
            { name: 'docType', value: 'Full (README + API + Inline)', desc: 'Scope: Full, README only, API only, Inline only, or Codemap only' },
        ],
        content: `# 📝 Documentation Generator

**Date:** $(date)
**Language:** $(language)
**Scope:** $(docType)

---

## Source Code

\\\`\\\`\\\`
$(codeToDocument)
\\\`\\\`\\\`

---

## Phase 1: Architecture Codemap

{{@AI:
  @think: yes
  @prompt: You are a documentation specialist focused on generating codemaps from source code. Analyze this $(language) code and produce an architectural codemap.

\\\`\\\`\\\`
$(codeToDocument)
\\\`\\\`\\\`

Generate this EXACT format:

### Codemap

**Last Updated:** $(date)
**Language:** $(language)

#### Architecture Overview
Create an ASCII diagram showing the relationships between all major components, modules, classes, or functions in this code. Show data flow direction with arrows.

\\\`\\\`\\\`
[Component A] ──▶ [Component B] ──▶ [Component C]
       │                                    ▲
       └──────── [Component D] ─────────────┘
\\\`\\\`\\\`

#### Key Modules

| Module / Function | Purpose | Exports | Dependencies |
|------------------|---------|---------|-------------|
| \\\`name\\\` | What it does | What it exposes | What it imports |

#### Data Flow
Describe how data flows through this code:
1. Entry point: where data comes in
2. Processing: what transformations happen
3. Output: where results go

#### External Dependencies
List every external package/library used:
- \\\`package-name\\\` — Purpose, how it's used

**KEY PRINCIPLE: Generate from code only — never invent features that don't exist. Every statement must be verifiable in the source.**}}

---

## Phase 2: README & API Documentation

{{@AI:
  @think: yes
  @prompt: You are a documentation specialist. Generate developer-facing documentation from this $(language) code. Scope: $(docType).

\\\`\\\`\\\`
$(codeToDocument)
\\\`\\\`\\\`

Generate ALL sections that apply:

### Overview
What this code does in 2-3 sentences. Be specific — name the actual functions and what they accomplish.

### Installation & Setup
- Prerequisites (language version, dependencies)
- Install command
- Environment variables needed (with descriptions and example values)
- Configuration options with defaults

### Quick Start
A minimal working example that a developer can copy-paste and run immediately:
\\\`\\\`\\\`
// This example MUST actually work with the code above
\\\`\\\`\\\`

### API Reference
For EVERY exported function, class, and constant:

#### \\\`functionName(param1, param2)\\\`
- **Description:** What it does
- **Parameters:**
  - \\\`param1\\\` (\\\`type\\\`) — description, default value if any
  - \\\`param2\\\` (\\\`type\\\`, optional) — description
- **Returns:** \\\`type\\\` — what the return value represents
- **Throws:** \\\`ErrorType\\\` — when and why
- **Example:**
\\\`\\\`\\\`
// Working example with expected output
const result = functionName('input');
// => expected output
\\\`\\\`\\\`

### Configuration
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| \\\`option\\\` | \\\`type\\\` | \\\`default\\\` | What it controls |

### Error Handling
- What errors can occur
- How to handle them
- Common troubleshooting steps

### Gotchas & Limitations
- Non-obvious behavior
- Known limitations
- Performance considerations
- Edge cases to watch for

**RULES:**
1. **Single source of truth** — Generate from code only, don't invent features
2. **Every example must work** — Code examples must be copy-pasteable and correct
3. **Use the code's naming** — Match the exact function names, parameter names, and conventions
4. **Document the WHY** — Explain rationale, not just what each function does
5. **Include freshness timestamps** — Always show when docs were generated}}

---

## Phase 3: Inline Documentation & Validation

{{Agent:
  Step 1: Generate complete inline documentation for the source code. Add JSDoc/docstring to EVERY function with: description, @param (name, type, description), @returns (type, description), @throws (when and why), and @example (working code snippet). Also add brief comments for any non-obvious logic, complex algorithms, or "why" explanations. Output the complete code with all documentation added as a drop-in replacement.

  Step 2: Validate the generated documentation against this quality checklist. For each item, mark ✅ pass or ❌ fail:
  - [ ] Every exported function has JSDoc/docstring with params, returns, and example
  - [ ] All code examples are syntactically correct and would work
  - [ ] No references to functions or features that don't exist in the code
  - [ ] All parameter types match the actual code
  - [ ] Return types match the actual code
  - [ ] Configuration options match actual defaults
  - [ ] No obsolete or stale references
  - [ ] Freshness timestamp included
  If any items fail, list the specific corrections needed.

  Step 3: Generate a documentation maintenance guide: When should these docs be updated? List the types of code changes that would require a doc update (new exports, API changes, new dependencies, config changes, architecture changes) vs changes that don't need doc updates (internal refactoring, bug fixes, cosmetic changes). This helps keep docs in sync with reality.
}}

> 💡 **How to use:** Paste your code, set the language and scope. Click **▶ Run All** for codemap → README/API docs → validated inline documentation.
`
    },
    {
        name: 'Python Review',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-filetype-py',
        description: 'Python-specific code review — PEP 8, type hints, Pythonic patterns, and security checks',
        variables: [
            { name: 'pythonCode', value: 'Paste your Python code here', desc: 'Python code to review' },
        ],
        content: `# 🐍 Python Code Review

**Date:** $(date)
**Reviewer:** Python Review Agent

---

## Code Under Review

\`\`\`python
$(pythonCode)
\`\`\`

---

## Python Review Results

{{@AI:
  @think: yes
  @prompt: You are a senior Python developer. Review this Python code for idiomatic style, correctness, and security.

\`\`\`python
$(pythonCode)
\`\`\`

Evaluate against:

### PEP 8 & Style
- Naming conventions (snake_case for functions, PascalCase for classes)
- Line length (88 or 120 chars)
- Import ordering (stdlib, third-party, local)
- Docstrings (Google or NumPy style)

### Pythonic Patterns
- List comprehensions vs loops where appropriate
- Context managers (with statements) for resources
- f-strings instead of format() or %
- Proper use of generators for large datasets
- Unpacking, enumerate, zip usage
- Dataclasses vs plain dicts for structured data

### Type Hints
- Missing type annotations on function signatures
- Return types
- Optional, Union, or modern X | Y syntax
- Generic types for collections

### Security
- eval() or exec() usage
- SQL string formatting (use parameterized queries)
- Pickle usage with untrusted data
- os.system or subprocess without shell=False
- Input validation

### Performance
- Unnecessary copies of large data
- String concatenation in loops (use join)
- Global variable lookups in hot paths
- Missing __slots__ for many-instance classes

For each finding, show:
- **Issue**: What's wrong
- **Current**: The problematic code
- **Fixed**: The corrected code
- **Why**: Brief explanation

End with a summary table of findings by severity.}}

> 💡 **How to use:** Paste your Python code, click **▶ Run All** for an idiomatic review.
`
    },
    {
        name: 'Design Architecture',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-building',
        description: 'ECC-style architect — ADRs, pattern catalogs, red flag detection, scalability roadmap, and design checklist',
        variables: [
            { name: 'systemDescription', value: 'Real-time chat application with message persistence and push notifications', desc: 'Describe the system to design' },
            { name: 'scale', value: '10K users, growing to 100K', desc: 'Expected scale (users, requests/sec)' },
            { name: 'constraints', value: 'Budget: low-medium, Team: 2-3 devs, Timeline: 3 months', desc: 'Constraints (budget, team, timeline)' },
        ],
        content: `# 🏗️ Architecture Design — $(systemDescription)

**Date:** $(date)
**Architect:** AI Architecture Agent
**Scale target:** $(scale)
**Constraints:** $(constraints)

---

## Phase 1: Architecture Design

{{@AI:
  @think: yes
  @prompt: You are a senior systems architect. Design the architecture for the following system using a systematic process.

**System:** $(systemDescription)
**Scale:** $(scale)
**Constraints:** $(constraints)

Follow the architecture review process:

---

### 1. Requirements Analysis

#### Functional Requirements
- List every feature the system needs as user stories
- Define API contracts (endpoints, methods, request/response)
- Specify data models and relationships

#### Non-Functional Requirements
- **Performance:** Target latency (p50, p95, p99), throughput (requests/sec)
- **Scalability:** Current and future user counts, data growth rate
- **Availability:** Uptime target (99.9%? 99.99%?)
- **Security:** Auth model, data sensitivity, compliance requirements
- **Cost:** Budget constraints, cost-per-user targets

---

### 2. High-Level Architecture

Create a Mermaid flowchart diagram showing ALL major components and their interactions:

\\\`\\\`\\\`mermaid
flowchart TD
    Client[Client App] --> LB[Load Balancer]
    LB --> API[API Server]
    API --> DB[(Database)]
    API --> Cache[(Cache)]
    API --> Queue[Message Queue]
    Queue --> Worker[Background Worker]
    ...
\\\`\\\`\\\`

Identify:
- Frontend layer
- Backend / API layer
- Data layer (database, cache, file storage)
- External services and integrations
- Primary data flows (show direction)

---

### 3. Component Breakdown

For EACH component in the diagram:

| Component | Responsibility | Technology | Justification | Data Owned | API Surface |
|-----------|---------------|------------|---------------|-----------|-------------|
| [Name] | [Single purpose] | [Tech choice] | [Why this tech] | [Tables/collections] | [Key endpoints] |

---

### 4. Data Model

Create a Mermaid ER diagram showing core entities:

\\\`\\\`\\\`mermaid
erDiagram
    USER ||--o{ POST : creates
    POST ||--o{ COMMENT : has
    USER ||--o{ COMMENT : writes
    ...
\\\`\\\`\\\`

For each entity:
- Key fields and types
- Indexes for common query patterns
- Relationships and constraints

---

### 5. Recommended Patterns

Apply relevant patterns from each layer:

**Frontend Patterns:**
- Component Composition — build complex UI from simple components
- Container/Presenter — separate data logic from rendering
- Custom Hooks — reusable stateful logic
- Code Splitting — lazy load routes and heavy components

**Backend Patterns:**
- Repository Pattern — abstract data access
- Service Layer — business logic separation
- Middleware — request/response processing pipeline
- Event-Driven — async operations for non-critical paths

**Data Patterns:**
- Normalized for writes — reduce redundancy
- Denormalized for reads — optimize query performance
- Caching Layers — what to cache, where (CDN, Redis, in-memory), TTL strategy
- Eventual Consistency — where strict consistency isn't needed

---

### 6. Security Architecture

- **Authentication:** Mechanism (JWT, session, OAuth) and storage (httpOnly cookies vs localStorage)
- **Authorization:** RBAC, ABAC, or simple role checks
- **Data Protection:** Encryption at rest and in transit, PII handling
- **API Security:** Rate limiting, input validation, CORS policy
- **Secret Management:** How secrets are stored and rotated
- **Defense in Depth:** Multiple layers, principle of least privilege

---

### 7. Scalability Roadmap

Provide a tiered scaling plan:

| Scale | Architecture | Key Changes | Estimated Cost |
|-------|-------------|-------------|---------------|
| 10K users | [Current design] | None needed | $X/mo |
| 100K users | [What changes] | [Specific additions] | $X/mo |
| 1M users | [Major shift] | [New components] | $X/mo |
| 10M users | [Full scale] | [Full redesign areas] | $X/mo |

---

### 8. Red Flags Check

Verify the design does NOT have these anti-patterns:
- ❌ **Big Ball of Mud** — No clear structure or boundaries
- ❌ **God Object** — One component doing everything
- ❌ **Golden Hammer** — Using same solution for everything
- ❌ **Tight Coupling** — Components too dependent on each other
- ❌ **Premature Optimization** — Optimizing before measuring
- ❌ **Not Invented Here** — Rejecting proven existing solutions
- ❌ **Magic** — Unclear, undocumented behavior

For each red flag, mark ✅ clear or ⚠️ concern with a brief note.}}

---

## Phase 2: Architecture Decision Records (ADRs)

{{@AI:
  @think: yes
  @prompt: Based on the architecture design above, create formal Architecture Decision Records for the 5 most significant technology and design choices. Use this EXACT format for each:

\\\`\\\`\\\`markdown
# ADR-00X: [Decision Title]

## Context
[Why this decision is needed — the problem being solved]

## Decision
[What was chosen and the high-level approach]

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Drawback 1 — and how it's mitigated]
- [Drawback 2]

### Alternatives Considered
- **[Alternative 1]:** [Pros] / [Cons] / [Why rejected]
- **[Alternative 2]:** [Pros] / [Cons] / [Why rejected]

## Status
Proposed

## Date
$(date)
\\\`\\\`\\\`

Create 5 ADRs covering:
1. Primary database choice
2. Backend framework / language
3. Frontend framework / rendering strategy
4. Authentication / authorization approach
5. Real-time / messaging / async strategy (if applicable)

For each alternative, provide genuine pros and cons — don't just dismiss alternatives.}}

---

## Phase 3: Design Readiness Checklist

{{Agent:
  Step 1: Evaluate the architecture against this system design readiness checklist. For each item, mark ✅ addressed, ⚠️ partially addressed (with note), or ❌ missing:

**Functional Requirements**
- [ ] User stories documented
- [ ] API contracts defined (endpoints, request/response)
- [ ] Data models specified with relationships
- [ ] UI/UX flows identified

**Non-Functional Requirements**
- [ ] Performance targets defined (latency, throughput)
- [ ] Scalability requirements specified (user tiers)
- [ ] Security requirements identified (auth, encryption, compliance)
- [ ] Availability targets set (uptime %)

**Technical Design**
- [ ] Architecture diagram created
- [ ] Component responsibilities defined (single purpose each)
- [ ] Data flow documented end-to-end
- [ ] Integration points identified
- [ ] Error handling strategy defined
- [ ] Testing strategy planned

**Operations**
- [ ] Deployment strategy defined (CI/CD, environments)
- [ ] Monitoring and alerting planned
- [ ] Backup and recovery strategy
- [ ] Rollback plan documented
- [ ] Cost estimation completed

Flag any ❌ items as blockers that must be resolved before implementation.

  Step 2: Generate a technology comparison matrix for the key decisions. Create a table comparing the chosen technology against 2 alternatives across these dimensions: learning curve, community size, performance, scalability ceiling, cost, maturity, and ecosystem. Rate each 1-5 stars. This helps validate the ADR decisions with data.

  Step 3: Generate an implementation roadmap. Break the architecture into buildable milestones:
  - Milestone 1 (Week 1-2): Foundation — core infrastructure, database, basic API
  - Milestone 2 (Week 3-4): Core features — main user flows, authentication
  - Milestone 3 (Week 5-6): Integration — external services, real-time features
  - Milestone 4 (Week 7-8): Hardening — security, monitoring, performance testing
  For each milestone, list specific deliverables and success criteria. Present as a timeline table.
}}

> 💡 **How to use:** Describe your system, set the scale and constraints. Click **▶ Run All** for complete architecture → ADRs → readiness checklist.
`
    },
    {
        name: 'Debug This Error',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-bug',
        description: '3-phase debug pipeline — triage & classify → root cause & fix → verify & prevent',
        variables: [
            { name: 'errorMessage', value: 'Paste your error message / stack trace here', desc: 'Error message or stack trace' },
            { name: 'context', value: 'Describe what you were doing when this error occurred', desc: 'Context around the error' },
            { name: 'language', value: 'JavaScript', desc: 'Language / framework (JS, Python, Go, React, Node, etc.)' },
            { name: 'codeSnippet', value: '(optional) Paste relevant code here', desc: 'Code around the error (optional)' },
        ],
        content: `# 🐛 Debug This Error

**Date:** $(date)
**Debugger:** AI Debug Agent
**Language:** $(language)

---

## Error

\\\`\\\`\\\`
$(errorMessage)
\\\`\\\`\\\`

## Context

$(context)

## Relevant Code

\\\`\\\`\\\`
$(codeSnippet)
\\\`\\\`\\\`

---

## Phase 1: Triage & Classify

{{@AI:
  @think: yes
  @prompt: You are a build-error resolution specialist. Your job is to rapidly triage and classify this error, then match it against known fix patterns.

**Error:**
\\\`\\\`\\\`
$(errorMessage)
\\\`\\\`\\\`

**Context:** $(context)
**Language / Framework:** $(language)

**Code (if provided):**
\\\`\\\`\\\`
$(codeSnippet)
\\\`\\\`\\\`

Produce the following analysis:

### Error Classification

| Property | Value |
|----------|-------|
| **Type** | Syntax / Runtime / Type / Dependency / Config / Network / Permission / Logic |
| **Severity** | 🔴 CRITICAL (app broken) / 🟠 HIGH (feature broken) / 🟡 MEDIUM (degraded) |
| **Category** | Build error / Type error / Import error / Null reference / API error / DB error / Auth error |
| **Source** | File and line (from stack trace) or best guess |

### Known-Pattern Match

Check the error against these common patterns and state which one matches (or "No match — requires deep analysis"):

| Error Pattern | Quick Fix |
|---------------|-----------|
| \\\`Cannot find module 'X'\\\` | Check import path, \\\`npm install X\\\`, verify tsconfig paths |
| \\\`X is not a function\\\` | Check typo, verify export name, check default vs named import |
| \\\`Cannot read properties of null/undefined\\\` | Add optional chaining \\\`?.\\\` or null guard before access |
| \\\`Type 'X' is not assignable to type 'Y'\\\` | Add type annotation, cast, or fix the source type |
| \\\`CORS / Access-Control\\\` | Add CORS headers on server, check origin whitelist |
| \\\`ECONNREFUSED / ETIMEDOUT\\\` | Check if target service is running, verify host:port |
| \\\`ENOMEM / heap out of memory\\\` | Increase Node \\\`--max-old-space-size\\\`, check for memory leaks |
| \\\`Permission denied / EACCES\\\` | Check file permissions, run with correct user, avoid sudo |
| \\\`SyntaxError: Unexpected token\\\` | Check for missing brackets, invalid JSON, wrong file extension |
| \\\`Module not found / ImportError\\\` | Check virtual env, verify package installed, check Python path |
| \\\`KeyError / AttributeError\\\` | Check dict key exists, verify object has attribute, use .get() |
| \\\`FOREIGN KEY constraint failed\\\` | Check referenced record exists, fix insert order |
| \\\`429 Too Many Requests\\\` | Add rate limiting, implement exponential backoff |
| \\\`ERR_REQUIRE_ESM\\\` | Switch to \\\`import\\\`, add \\\`"type": "module"\\\` in package.json, or use dynamic import |

If a pattern matches, state the **confidence level** (High / Medium / Low) and the suggested fix. If no pattern matches, state why this requires deeper analysis.}}

---

## Phase 2: Root Cause & Fix

{{@AI:
  @think: yes
  @prompt: You are a senior debugger. Perform a deep root-cause analysis of this error and produce a precise, minimal fix.

**Error:**
\\\`\\\`\\\`
$(errorMessage)
\\\`\\\`\\\`

**Context:** $(context)
**Language / Framework:** $(language)

**Code (if provided):**
\\\`\\\`\\\`
$(codeSnippet)
\\\`\\\`\\\`

### 1. Root Cause

Trace the error from the symptom to the source:
- **Immediate cause:** What triggered the error (the line that threw)
- **Underlying cause:** Why that line failed (the real bug — often upstream)
- **Contributing factors:** Config, environment, timing, or data that made this happen

### 2. The Fix

Show the **minimal diff** — the smallest change that resolves the error:

**❌ Before:**
\\\`\\\`\\\`
// The problematic code
\\\`\\\`\\\`

**✅ After:**
\\\`\\\`\\\`
// The fixed code
\\\`\\\`\\\`

**Why this works:** One-sentence explanation of the fix.

### 3. DO and DON'T

| ✅ DO | ❌ DON'T |
|-------|---------|
| Add the specific fix shown above | Refactor unrelated code while fixing |
| Add a null check / type guard at the source | Suppress the error with try-catch without handling it |
| Fix the import / dependency that's missing | Downgrade packages to "make it work" without understanding why |
| Test the fix in isolation first | Change architecture to work around the bug |
| Check if the same pattern exists elsewhere | Ignore the root cause and only fix the symptom |

### 4. Quick Diagnostic Steps

If the root cause isn't 100% certain, provide exact steps to confirm:
1. Add this \\\`console.log\\\` / \\\`print\\\` at line X: \\\`...\\\`
2. Check the value of \\\`variable\\\` — it should be \\\`expected\\\`, if it's \\\`something else\\\` then the bug is in \\\`...\\\`
3. Run this command to verify: \\\`...\\\`

Be direct: state the fix first, explain after.}}

---

## Phase 3: Verify & Prevent

{{Agent:
  Step 1: Generate verification commands to confirm the fix works. Based on the error type and language ($(language)), provide exact commands the developer should run after applying the fix. Include build commands, test commands, and any sanity checks. Format as a numbered checklist with the actual commands to copy-paste. For example: npm run build, npx tsc --noEmit, npm test, python -m pytest, go build ./..., curl commands for API errors, etc. If the error was a build/type error, the success metric is "command exits with code 0". If it was a runtime error, describe the expected behavior after the fix.

  Step 2: Generate preventive guards to stop this class of error from recurring. Provide concrete code — not advice. This should include: input validation (null checks, type guards, assertions), error handling wrappers, TypeScript strict mode flags or linter rules to enable, test cases that would have caught this bug. Show each guard as a code snippet that can be dropped into the codebase.

  Step 3: Scan for related issues. Based on the error pattern identified in Phase 1, describe 3-5 places where the same bug pattern might hide in a typical $(language) codebase. For each, provide: what to search for (exact grep / search pattern), why it's risky, and a one-line fix. End with a priority-ordered action list: fix this error → add guards → sweep related issues → add tests.
}}

> 💡 **How to use:** Paste the error, describe the context, set your language. Click **▶ Run All** for triage → root cause → verification.
`
    },
    {
        name: 'SQL Optimizer',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-database-gear',
        description: 'ECC-style DB reviewer — EXPLAIN ANALYZE, anti-pattern detection, RLS security, schema typing, and concurrency audit',
        variables: [
            { name: 'sqlQueries', value: 'Paste your SQL queries here', desc: 'SQL queries to optimize' },
            { name: 'dbEngine', value: 'PostgreSQL', desc: 'Database engine: PostgreSQL, MySQL, SQLite, etc.' },
            { name: 'tableContext', value: 'users (~100K rows), orders (~1M rows), products (~10K rows)', desc: 'Table names and approximate sizes' },
        ],
        content: `# 📊 SQL Optimizer — $(dbEngine)

**Date:** $(date)
**Engine:** $(dbEngine)
**Tables:** $(tableContext)
**Optimizer:** AI Database Review Agent

---

## Queries to Optimize

\\\`\\\`\\\`sql
$(sqlQueries)
\\\`\\\`\\\`

---

## Phase 1: Performance Audit

{{@AI:
  @think: yes
  @prompt: You are an expert $(dbEngine) database specialist focused on query optimization and performance. Analyze these SQL queries in the context of the given table sizes.

\\\`\\\`\\\`sql
$(sqlQueries)
\\\`\\\`\\\`

**Table context:** $(tableContext)

---

### 1. Execution Plan Prediction

For each query, predict what EXPLAIN ANALYZE would show:
- **Scan type:** Seq Scan (⚠️ bad on large tables) vs Index Scan vs Index Only Scan
- **Join type:** Nested Loop vs Hash Join vs Merge Join
- **Estimated rows:** How many rows each operation processes
- **Cost estimate:** Relative cost of each query
- **Bottleneck:** The most expensive operation and why

Flag every **Seq Scan on tables > 10K rows** as a CRITICAL performance issue.

---

### 2. Index Recommendations

For each missing index, provide:

\\\`\\\`\\\`sql
-- WHY: [What query benefits and why]
-- IMPACT: [Before estimate → After estimate]
CREATE INDEX idx_tablename_column ON tablename (column);
\\\`\\\`\\\`

Apply these indexing rules:
- **Foreign keys** — ALWAYS index. No exceptions.
- **Composite indexes** — Equality columns FIRST, then range columns
  \\\`\\\`\\\`sql
  -- GOOD: status (equality) before created_at (range)
  CREATE INDEX idx_orders_status_date ON orders (status, created_at);
  -- BAD: range column first
  CREATE INDEX idx_orders_date_status ON orders (created_at, status);
  \\\`\\\`\\\`
- **Partial indexes** — Use WHERE for filtered queries:
  \\\`\\\`\\\`sql
  CREATE INDEX idx_active_users ON users (email) WHERE deleted_at IS NULL;
  \\\`\\\`\\\`
- **Covering indexes** — Use INCLUDE to avoid table lookups:
  \\\`\\\`\\\`sql
  CREATE INDEX idx_orders_user ON orders (user_id) INCLUDE (total, status);
  \\\`\\\`\\\`

---

### 3. Anti-Pattern Detection

Flag ALL of these if found (with BAD → GOOD examples):

| Anti-Pattern | Severity | Why It's Bad |
|-------------|----------|-------------|
| \\\`SELECT *\\\` in production | 🟠 HIGH | Fetches unnecessary data, breaks covering indexes |
| \\\`OFFSET\\\` pagination on large tables | 🔴 CRITICAL | O(n) — scans and discards rows |
| \\\`int\\\` for IDs instead of \\\`bigint\\\` | 🟡 MEDIUM | Overflows at 2.1B rows |
| \\\`varchar(255)\\\` without reason | 🟡 MEDIUM | Use \\\`text\\\` — same performance, no arbitrary limit |
| \\\`timestamp\\\` without timezone | 🟠 HIGH | Use \\\`timestamptz\\\` — avoids timezone bugs |
| Random UUIDs as PK | 🟠 HIGH | Fragments B-tree — use UUIDv7 or IDENTITY |
| String concatenation in queries | 🔴 CRITICAL | SQL injection risk — use parameterized queries |
| Individual INSERTs in loops | 🟠 HIGH | Use multi-row INSERT or COPY |
| N+1 query pattern | 🔴 CRITICAL | Fetch related data with JOIN or batch query |
| Unindexed foreign keys | 🟠 HIGH | Causes Seq Scans on JOINs and cascading deletes |

For each found anti-pattern, show:
\\\`\\\`\\\`sql
-- BAD (current)
SELECT * FROM orders WHERE user_id = 5 LIMIT 10 OFFSET 1000;

-- GOOD (fixed) — cursor-based pagination
SELECT * FROM orders WHERE user_id = 5 AND id > $last_seen_id
ORDER BY id LIMIT 10;
\\\`\\\`\\\`

---

### 4. Performance Summary

| Query | Scan Type | Est. Cost | Bottleneck | Recommended Fix | Improvement |
|-------|----------|-----------|-----------|----------------|-------------|
| Q1 | ? | ? | ? | ? | ~?x faster |}}

---

## Phase 2: Schema & Security Review

{{@AI:
  @think: yes
  @prompt: Review the schema implied by these $(dbEngine) queries for design issues, security problems, and concurrency risks.

\\\`\\\`\\\`sql
$(sqlQueries)
\\\`\\\`\\\`

**Table context:** $(tableContext)

---

### Schema Design Review

Check each table/column mentioned in the queries:

**Type correctness:**
- IDs → \\\`bigint\\\` (not \\\`int\\\`)
- Strings → \\\`text\\\` (not \\\`varchar(255)\\\` unless there's a business reason)
- Timestamps → \\\`timestamptz\\\` (not \\\`timestamp\\\`)
- Money → \\\`numeric\\\` (not \\\`float\\\` or \\\`double\\\`)
- Booleans → \\\`boolean\\\` (not \\\`int 0/1\\\`)
- UUIDs → UUIDv7 or IDENTITY (not random UUID for PKs)

**Constraints:**
- PRIMARY KEYs defined
- FOREIGN KEYs with ON DELETE behavior (CASCADE, SET NULL, or RESTRICT)
- NOT NULL on required columns
- CHECK constraints for business rules
- Naming: \\\`lowercase_snake_case\\\` (no quoted mixed-case identifiers)

Provide ALTER TABLE statements for any corrections.

---

### Security Review

- **SQL Injection:** Are all queries parameterized? (String concatenation = 🔴 CRITICAL)
- **Row Level Security (RLS):** For multi-tenant tables, is RLS enabled?
  \\\`\\\`\\\`sql
  -- GOOD: RLS policy with indexed column
  CREATE POLICY user_access ON orders
    USING (user_id = (SELECT auth.uid()));
  \\\`\\\`\\\`
- **Privilege:** No \\\`GRANT ALL\\\` to application users — use least privilege
- **Data exposure:** Are sensitive columns (email, SSN, etc.) properly protected?

---

### Concurrency Review

- **Transaction length:** Are transactions kept short? (Never hold locks during external API calls)
- **Deadlock prevention:** Are rows locked in consistent order? (\\\`ORDER BY id FOR UPDATE\\\`)
- **Queue patterns:** Use \\\`SKIP LOCKED\\\` for worker queue patterns (10x throughput)
  \\\`\\\`\\\`sql
  -- GOOD: Worker queue with SKIP LOCKED
  SELECT id, payload FROM job_queue
  WHERE status = 'pending'
  ORDER BY id
  FOR UPDATE SKIP LOCKED
  LIMIT 1;
  \\\`\\\`\\\`
- **Batch operations:** Use multi-row INSERT or COPY, not individual inserts in loops}}

---

## Phase 3: Optimized Queries

{{Agent:
  Step 1: Rewrite every query from the input with all optimizations applied. For each query, show: the original query, the optimized version, a bulleted list of every change made with rationale, and the estimated performance improvement (e.g., 10x faster, from Seq Scan to Index Scan). The rewritten queries must be functionally equivalent — same results, better performance. Consider: CTE vs subquery performance, EXISTS vs IN vs JOIN, window functions vs self-joins, cursor pagination replacing OFFSET, and explicit column lists replacing SELECT *.

  Step 2: Generate all necessary DDL statements to support the optimizations: CREATE INDEX statements (with comments explaining which query they optimize), ALTER TABLE statements for type corrections or constraint additions, and CREATE POLICY statements for RLS if applicable. Group them in the order they should be executed, with a note about which can be run with CREATE INDEX CONCURRENTLY to avoid blocking.

  Step 3: Generate a database health checklist tailored to the queries reviewed. Include diagnostic SQL commands to run for ongoing monitoring:
  - Top 10 slowest queries (pg_stat_statements)
  - Unused indexes to drop
  - Table bloat detection
  - Index usage statistics
  - Missing index recommendations from pg_stat_user_tables
  Present each as a ready-to-run SQL command with explanation of what to look for in the output.
}}

> 💡 **How to use:** Paste your SQL queries, set the database engine and table sizes. Click **▶ Run All** for performance audit → schema/security review → optimized queries with DDL.
`
    },
    {
        name: 'TDD Guide',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-check2-circle',
        description: 'Test-Driven Development workflow — write failing tests first, implement, refactor, and verify coverage',
        variables: [
            { name: 'featureDescription', value: 'User registration with email validation and password hashing', desc: 'Feature to implement with TDD' },
            { name: 'language', value: 'JavaScript', desc: 'Programming language' },
            { name: 'testFramework', value: 'Jest', desc: 'Test framework (Jest, Pytest, Go testing, Mocha, etc.)' },
        ],
        content: `# ✅ TDD Guide — $(featureDescription)

**Date:** $(date)
**Method:** Test-Driven Development (Red → Green → Refactor)
**Language:** $(language)
**Test Framework:** $(testFramework)

---

## Phase 1: RED — Write Failing Tests

{{@AI:
  @think: yes
  @prompt: You are a senior developer practicing strict TDD. Your task is to write comprehensive failing tests BEFORE any implementation code.

**Feature:** $(featureDescription)
**Language:** $(language)
**Framework:** $(testFramework)

Write failing tests covering:

### Core Behavior Tests
- Happy path — the feature works as expected with valid inputs
- Each distinct behavior or state transition
- Return values and side effects

### Edge Case Tests
- Empty inputs, null, undefined
- Boundary values (min, max, zero, negative)
- Large inputs, unicode, special characters
- Concurrent access (if applicable)

### Error Handling Tests
- Invalid inputs → appropriate error response
- Missing required fields
- Type mismatches
- Resource not found scenarios

### Integration Points (if applicable)
- Database interactions (mock or in-memory)
- External API calls (mocked)
- Event emissions

**OUTPUT FORMAT:**

\\\`\\\`\\\`$(language)
// Test file: [filename].test.[ext]

describe('[Feature Name]', () => {
  // Group 1: Core Behavior
  test('[specific behavior being tested]', () => {
    // Arrange — set up test data
    // Act — call the function/method
    // Assert — verify the expected outcome
  });

  // Group 2: Edge Cases
  // Group 3: Error Handling
});
\\\`\\\`\\\`

Rules:
1. **Tests MUST fail** — don't write implementation, only tests
2. **One assertion per test** where practical
3. **Descriptive names** — test name should read like a requirement
4. **AAA pattern** — Arrange, Act, Assert in every test
5. **No implementation logic** — tests only define WHAT, not HOW}}

---

## Phase 2: GREEN — Minimal Implementation

{{@AI:
  @think: yes
  @prompt: Now implement the MINIMUM code needed to make ALL the tests above pass. You are in the GREEN phase of TDD.

**Feature:** $(featureDescription)
**Language:** $(language)
**Tests to satisfy:** [refer to the tests from Phase 1 above]

Rules:
1. **Minimum viable code** — only write enough to pass the tests, nothing more
2. **No optimization** — that's for the Refactor phase
3. **No extra features** — stick to what the tests require
4. **All tests must pass** — if a test would still fail, fix it

Provide:
1. **Implementation code** — complete, runnable file(s)
2. **Test results** — predicted pass/fail for each test
3. **Any test adjustments** — if a test was poorly written, suggest a fix (but don't skip it)}}

---

## Phase 3: REFACTOR — Improve Without Breaking

{{Agent:
  Step 1: Review the GREEN implementation above. Identify refactoring opportunities: duplicated logic, unclear naming, long functions (>30 lines), deep nesting, missing type annotations, hardcoded values that should be constants. For each issue, describe what to change and why. Do NOT change behavior — all tests must still pass.

  Step 2: Produce the refactored version of the code. Show a clean, production-ready version that passes all the same tests. After the code, list every change made with a one-line rationale. End with a confidence rating (High/Medium/Low) that all tests still pass.

  Step 3: Analyze test coverage. List: which code paths are tested, which are NOT tested, and suggest 3-5 additional tests that would improve coverage. Present as a checklist:
- [ ] [Test name] — [what it covers] — [priority: P0/P1/P2]

End with an estimated coverage percentage and whether it meets the 80% minimum threshold.
}}

> 💡 **How to use:** Describe your feature, set language and test framework, click **▶ Run All** for the full TDD cycle.
`
    },
    {
        name: 'Database Review',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-database-check',
        description: 'Database schema & query review — N+1 detection, index analysis, normalization audit, and migration safety',
        variables: [
            { name: 'schemaOrQueries', value: 'Paste your schema, queries, or migration files here', desc: 'Database code to review' },
            { name: 'dbEngine', value: 'PostgreSQL', desc: 'Database engine (PostgreSQL, MySQL, SQLite, MongoDB, etc.)' },
            { name: 'orm', value: 'None (raw SQL)', desc: 'ORM in use (Prisma, Sequelize, SQLAlchemy, Drizzle, Django ORM, etc.)' },
        ],
        content: `# 🗄️ Database Review — $(dbEngine)

**Date:** $(date)
**Reviewer:** AI Database Agent
**Engine:** $(dbEngine)
**ORM:** $(orm)

---

## Code Under Review

\\\`\\\`\\\`sql
$(schemaOrQueries)
\\\`\\\`\\\`

---

## Schema & Query Analysis

{{@AI:
  @think: yes
  @prompt: You are a database architect and performance specialist for $(dbEngine). Review the schema, queries, and/or migration code below.

\\\`\\\`\\\`
$(schemaOrQueries)
\\\`\\\`\\\`

**ORM in use:** $(orm)

Evaluate against these categories:

### 1. Schema Design
- **Normalization** — Is the schema properly normalized? Any redundant data?
- **Data types** — Are types appropriate? (e.g., VARCHAR vs TEXT, INT vs BIGINT, TIMESTAMP vs DATE)
- **Constraints** — Missing NOT NULL, UNIQUE, CHECK, or FOREIGN KEY constraints?
- **Defaults** — Sensible defaults for optional columns?
- **Naming** — Consistent naming (snake_case? singular vs plural tables?)

### 2. Performance Issues
- **N+1 queries** — Loops executing individual queries instead of JOINs or batch loads
- **Missing indexes** — Columns used in WHERE, JOIN, ORDER BY without indexes
- **Over-indexing** — Too many indexes slowing writes
- **Full table scans** — SELECT * or unbounded queries without LIMIT
- **Expensive JOINs** — Missing indexes on join columns

### 3. Query Patterns
- **Parameterized queries** — No string concatenation (SQL injection risk)
- **Pagination** — OFFSET vs cursor-based (cursor is better for large datasets)
- **Aggregation** — Could benefit from materialized views?
- **Transaction safety** — Operations that need ACID guarantees

### 4. Migration Safety (if reviewing migrations)
- **Backwards compatibility** — Will this break running code during deployment?
- **Data loss risk** — Dropping columns, changing types
- **Lock duration** — Adding indexes on large tables (use CONCURRENTLY in PostgreSQL)
- **Rollback plan** — Can this migration be reversed?

### 5. Security
- **Row-Level Security** (RLS) — Enabled for multi-tenant data?
- **Privilege separation** — Application user vs admin user permissions
- **Sensitive data** — PII encrypted at rest? Audit columns present?

For each finding:
- **Severity:** 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
- **Issue:** What's wrong
- **Fix:** Exact SQL or ORM code to fix it
- **Impact:** Performance/security/reliability effect

End with a summary table and overall database health grade (A-F).}}

> 💡 **How to use:** Paste your schema, queries, or migrations. Set the DB engine and ORM, click **▶ Run All** for analysis.
`
    },
    {
        name: 'Generate E2E Tests',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-play-btn',
        description: 'User flow → E2E tests — generate Playwright or Cypress test suites from feature descriptions',
        variables: [
            { name: 'userFlows', value: '1. User registers with email and password\n2. User logs in with credentials\n3. User creates a new project\n4. User invites a team member', desc: 'User flows to test (numbered list)' },
            { name: 'testFramework', value: 'Playwright', desc: 'E2E framework: Playwright, Cypress, Puppeteer, etc.' },
            { name: 'appUrl', value: 'http://localhost:3000', desc: 'Application URL for tests' },
        ],
        content: `# 🎭 E2E Test Generator — $(testFramework)

**Date:** $(date)
**Framework:** $(testFramework)
**App URL:** $(appUrl)

---

## User Flows to Test

$(userFlows)

---

## Generated E2E Tests

{{Agent:
  Step 1: Analyze each user flow and break it down into individual test steps. For each flow, identify: preconditions (user state, test data needed), the exact sequence of user actions (click, type, navigate, wait), expected outcomes at each step, and cleanup/teardown needs. Present as a structured outline before writing any test code.

  Step 2: Generate complete, runnable $(testFramework) test code for ALL user flows. Use the Page Object Model pattern for reusability. Include:

**Test structure:**
- Proper describe/test grouping by flow
- beforeAll/afterAll for setup and teardown
- Test isolation — each test should be independent

**For each test step, include:**
- Navigation actions (goto, click links)
- Form interactions (fill, select, check)
- Assertions (visible text, URL, element state)
- Wait strategies (waitForSelector, waitForResponse, NOT arbitrary timeouts)
- Screenshot capture on failure

**Best practices:**
- Use data-testid selectors (not CSS classes or XPath)
- Generate test data with unique identifiers (timestamps or UUIDs)
- Handle loading states and async operations
- Test both happy path and at least 1 error case per flow

  Step 3: Generate a test configuration file and npm scripts to run the tests. Include: $(testFramework) config file with baseURL, timeouts, retries, and screenshot settings. Also provide a CI/CD pipeline snippet (GitHub Actions YAML) to run these tests on every push. End with a test coverage matrix showing which user flows are covered:

| Flow | Happy Path | Error Case | Edge Case | Auth Required |
|------|-----------|------------|-----------|---------------|
| ... | ✅/❌ | ✅/❌ | ✅/❌ | Yes/No |
}}

> 💡 **How to use:** List your user flows, set the test framework and app URL, click **▶ Run All** for complete E2E tests.
`
    },
    {
        name: 'API Design Review',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-plug',
        description: 'REST API audit — conventions, error handling, pagination, versioning, and OpenAPI spec generation',
        variables: [
            { name: 'apiCode', value: 'Paste your API route handlers or endpoint definitions here', desc: 'API code to review' },
            { name: 'framework', value: 'Express.js', desc: 'API framework (Express, FastAPI, Django REST, Flask, etc.)' },
            { name: 'apiStyle', value: 'REST', desc: 'API style: REST, GraphQL, gRPC' },
        ],
        content: `# 🔌 API Design Review — $(apiStyle)

**Date:** $(date)
**Reviewer:** AI API Design Agent
**Framework:** $(framework)
**Style:** $(apiStyle)

---

## API Code Under Review

\\\`\\\`\\\`
$(apiCode)
\\\`\\\`\\\`

---

## Design Audit

{{@AI:
  @think: yes
  @prompt: You are a senior API architect specializing in $(apiStyle) APIs built with $(framework). Review the API code below for design quality, security, and developer experience.

\\\`\\\`\\\`
$(apiCode)
\\\`\\\`\\\`

Evaluate against these standards:

### 1. REST Conventions (if REST)
- **HTTP methods** — GET for reads, POST for creates, PUT/PATCH for updates, DELETE for deletes
- **Status codes** — 200 success, 201 created, 204 no content, 400 bad request, 401 unauthorized, 403 forbidden, 404 not found, 409 conflict, 422 validation error, 429 rate limited, 500 server error
- **URL structure** — Nouns not verbs (/users not /getUsers), plural resources, nested for relationships (/users/:id/posts)
- **Idempotency** — PUT and DELETE should be idempotent

### 2. Error Handling
- **Consistent error format** — Every error should return the same JSON structure
- **Error code + message** — Machine-readable code + human-readable message
- **No stack traces in production** — Internal errors should not leak implementation details
- **Validation errors** — Field-level error details for 422 responses

Example error format:
\\\`\\\`\\\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      { "field": "email", "message": "Must be a valid email address" }
    ]
  }
}
\\\`\\\`\\\`

### 3. Pagination
- **Cursor-based** preferred over offset (avoids page drift with inserts)
- **Consistent format** — Include total count, next/prev cursors, page size
- **Max page size** — Enforce an upper limit (e.g., 100)

### 4. Input Validation
- **Schema validation** on every endpoint (Zod, Joi, Pydantic, etc.)
- **Type coercion** — Handle string numbers, booleans from query params
- **Sanitization** — Strip dangerous characters before processing

### 5. Authentication & Authorization
- **Auth middleware** — Applied consistently to protected routes
- **RBAC** — Role checks after authentication
- **API keys** — Sent in headers (not URL params, which get logged)

### 6. Rate Limiting & Performance
- **Rate limiting** — Per endpoint, stricter on auth routes
- **Caching headers** — ETag, Cache-Control for GET responses
- **Response size** — No unbounded queries, always paginate lists
- **Timeouts** — On external service calls

### 7. Documentation
- **Self-documenting** — Clear endpoint names and status codes
- **Missing docs** — Endpoints without JSDoc/docstrings

For each finding, show the problematic code and the corrected version.

End with a summary: API Design Score (A-F) and top 3 improvements.}}

---

## OpenAPI Spec

{{@AI:
  @think: yes
  @prompt: Based on the API code above, generate an OpenAPI 3.0 specification (YAML format) documenting all endpoints. Include: paths, HTTP methods, request body schemas, response schemas (success and error), query parameters, path parameters, authentication requirements, and example values. Make it production-ready.}}

> 💡 **How to use:** Paste your API code, set the framework and style, click **▶ Run All** for design audit + OpenAPI spec.
`
    },
    {
        name: 'Fix Build Errors',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-wrench',
        description: 'Paste build output or CI logs → get root cause analysis, fix, and prevention strategy',
        variables: [
            { name: 'buildOutput', value: 'Paste your build error output / CI logs here', desc: 'Build output or CI/CD error logs' },
            { name: 'buildTool', value: 'Vite / Webpack', desc: 'Build tool (Vite, Webpack, Rollup, esbuild, tsc, cargo, go build, etc.)' },
            { name: 'projectContext', value: 'React app with TypeScript', desc: 'Brief project description' },
        ],
        content: `# 🔧 Fix Build Errors — $(buildTool)

**Date:** $(date)
**Build Tool:** $(buildTool)
**Project:** $(projectContext)
**Fixer:** AI Build Error Agent

---

## Build Output

\\\`\\\`\\\`
$(buildOutput)
\\\`\\\`\\\`

---

## Diagnosis & Fix

{{@AI:
  @think: yes
  @prompt: You are a build systems expert. Analyze this build failure and provide an actionable fix.

Build tool: $(buildTool)
Project: $(projectContext)

Build output:
\\\`\\\`\\\`
$(buildOutput)
\\\`\\\`\\\`

Provide your analysis in this EXACT order (fix first, explain after):

### 1. Quick Fix
The exact command or code change to resolve this error. Be specific:
- If it's a dependency issue → exact npm/pip/go command
- If it's a code error → exact file and line to change
- If it's a config issue → exact config change needed

### 2. Root Cause
- **What failed:** The specific build step that errored
- **Why it failed:** The underlying cause (not just the symptom)
- **Error chain:** If error A caused error B, trace the chain

### 3. Common Causes
This type of build error is usually caused by:
1. [Most common cause and its fix]
2. [Second most common cause]
3. [Third most common cause]

### 4. Verification
After applying the fix, verify with:
\\\`\\\`\\\`bash
[exact commands to rebuild and verify]
\\\`\\\`\\\`

### 5. Prevention
How to prevent this error from recurring:
- CI/CD checks to add
- Configuration changes
- Development workflow improvements
- Pre-commit hooks or linting rules

If the build output contains multiple errors, address them in dependency order (fix the root cause first, dependent errors may resolve automatically).}}

> 💡 **How to use:** Paste build output or CI logs, set your build tool, click **▶ Run All** for the fix.
`
    },
    {
        name: 'Performance Profiler',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-speedometer2',
        description: 'Paste code → get N+1 detection, memory leak spots, O(n²) loops, bundle impact, and caching recommendations',
        variables: [
            { name: 'codeToProfile', value: 'Paste your code here', desc: 'Code to analyze for performance' },
            { name: 'language', value: 'JavaScript', desc: 'Programming language' },
            { name: 'context', value: 'Web app / API server / CLI tool / Worker', desc: 'Where this code runs' },
        ],
        content: `# ⚡ Performance Profiler

**Date:** $(date)
**Profiler:** AI Performance Agent
**Language:** $(language)
**Runtime:** $(context)

---

## Code Under Analysis

\\\`\\\`\\\`
$(codeToProfile)
\\\`\\\`\\\`

---

## Phase 1: Hotspot Detection

{{@AI:
  @think: yes
  @prompt: You are a performance engineering specialist. Analyze this $(language) code running as a $(context) for performance bottlenecks.

\\\`\\\`\\\`
$(codeToProfile)
\\\`\\\`\\\`

Scan for these categories and report **every** finding:

### 1. Algorithmic Complexity
- O(n²) or worse loops (nested iterations over the same data)
- Redundant re-computation (same value calculated multiple times)
- Unnecessary sorting or searching in hot paths
- Array/string concatenation in loops (should use join/buffer)

### 2. I/O & Network
- **N+1 query patterns** — loops making individual DB/API calls instead of batch
- Sequential async calls that could be parallelized (Promise.all / asyncio.gather)
- Missing connection pooling
- Unbounded data fetching (no LIMIT, loading entire collections)

### 3. Memory
- Memory leaks — event listeners not removed, closures holding references, growing caches without eviction
- Large object cloning when mutation would suffice
- Holding entire files in memory instead of streaming
- Global state accumulation

### 4. Rendering & Frontend (if applicable)
- Unnecessary re-renders (missing React.memo, useMemo, useCallback)
- Large DOM manipulation without batching
- Layout thrashing (read-write-read-write patterns)
- Unoptimized images or missing lazy loading

For each finding, report:

| # | Category | Severity | Location | Issue | Impact Estimate |
|---|----------|----------|----------|-------|-----------------|
| 1 | ... | 🔴 Critical / 🟠 High / 🟡 Medium | Line/function | ... | ~Xms / ~X% slower |
}}

---

## Phase 2: Optimized Code & Benchmarks

{{Agent:
  Step 1: For the top 5 most impactful findings from Phase 1, produce optimized versions. For each, show the original code (❌ Before), the optimized code (✅ After), what changed and why it's faster, and an estimated performance improvement. Focus on the highest-impact changes first. Make sure optimizations preserve the exact same behavior.

  Step 2: Generate a caching strategy for this code. Identify: what values can be cached (computed results, API responses, DB queries), where to cache (in-memory, Redis, CDN, browser), recommended TTL for each cache, cache invalidation triggers. Present as a table with concrete implementation snippets.

  Step 3: Create a performance monitoring checklist. List the specific metrics to track (response time p50/p95/p99, memory usage, query count per request, bundle size, Core Web Vitals if frontend), the tools and commands to measure them (e.g., lighthouse, clinic.js, py-spy, pprof, Chrome DevTools), and warning thresholds that indicate regression. Format as an actionable checklist the developer can integrate into CI/CD.
}}

> 💡 **How to use:** Paste your code, set the language and runtime context. Click **▶ Run All** for hotspot scan → optimizations → monitoring plan.
`
    },
    {
        name: 'Implementation Planner',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-kanban',
        description: 'Describe a feature → get a phased plan with task breakdown, dependency order, risk assessment, and effort estimate',
        variables: [
            { name: 'featureDescription', value: 'Add user authentication with OAuth (Google, GitHub) and role-based access control', desc: 'Feature to plan' },
            { name: 'techStack', value: 'Next.js, PostgreSQL, Prisma', desc: 'Technology stack' },
            { name: 'teamSize', value: '1 developer', desc: 'Team size and composition' },
        ],
        content: `# 📋 Implementation Plan — $(featureDescription)

**Date:** $(date)
**Planner:** AI Planning Agent
**Stack:** $(techStack)
**Team:** $(teamSize)

---

## Implementation Blueprint

{{@AI:
  @think: yes
  @prompt: You are a senior technical lead creating an implementation plan for a development team. Plan the following feature from zero to shipped.

**Feature:** $(featureDescription)
**Tech Stack:** $(techStack)
**Team:** $(teamSize)

Generate a complete implementation plan:

### 1. Requirements Analysis

Break the feature into concrete requirements:
- **Must Have (P0):** Core functionality that defines the feature
- **Should Have (P1):** Important but not blocking launch
- **Nice to Have (P2):** Enhancements for later

### 2. Architecture Decisions

For each significant decision, document:
- **Decision**: What was chosen
- **Alternatives**: 2-3 other options considered
- **Rationale**: Why this option wins (trade-offs)

### 3. Task Breakdown

Create a detailed, ordered task list. Each task should be shippable independently:

| # | Task | Depends On | Estimated Effort | Risk |
|---|------|-----------|-----------------|------|
| 1 | [Task name] | — | 2h / 4h / 1d / 2d | 🟢 Low / 🟡 Med / 🔴 High |
| 2 | [Task name] | Task 1 | ... | ... |

Rules for task breakdown:
- No task should take more than 2 days
- Each task must be testable in isolation
- Dependencies must form a DAG (no circular deps)
- Infrastructure and schema changes go first

### 4. Phased Rollout

Split into phases with clear milestones:

**Phase 1: Foundation (Week 1)**
- Tasks: 1, 2, 3
- Milestone: [what's working at the end]
- Demo: [what you can show]

**Phase 2: Core Logic (Week 2)**
- ...

**Phase 3: Polish & Ship (Week 3)**
- ...

### 5. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [What could go wrong] | Low/Med/High | Low/Med/High | [How to prevent or handle] |

### 6. Definition of Done

- [ ] All P0 requirements implemented
- [ ] Tests written (unit + integration)
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] QA passed

Provide real, specific tasks — not generic placeholders. Reference actual libraries, APIs, and patterns for the $(techStack) stack.}}

> 💡 **How to use:** Describe your feature, set your stack. Click **▶ Run All** for a production-ready implementation plan.
`
    },
    {
        name: 'Git Commit Reviewer',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-git',
        description: 'Paste a diff or commit messages → get conventional commit formatting, breaking change detection, and changelog',
        variables: [
            { name: 'diffOrCommits', value: 'Paste your git diff, commit messages, or list of changes here', desc: 'Git diff or commit messages to review' },
            { name: 'project', value: 'my-project', desc: 'Project name for changelog header' },
        ],
        content: `# 🔀 Git Commit Reviewer — $(project)

**Date:** $(date)
**Reviewer:** AI Git Agent

---

## Input

\\\`\\\`\\\`
$(diffOrCommits)
\\\`\\\`\\\`

---

## Commit Review & Changelog

{{@AI:
  @think: yes
  @prompt: You are a senior developer reviewing git changes for commit quality. Analyze the diff or commit messages below and produce professional commit formatting and a changelog.

\\\`\\\`\\\`
$(diffOrCommits)
\\\`\\\`\\\`

**Project:** $(project)

### 1. Change Analysis

Categorize every change:

| File / Area | Change Type | Scope | Summary |
|------------|-------------|-------|---------|
| [file/module] | feat / fix / refactor / docs / test / chore / perf / ci | [component] | [one-line description] |

### 2. Conventional Commit Messages

Rewrite as proper [Conventional Commits](https://www.conventionalcommits.org/):

\\\`\\\`\\\`
type(scope): description

[optional body explaining WHAT and WHY, not HOW]

[optional footer: BREAKING CHANGE, Fixes #123, Co-authored-by]
\\\`\\\`\\\`

Rules:
- **feat:** New feature (MINOR version bump)
- **fix:** Bug fix (PATCH version bump)
- **BREAKING CHANGE:** in footer → MAJOR version bump
- Keep subject line ≤ 72 characters
- Use imperative mood ("add" not "added")
- Body wraps at 80 characters
- One logical change per commit

If the diff contains multiple logical changes, suggest splitting into separate commits.

### 3. Breaking Change Detection

Scan for breaking changes:
- [ ] API signature changes (parameters added/removed/renamed)
- [ ] Return type changes
- [ ] Removed public functions/methods/exports
- [ ] Database schema changes (column drops, type changes)
- [ ] Config format changes
- [ ] Environment variable changes
- [ ] Dependency major version bumps

For each breaking change found, provide:
- **What broke**: Exact change
- **Who's affected**: Consumers, downstream services, users
- **Migration steps**: How to update

### 4. Generated Changelog

\\\`\\\`\\\`markdown
## [version] — $(date)

### ✨ Features
- description (#PR)

### 🐛 Bug Fixes
- description (#PR)

### ♻️ Refactoring
- description

### 📝 Documentation
- description

### ⚠️ Breaking Changes
- description — see migration guide
\\\`\\\`\\\`

### 5. Quality Check

| Check | Status | Notes |
|-------|--------|-------|
| Commit messages follow conventional format | ✅/❌ | ... |
| Each commit is a single logical change | ✅/❌ | ... |
| No sensitive data in diff (keys, passwords) | ✅/❌ | ... |
| Breaking changes documented | ✅/❌ | ... |
| Tests updated for changed behavior | ✅/❌ | ... |
}}

> 💡 **How to use:** Paste your git diff (\\\`git diff\\\`) or commit messages (\\\`git log\\\`). Click **▶ Run All** for formatted commits + changelog.
`
    },
    {
        name: 'Deployment Checklist',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-rocket-takeoff',
        description: 'Describe your stack → get CI/CD pipeline, Docker config, health checks, rollback plan, and pre-deploy checklist',
        variables: [
            { name: 'stackDescription', value: 'Next.js frontend + Express API + PostgreSQL + Redis, deployed on Vercel (frontend) and Railway (backend)', desc: 'Your full stack and deployment targets' },
            { name: 'appName', value: 'my-app', desc: 'Application name' },
        ],
        content: `# 🚀 Deployment Checklist — $(appName)

**Date:** $(date)
**Engineer:** AI DevOps Agent
**Stack:** $(stackDescription)

---

## Deployment Blueprint

{{@AI:
  @think: yes
  @prompt: You are a senior DevOps engineer. Generate a complete deployment strategy for the following application.

**App:** $(appName)
**Stack:** $(stackDescription)

### 1. Pre-Deploy Checklist

Generate a comprehensive checklist. Mark each item as required (🔴) or recommended (🟡):

**Code Quality**
- 🔴 All tests passing (\\\`npm test\\\` / \\\`pytest\\\` exit 0)
- 🔴 Build succeeds locally (\\\`npm run build\\\`)
- 🔴 No console.log / debug statements in production code
- 🟡 Lint passing with zero warnings
- 🔴 Environment variables documented and set in target

**Security**
- 🔴 No hardcoded secrets in codebase (grep check)
- 🔴 Dependencies audited (\\\`npm audit\\\` / \\\`pip audit\\\`)
- 🟡 CORS configured for production origins only
- 🔴 Rate limiting enabled on public endpoints
- 🟡 CSP headers configured

**Database**
- 🔴 Migrations tested on staging first
- 🔴 Backward-compatible schema changes (no column drops without code deploy first)
- 🟡 Database backup taken before migration
- 🟡 Rollback migration tested

**Performance**
- 🟡 Bundle size checked (no regressions)
- 🟡 API response times within SLA
- 🟡 Cache strategy verified

### 2. CI/CD Pipeline

Generate a GitHub Actions workflow YAML for this stack:
- Triggers: push to main, pull requests
- Jobs: lint, test, build, deploy
- Environment secrets handling
- Staged deployment (staging → production)
- Deployment notifications

### 3. Docker Configuration (if applicable)

Generate optimized Dockerfile(s) for the stack:
- Multi-stage builds for smaller images
- Non-root user for security
- .dockerignore file
- docker-compose.yml for local development
- Health check configuration

### 4. Health Checks & Monitoring

- **/health** endpoint: what to check (DB, cache, external APIs)
- **Uptime monitoring**: recommended service and check interval
- **Error tracking**: integration setup (Sentry, etc.)
- **Logging**: structured JSON logging with log levels
- **Alerts**: what triggers a page (error rate, latency, uptime)

### 5. Rollback Plan

Provide exact rollback procedures for each failure scenario:

| Failure | Detection | Rollback Steps | Recovery Time |
|---------|-----------|---------------|---------------|
| Bad deploy (app crashes) | Health check fails | ... | < 5 min |
| DB migration breaks | Error spike post-deploy | ... | 10-30 min |
| Performance regression | Latency alerts | ... | < 5 min |
| Security vulnerability | Audit alert | ... | < 1 hour |

### 6. Post-Deploy Verification

Commands to verify the deployment is healthy:
- Smoke test endpoints
- Check logs for errors
- Verify database state
- Monitor dashboards for 15 minutes

Provide exact commands and URLs, not generic advice.}}

> 💡 **How to use:** Describe your stack, click **▶ Run All** for a complete deployment playbook.
`
    },
    {
        name: 'Cost-Aware LLM Pipeline',
        category: 'agents',
        displayTag: 'Agent',
        icon: 'bi-cash-stack',
        description: 'Describe your AI pipeline → get model routing, budget tracking, cost optimization, and fallback strategies',
        variables: [
            { name: 'pipelineDescription', value: 'Customer support chatbot that handles FAQs, escalates complex issues, and generates ticket summaries', desc: 'Describe your LLM pipeline or AI feature' },
            { name: 'monthlyBudget', value: '$500', desc: 'Monthly budget for LLM API costs' },
            { name: 'currentModels', value: 'GPT-4o for everything', desc: 'Current model(s) in use' },
        ],
        content: `# 💰 Cost-Aware LLM Pipeline — $(pipelineDescription)

**Date:** $(date)
**Advisor:** AI Cost Optimization Agent
**Budget:** $(monthlyBudget) / month
**Current:** $(currentModels)

---

## Pipeline Cost Analysis

{{@AI:
  @think: yes
  @prompt: You are an AI infrastructure cost optimization specialist. Analyze this LLM pipeline and design a cost-efficient architecture.

**Pipeline:** $(pipelineDescription)
**Monthly Budget:** $(monthlyBudget)
**Current Models:** $(currentModels)

### 1. Task Classification

Break the pipeline into distinct task types and classify each by complexity:

| Task | Complexity | Current Model | Recommended Model | Cost Savings |
|------|-----------|---------------|-------------------|-------------|
| [task] | Simple / Medium / Complex | [current] | [cheaper alternative] | ~X% |

Classification guide:
- **Simple** (use smallest model): Classification, routing, FAQ lookup, template filling, sentiment
- **Medium** (use mid-tier): Summarization, extraction, moderate generation, translation
- **Complex** (use premium): Reasoning, multi-step analysis, creative writing, code generation, nuanced judgment

### 2. Model Routing Strategy

Design a smart router that directs requests to the cheapest model that can handle them:

\\\`\\\`\\\`
Request → Classifier → Route
                       ├── Simple    → Haiku / GPT-4o-mini / Gemini Flash  ($0.25/1M)
                       ├── Medium    → Sonnet / GPT-4o / Gemini Pro        ($3/1M)
                       └── Complex   → Opus / GPT-4.5 / Gemini Ultra       ($15/1M)
\\\`\\\`\\\`

For each route, specify:
- Input criteria (keywords, length, topic, user tier)
- Quality threshold (when to escalate to a bigger model)
- Fallback behavior (if the small model fails or quality is low)

### 3. Cost Optimization Techniques

Apply these patterns and estimate savings:

| Technique | Description | Estimated Savings |
|-----------|-------------|------------------|
| **Prompt caching** | Cache system prompts and few-shot examples | 50-90% on cached tokens |
| **Response caching** | Cache identical or near-identical queries (hash-based) | 20-40% of total calls |
| **Batch processing** | Aggregate non-urgent requests into batch API calls | 50% per request |
| **Streaming + early stop** | Stop generation when answer is complete | 10-30% on output tokens |
| **Prompt compression** | Remove redundancy, use abbreviations in system prompts | 15-25% on input tokens |
| **Fine-tuning** | Train a smaller model on your specific task | 80%+ vs large model |
| **Token budget limits** | Set max_tokens per task type | Prevents runaway costs |

### 4. Budget Breakdown

Given $(monthlyBudget)/month budget:

| Component | % of Budget | Monthly Cost | Daily Limit | Rate (req/day) |
|-----------|------------|-------------|-------------|----------------|
| [task type] | X% | $X | $X | ~N requests |

Include a **cost alert threshold** — at what daily spend should alerts fire?

### 5. Fallback & Degradation Strategy

What happens when budget is exhausted or a model is unavailable:

| Scenario | Response |
|----------|----------|
| Budget 80% consumed | Switch all Medium tasks to Small models |
| Budget 95% consumed | Queue non-urgent requests, serve only P0 |
| Model API down | Fallback to [alternative provider] |
| Quality regression | Escalate to next tier, log for review |
| Latency spike | Switch to faster model, cache aggressively |

### 6. Monitoring Dashboard Metrics

Track these costs in real-time:
- Total spend (daily, weekly, monthly) vs budget
- Cost per request by task type
- Model distribution (% requests per model)
- Cache hit rate
- Quality score distribution (user feedback, automated eval)
- Token usage (input vs output, average per request)

Provide specific, actionable recommendations with estimated dollar savings.}}

> 💡 **How to use:** Describe your AI pipeline, set your budget and current models. Click **▶ Run All** for cost-optimized architecture.
`
    }
];
