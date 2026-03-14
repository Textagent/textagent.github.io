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
    }
];
