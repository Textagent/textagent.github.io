# Changelog: Agent Flow Enforcement & Decision Tree

**Date:** 2026-03-20

## Changes

- **Agent execution requires `@agenttype`** — cloud/Docker paths only activate when an external agent (openclaw/openfang) is selected; without `@agenttype`, steps always run via standard LLM
- **Cloud toggle disabled without agent** — ☁️ button is grayed out with tooltip "Select an agent type first" when no `@agenttype` is set
- **Cloud/Local badge requires agent** — badge only renders when `@agenttype` is present
- **GitHub auth gate scoped to Codespaces** — auth modal only triggers when provider is `codespaces`, not for Local Docker or Custom Endpoint
- **Auto-start agent-runner** — `npm run dev` now starts both Vite and agent-runner server concurrently
- **Default template updated** — Agent tag template includes `@cloud: no` by default
- **Decision tree diagram** — Mermaid LR flowchart added to README showing 3 execution modes

## Files Changed

| File | Change |
|------|--------|
| `js/ai-docgen-generate.js` | `useAgentExec` simplified to `!!block.agentType` |
| `js/ai-docgen.js` | Cloud badge/toggle conditional on `agentTypeName`; auth gate scoped to codespaces provider; `updateBlockField` preserves `@cloud: no` |
| `js/github-auth.js` | Agent execution settings wiring |
| `package.json` | `dev` script runs agent-runner + Vite concurrently |
| `tests/feature/agent-cloud.spec.js` | Updated cloud toggle test to include `@agenttype` |
| `README.md` | Decision tree diagram, updated Agent Flow feature row |
| `css/ai-docgen.css` | Cloud badge, agent type dropdown styles |
