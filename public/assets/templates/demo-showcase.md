# Product Launch Brief — Project Aurora

## Overview

We're launching **Project Aurora** — a next-gen privacy platform for enterprise teams who refuse to compromise on data sovereignty.

## Key Metrics

| Metric          | Target   | Current  | Status       |
|-----------------|----------|----------|--------------|
| Daily Active    | 50,000   | 47,200   | 🟢 On Track  |
| NPS Score       | 70+      | 64       | 🟡 At Risk   |
| Monthly Churn   | < 3%     | 2.1%     | 🟢 On Track  |
| Avg Session     | 12 min   | 14.3 min | 🟢 Exceeding |
| Enterprise Tier | 200 orgs | 187 orgs | 🟡 At Risk   |

---

## 🤖 AI-Powered Analysis

{{AI: Based on the metrics table above, write a 3-paragraph executive summary analyzing the launch readiness of Project Aurora. Highlight the NPS risk and recommend 2 specific actions to address it before launch.}}

---

## 🔗 Agent Flow — Competitive Intelligence Pipeline

{{Agent:
  Step 1: Research the top 5 privacy-first productivity platforms in 2026, including Notion, Obsidian, Anytype, Logseq, and TextAgent
  Step 2: For each platform, summarize their privacy model in one sentence and rate it on a scale of 1-5 for true client-side privacy
  Step 3: Create a comparison table with columns: Platform, Privacy Model, Client-Side Score (1-5), Key Weakness
}}

---

## 📊 Code Execution — Visualize the Data

```python
import matplotlib.pyplot as plt
import numpy as np

categories = ['Privacy', 'Speed', 'AI Power', 'Offline', 'Cost']
scores = [95, 88, 82, 100, 100]

fig, ax = plt.subplots(figsize=(8, 4))
colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed']
bars = ax.barh(categories, scores, color=colors, height=0.6, edgecolor='white', linewidth=0.5)

for bar, score in zip(bars, scores):
    ax.text(bar.get_width() - 5, bar.get_y() + bar.get_height()/2,
            f'{score}%', va='center', ha='right', color='white', fontweight='bold', fontsize=12)

ax.set_xlim(0, 105)
ax.set_title('TextAgent Feature Scores', fontsize=14, fontweight='bold', pad=15)
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
plt.tight_layout()
plt.show()
```

---

## 🗃️ SQL Analysis — Launch Database

```sql
CREATE TABLE IF NOT EXISTS launches (
    id INTEGER PRIMARY KEY,
    product TEXT,
    category TEXT,
    launch_month TEXT,
    privacy_score INTEGER
);

INSERT INTO launches VALUES (1, 'TextAgent', 'Productivity', 'March 2026', 5);
INSERT INTO launches VALUES (2, 'Aurora AI', 'Security', 'March 2026', 4);
INSERT INTO launches VALUES (3, 'DataVault', 'Storage', 'Feb 2026', 3);
INSERT INTO launches VALUES (4, 'PrivacyOS', 'Platform', 'March 2026', 5);
INSERT INTO launches VALUES (5, 'CloudSync', 'Productivity', 'Jan 2026', 2);

SELECT product, category, privacy_score,
       CASE
           WHEN privacy_score >= 4 THEN '🟢 Strong'
           WHEN privacy_score >= 3 THEN '🟡 Moderate'
           ELSE '🔴 Weak'
       END as privacy_rating
FROM launches
ORDER BY privacy_score DESC;
```

---

## 🌐 Web Search — Latest Intelligence

{{AI: What were the most significant AI-powered productivity tool launches in March 2026? Focus on tools that emphasize privacy or local-first architecture.}}

> 💡 **Demo tip:** Toggle "Web Search" ON and select DuckDuckGo to see live citations.

---

## 📑 Presentation Mode

> **Demo tip:** Click the **Presentation** icon in the toolbar to turn this document into a slide deck. Each `## Heading` becomes a new slide.

---

## ✅ Demo Checklist

- [x] Privacy hero — zero network requests
- [x] Live Markdown preview with table tools
- [x] AI generation with local Qwen model
- [x] Agent Flow multi-step pipeline
- [x] Python code execution with chart
- [x] SQL query with formatted output
- [x] Web search with citations
- [ ] Encrypted sharing (do live)
- [ ] Presentation mode (do live)
- [ ] LLM Memory Export (do live)
