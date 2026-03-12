// ============================================
// templates/ai.js — AI-Powered Templates
// ============================================
window.__MDV_TEMPLATES_AI = [
    {
        name: 'AI Business Proposal',
        category: 'ai',
    displayTag: 'AI · Think',
        icon: 'bi-briefcase',
        description: 'Generate a persuasive business proposal — fill in client & project details, AI does the rest',
        variables: [
            { name: 'projectName', value: 'Project Alpha', desc: 'Project or service name' },
            { name: 'clientName', value: 'Acme Corp', desc: 'Client / target company' },
            { name: 'yourName', value: 'Your Name', desc: 'Your name or company' },
            { name: 'yourEmail', value: 'email@company.com', desc: 'Contact email' },
        ],
        content: `# Business Proposal — $(projectName)

**Prepared for:** $(clientName)
**Prepared by:** $(yourName)
**Date:** $(date)

---

## Executive Summary

{{AI: Write a compelling executive summary for this business proposal. The project is about [describe your project/service here]. Highlight the key value proposition, expected outcomes, and why the client should choose us. Keep it to 3-4 paragraphs.}}

---

## Problem Statement

{{Think: Analyze the core business problem that the client is facing. Consider market trends, competitive pressures, and operational inefficiencies. Present the problem in a way that creates urgency and sets up the solution.}}

---

## Proposed Solution

{{AI: Based on the problem statement above, describe the proposed solution in detail. Include the approach, key deliverables, and how each addresses the client's pain points. Use sub-sections for clarity.}}

---

## Scope of Work

{{AI: Generate a detailed scope of work table with the following columns: Phase, Deliverable, Description, Timeline. Include at least 4-5 phases covering discovery, design, implementation, testing, and launch.}}

---

## Timeline & Milestones

\`\`\`mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Discovery & Research    :a1, 2024-01-01, 14d
    section Phase 2
    Design & Planning       :a2, after a1, 21d
    section Phase 3
    Development             :a3, after a2, 42d
    section Phase 4
    Testing & QA            :a4, after a3, 14d
    section Phase 5
    Launch & Handover       :a5, after a4, 7d
\`\`\`

---

## Investment

{{AI: Create a professional pricing table with columns: Item, Description, Cost. Include line items for each phase of the project, plus any recurring costs. Add a total row at the bottom. Use realistic placeholder amounts.}}

---

## Why Choose Us

{{AI: Write 4-5 compelling reasons why the client should choose us for this project. Include relevant experience, unique methodology, team expertise, and any guarantees or support commitments.}}

---

## Next Steps

1. Review this proposal and provide feedback
2. Schedule a follow-up meeting to discuss details
3. Sign the Statement of Work (SOW)
4. Kick off the project!

---

**Contact:** $(yourName) · $(yourEmail)

> 💡 **How to use:** Edit the variable table at the top, click **⚡ Vars** to apply, then click **✨ Fill** to generate all AI sections.
`
    },
    {
        name: 'AI Research Paper',
        category: 'ai',
    displayTag: 'AI · Think',
        icon: 'bi-mortarboard',
        description: 'Academic research paper — outline your thesis, AI fills abstract, lit review, methodology & analysis',
        content: `# [Research Paper Title]

**Author(s):** [Your Name]
**Institution:** [University / Organization]
**Date:** $(date)
**Keywords:** [keyword1], [keyword2], [keyword3], [keyword4]

---

## Abstract

{{AI: Write a concise academic abstract (200-300 words) for a research paper about [describe your research topic here]. Include the research question, methodology, key findings, and implications. Use formal academic language.}}

---

## 1. Introduction

{{AI: Write the introduction section for this research paper. Provide background context on [your topic], state the research gap, articulate the research question, and preview the paper's structure. Include 3-4 paragraphs with proper academic tone.}}

---

## 2. Literature Review

{{Think: Conduct a thorough analysis of the existing literature on [your topic]. Identify 5-6 major themes or research streams. For each theme, discuss key findings from prior research, methodological approaches used, and gaps that remain. Organize chronologically or thematically.}}

---

## 3. Methodology

{{AI: Describe the research methodology in detail. Include:
- **Research Design** — qualitative, quantitative, or mixed methods
- **Data Collection** — surveys, interviews, experiments, secondary data
- **Sample** — population, sampling method, sample size
- **Analysis Approach** — statistical tests, coding framework, tools used
- **Limitations** — potential biases and constraints

Use formal academic language appropriate for a peer-reviewed journal.}}

---

## 4. Results

{{AI: Write a results section with placeholder findings. Include:
- A summary statistics table (use markdown table)
- Key findings organized by research question
- At least one comparison or correlation finding
- Descriptive statistics where appropriate

Present findings objectively without interpretation.}}

---

## 5. Discussion

{{Think: Analyze and interpret the research findings from the results section. Compare with existing literature from the literature review. Discuss:
1. How findings answer the research question
2. Alignment or divergence from prior studies
3. Theoretical implications
4. Practical implications
5. Unexpected findings and possible explanations}}

---

## 6. Conclusion

{{AI: Write a conclusion that summarizes the key contributions of this research, acknowledges limitations, and suggests 3-4 specific directions for future research. Keep it concise (2-3 paragraphs).}}

---

## References

{{AI: Generate 8-10 realistic APA-format references related to [your topic]. Include a mix of journal articles, conference papers, and books from the last 10 years.}}

---

> 💡 **How to use:** Fill in your topic in the bracketed placeholders, customize the AI prompts, then click **✨ Fill**.
`
    },
    {
        name: 'AI Product PRD',
        category: 'ai',
    displayTag: 'AI · Think',
        icon: 'bi-kanban',
        description: 'Product Requirements Document — define vision, AI generates user stories, specs & success metrics',
        content: `# Product Requirements Document (PRD)

**Product:** [Product Name]
**Author:** [Your Name]
**Date:** $(date)
**Status:** Draft
**Version:** 1.0

---

## 1. Overview

### Vision
[One-sentence description of what this product will achieve]

### Problem Statement
{{Think: Analyze the problem this product solves. Consider who is affected, how frequently the problem occurs, what current workarounds exist, and what happens if the problem is not solved. Be specific and data-driven.}}

---

## 2. Goals & Success Metrics

{{AI: Based on the product vision above, generate a table of goals and success metrics with these columns: Goal, Metric, Target, Measurement Method. Include 4-5 goals covering user adoption, engagement, business impact, and quality.}}

---

## 3. User Personas

{{AI: Create 3 distinct user personas for this product. For each persona include: Name, Role, Demographics, Goals, Pain Points, and a quote that captures their frustration. Present each persona as a separate sub-section.}}

---

## 4. User Stories

{{AI: Generate 8-10 user stories in the format "As a [persona], I want to [action] so that [benefit]." Organize them by priority (P0, P1, P2) in a table with columns: Priority, User Story, Acceptance Criteria.}}

---

## 5. Functional Requirements

{{AI: Based on the user stories above, create detailed functional requirements organized by feature area. For each requirement include an ID (FR-001, FR-002, etc.), description, priority, and dependencies. Use a markdown table.}}

---

## 6. Non-Functional Requirements

{{AI: List non-functional requirements covering: Performance (response times, throughput), Scalability, Security, Accessibility, Reliability (uptime SLA), and Compatibility. Format as a table with columns: Category, Requirement, Target.}}

---

## 7. User Flow

\`\`\`mermaid
flowchart TD
    A[User Opens App] --> B{Authenticated?}
    B -->|No| C[Login / Sign Up]
    C --> D[Dashboard]
    B -->|Yes| D
    D --> E[Core Feature]
    E --> F{Task Complete?}
    F -->|Yes| G[Success State]
    F -->|No| H[Error Handling]
    H --> E
\`\`\`

---

## 8. Release Plan

{{AI: Create a phased release plan with 3 phases: MVP, V1.0, and V2.0. For each phase, list included features, target date, and key milestones. Use a table format.}}

---

## 9. Open Questions

- [ ] [Question 1 that needs stakeholder input]
- [ ] [Question 2 about scope or priority]
- [ ] [Question 3 about technical feasibility]

---

> 💡 **How to use:** Fill in your product details, then click **✨ Fill** to generate the complete PRD.
`
    },
    {
        name: 'AI Marketing Copy',
        category: 'ai',
    displayTag: 'AI',
        icon: 'bi-megaphone',
        description: 'Landing pages, ad copy & email campaigns — describe brand/audience, AI writes compelling copy',
        content: `# Marketing Copy — [Product / Campaign Name]

**Brand:** [Your Brand Name]
**Target Audience:** [Describe your ideal customer]
**Tone:** [Professional / Casual / Bold / Playful]
**Date:** $(date)

---

## 🎯 Hero Section (Landing Page)

{{AI: Write a compelling landing page hero section for [your product/service]. Include:
- A bold, attention-grabbing headline (8-12 words)
- A supporting sub-headline (15-20 words)
- 3 bullet points highlighting key benefits
- A strong call-to-action button text

Target audience is [describe audience]. Tone should be [your tone].}}

---

## ✨ Feature Highlights

{{AI: Write 4 feature highlight blocks for [your product]. For each feature include:
- An emoji icon
- A short, catchy feature name (2-4 words)
- A benefit-focused description (2-3 sentences)
- Why it matters to the user

Make the copy benefits-focused, not feature-focused. Use persuasive language.}}

---

## 💬 Social Proof Section

{{AI: Generate 3 realistic customer testimonials for [your product/service]. Each should include:
- A customer quote (2-3 sentences)
- Customer name and title/company
- A specific result or metric they achieved

Make them diverse and authentic-sounding.}}

---

## 📧 Email Campaign: Welcome Sequence

### Email 1: Welcome
{{AI: Write a welcome email (150-200 words) for new subscribers. Include a warm greeting, what they can expect, one quick win they can get immediately, and a CTA. Subject line included.}}

### Email 2: Value Delivery
{{AI: Write a follow-up email (150-200 words) that delivers value — a tip, case study, or tutorial related to [your product]. Include an engaging subject line and soft CTA.}}

### Email 3: Conversion
{{AI: Write a conversion-focused email (150-200 words) with a limited-time offer or compelling reason to buy/sign up now. Include urgency, social proof, and a strong CTA. Include subject line.}}

---

## 📱 Social Media Posts

{{AI: Generate 5 social media posts for [your product] across different platforms:
1. **Twitter/X** — Short, punchy (under 280 chars)
2. **LinkedIn** — Professional, thought-leadership style
3. **Instagram** — Visual-friendly caption with hashtags
4. **Facebook** — Conversational, community-focused
5. **TikTok/Short-form** — Hook + value + CTA script

Include relevant emojis and hashtags.}}

---

## 🎨 Ad Copy Variants

{{AI: Write 3 Google/Facebook ad copy variants for [your product]. Each should have:
- Headline (30 chars max)
- Description (90 chars max)
- CTA
- Target keyword

Vary the angle: one benefit-focused, one problem-focused, one social-proof-focused.}}

---

> 💡 **How to use:** Replace the bracketed details with your product info, then click **✨ Fill** to generate all marketing copy.
`
    },
    {
        name: 'AI Lesson Plan',
        category: 'ai',
    displayTag: 'AI · Think',
        icon: 'bi-journal-bookmark',
        description: 'Teaching & training — specify subject/grade level, AI generates objectives, activities & assessments',
        content: `# Lesson Plan — [Topic Title]

**Subject:** [Subject Area]
**Grade/Level:** [Grade Level or Audience]
**Duration:** [e.g., 50 minutes / 2 hours]
**Instructor:** [Your Name]
**Date:** $(date)

---

## Learning Objectives

{{AI: Write 4-5 specific, measurable learning objectives for a lesson about [your topic] for [grade/level] students. Use Bloom's Taxonomy action verbs (analyze, evaluate, create, etc.). Format as a numbered list starting with "Students will be able to..."}}

---

## Standards Alignment

{{AI: List 3-4 relevant educational standards (Common Core, NGSS, or relevant standards for your subject area) that this lesson addresses. Format as a table with columns: Standard Code, Description, How Addressed.}}

---

## Materials Needed

{{AI: Generate a comprehensive materials list for teaching [your topic]. Include:
- Physical materials (handouts, supplies, equipment)
- Digital resources (links, software, multimedia)
- Preparation notes (what to set up before class)

Format as a categorized checklist.}}

---

## Lesson Structure

### 🔔 Warm-Up / Hook (10 min)

{{AI: Design an engaging warm-up activity for [your topic] that activates prior knowledge and hooks student interest. Include:
- An attention-grabbing opening question or demonstration
- A brief think-pair-share activity
- Transition to the main lesson}}

### 📖 Direct Instruction (15 min)

{{AI: Outline the direct instruction portion. Include:
- Key concepts to present (3-4 main ideas)
- Explanation strategies (analogies, examples, visuals)
- Check-for-understanding questions to ask during instruction
- Notes on differentiation for diverse learners}}

### 🛠️ Guided Practice (15 min)

{{AI: Design a guided practice activity where students apply [your topic] with teacher support. Include:
- Step-by-step activity instructions
- Example problems or scenarios to work through together
- Common misconceptions to address
- Support strategies for struggling students}}

### 🚀 Independent Practice (15 min)

{{AI: Create an independent practice activity or worksheet for [your topic]. Include:
- 5-6 practice problems or tasks (increasing difficulty)
- A challenge/extension problem for advanced students
- Clear success criteria so students can self-assess}}

### 🎯 Closure (5 min)

{{AI: Design a closure activity that reinforces learning. Include:
- An exit ticket question (1-2 questions)
- A brief recap strategy
- Preview of the next lesson}}

---

## Assessment

{{AI: Create a rubric for assessing student understanding of [your topic]. Use a table with columns: Criteria, Excellent (4), Proficient (3), Developing (2), Beginning (1). Include 4 criteria covering knowledge, application, communication, and effort.}}

---

## Differentiation

{{Think: Analyze how to differentiate this lesson for three groups:
1. **Advanced learners** — extension activities and higher-order challenges
2. **On-level learners** — standard expectations with support scaffolds
3. **Struggling learners** — modified tasks, visual supports, peer tutoring

Provide specific, actionable strategies for each group.}}

---

## Homework / Follow-Up

{{AI: Design a meaningful homework assignment related to [your topic] that reinforces the lesson objectives. Include clear instructions, expected time commitment (15-20 min), and how it connects to the next lesson.}}

---

> 💡 **How to use:** Fill in your subject, topic, and grade level, then click **✨ Fill** to generate the complete lesson plan.
`
    },
    {
        name: 'AI Technical RFC',
        category: 'ai',
    displayTag: 'AI · Think',
        icon: 'bi-gear-wide-connected',
        description: 'Engineering design doc / RFC — describe the problem, AI generates alternatives, architecture & plan',
        content: `# RFC: [Feature / System Name]

**Author:** [Your Name]
**Status:** Draft
**Created:** $(date)
**Reviewers:** [List reviewers]

---

## Summary

{{AI: Write a concise summary (3-4 sentences) of this RFC. The technical change is about [describe your proposed change/feature here]. Include what is being proposed, why, and the expected impact.}}

---

## Motivation

{{Think: Analyze the motivation behind this technical change. Consider:
1. What problem does this solve? Be specific with metrics or user pain points.
2. Why now? What has changed that makes this important?
3. What happens if we don't do this?
4. How does this align with the team/company's technical strategy?

Present a clear, compelling case for the change.}}

---

## Detailed Design

### Architecture

{{AI: Based on the summary above, propose a detailed technical architecture. Include:
- System components and their responsibilities
- Data flow between components
- API contracts or interface definitions
- Database schema changes (if applicable)

Use code blocks for any API or schema definitions.}}

\`\`\`mermaid
flowchart TB
    subgraph Client
        A[Frontend App]
    end
    subgraph Backend
        B[API Gateway]
        C[Service A]
        D[Service B]
        E[Database]
    end
    A --> B
    B --> C
    B --> D
    C --> E
    D --> E
\`\`\`

### API Changes

{{AI: Define the API changes needed for this feature. For each endpoint include:
- HTTP method and path
- Request body schema (JSON)
- Response body schema (JSON)
- Error codes and their meaning

Format using code blocks with JSON examples.}}

---

## Alternatives Considered

{{Think: Evaluate 3 alternative approaches to solving this problem. For each alternative:
1. Describe the approach
2. List pros and cons
3. Explain why it was not chosen

Present as a comparison table, then provide a paragraph justifying the chosen approach.}}

---

## Migration Strategy

{{AI: Describe the migration strategy for rolling out this change. Include:
- **Phase 1:** Data migration or schema changes
- **Phase 2:** Backend deployment (feature flags, canary rollout)
- **Phase 3:** Frontend rollout
- **Rollback plan:** How to revert if issues arise
- **Monitoring:** Key metrics to watch during rollout}}

---

## Security Considerations

{{AI: Analyze the security implications of this change. Cover:
- Authentication / Authorization changes
- Data privacy implications (PII handling)
- Input validation requirements
- Potential attack vectors and mitigations
Format as a table with columns: Concern, Risk Level, Mitigation.}}

---

## Performance Impact

{{AI: Assess the performance implications. Include:
- Expected latency changes (with estimates)
- Throughput / scaling considerations
- Resource utilization (CPU, memory, storage)
- Load testing plan
Format as a table with before/after estimates.}}

---

## Open Questions

- [ ] [Technical question that needs investigation]
- [ ] [Dependency question for another team]
- [ ] [Scalability concern to validate]

---

## Timeline

| Phase | Task | Duration | Owner |
|-------|------|----------|-------|
| 1 | Design review & approval | 1 week | [Name] |
| 2 | Core implementation | 2 weeks | [Name] |
| 3 | Testing & QA | 1 week | [Name] |
| 4 | Staged rollout | 1 week | [Name] |

---

> 💡 **How to use:** Describe your technical change in the Summary section, then click **✨ Fill** to generate the complete RFC.
`
    },
    {
        name: 'AI Cover Letter',
        category: 'ai',
    displayTag: 'AI',
        icon: 'bi-envelope-paper-heart',
        description: 'Job applications — paste the job description and your background, AI writes a personalized letter',
        variables: [
            { name: 'applicantName', value: 'Your Full Name', desc: 'Your name' },
            { name: 'position', value: 'Job Title', desc: 'Position applying for' },
            { name: 'targetCompany', value: 'Company Name', desc: 'Company you\'re applying to' },
        ],
        content: `# Cover Letter

**Applicant:** $(applicantName)
**Position:** $(position)
**Company:** $(targetCompany)
**Date:** $(date)

---

## Your Background (fill this in for the AI)

- **Current Role:** [Your current title & company]
- **Years of Experience:** [X years]
- **Key Skills:** [skill1, skill2, skill3, skill4]
- **Biggest Achievement:** [One-line description of your top accomplishment]
- **Why This Company:** [Why you want to work here specifically]

## Job Description (paste here)

> [Paste the full job description here — the AI will use this to tailor the cover letter]

---

## Generated Cover Letter

{{AI: Write a professional, compelling cover letter for the position described above. The applicant's background is listed in the "Your Background" section. The job description is quoted above.

Structure:
1. **Opening paragraph** — Hook the reader, mention the specific role and company by name, show genuine enthusiasm
2. **Body paragraph 1** — Highlight the most relevant experience and connect it to a key requirement from the job description
3. **Body paragraph 2** — Showcase a specific achievement with measurable results that demonstrates the skills they're looking for
4. **Body paragraph 3** — Show cultural fit and explain why this specific company excites you
5. **Closing paragraph** — Confident call-to-action, express eagerness for next steps

Tone: Professional but personable. Avoid clichés like "I believe I would be a great fit." Use specific, concrete language. Keep it under 400 words.}}

---

## Key Talking Points for Interview

{{AI: Based on the job description and cover letter above, generate 5 talking points the applicant should prepare for the interview. For each, include:
- The likely interview question
- A suggested STAR-method answer outline (Situation, Task, Action, Result)

Format as numbered sections.}}

---

> 💡 **How to use:** Fill in your background, paste the job description, then click **✨ Fill**. Customize the output to add your personal voice.
`
    },
    {
        name: 'AI SWOT Analysis',
        category: 'ai',
    displayTag: 'AI · Think',
        icon: 'bi-grid-3x3-gap',
        description: 'Strategic planning — describe your company/product, AI generates comprehensive SWOT analysis',
        variables: [
            { name: 'companyName', value: 'Company Name', desc: 'Company or product to analyze' },
            { name: 'authorName', value: 'Your Name', desc: 'Analysis author' },
        ],
        content: `# SWOT Analysis — $(companyName)

**Prepared by:** $(authorName)
**Date:** $(date)
**Industry:** [Your Industry]

---

## Company / Product Overview

> [Describe your company, product, or project in 2-3 sentences. Include what you do, your target market, and your current position in the market.]

---

## SWOT Matrix

{{AI: Based on the company/product overview above, generate a comprehensive SWOT analysis. Create a 2x2 markdown table with:
- **Strengths** (top-left) — 5 internal advantages
- **Weaknesses** (top-right) — 5 internal challenges
- **Opportunities** (bottom-left) — 5 external possibilities
- **Threats** (bottom-right) — 5 external risks

Each item should be specific and actionable, not generic.}}

---

## Detailed Analysis

### 💪 Strengths

{{AI: Expand on the top 3 strengths identified above. For each, explain:
- Why it's a competitive advantage
- How it can be leveraged further
- Evidence or metrics that support it

Use sub-sections for each strength.}}

### ⚠️ Weaknesses

{{Think: Critically analyze the top 3 weaknesses. For each, consider:
- Root cause analysis — why does this weakness exist?
- Impact assessment — how much does it affect performance?
- Mitigation strategies — specific actions to address it
- Timeline — short-term vs. long-term fixes

Be honest and specific. Vague weaknesses lead to vague solutions.}}

### 🚀 Opportunities

{{AI: Expand on the top 3 opportunities. For each, provide:
- Market data or trends supporting the opportunity
- Required investment or resources to capture it
- Expected ROI or impact
- Risk of not acting on it

Prioritize by potential impact.}}

### 🛡️ Threats

{{Think: Analyze the top 3 threats in depth. For each, evaluate:
- Probability of occurring (High / Medium / Low)
- Potential impact severity (High / Medium / Low)
- Early warning signs to monitor
- Defensive strategies and contingency plans

Present a risk matrix table for all threats.}}

---

## Strategic Recommendations

{{AI: Based on the complete SWOT analysis above, generate 5 strategic recommendations. For each recommendation:
1. State the strategy clearly
2. Link it to specific SWOT findings (e.g., "Leverage Strength #2 to capture Opportunity #1")
3. Define success metrics
4. Estimate timeline and resources needed

Organize from highest to lowest priority.}}

---

## Action Plan

{{AI: Create an action plan table with columns: Priority, Action Item, SWOT Link, Owner, Timeline, Status. Include 8-10 specific actions derived from the strategic recommendations above.}}

---

> 💡 **How to use:** Describe your company/product in the overview section, then click **✨ Fill** to generate the complete analysis.
`
    },
    {
        name: 'AI Content Calendar',
        category: 'ai',
    displayTag: 'AI',
        icon: 'bi-calendar3',
        description: 'Social media & content marketing — describe your brand, AI generates a monthly content calendar',
        content: `# Content Calendar — [Brand / Project Name]

**Month:** [Target Month, e.g., April 2024]
**Platforms:** [Instagram, Twitter/X, LinkedIn, Blog, etc.]
**Brand Voice:** [Professional / Casual / Bold / Educational]
**Industry:** [Your Industry]
**Date Created:** $(date)

---

## Brand Context

> [Describe your brand in 2-3 sentences: what you do, who your audience is, your key differentiators, and any upcoming launches or events to promote.]

---

## Content Pillars

{{AI: Based on the brand context above, define 4-5 content pillars — recurring themes that all content should fall under. For each pillar, include:
- **Pillar Name** (2-3 words)
- **Description** (1 sentence)
- **Content Ratio** (% of total content)
- **Example Topics** (3 bullet points)

Format as a table.}}

---

## Weekly Content Calendar

### Week 1

{{AI: Generate a detailed content calendar for Week 1. Create a table with columns: Day, Platform, Content Type, Topic/Title, Caption/Hook (first line), Pillar, Hashtags. Include 5-7 posts spread across the specified platforms. Make each post specific and ready-to-use.}}

### Week 2

{{AI: Generate Week 2 content calendar in the same table format. Vary the content types (carousel, video, story, poll, article, infographic). Ensure a good mix of content pillars and platforms.}}

### Week 3

{{AI: Generate Week 3 content calendar. Include at least one engagement-focused post (poll, Q&A, challenge), one educational post, and one promotional post. Same table format.}}

### Week 4

{{AI: Generate Week 4 content calendar. Include a month-end wrap-up post, a forward-looking teaser for next month, and strong CTAs. Same table format.}}

---

## Monthly Blog / Long-Form Content

{{AI: Suggest 4 blog post or long-form content ideas for the month. For each include:
- **Title** (SEO-optimized)
- **Target Keyword**
- **Content Brief** (3-4 sentences describing the angle)
- **Pillar** it aligns with
- **Estimated Word Count**
- **CTA** at the end of the article

Format as separate sections.}}

---

## Key Dates & Events

{{AI: List 5-8 relevant dates for [target month] that could inspire content. Include:
- Industry-specific events or awareness days
- Holidays and observances
- Trending topics / seasonal themes
- Company milestones (placeholder)

Format as a table with columns: Date, Event, Content Opportunity, Platform.}}

---

## Performance Tracking

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | Monthly Total |
|--------|--------|--------|--------|--------|---------------|
| Posts Published | — | — | — | — | — |
| Total Reach | — | — | — | — | — |
| Engagement Rate | — | — | — | — | — |
| Link Clicks | — | — | — | — | — |
| New Followers | — | — | — | — | — |
| Top Performing Post | — | — | — | — | — |

---

> 💡 **How to use:** Fill in your brand details and target month, then click **✨ Fill** to generate the complete content calendar.
`
    },
    {
        name: 'AI Stock Research Report',
        category: 'ai',
    displayTag: 'AI · Think',
        icon: 'bi-graph-up-arrow',
        description: 'Equity research — enter a company name/ticker, AI generates a full stock analysis report',
        content: `# Stock Research Report — [Company Name] ([TICKER])

**Analyst:** [Your Name]
**Date:** $(date)
**Sector:** [e.g., Technology / Healthcare / Finance]
**Exchange:** [NYSE / NASDAQ / BSE / NSE]

---

## Company Overview

{{AI: Write a comprehensive company overview for [Company Name] (ticker: [TICKER]). Include:
- What the company does (core business model)
- Key products/services and revenue streams
- Market capitalization and current stock price range
- Founding year, headquarters, and CEO
- Number of employees and global presence

Keep it factual and concise (3-4 paragraphs).}}

---

## Investment Summary

{{AI: Provide an investment summary for [Company Name] with:
- **Rating:** Buy / Hold / Sell (with justification)
- **Target Price:** Estimated 12-month target
- **Current Price:** [Enter current price]
- **Upside/Downside:** Percentage potential

Write 2-3 sentences summarizing the bull case and the key risk.}}

---

## Financial Highlights

{{AI: Generate a financial highlights table for [Company Name] with the following structure:

| Metric | FY 2022 | FY 2023 | FY 2024 (Est.) | YoY Growth |
|--------|---------|---------|----------------|------------|

Include these rows: Revenue, Net Income, EPS, P/E Ratio, Gross Margin, Operating Margin, Free Cash Flow, Debt-to-Equity, ROE, Dividend Yield.

Use realistic placeholder numbers appropriate for a company in the [sector] sector.}}

---

## Revenue Breakdown

{{AI: Analyze [Company Name]'s revenue breakdown:
1. **By Segment** — List each business segment with estimated revenue contribution (%)
2. **By Geography** — Revenue split by region (Americas, EMEA, APAC, etc.)
3. **Growth Drivers** — Top 3 factors driving revenue growth

Present segment data as a markdown table and include a brief analysis paragraph.}}

---

## Competitive Landscape

{{AI: Create a competitive analysis for [Company Name]. Include:
- A comparison table with 4-5 key competitors
- Columns: Company, Market Cap, Revenue, P/E Ratio, Margin, Key Strength
- Market share analysis (estimated)
- Competitive moat assessment (brand, technology, network effects, cost advantages, switching costs)}}

---

## SWOT Analysis

{{Think: Perform a detailed SWOT analysis for [Company Name] as a stock investment:

**Strengths** — What gives this company a durable competitive advantage?
**Weaknesses** — What internal challenges could impact future performance?
**Opportunities** — What market trends, expansions, or catalysts could drive growth?
**Threats** — What external risks (regulation, competition, macro) could hurt the stock?

Be specific to this company and sector, not generic. Include at least 4 points per quadrant.}}

---

## Technical Analysis

{{AI: Provide a brief technical analysis for [TICKER] stock:
- **Trend:** Current trend direction (uptrend / downtrend / sideways)
- **Support Levels:** Key price support zones
- **Resistance Levels:** Key price resistance zones
- **Moving Averages:** 50-day and 200-day MA status
- **RSI:** Overbought / Oversold assessment
- **Volume:** Recent volume trends

Present as a table.}}

---

## Risk Factors

{{AI: Identify and analyze 5-6 key risk factors for investing in [Company Name]. For each risk:
- Describe the risk
- Assess probability (High / Medium / Low)
- Assess potential impact (High / Medium / Low)
- Note any mitigation

Format as a table with columns: Risk Factor, Description, Probability, Impact.}}

---

## Analyst Verdict

{{Think: Synthesize all the analysis above into a final investment verdict for [Company Name]. Address:
1. Is the stock fairly valued, overvalued, or undervalued?
2. What is the key catalyst that could move the stock?
3. What would change your thesis (bull case killer / bear case killer)?
4. Recommended position sizing (aggressive / moderate / small)
5. Time horizon (short-term trade vs. long-term hold)

Be balanced and objective.}}

---

> 💡 **How to use:** Replace [Company Name] and [TICKER] with your target stock, then click **✨ Fill** to generate the full research report.
`
    },
    {
        name: 'AI Financial Statement Analysis',
        category: 'ai',
    displayTag: 'AI · Think',
        icon: 'bi-file-earmark-spreadsheet',
        description: 'Deep-dive into financials — enter company name, AI analyzes income statement, balance sheet & cash flow',
        content: `# Financial Statement Analysis — [Company Name]

**Prepared by:** [Your Name]
**Date:** $(date)
**Period:** [e.g., FY 2024 / Q3 2024]
**Source:** [Annual Report / 10-K / Quarterly Filing]

---

## Executive Summary

{{AI: Write an executive summary of the financial health of [Company Name]. Analyze profitability, liquidity, solvency, and efficiency in 3-4 paragraphs. Highlight the most important finding and its implication for investors.}}

---

## Income Statement Analysis

{{AI: Analyze [Company Name]'s income statement. Generate a table with line items:

| Line Item | Current Period | Prior Period | Change ($) | Change (%) |
|-----------|---------------|-------------|------------|------------|

Include: Revenue, COGS, Gross Profit, R&D, SG&A, Operating Income, Interest Expense, Net Income, EPS (Basic), EPS (Diluted).

Use realistic placeholder figures for a company in [sector]. Follow with 3-4 key observations.}}

---

## Balance Sheet Analysis

{{AI: Analyze [Company Name]'s balance sheet. Create two tables:

**Assets:**
| Item | Current Period | Prior Period |
Include: Cash & Equivalents, Short-term Investments, Accounts Receivable, Inventory, Total Current Assets, PP&E, Goodwill, Intangibles, Total Assets.

**Liabilities & Equity:**
| Item | Current Period | Prior Period |
Include: Accounts Payable, Short-term Debt, Total Current Liabilities, Long-term Debt, Total Liabilities, Retained Earnings, Total Stockholders' Equity.

Follow with analysis of working capital, asset composition, and capital structure.}}

---

## Cash Flow Analysis

{{AI: Analyze [Company Name]'s cash flow statement. Create a table:

| Category | Amount | Prior Period | Trend |
|----------|--------|-------------|-------|

Include key items under: Operating Activities (net income, D&A, working capital changes), Investing Activities (capex, acquisitions), Financing Activities (debt, buybacks, dividends).

Calculate Free Cash Flow and FCF yield. Provide analysis of cash generation quality.}}

---

## Key Financial Ratios

{{AI: Calculate and present key financial ratios for [Company Name] in a comprehensive table:

| Category | Ratio | Value | Industry Avg | Assessment |
|----------|-------|-------|-------------|------------|

Include ratios across these categories:
- **Profitability:** Gross Margin, Operating Margin, Net Margin, ROE, ROA, ROIC
- **Liquidity:** Current Ratio, Quick Ratio, Cash Ratio
- **Solvency:** Debt-to-Equity, Interest Coverage, Debt-to-EBITDA
- **Efficiency:** Asset Turnover, Inventory Turnover, Days Sales Outstanding
- **Valuation:** P/E, P/B, P/S, EV/EBITDA, PEG Ratio

Use realistic values and provide a brief assessment for each.}}

---

## Trend Analysis

{{Think: Analyze the 3-5 year financial trends for [Company Name]:
1. Revenue growth trajectory — accelerating or decelerating?
2. Margin expansion or compression — what's driving it?
3. Cash flow quality — is FCF growing in line with earnings?
4. Balance sheet health — is leverage increasing?
5. Capital allocation — how is management deploying capital (R&D, buybacks, dividends, M&A)?

Identify the most important trend and its implication for the company's future.}}

---

## Red Flags & Concerns

{{AI: Identify any financial red flags or concerns in [Company Name]'s statements:
- Aggressive revenue recognition
- Growing receivables vs. revenue
- Declining cash conversion
- Rising debt levels
- Off-balance sheet items
- Related-party transactions

Format as a checklist with status (⚠️ Concern / ✅ Healthy / 🔍 Monitor).}}

---

## Conclusion & Outlook

{{AI: Summarize the financial analysis with:
- Overall financial health grade (A to F)
- Top 3 financial strengths
- Top 3 areas of concern
- 12-month financial outlook
- Key metrics to monitor going forward}}

---

> 💡 **How to use:** Enter the company name and filing period, then click **✨ Fill** for a complete financial deep-dive.
`
    },
    {
        name: 'AI Investment Thesis',
        category: 'ai',
    displayTag: 'AI · Think',
        icon: 'bi-piggy-bank',
        description: 'Build a bull/bear case — enter a stock, AI generates a structured investment thesis with catalysts & risks',
        content: `# Investment Thesis — [Company Name] ([TICKER])

**Author:** [Your Name]
**Date:** $(date)
**Current Price:** $[XXX]
**Position:** [Long / Short / Watch]

---

## Thesis Statement

{{AI: Write a clear, one-paragraph investment thesis for [Company Name]. State whether this is a Buy, Sell, or Hold recommendation. Include the core reasoning in 3-4 sentences — what makes this an attractive (or unattractive) investment at the current valuation. Be specific and conviction-driven.}}

---

## The Bull Case 🐂

{{AI: Present the bull case for [Company Name] with 5 compelling arguments. For each argument:
- **Argument title** (bold, one line)
- **Evidence** (2-3 sentences with data points or market trends)
- **Impact** (what this means for the stock price)

Include arguments around: market opportunity, competitive advantages, growth catalysts, management quality, and valuation attractiveness.}}

---

## The Bear Case 🐻

{{Think: Present the bear case for [Company Name] with 5 counter-arguments. Be genuinely critical — challenge every bull case assumption:
- What could go wrong with the growth story?
- What are the competitive threats that bulls are underestimating?
- Is the valuation actually justified?
- What macro or regulatory risks exist?
- What does the bear scenario look like for earnings?

For each argument, quantify the potential downside impact.}}

---

## Catalysts & Timeline

{{AI: Identify 5-6 upcoming catalysts that could move [Company Name]'s stock price. Create a table:

| Catalyst | Expected Date | Direction | Potential Impact |
|----------|--------------|-----------|-----------------|

Include: earnings reports, product launches, regulatory decisions, M&A potential, industry events, and macro factors. Estimate the potential stock price impact for each.}}

---

## Valuation Analysis

{{AI: Perform a multi-method valuation for [Company Name]:

### 1. Comparable Company Analysis
Create a table comparing [Company Name] to 4-5 peers on: P/E, EV/EBITDA, P/S, PEG, and P/FCF ratios. Note whether [Company Name] trades at a premium or discount and why.

### 2. DCF Valuation Summary
Provide a simplified DCF with key assumptions:
- Revenue Growth Rate: X%
- Terminal Growth Rate: X%
- WACC: X%
- Implied fair value per share: $XXX

### 3. Price Target Scenarios
| Scenario | Probability | Price Target | Upside/Downside |
|----------|------------|-------------|-----------------|
| Bull | X% | $XXX | +X% |
| Base | X% | $XXX | +X% |
| Bear | X% | $XXX | -X% |

Probability-weighted target: $XXX}}

---

## Key Metrics to Track

{{AI: List 8-10 key performance indicators (KPIs) to monitor for this investment thesis. For each:
- Metric name
- Current value
- Threshold that would invalidate the thesis (bull case killer)
- Direction that confirms the thesis

Format as a table with columns: KPI, Current, Bull Signal, Bear Signal.}}

---

## Position Sizing & Risk Management

{{AI: Recommend position sizing and risk management for this investment:
- **Suggested Allocation:** X% of portfolio (justify)
- **Entry Strategy:** Dollar-cost average / Lump sum / Scale in on dips
- **Stop-Loss:** Price level and rationale
- **Profit Target:** Price level(s) for taking profits
- **Time Horizon:** Short-term (< 1 year) / Medium (1-3 years) / Long-term (3+ years)
- **Thesis Review Date:** When to re-evaluate}}

---

## Bottom Line

{{Think: In 3-4 sentences, state your final verdict. Would you put your own money into this stock today? At what price would you become more interested? What's the single most important factor to watch? Be direct and honest.}}

---

> 💡 **How to use:** Enter the company name and ticker, then click **✨ Fill** to generate a structured investment thesis.
`
    },
    {
        name: 'AI Portfolio Review',
        category: 'ai',
    displayTag: 'AI · Think',
        icon: 'bi-pie-chart',
        description: 'Portfolio analysis — list your holdings, AI generates allocation analysis, risk assessment & rebalancing plan',
        content: `# Portfolio Review & Analysis

**Investor:** [Your Name]
**Date:** $(date)
**Portfolio Value:** $[Total Value]
**Objective:** [Growth / Income / Balanced / Preservation]
**Risk Tolerance:** [Aggressive / Moderate / Conservative]

---

## Current Holdings

> **Instructions:** Fill in your portfolio below, then click **✨ Fill** to generate the full analysis.

| # | Ticker | Company | Shares | Avg Cost | Current Price | Value | Weight |
|---|--------|---------|--------|----------|--------------|-------|--------|
| 1 | [TICK] | [Name] | [X] | $[XX] | $[XX] | $[XX] | [X]% |
| 2 | [TICK] | [Name] | [X] | $[XX] | $[XX] | $[XX] | [X]% |
| 3 | [TICK] | [Name] | [X] | $[XX] | $[XX] | $[XX] | [X]% |
| 4 | [TICK] | [Name] | [X] | $[XX] | $[XX] | $[XX] | [X]% |
| 5 | [TICK] | [Name] | [X] | $[XX] | $[XX] | $[XX] | [X]% |
| 6 | [TICK] | [Name] | [X] | $[XX] | $[XX] | $[XX] | [X]% |
| — | **Cash** | — | — | — | — | $[XX] | [X]% |
| | **TOTAL** | | | | | **$[XX]** | **100%** |

---

## Portfolio Allocation Analysis

{{AI: Based on the holdings above, analyze the portfolio allocation:

### By Sector
Create a table showing allocation by sector (Technology, Healthcare, Finance, Consumer, Energy, etc.) with weight percentage and whether it's overweight/underweight vs. S&P 500.

### By Asset Class
Break down by: Large Cap, Mid Cap, Small Cap, International, Bonds, Cash, Other.

### By Geography
Estimate geographic revenue exposure: US, Europe, Asia, Emerging Markets.

Highlight any concentration risks (single stock > 20%, single sector > 40%).}}

---

## Performance Summary

{{AI: Generate a performance analysis table for the portfolio:

| Metric | Portfolio | S&P 500 | Difference |
|--------|-----------|---------|------------|

Include: YTD Return, 1-Year Return, Total Gain/Loss ($), Total Gain/Loss (%), Best Performer, Worst Performer, Win Rate (% of positions in profit).

Add a brief paragraph on performance attribution — what drove returns and what detracted.}}

---

## Risk Assessment

{{Think: Analyze the portfolio's risk profile. Evaluate:

1. **Concentration Risk** — Are any positions too large? Any sector overexposure?
2. **Correlation Risk** — Do multiple holdings tend to move together?
3. **Valuation Risk** — Are any holdings trading at elevated multiples?
4. **Dividend Reliability** — For income positions, is the dividend sustainable?
5. **Macro Sensitivity** — How would the portfolio perform in: recession, rising rates, inflation, market crash?
6. **Liquidity Risk** — Any small-cap or thinly-traded positions?

Rate overall portfolio risk on a scale of 1-10 and explain.}}

---

## Individual Position Review

{{AI: For each holding in the portfolio, provide a brief review (3-4 lines each):
- Current thesis: Is the original buy reason still valid?
- Technical status: Near support, resistance, or at a crossroads?
- Recommendation: Hold / Add / Trim / Sell
- Key upcoming catalyst or risk

Format as a table with columns: Ticker, Status, Action, Rationale, Next Catalyst.}}

---

## Rebalancing Recommendations

{{AI: Based on the analysis above, recommend specific rebalancing actions:

| Action | Ticker | Current Weight | Target Weight | Change | Rationale |
|--------|--------|---------------|--------------|--------|-----------|

Include:
- Positions to trim (overweight or thesis deteriorating)
- Positions to add (underweight or strong momentum)
- New positions to consider (with brief rationale)
- Cash target allocation

Factor in the investor's stated objective and risk tolerance.}}

---

## Watchlist: Potential Additions

{{AI: Suggest 5 stocks to add to the investor's watchlist based on their portfolio style and gaps in allocation. For each:
- **Ticker & Name**
- **Sector** & why it complements the portfolio
- **Entry Price** — ideal buy zone
- **Thesis** in one sentence

Format as a table.}}

---

## Action Plan

- [ ] Review and confirm rebalancing recommendations
- [ ] Set limit orders for trimming overweight positions
- [ ] Research watchlist candidates in detail
- [ ] Schedule next portfolio review: [Date + 30 days]

---

> 💡 **How to use:** Fill in your holdings table, then click **✨ Fill** to get a complete portfolio analysis with rebalancing recommendations.
`
    },
    {
        name: 'AI Language Tutor',
        category: 'ai',
    displayTag: 'AI · TTS',
        icon: 'bi-translate',
        description: 'Duolingo-style language lessons — pick native \u0026 target language, AI generates vocabulary, dialogues \u0026 quizzes with 🔊 pronunciation',
        variables: [
            { name: 'nativeLang', value: 'English', desc: 'Your native language' },
            { name: 'targetLang', value: 'Japanese', desc: 'Language you want to learn' },
            { name: 'level', value: 'beginner', desc: 'beginner / intermediate / advanced' },
            { name: 'topic', value: 'greetings \u0026 introductions', desc: 'Topic for this lesson' },
        ],
        content: `# 🌍 Language Lesson — $(targetLang)

**Native Language:** $(nativeLang)
**Learning:** $(targetLang)
**Level:** $(level)
**Topic:** $(topic)
**Date:** $(date)

> 💡 **How to use:** Click **⚡ Vars** to apply your settings, then **✨ Fill** to generate the lesson. Hover over any text and click **🔊** to hear pronunciation via Kokoro TTS.

---

## 📖 Vocabulary

{{AI: Generate a vocabulary list of 12-15 essential words/phrases for the topic "$(topic)" at the $(level) level.

Format as a table with columns:
| # | $(targetLang) | Pronunciation | $(nativeLang) | Example Sentence |

The pronunciation column should use romanization/transliteration for non-Latin scripts.
Each example sentence should be a natural, everyday usage.
Order from most common to least common.}}

---

## 🗣️ Dialogue Practice

{{AI: Write a natural conversation between two people (Person A and Person B) about "$(topic)" in $(targetLang). This should be at (level) difficulty.

Format:
For each line, show:
**Person A:** [$(targetLang) sentence]
*(pronunciation)* — [$(nativeLang) translation]

**Person B:** [$(targetLang) sentence]
*(pronunciation)* — [$(nativeLang) translation]

Include 6-8 exchanges. Make it realistic and culturally appropriate. Add a brief cultural note at the end about any relevant customs or etiquette.}}

---

## 📝 Grammar Notes

{{AI: Explain 2-3 key grammar patterns used in the dialogue and vocabulary above. For each pattern:

### Pattern: [Name in $(nativeLang)]
- **Structure:** Show the grammar pattern formula
- **Rule:** Explain when and how to use it (1-2 sentences)
- **Examples:**
  1. [$(targetLang)] → [$(nativeLang)]
  2. [$(targetLang)] → [$(nativeLang)]
  3. [$(targetLang)] → [$(nativeLang)]
- **Common mistake:** What learners at $(level) level often get wrong

Keep explanations clear and beginner-friendly even for advanced topics.}}

---

## 🎯 Practice Quiz

{{AI: Create a practice quiz with 10 questions about "$(topic)" at the $(level) level. Mix the following question types:

### Fill in the Blank (4 questions)
Complete the sentence in $(targetLang):
1. ______ [rest of sentence] → (Answer: [word])

### Translate to $(targetLang) (3 questions)
5. [$(nativeLang) sentence] → ?

### Choose the Correct Answer (3 questions)
8. [Question in $(nativeLang)]
   - a) [option in $(targetLang)]
   - b) [option in $(targetLang)]
   - c) [option in $(targetLang)]
   - d) [option in $(targetLang)]

---

**Answer Key:**
List all answers with brief explanations for any tricky ones.}}

---

## 🔁 Quick Review Flashcards

{{AI: Create 8 flashcard-style review items for this lesson. Format as:

| Front ($(targetLang)) | Back ($(nativeLang)) | Mnemonic Tip |
|---|---|---|

Include a memory trick, association, or mnemonic for each word to help retention.}}

---

## 🎓 Next Steps

{{AI: Based on this "$(topic)" lesson at $(level) level, suggest:
1. **3 related topics** to study next (with brief description of what you'll learn)
2. **2 practice activities** the learner can do today to reinforce this lesson
3. **1 cultural immersion tip** — a movie, song, podcast, or social media account in $(targetLang) related to this topic

Keep suggestions specific and actionable.}}

---

> 🔊 **Pronunciation Tip:** Hover over any text in the preview and click the **🔊** button to hear it spoken aloud by the Kokoro TTS engine. This works for all 10+ supported languages!
`
    },
    {
        name: 'AI Model Manager',
        category: 'ai',
    displayTag: 'AI · Local',
        icon: 'bi-hdd-stack',
        description: 'Manage local AI models — view available models, check cache status, and learn how to clear browser storage',
        content: `# AI Model Manager — Local Models Reference

**Date:** $(date)

---

## 📦 Available Local Models

| Model | Size | Worker | Use Case |
|:------|:-----|:-------|:---------|
| **Qwen 3.5 Small (0.8B)** | ~500 MB | ai-worker.js | General writing, fast inference |
| **Qwen 3.5 Medium (2B)** | ~1.2 GB | ai-worker.js | Better quality, moderate speed |
| **Qwen 3.5 Large (4B)** | ~2.5 GB | ai-worker.js | Best quality, high-end devices |
| **Granite Docling (258M)** | ~500 MB | ai-worker-docling.js | Document OCR |
| **Florence-2 (230M)** | ~230 MB | ai-worker-florence.js | OCR + image captioning |
| **Voxtral Mini 3B** | ~2.7 GB | voxtral-worker.js | Speech-to-text (WebGPU) |
| **Whisper V3 Turbo** | ~800 MB | speech-worker.js | Speech-to-text (WASM fallback) |
| **Kokoro 82M** | ~80 MB | tts-worker.js | Text-to-speech (EN/CN) |

---

## 🔧 Model Loading States

When you download a local model, the consent dialog shows:

- **⬇️ Downloading from huggingface.co/textagent/...** — First-time download with progress bar and file size
- **📦 Loading from cache...** — Model was previously downloaded and is loading from browser storage
- **Source location** — Shows the HuggingFace model path (e.g., \`textagent/Qwen3.5-0.8B-ONNX\`)

---

## 🗑️ Deleting Cached Models

To free up browser storage, click the **Delete Model** button in the consent dialog:

1. Click the **✨ AI** button in the toolbar
2. Select a local model from the model dropdown
3. The consent dialog will show a red **🗑️ Delete Model** button (visible if the model was previously downloaded)
4. Click it to clear all cached files from Cache API and OPFS
5. The consent flag resets — you'll see the download dialog again on next use

> [!TIP]
> Each model's files are stored in your browser's Cache API. Deleting a model frees the disk space but you'll need to re-download it to use it again.

---

## 📊 Storage Breakdown

{{AI: Create a helpful guide explaining browser storage mechanisms for AI models. Cover:
1. **Cache API** — how Transformers.js uses it to store model files
2. **OPFS (Origin Private File System)** — an alternative storage mechanism
3. **IndexedDB** — used for consent flags and small metadata
4. **Approximate storage** — how much space each model takes
5. **Browser limits** — typical storage quotas and how to check usage

Format with clear sections and practical tips.}}

---

## 🔄 Model Hosting

All models are hosted under the [textagent HuggingFace organization](https://huggingface.co/textagent):

- Primary: \`textagent/{model-name}\`
- Fallback: \`onnx-community/{model-name}\` (if primary unavailable)

Models use ONNX format for efficient browser inference via [Transformers.js](https://huggingface.co/docs/transformers.js).

---

> 💡 **How to use:** This template serves as a reference card for managing your local AI models. Click **✨ Fill** to generate the storage guide section.
`
    },
];

