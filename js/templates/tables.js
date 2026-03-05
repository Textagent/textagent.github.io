// ============================================
// templates/tables.js — Table / Spreadsheet Templates
// ============================================
window.__MDV_TEMPLATES_TABLES = [
    {
        name: 'Sales Dashboard',
        category: 'tables',
        icon: 'bi-graph-up-arrow',
        description: 'Quarterly sales data with regions, products, and KPIs — sort, filter, chart, and export',
        content: `# 📊 Sales Dashboard — Q1-Q4 2024

> **Hover over any table** to reveal the spreadsheet toolbar: **Sort, Filter, Search, Stats, Chart, +Row, +Col, CSV, MD, Download**.
> Double-click any cell to edit it inline!

---

## Revenue by Region

| Region | Q1 | Q2 | Q3 | Q4 | Total | YoY Growth |
|--------|----:|----:|----:|----:|------:|-----------:|
| North America | 245000 | 312000 | 289000 | 367000 | 1213000 | 18.2% |
| Europe | 189000 | 201000 | 218000 | 256000 | 864000 | 12.5% |
| Asia Pacific | 167000 | 198000 | 234000 | 298000 | 897000 | 24.7% |
| Latin America | 78000 | 92000 | 105000 | 118000 | 393000 | 15.3% |
| Middle East | 45000 | 53000 | 61000 | 72000 | 231000 | 21.8% |
| Africa | 23000 | 31000 | 38000 | 47000 | 139000 | 32.1% |

---

## Top Products

| Rank | Product | Category | Units Sold | Revenue | Margin | Rating |
|-----:|---------|----------|----------:|--------:|-------:|-------:|
| 1 | CloudSync Pro | SaaS | 15420 | 924000 | 72.3% | 4.8 |
| 2 | DataVault Enterprise | Storage | 8930 | 714400 | 65.1% | 4.6 |
| 3 | SecureGate Plus | Security | 12100 | 544500 | 78.9% | 4.7 |
| 4 | AnalyticsPro Suite | Analytics | 6750 | 472500 | 68.4% | 4.5 |
| 5 | DevOps Toolkit | DevTools | 9200 | 368000 | 71.2% | 4.4 |
| 6 | AI Vision Module | AI/ML | 3100 | 341000 | 62.8% | 4.3 |
| 7 | NetGuard Basic | Security | 18900 | 283500 | 81.5% | 4.2 |
| 8 | StreamLine CRM | SaaS | 7400 | 259000 | 69.7% | 4.1 |

---

## Sales Team Performance

| Name | Role | Region | Deals Closed | Revenue | Quota | Attainment | Commission |
|------|------|--------|-------------:|--------:|------:|-----------:|-----------:|
| Sarah Chen | Director | APAC | 47 | 423000 | 350000 | 120.9% | 42300 |
| James Miller | Sr. Rep | NA | 38 | 342000 | 300000 | 114.0% | 34200 |
| Priya Patel | Manager | EMEA | 35 | 315000 | 280000 | 112.5% | 31500 |
| Carlos Ruiz | Rep | LATAM | 42 | 294000 | 250000 | 117.6% | 29400 |
| Emma Johnson | Sr. Rep | NA | 31 | 279000 | 260000 | 107.3% | 27900 |
| Ahmed Hassan | Rep | MEA | 28 | 252000 | 220000 | 114.5% | 25200 |
| Lisa Park | Rep | APAC | 33 | 231000 | 200000 | 115.5% | 23100 |

> [!TIP]
> Click **Σ Stats** in the toolbar to see totals, averages, and more for all numeric columns.
> Click **Chart** to generate a bar chart from any column.
`
    },
    {
        name: 'Project Tracker',
        category: 'tables',
        icon: 'bi-kanban',
        description: 'Multi-project task tracker with priorities, statuses, deadlines, and resource allocation',
        content: `# 📋 Project Tracker — Sprint 24.3

> Use the table tools: **Filter** by status or priority, **Sort** by deadline, **Search** for any keyword.

---

## Active Projects

| ID | Project | Lead | Status | Priority | Start | Deadline | Budget | Spent | Progress |
|----|---------|------|--------|----------|-------|----------|-------:|------:|---------:|
| PRJ-001 | Platform Redesign | Alice Chen | In Progress | 🔴 Critical | 2024-01-15 | 2024-06-30 | 250000 | 178000 | 71% |
| PRJ-002 | API Gateway v3 | Bob Smith | In Progress | 🟠 High | 2024-02-01 | 2024-05-15 | 180000 | 145000 | 81% |
| PRJ-003 | Mobile App iOS | Carol Davis | Testing | 🟠 High | 2024-01-20 | 2024-04-30 | 320000 | 298000 | 93% |
| PRJ-004 | Analytics Dashboard | Dan Wilson | In Progress | 🟡 Medium | 2024-03-01 | 2024-07-15 | 150000 | 52000 | 35% |
| PRJ-005 | SSO Integration | Eve Taylor | Not Started | 🟡 Medium | 2024-04-01 | 2024-08-01 | 95000 | 0 | 0% |
| PRJ-006 | Data Migration | Frank Lee | Blocked | 🔴 Critical | 2024-02-15 | 2024-04-15 | 120000 | 89000 | 74% |
| PRJ-007 | CI/CD Pipeline | Grace Kim | Complete | 🟢 Low | 2024-01-10 | 2024-03-30 | 85000 | 79000 | 100% |
| PRJ-008 | Doc Portal | Henry Zhang | In Progress | 🟢 Low | 2024-03-15 | 2024-09-01 | 65000 | 12000 | 18% |

---

## Sprint Tasks

| Task | Project | Assignee | Type | Status | Story Points | Hours Est | Hours Actual |
|------|---------|----------|------|--------|-------------:|----------:|-------------:|
| Implement auth flow | PRJ-001 | Alice | Feature | Done | 8 | 16 | 14 |
| Fix memory leak | PRJ-002 | Bob | Bug | In Review | 5 | 8 | 12 |
| UI accessibility audit | PRJ-003 | Carol | Task | In Progress | 3 | 6 | 4 |
| Chart component | PRJ-004 | Dan | Feature | In Progress | 13 | 24 | 18 |
| SAML endpoint | PRJ-005 | Eve | Feature | To Do | 8 | 16 | 0 |
| Schema migration script | PRJ-006 | Frank | Task | Blocked | 5 | 10 | 8 |
| Deploy staging | PRJ-007 | Grace | Task | Done | 2 | 4 | 3 |
| API reference docs | PRJ-008 | Henry | Docs | In Progress | 3 | 8 | 5 |
| Rate limiter | PRJ-002 | Bob | Feature | To Do | 8 | 14 | 0 |
| Push notifications | PRJ-003 | Carol | Feature | Testing | 13 | 20 | 22 |
| Dark mode theme | PRJ-001 | Alice | Feature | In Review | 5 | 10 | 9 |
| Load test scripts | PRJ-002 | Bob | Task | To Do | 3 | 6 | 0 |

---

## Team Allocation

| Team Member | Role | PRJ-001 | PRJ-002 | PRJ-003 | PRJ-004 | Utilization |
|-------------|------|--------:|--------:|--------:|--------:|------------:|
| Alice Chen | Lead | 60% | 0% | 0% | 20% | 80% |
| Bob Smith | Senior Dev | 0% | 80% | 0% | 0% | 80% |
| Carol Davis | Dev | 0% | 0% | 90% | 0% | 90% |
| Dan Wilson | Dev | 10% | 0% | 0% | 70% | 80% |
| Eve Taylor | Dev | 0% | 20% | 0% | 0% | 20% |

> [!TIP]
> Use **Filter** on the Status column to see only "In Progress" or "Blocked" tasks.
> **+Row** to add new tasks, **+Col** to add new fields.
`
    },
    {
        name: 'Financial Report',
        category: 'tables',
        icon: 'bi-currency-dollar',
        description: 'Income statement, balance sheet, and financial ratios with comparative periods',
        content: `# 💰 Financial Report — FY 2024

> Sort columns to rank by any metric. Click **Σ Stats** for column totals.

---

## Income Statement (USD thousands)

| Line Item | Q1 2024 | Q2 2024 | Q3 2024 | Q4 2024 | FY 2024 | FY 2023 | Change |
|-----------|--------:|--------:|--------:|--------:|--------:|--------:|-------:|
| Revenue | 4250 | 4680 | 5120 | 5890 | 19940 | 16200 | 23.1% |
| COGS | -1700 | -1870 | -2048 | -2356 | -7974 | -6804 | 17.2% |
| **Gross Profit** | **2550** | **2810** | **3072** | **3534** | **11966** | **9396** | **27.4%** |
| R&D | -680 | -720 | -750 | -790 | -2940 | -2430 | 21.0% |
| Sales & Marketing | -510 | -560 | -615 | -710 | -2395 | -2106 | 13.7% |
| G&A | -340 | -350 | -360 | -375 | -1425 | -1296 | 10.0% |
| **Operating Income** | **1020** | **1180** | **1347** | **1659** | **5206** | **3564** | **46.1%** |
| Interest & Other | -45 | -42 | -38 | -35 | -160 | -180 | -11.1% |
| Tax | -244 | -284 | -327 | -406 | -1261 | -847 | 48.9% |
| **Net Income** | **731** | **854** | **982** | **1218** | **3785** | **2537** | **49.2%** |

---

## Balance Sheet

| Account | Dec 2024 | Sep 2024 | Jun 2024 | Mar 2024 | Dec 2023 |
|---------|--------:|--------:|--------:|--------:|--------:|
| Cash & Equivalents | 8950 | 7800 | 6900 | 6100 | 5400 |
| Accounts Receivable | 3200 | 2870 | 2650 | 2400 | 2100 |
| Inventory | 1890 | 1720 | 1650 | 1580 | 1500 |
| **Total Current Assets** | **14040** | **12390** | **11200** | **10080** | **9000** |
| PP&E | 4500 | 4350 | 4200 | 4050 | 3900 |
| Intangibles | 2800 | 2850 | 2900 | 2950 | 3000 |
| **Total Assets** | **21340** | **19590** | **18300** | **17080** | **15900** |
| Accounts Payable | 1650 | 1480 | 1350 | 1200 | 1100 |
| Short-term Debt | 1200 | 1400 | 1600 | 1800 | 2000 |
| **Total Liabilities** | **6350** | **6080** | **5850** | **5600** | **5400** |
| **Shareholders' Equity** | **14990** | **13510** | **12450** | **11480** | **10500** |

---

## Key Financial Ratios

| Ratio | Q4 2024 | Q3 2024 | Q2 2024 | Q1 2024 | Industry Avg |
|-------|--------:|--------:|--------:|--------:|-------------:|
| Gross Margin | 60.0% | 60.0% | 60.0% | 60.0% | 55.0% |
| Operating Margin | 28.2% | 26.3% | 25.2% | 24.0% | 20.0% |
| Net Margin | 20.7% | 19.2% | 18.2% | 17.2% | 14.0% |
| Current Ratio | 4.92 | 4.30 | 3.80 | 3.36 | 2.50 |
| Debt/Equity | 0.42 | 0.45 | 0.47 | 0.49 | 0.65 |
| ROE | 32.5% | 29.1% | 27.4% | 25.5% | 18.0% |
| Revenue Growth YoY | 28.5% | 26.2% | 24.1% | 21.8% | 12.0% |
| EPS ($) | 3.05 | 2.46 | 2.14 | 1.83 | 1.50 |

> [!TIP]
> Use **Chart** to visualize revenue or margin trends across quarters.
`
    },
    {
        name: 'Employee Directory',
        category: 'tables',
        icon: 'bi-people',
        description: 'HR directory with departments, skills, compensation, and performance ratings',
        content: `# 👥 Employee Directory — Engineering Division

> **Search** for any name, skill, or department. **Filter** by location or role. **Sort** by salary or rating.

---

## Team Roster

| ID | Name | Title | Department | Location | Start Date | Salary | Rating | Level |
|----|------|-------|------------|----------|-----------|-------:|-------:|------:|
| E-101 | Alice Chen | Sr. Software Engineer | Platform | San Francisco | 2019-03-15 | 185000 | 4.8 | L5 |
| E-102 | Bob Martinez | Engineering Manager | Backend | New York | 2018-07-22 | 210000 | 4.6 | L6 |
| E-103 | Carol Williams | Staff Engineer | Infrastructure | London | 2017-11-01 | 225000 | 4.9 | L7 |
| E-104 | David Kim | Software Engineer | Frontend | Seoul | 2021-01-10 | 135000 | 4.3 | L4 |
| E-105 | Emma Thompson | Dev Lead | Mobile | Austin | 2020-05-20 | 195000 | 4.7 | L6 |
| E-106 | Frank Nguyen | Jr. Software Engineer | Backend | Singapore | 2023-06-12 | 95000 | 4.1 | L3 |
| E-107 | Grace Park | SRE Manager | DevOps | San Francisco | 2018-09-03 | 215000 | 4.5 | L6 |
| E-108 | Henry Zhang | ML Engineer | AI/ML | Berlin | 2020-08-17 | 190000 | 4.6 | L5 |
| E-109 | Isabella Costa | QA Lead | Quality | São Paulo | 2019-12-01 | 145000 | 4.4 | L5 |
| E-110 | Jack O'Brien | Security Engineer | Security | Dublin | 2021-04-15 | 170000 | 4.7 | L5 |
| E-111 | Karen Nakamura | Product Engineer | Platform | Tokyo | 2022-02-28 | 155000 | 4.2 | L4 |
| E-112 | Leo Petrov | Data Engineer | Data | Amsterdam | 2020-10-05 | 165000 | 4.5 | L5 |

---

## Skills Matrix

| Name | Python | JavaScript | Go | Rust | K8s | AWS | ML | SQL |
|------|:------:|:----------:|:--:|:----:|:---:|:---:|:--:|:---:|
| Alice Chen | ★★★ | ★★★★ | ★★ | ★ | ★★★ | ★★★★ | ★★ | ★★★ |
| Bob Martinez | ★★★★ | ★★ | ★★★★ | ★★ | ★★★ | ★★★ | ★ | ★★★★ |
| Carol Williams | ★★★ | ★★ | ★★★★★ | ★★★★ | ★★★★★ | ★★★★★ | ★★ | ★★★ |
| David Kim | ★★ | ★★★★★ | ★ | ★ | ★ | ★★ | ★ | ★★ |
| Emma Thompson | ★★★ | ★★★★ | ★★ | ★ | ★★ | ★★★ | ★ | ★★ |
| Henry Zhang | ★★★★★ | ★★ | ★★ | ★★★ | ★★★ | ★★★★ | ★★★★★ | ★★★★ |
| Leo Petrov | ★★★★ | ★★ | ★★★ | ★ | ★★★★ | ★★★★ | ★★★ | ★★★★★ |

---

## Department Summary

| Department | Headcount | Avg Salary | Avg Rating | Open Roles | Budget Used |
|------------|----------:|-----------:|-----------:|-----------:|------------:|
| Platform | 15 | 172000 | 4.5 | 3 | 87% |
| Backend | 22 | 158000 | 4.4 | 5 | 92% |
| Frontend | 12 | 145000 | 4.3 | 2 | 78% |
| Infrastructure | 8 | 198000 | 4.7 | 1 | 95% |
| Mobile | 10 | 165000 | 4.5 | 2 | 85% |
| DevOps | 6 | 178000 | 4.6 | 1 | 91% |
| AI/ML | 9 | 185000 | 4.4 | 4 | 72% |
| Data | 7 | 162000 | 4.5 | 2 | 88% |
| Security | 5 | 175000 | 4.6 | 3 | 80% |
| Quality | 8 | 140000 | 4.3 | 1 | 90% |

> [!TIP]
> Try **+Row** to add new employees, or **+Col** to add tracking fields like "Vacation Days" or "Certifications".
`
    },
    {
        name: 'Competitive Analysis',
        category: 'tables',
        icon: 'bi-trophy',
        description: 'Market comparison matrix with feature scoring, pricing tiers, and SWOT summary',
        content: `# 🏆 Competitive Analysis — Cloud Platform Market

> Sort by any column to find leaders. Use **Filter** to focus on specific categories. **Chart** any numeric column for visual comparison.

---

## Market Overview

| Company | Market Cap ($B) | Revenue ($B) | Growth | Customers | Market Share | Founded |
|---------|---------------:|-------------:|-------:|----------:|-------------:|--------:|
| CloudFirst | 180.5 | 28.4 | 32.1% | 245000 | 28.5% | 2010 |
| DataScale | 142.3 | 22.1 | 28.7% | 198000 | 22.2% | 2012 |
| NetVault | 98.7 | 15.8 | 24.3% | 156000 | 15.9% | 2014 |
| CodeDeploy | 67.2 | 11.2 | 35.6% | 132000 | 11.3% | 2016 |
| **Our Product** | **45.8** | **8.5** | **42.3%** | **89000** | **8.5%** | **2018** |
| InfraHub | 34.1 | 6.3 | 22.8% | 67000 | 6.3% | 2015 |
| SecureOps | 28.9 | 5.2 | 19.5% | 54000 | 5.2% | 2013 |
| MicroStack | 15.6 | 2.4 | 15.2% | 31000 | 2.4% | 2019 |

---

## Feature Comparison (1-5 scale)

| Feature | Our Product | CloudFirst | DataScale | NetVault | CodeDeploy |
|---------|:----------:|:----------:|:---------:|:--------:|:----------:|
| Auto-scaling | 5 | 5 | 4 | 4 | 3 |
| CI/CD Integration | 5 | 4 | 3 | 3 | 5 |
| Multi-region | 4 | 5 | 5 | 4 | 3 |
| Container Support | 5 | 5 | 4 | 5 | 4 |
| Serverless | 4 | 5 | 4 | 3 | 4 |
| ML/AI Tools | 5 | 4 | 5 | 3 | 2 |
| Security & Compliance | 4 | 5 | 4 | 4 | 3 |
| Developer Experience | 5 | 3 | 3 | 4 | 5 |
| Documentation | 4 | 4 | 3 | 4 | 4 |
| Pricing Flexibility | 5 | 3 | 3 | 4 | 4 |
| Support SLA | 4 | 5 | 4 | 3 | 3 |
| **Total** | **50** | **48** | **42** | **41** | **40** |

---

## Pricing Tiers Comparison ($/month)

| Tier | Our Product | CloudFirst | DataScale | NetVault | CodeDeploy |
|------|----------:|----------:|----------:|----------:|----------:|
| Free | 0 | 0 | 0 | 0 | 0 |
| Starter | 29 | 49 | 45 | 39 | 35 |
| Professional | 99 | 199 | 179 | 149 | 129 |
| Business | 299 | 499 | 449 | 399 | 349 |
| Enterprise | 899 | 1499 | 1299 | 1099 | 999 |
| Custom / Contact | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Customer Satisfaction

| Metric | Our Product | CloudFirst | DataScale | NetVault | Industry Avg |
|--------|----------:|----------:|----------:|----------:|-------------:|
| NPS Score | 72 | 58 | 52 | 61 | 48 |
| G2 Rating | 4.7 | 4.3 | 4.1 | 4.4 | 4.0 |
| Support CSAT | 94% | 87% | 82% | 89% | 80% |
| Uptime SLA | 99.99% | 99.95% | 99.9% | 99.95% | 99.9% |
| Avg Response Time | 12min | 45min | 2hr | 30min | 4hr |
| Churn Rate | 2.1% | 4.8% | 6.2% | 3.9% | 7.5% |

> [!TIP]
> Click **Chart** → select "Our Product" as label and any competitor column as value to visualize head-to-head comparisons.
`
    }
];
