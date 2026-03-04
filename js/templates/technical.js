// ============================================
// templates/technical.js — Technical Templates
// ============================================
window.__MDV_TEMPLATES_TECHNICAL = [
    {
      name: 'Bug Report',
      category: 'technical',
      icon: 'bi-bug',
      description: 'Detailed bug report with reproduction steps and environment info',
      content: `# Bug Report

**Title:** [Brief description of the bug]
**Severity:** 🔴 Critical / 🟠 Major / 🟡 Minor / 🟢 Trivial
**Reporter:** [Your Name]
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
      content: `# Technical Specification

**Feature:** [Feature Name]
**Author:** [Your Name]
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
      content: `# Code Review

**PR:** #[number] — [PR Title]
**Author:** @[username]
**Reviewer:** @[username]
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
];
