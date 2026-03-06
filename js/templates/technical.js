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
CREATE TABLE example (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  status      VARCHAR(50) DEFAULT 'active',
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);
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

{{Think: Write an introduction that establishes the context, states the problem, and outlines the approach. The topic is [your topic]. Include relevant background and why this investigation matters.}}

## Methodology

{{AI: Describe the methodology used. Include tools, frameworks, data sources, and evaluation criteria. Use bullet points for clarity.}}

## Findings

{{AI: Present the key findings in a structured format. Use a combination of prose, bullet points, and a summary table. Include 3-5 significant results.}}

## Analysis

{{Think: Provide a deep analysis of the findings. Compare with expected outcomes, identify patterns, discuss implications, and note any anomalies or limitations.}}

## Recommendations

{{AI: Based on the analysis, provide 4-5 actionable recommendations. Format as numbered list with bold titles and supporting explanations.}}

## Conclusion

{{AI: Write a conclusion that ties everything together. Restate the key findings, their significance, and next steps for future work.}}
`
  },
];
