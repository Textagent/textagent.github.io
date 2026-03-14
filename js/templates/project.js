// ============================================
// templates/project.js — Project Templates
// ============================================
window.__MDV_TEMPLATES_PROJECT = [
  {
    name: 'Meeting Notes',
    category: 'project',
    icon: 'bi-people',
    description: 'Structured meeting notes with attendees, agenda, decisions, and action items',
    variables: [
      { name: 'meetingTitle', value: 'Team Standup', desc: 'Meeting title or topic' },
      { name: 'facilitator', value: 'Your Name', desc: 'Meeting facilitator' },
      { name: 'location', value: 'Conference Room / Zoom', desc: 'Meeting location' },
    ],
    content: `# $(meetingTitle) — Meeting Notes

**Date:** $(date)
**Time:** 10:00 AM — 11:00 AM
**Location:** $(location)
**Facilitator:** $(facilitator)

## Attendees

- [ ] Person 1 — Role
- [ ] Person 2 — Role
- [ ] Person 3 — Role

---

## Agenda

1. Review of previous action items (5 min)
2. Topic A — [Owner] (15 min)
3. Topic B — [Owner] (15 min)
4. Topic C — [Owner] (10 min)
5. Open discussion (10 min)
6. Next steps & wrap-up (5 min)

---

## Discussion Notes

### Topic A
- Key point discussed
- Decisions made
- Open questions

### Topic B
- Key point discussed
- Decisions made

### Topic C
- Key point discussed
- Concerns raised

---

## Decisions Made

| # | Decision | Owner | Deadline |
|---|----------|-------|----------|
| 1 | Decision description | Person | Date |
| 2 | Decision description | Person | Date |

## Action Items

- [ ] **Person 1:** Action description — *Due: Date*
- [ ] **Person 2:** Action description — *Due: Date*
- [ ] **Person 3:** Action description — *Due: Date*

---

**Next Meeting:** [Date & Time]
**Facilitator:** $(facilitator)
`
  },
  {
    name: 'Project Proposal',
    category: 'project',
    icon: 'bi-lightbulb',
    description: 'Comprehensive project proposal with objectives, timeline, and budget',
    variables: [
      { name: 'projectName', value: 'Project Alpha', desc: 'Name of the project' },
      { name: 'authorName', value: 'Your Name', desc: 'Proposal author' },
      { name: 'sponsor', value: 'Sponsor Name', desc: 'Project sponsor' },
    ],
    content: `# Project Proposal: $(projectName)

**Prepared by:** $(authorName)
**Date:** $(date)
**Version:** 1.0

---

## Executive Summary

A brief overview of the project, its goals, and expected outcomes (2-3 sentences).

## Problem Statement

Describe the problem or opportunity this project addresses. Include relevant data or metrics.

## Objectives

1. **Primary Objective** — Description
2. **Secondary Objective** — Description
3. **Tertiary Objective** — Description

## Proposed Solution

Detailed description of the proposed solution and approach.

### Key Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Feature 1 | Description | High |
| Feature 2 | Description | Medium |
| Feature 3 | Description | Low |

## Timeline

\`\`\`mermaid
gantt
  title Project Timeline
  dateFormat  YYYY-MM-DD
  section Phase 1
  Research & Planning  :a1, 2024-01-01, 14d
  Design               :a2, after a1, 14d
  section Phase 2
  Development          :a3, after a2, 30d
  Testing              :a4, after a3, 14d
  section Phase 3
  Deployment           :a5, after a4, 7d
  Review               :a6, after a5, 7d
\`\`\`

## Budget Estimate

| Item | Cost | Notes |
|------|------|-------|
| Development | $X,XXX | Description |
| Infrastructure | $X,XXX | Description |
| Testing | $X,XXX | Description |
| **Total** | **$XX,XXX** | |

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Risk 1 | High | Medium | Mitigation strategy |
| Risk 2 | Medium | Low | Mitigation strategy |

## Success Metrics

- **Metric 1:** Target value
- **Metric 2:** Target value
- **Metric 3:** Target value

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Sponsor | $(sponsor) | | |
| Technical Lead | $(authorName) | | |
| Stakeholder | | | |
`
  },
  {
    name: 'Sprint Planning',
    category: 'project',
    icon: 'bi-kanban',
    description: 'Agile sprint planning document with user stories and task breakdown',
    variables: [
      { name: 'sprintNumber', value: '1', desc: 'Sprint number' },
      { name: 'sprintGoal', value: 'Deliver MVP features', desc: 'One-sentence sprint goal' },
      { name: 'startDate', value: '2026-03-10', desc: 'Sprint start date' },
      { name: 'endDate', value: '2026-03-24', desc: 'Sprint end date' },
    ],
    content: `# Sprint Planning — Sprint $(sprintNumber)

**Sprint Duration:** $(startDate) → $(endDate)
**Sprint Goal:** $(sprintGoal)
**Team Velocity:** [X] story points

---

## Sprint Backlog

### 🔴 High Priority

#### US-001: [User Story Title]
> As a [user type], I want [action] so that [benefit].

- **Points:** 5
- **Assignee:** [Name]
- Tasks:
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

#### US-002: [User Story Title]
> As a [user type], I want [action] so that [benefit].

- **Points:** 3
- **Assignee:** [Name]
- Tasks:
- [ ] Task 1
- [ ] Task 2

### 🟡 Medium Priority

#### US-003: [User Story Title]
> As a [user type], I want [action] so that [benefit].

- **Points:** 2
- **Assignee:** [Name]
- Tasks:
- [ ] Task 1
- [ ] Task 2

### 🟢 Low Priority

#### US-004: [User Story Title]
- **Points:** 1
- **Assignee:** [Name]
- Tasks:
- [ ] Task 1

---

## Capacity

| Team Member | Available Days | Capacity (pts) |
|-------------|---------------|----------------|
| Person 1 | 10 | 8 |
| Person 2 | 8 | 6 |
| Person 3 | 10 | 8 |
| **Total** | | **22** |

## Risks & Blockers

- ⚠️ Risk/blocker description — *Mitigation plan*

## Definition of Done

- [ ] Code reviewed and approved
- [ ] Unit tests passing (>80% coverage)
- [ ] Documentation updated
- [ ] QA verified
- [ ] Deployed to staging
`
  },
  {
    name: 'Product Launch (AI Fill)',
    category: 'project',
    icon: 'bi-robot',
    description: 'AI-fillable product launch doc — outline your product, let AI write the copy',
    variables: [
      { name: 'productName', value: 'My Product', desc: 'Product name' },
    ],
    content: `# $(productName) — Launch Document

**Launch Date:** $(date)
**Version:** 1.0

---

## Executive Summary

{{AI: Write a concise executive summary for a product launch. The product is [describe your product]. Cover what it does, who it's for, and why it matters.}}

## Key Features

{{AI: Create a features section with 4-5 key features. For each feature, include an icon emoji, a bold title, and a one-line description. Format as a markdown table with columns: Feature, Description, Benefit.}}

## Competitive Analysis

{{@AI:
  @think: yes
  @prompt: Compare this product to 3 competitors. Create a comparison table with features, pricing, and unique advantages. Highlight where our product wins.}}

## Pricing

{{AI: Create a pricing section with Free, Pro ($9/mo), and Enterprise tiers. Use a comparison table showing what's included in each tier. Make the Pro tier the recommended option.}}

## Launch Checklist

- [ ] Product demo video
- [ ] Landing page live
- [ ] Press release sent
- [ ] Social media posts scheduled
- [ ] Email campaign ready
- [ ] Support docs updated
`
  },
];
