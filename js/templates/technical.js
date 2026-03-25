// ============================================
// templates/technical.js — Technical Templates
// ============================================
window.__MDV_TEMPLATES_TECHNICAL = [
  {
    name: 'Bug Report',
    category: 'technical',
    icon: 'bi-bug',
    description: 'Detailed bug report with reproduction steps and environment info',
    variables: [
      { name: 'bugTitle', value: 'Brief description of the bug', desc: 'Bug title' },
      { name: 'reporter', value: 'Your Name', desc: 'Who found the bug' },
      { name: 'severity', value: '🟠 Major', desc: 'Severity level' },
    ],
    content: `# Bug Report

**Title:** $(bugTitle)
**Severity:** $(severity)
**Reporter:** $(reporter)
**Date:** $(date)
**Status:** Open

---

## Description

A clear and concise description of what the bug is.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

A clear description of what you expected to happen.

## Actual Behavior

A clear description of what actually happened.

## Screenshots / Recordings

_If applicable, add screenshots or screen recordings to help explain the problem._

## Environment

| Property | Value |
|----------|-------|
| OS | macOS 14.2 / Windows 11 / Ubuntu 22.04 |
| Browser | Chrome 120 / Firefox 121 / Safari 17 |
| App Version | 1.2.0 |
| Device | Desktop / Mobile |
| Screen Size | 1920x1080 |

## Console Errors

\`\`\`
Paste any relevant console errors here
\`\`\`

## Additional Context

Add any other context about the problem here. Include:
- Frequency (always, sometimes, rare)
- Workaround if any
- Related issues

---

## Resolution

**Fixed in:** [Version / PR #]
**Root Cause:**
**Fix Description:**
`
  },
  {
    name: 'Technical Spec',
    category: 'technical',
    icon: 'bi-diagram-3',
    description: 'Technical specification document with architecture and implementation details',
    variables: [
      { name: 'featureName', value: 'Feature Name', desc: 'Feature being specified' },
      { name: 'authorName', value: 'Your Name', desc: 'Spec author' },
    ],
    content: `# Technical Specification

**Feature:** $(featureName)
**Author:** $(authorName)
**Date:** $(date)
**Status:** Draft / In Review / Approved

---

## Overview

Brief description of the feature and its purpose.

## Background & Motivation

Why is this feature needed? What problem does it solve?

## Goals & Non-Goals

### Goals
- Goal 1
- Goal 2

### Non-Goals
- Non-goal 1 (explicitly out of scope)

## Architecture

\`\`\`mermaid
flowchart TD
  A[Client] --> B[API Gateway]
  B --> C[Service Layer]
  C --> D[Database]
  C --> E[Cache]
  C --> F[External API]
\`\`\`

## Detailed Design

### Data Model

\`\`\`sql
CREATE TABLE IF NOT EXISTS example (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  status      TEXT DEFAULT 'active',
  created_at  TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO example VALUES (1, 'Feature A', 'active', datetime('now'));
INSERT OR IGNORE INTO example VALUES (2, 'Feature B', 'draft', datetime('now'));
INSERT OR IGNORE INTO example VALUES (3, 'Feature C', 'active', datetime('now'));
SELECT * FROM example;
\`\`\`

### API Design

#### \`POST /api/v1/resource\`

**Request:**
\`\`\`json
{
"name": "string",
"config": {}
}
\`\`\`

**Response:** \`201 Created\`

### Error Handling

| Error Case | Handling Strategy |
|------------|-------------------|
| Invalid input | Return 400 with validation errors |
| Not found | Return 404 |
| Rate limited | Return 429 with retry-after header |

## Testing Strategy

- **Unit Tests:** Core logic and data transformations
- **Integration Tests:** API endpoints and database operations
- **E2E Tests:** Critical user flows

## Rollout Plan

1. **Phase 1:** Internal testing (1 week)
2. **Phase 2:** Beta rollout to 10% of users
3. **Phase 3:** Full rollout

## Open Questions

- [ ] Question 1?
- [ ] Question 2?
`
  },
  {
    name: 'Code Review',
    category: 'technical',
    icon: 'bi-git',
    description: 'Code review checklist and feedback template',
    variables: [
      { name: 'prNumber', value: '42', desc: 'Pull request number' },
      { name: 'prTitle', value: 'PR Title', desc: 'Pull request title' },
      { name: 'prAuthor', value: 'author', desc: 'PR author username' },
      { name: 'reviewer', value: 'reviewer', desc: 'Reviewer username' },
    ],
    content: `# Code Review

**PR:** #$(prNumber) — $(prTitle)
**Author:** @$(prAuthor)
**Reviewer:** @$(reviewer)
**Date:** $(date)

---

## Summary

Brief description of what this PR does.

## Review Checklist

### Correctness
- [ ] Code does what the PR description says
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs

### Code Quality
- [ ] Code is readable and well-organized
- [ ] Functions/methods are appropriately sized
- [ ] Variable names are descriptive
- [ ] No unnecessary complexity
- [ ] DRY principle followed

### Testing
- [ ] Unit tests added/updated
- [ ] Tests cover edge cases
- [ ] All tests passing
- [ ] Test coverage maintained or improved

### Security
- [ ] No hardcoded secrets or credentials
- [ ] Input validation in place
- [ ] No SQL injection vulnerabilities
- [ ] XSS prevention applied

### Performance
- [ ] No N+1 queries
- [ ] Appropriate caching used
- [ ] No memory leaks
- [ ] Database indexes considered

---

## Feedback

### 🟢 What's Good
- Positive feedback point 1
- Positive feedback point 2

### 🟡 Suggestions
- **File:Line** — Suggestion description
- **File:Line** — Suggestion description

### 🔴 Must Fix
- **File:Line** — Issue description
- **File:Line** — Issue description

---

**Verdict:** ✅ Approve / 🔄 Request Changes / ❌ Reject
`
  },
  {
    name: 'Technical Report (AI Fill)',
    category: 'technical',
    icon: 'bi-robot',
    description: 'AI-fillable technical report — describe your findings, let AI write the analysis',
    variables: [
      { name: 'reportTopic', value: 'Topic', desc: 'Report topic or title' },
      { name: 'authorName', value: 'Your Name', desc: 'Report author' },
    ],
    content: `# Technical Report: $(reportTopic)

**Author:** $(authorName)
**Date:** $(date)
**Status:** Draft

---

## Abstract

{{AI: Write a concise abstract (150-200 words) for a technical report about [describe your topic]. Summarize the purpose, methodology, key findings, and conclusions.}}

## Introduction

{{@AI:
  @think: yes
  @prompt: Write an introduction that establishes the context, states the problem, and outlines the approach. The topic is [your topic]. Include relevant background and why this investigation matters.}}

## Methodology

{{AI: Describe the methodology used. Include tools, frameworks, data sources, and evaluation criteria. Use bullet points for clarity.}}

## Findings

{{AI: Present the key findings in a structured format. Use a combination of prose, bullet points, and a summary table. Include 3-5 significant results.}}

## Analysis

{{@AI:
  @think: yes
  @prompt: Provide a deep analysis of the findings. Compare with expected outcomes, identify patterns, discuss implications, and note any anomalies or limitations.}}

## Recommendations

{{AI: Based on the analysis, provide 4-5 actionable recommendations. Format as numbered list with bold titles and supporting explanations.}}

## Conclusion

{{AI: Write a conclusion that ties everything together. Restate the key findings, their significance, and next steps for future work.}}
`
  },
  {
    name: 'Mermaid Diagram Catalog',
    category: 'technical',
    icon: 'bi-diagram-3',
    description: 'Complete reference — all 18 Mermaid diagram types with ready-to-use examples',
    content:
      '# 📊 Mermaid Diagram Catalog\n\n' +
      '> A comprehensive reference of **every Mermaid diagram type** — copy, customize, and use in your documents.\n\n' +
      '> [!TIP]\n' +
      '> Hover any diagram for the **toolbar** — zoom/pan, download PNG/SVG, copy to clipboard.\n\n' +
      '---\n\n' +
      '## 1. Flowchart\n\n' +
      'Represent processes, workflows, decision trees, and algorithms.\n\n' +
      '```mermaid\n' +
      'flowchart TD\n' +
      '    A[Start] --> B{Decision?}\n' +
      '    B -->|Yes| C[Action A]\n' +
      '    B -->|No| D[Action B]\n' +
      '    C --> E[Process]\n' +
      '    D --> E\n' +
      '    E --> F((End))\n' +
      '```\n\n' +
      '**Directions:** `TD` top-down · `LR` left-right · `BT` bottom-top · `RL` right-left\n\n' +
      '**Node shapes:** `[rect]` `(rounded)` `{diamond}` `((circle))` `([stadium])` `[[subroutine]]` `>asymmetric]` `{{hexagon}}`\n\n' +
      '---\n\n' +
      '## 2. Sequence Diagram\n\n' +
      'Show how processes interact over time — ideal for API calls and object communication.\n\n' +
      '```mermaid\n' +
      'sequenceDiagram\n' +
      '    autonumber\n' +
      '    actor User\n' +
      '    participant API\n' +
      '    participant DB\n\n' +
      '    User->>+API: POST /login\n' +
      '    API->>+DB: query user\n' +
      '    DB-->>-API: user record\n' +
      '    alt valid credentials\n' +
      '        API-->>User: 200 OK + token\n' +
      '    else invalid\n' +
      '        API-->>-User: 401 Unauthorized\n' +
      '    end\n' +
      '    Note over User,API: Session established\n' +
      '```\n\n' +
      '**Arrows:** `->>` solid · `-->>` dashed · `-x` lost message · `-)` async\n\n' +
      '---\n\n' +
      '## 3. Class Diagram\n\n' +
      'Model OOP structures — classes, attributes, methods, and relationships.\n\n' +
      '```mermaid\n' +
      'classDiagram\n' +
      '    class Animal {\n' +
      '        +String name\n' +
      '        +int age\n' +
      '        +makeSound() void\n' +
      '    }\n' +
      '    class Dog {\n' +
      '        +String breed\n' +
      '        +fetch() void\n' +
      '    }\n' +
      '    class Cat {\n' +
      '        +bool indoor\n' +
      '        +purr() void\n' +
      '    }\n' +
      '    class Owner {\n' +
      '        +String name\n' +
      '        +adopt(Animal a) void\n' +
      '    }\n' +
      '    Animal <|-- Dog : extends\n' +
      '    Animal <|-- Cat : extends\n' +
      '    Owner "1" --> "*" Animal : owns\n' +
      '```\n\n' +
      '**Relationships:** `<|--` inheritance · `*--` composition · `o--` aggregation · `-->` association · `..>` dependency\n\n' +
      '---\n\n' +
      '## 4. State Diagram\n\n' +
      'Describe system behavior — states, transitions, and nested states.\n\n' +
      '```mermaid\n' +
      'stateDiagram-v2\n' +
      '    [*] --> Idle\n' +
      '    Idle --> Processing : submit\n' +
      '    Processing --> Success : valid\n' +
      '    Processing --> Error : invalid\n' +
      '    Error --> Idle : retry\n' +
      '    Success --> [*]\n\n' +
      '    state Processing {\n' +
      '        [*] --> Validating\n' +
      '        Validating --> Saving\n' +
      '        Saving --> [*]\n' +
      '    }\n' +
      '```\n\n' +
      '---\n\n' +
      '## 5. Entity Relationship (ER) Diagram\n\n' +
      'Model database schemas — entities, attributes, and relationships.\n\n' +
      '```mermaid\n' +
      'erDiagram\n' +
      '    CUSTOMER ||--o{ ORDER : places\n' +
      '    ORDER ||--|{ LINE_ITEM : contains\n' +
      '    PRODUCT ||--o{ LINE_ITEM : "ordered in"\n' +
      '    CUSTOMER {\n' +
      '        int id PK\n' +
      '        string name\n' +
      '        string email\n' +
      '    }\n' +
      '    ORDER {\n' +
      '        int id PK\n' +
      '        int customer_id FK\n' +
      '        date created_at\n' +
      '        string status\n' +
      '    }\n' +
      '    PRODUCT {\n' +
      '        int id PK\n' +
      '        string name\n' +
      '        float price\n' +
      '    }\n' +
      '    LINE_ITEM {\n' +
      '        int order_id FK\n' +
      '        int product_id FK\n' +
      '        int quantity\n' +
      '    }\n' +
      '```\n\n' +
      '**Cardinality:** `||--||` one-to-one · `||--o{` one-to-many · `}o--o{` many-to-many\n\n' +
      '---\n\n' +
      '## 6. Gantt Chart\n\n' +
      'Plan and schedule project timelines with task dependencies.\n\n' +
      '```mermaid\n' +
      'gantt\n' +
      '    title Project Launch Plan\n' +
      '    dateFormat YYYY-MM-DD\n' +
      '    axisFormat %b %d\n\n' +
      '    section Design\n' +
      '    Wireframes        :done, d1, 2025-04-01, 7d\n' +
      '    UI Mockups         :active, d2, after d1, 10d\n' +
      '    Design Review      :milestone, m1, after d2, 0d\n\n' +
      '    section Development\n' +
      '    Frontend           :dev1, after m1, 14d\n' +
      '    Backend API        :dev2, after m1, 14d\n' +
      '    Integration        :dev3, after dev1, 7d\n\n' +
      '    section Testing\n' +
      '    QA Testing         :test1, after dev3, 7d\n' +
      '    UAT                :test2, after test1, 5d\n' +
      '    Launch             :milestone, m2, after test2, 0d\n' +
      '```\n\n' +
      '**Task states:** `:done` · `:active` · `:crit` (critical path) · `:milestone`\n\n' +
      '---\n\n' +
      '## 7. User Journey Diagram\n\n' +
      'Map user experience across touchpoints with satisfaction scores (1–5).\n\n' +
      '```mermaid\n' +
      'journey\n' +
      '    title User Onboarding Experience\n' +
      '    section Discovery\n' +
      '        Find website: 5: User\n' +
      '        Read landing page: 4: User\n' +
      '        Watch demo video: 5: User\n' +
      '    section Sign Up\n' +
      '        Click Sign Up: 5: User\n' +
      '        Fill in form: 3: User\n' +
      '        Email verification: 2: User, System\n' +
      '    section First Use\n' +
      '        Complete tutorial: 4: User\n' +
      '        Create first project: 5: User\n' +
      '        Invite team member: 3: User\n' +
      '```\n\n' +
      '---\n\n' +
      '## 8. Requirement Diagram\n\n' +
      'Visualize requirements and traceability (SysML).\n\n' +
      '```mermaid\n' +
      'requirementDiagram\n' +
      '    requirement "User Authentication" {\n' +
      '        id: "REQ-001"\n' +
      '        text: System shall authenticate users via OAuth 2.0\n' +
      '        risk: high\n' +
      '        verifymethod: test\n' +
      '    }\n' +
      '    requirement "Session Management" {\n' +
      '        id: "REQ-002"\n' +
      '        text: Sessions expire after 30 minutes of inactivity\n' +
      '        risk: medium\n' +
      '        verifymethod: inspection\n' +
      '    }\n' +
      '    element "Auth Service" {\n' +
      '        type: module\n' +
      '    }\n' +
      '    element "Session Store" {\n' +
      '        type: module\n' +
      '    }\n' +
      '    "Auth Service" - satisfies -> "User Authentication"\n' +
      '    "Session Store" - satisfies -> "Session Management"\n' +
      '    "Session Management" - derives -> "User Authentication"\n' +
      '```\n\n' +
      '---\n\n' +
      '## 9. Quadrant Chart\n\n' +
      'Plot items across two axes — perfect for prioritization and SWOT matrices.\n\n' +
      '```mermaid\n' +
      'quadrantChart\n' +
      '    title Feature Prioritization\n' +
      '    x-axis Low Effort --> High Effort\n' +
      '    y-axis Low Impact --> High Impact\n' +
      '    quadrant-1 Do First\n' +
      '    quadrant-2 Plan\n' +
      '    quadrant-3 Delegate\n' +
      '    quadrant-4 Eliminate\n' +
      '    SSO Integration: [0.8, 0.9]\n' +
      '    Dark Mode: [0.2, 0.6]\n' +
      '    API v2: [0.7, 0.7]\n' +
      '    Footer Redesign: [0.3, 0.2]\n' +
      '    Onboarding Tour: [0.4, 0.85]\n' +
      '    Legacy Cleanup: [0.9, 0.3]\n' +
      '```\n\n' +
      '---\n\n' +
      '## 10. Mindmap\n\n' +
      'Visually organize ideas branching from a central concept.\n\n' +
      '```mermaid\n' +
      'mindmap\n' +
      '    root((Project Planning))\n' +
      '        Goals\n' +
      '            Revenue target\n' +
      '            User growth\n' +
      '            Market expansion\n' +
      '        Team\n' +
      '            Engineering\n' +
      '                Frontend\n' +
      '                Backend\n' +
      '            Design\n' +
      '            Marketing\n' +
      '        Timeline\n' +
      '            Q1 Research\n' +
      '            Q2 Build\n' +
      '            Q3 Launch\n' +
      '            Q4 Scale\n' +
      '        Risks\n' +
      '            Technical debt\n' +
      '            Hiring delays\n' +
      '            Market shift\n' +
      '```\n\n' +
      '---\n\n' +
      '## 11. Pie Chart\n\n' +
      'Show proportions of a whole.\n\n' +
      '```mermaid\n' +
      'pie title Monthly Traffic Sources\n' +
      '    "Organic Search" : 42\n' +
      '    "Direct" : 25\n' +
      '    "Social Media" : 18\n' +
      '    "Referral" : 10\n' +
      '    "Email" : 5\n' +
      '```\n\n' +
      '---\n\n' +
      '## 12. Timeline\n\n' +
      'Display chronological events and milestones.\n\n' +
      '```mermaid\n' +
      'timeline\n' +
      '    title Company Milestones\n' +
      '    2020 : Founded\n' +
      '         : First prototype\n' +
      '    2021 : Seed round $2M\n' +
      '         : 10 employees\n' +
      '    2022 : Product launch\n' +
      '         : 1K customers\n' +
      '    2023 : Series A $15M\n' +
      '         : 50 employees\n' +
      '    2024 : International expansion\n' +
      '         : 10K customers\n' +
      '    2025 : Series B\n' +
      '         : IPO preparation\n' +
      '```\n\n' +
      '---\n\n' +
      '## 13. Sankey Diagram\n\n' +
      'Visualize flow quantities — arrow width proportional to flow rate.\n\n' +
      '```mermaid\n' +
      'sankey-beta\n\n' +
      'Revenue,Engineering,400000\n' +
      'Revenue,Marketing,200000\n' +
      'Revenue,Operations,150000\n' +
      'Revenue,Sales,180000\n' +
      'Revenue,R and D,70000\n' +
      'Engineering,Cloud Infra,150000\n' +
      'Engineering,Salaries,250000\n' +
      'Marketing,Paid Ads,120000\n' +
      'Marketing,Content,80000\n' +
      '```\n\n' +
      '---\n\n' +
      '## 14. XY Chart (Bar + Line)\n\n' +
      'Plot data points with bar charts and line graphs.\n\n' +
      '```mermaid\n' +
      'xychart-beta\n' +
      '    title "Monthly Active Users (2025)"\n' +
      '    x-axis [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]\n' +
      '    y-axis "Users (thousands)" 0 --> 250\n' +
      '    bar [45, 62, 78, 95, 110, 132, 148, 160, 175, 195, 220, 245]\n' +
      '    line [45, 62, 78, 95, 110, 132, 148, 160, 175, 195, 220, 245]\n' +
      '```\n\n' +
      '---\n\n' +
      '## 15. Git Graph\n\n' +
      'Visualize Git branching, merging, and commit history.\n\n' +
      '```mermaid\n' +
      'gitGraph\n' +
      '    commit id: "init"\n' +
      '    commit id: "base"\n' +
      '    branch feature/auth\n' +
      '    checkout feature/auth\n' +
      '    commit id: "add login"\n' +
      '    commit id: "add OAuth"\n' +
      '    checkout main\n' +
      '    branch feature/ui\n' +
      '    commit id: "new header"\n' +
      '    checkout main\n' +
      '    merge feature/auth id: "merge auth" tag: "v1.1"\n' +
      '    checkout feature/ui\n' +
      '    commit id: "dark mode"\n' +
      '    checkout main\n' +
      '    merge feature/ui id: "merge ui" tag: "v1.2"\n' +
      '    commit id: "release" type: HIGHLIGHT\n' +
      '```\n\n' +
      '---\n\n' +
      '## 16. Block Diagram\n\n' +
      'High-level system architecture with structured block layouts.\n\n' +
      '```mermaid\n' +
      'block-beta\n' +
      '    columns 3\n' +
      '    Frontend blockArrowId6<["  "]>(right) Backend\n' +
      '    space:3\n' +
      '    DB["Database"] space Cache["Redis Cache"]\n\n' +
      '    Backend --> DB\n' +
      '    Backend --> Cache\n' +
      '```\n\n' +
      '---\n\n' +
      '## 17. Architecture Diagram\n\n' +
      'Model cloud, deployment, and IT infrastructure.\n\n' +
      '```mermaid\n' +
      'architecture-beta\n' +
      '    group cloud(cloud)[Cloud Platform]\n\n' +
      '    service api(server)[API Gateway] in cloud\n' +
      '    service app(server)[App Server] in cloud\n' +
      '    service db(database)[PostgreSQL] in cloud\n' +
      '    service cache(database)[Redis] in cloud\n\n' +
      '    api:R --> L:app\n' +
      '    app:R --> L:db\n' +
      '    app:B --> T:cache\n' +
      '```\n\n' +
      '---\n\n' +
      '## 18. C4 Context Diagram\n\n' +
      'Software architecture overview using the C4 model — context, containers, components.\n\n' +
      '```mermaid\n' +
      'C4Context\n' +
      '    title System Context — Online Store\n\n' +
      '    Person(customer, "Customer", "Browses and purchases products")\n' +
      '    System(store, "Online Store", "E-commerce platform")\n' +
      '    System_Ext(payment, "Payment Gateway", "Processes payments")\n' +
      '    System_Ext(email, "Email Service", "Sends notifications")\n' +
      '    System_Ext(shipping, "Shipping API", "Handles delivery")\n\n' +
      '    Rel(customer, store, "Uses", "HTTPS")\n' +
      '    Rel(store, payment, "Charges", "HTTPS")\n' +
      '    Rel(store, email, "Sends emails", "SMTP")\n' +
      '    Rel(store, shipping, "Ships orders", "REST")\n' +
      '```\n\n' +
      '---\n\n' +
      '## Quick Reference\n\n' +
      '| # | Type | Keyword | Best For |\n' +
      '|:--|:-----|:--------|:---------|\n' +
      '| 1 | Flowchart | `flowchart TD` | Processes, decisions, workflows |\n' +
      '| 2 | Sequence | `sequenceDiagram` | API calls, interactions |\n' +
      '| 3 | Class | `classDiagram` | OOP design, data models |\n' +
      '| 4 | State | `stateDiagram-v2` | State machines, lifecycle |\n' +
      '| 5 | ER | `erDiagram` | Database schemas |\n' +
      '| 6 | Gantt | `gantt` | Project scheduling |\n' +
      '| 7 | Journey | `journey` | User experience mapping |\n' +
      '| 8 | Requirement | `requirementDiagram` | Specs traceability (SysML) |\n' +
      '| 9 | Quadrant | `quadrantChart` | Prioritization matrices |\n' +
      '| 10 | Mindmap | `mindmap` | Brainstorming, idea maps |\n' +
      '| 11 | Pie | `pie` | Proportions, breakdowns |\n' +
      '| 12 | Timeline | `timeline` | Chronological events |\n' +
      '| 13 | Sankey | `sankey-beta` | Flow quantities, budgets |\n' +
      '| 14 | XY Chart | `xychart-beta` | Bar/line charts |\n' +
      '| 15 | Git Graph | `gitGraph` | Branch/merge history |\n' +
      '| 16 | Block | `block-beta` | System block layouts |\n' +
      '| 17 | Architecture | `architecture-beta` | Cloud/infra diagrams |\n' +
      '| 18 | C4 | `C4Context` | Software architecture (C4) |\n\n' +
      '> [!NOTE]\n' +
      '> Types marked `-beta` are experimental and may evolve in future Mermaid versions.\n'
  },
];
