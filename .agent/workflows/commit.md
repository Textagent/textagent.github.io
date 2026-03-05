---
description: How to commit and push code changes
---

# Commit Workflow

When committing code changes, **always** include a changelog file that documents what was changed.

## Steps

1. Create or update a `CHANGELOG-<topic>.md` file in the repo root that summarizes all changes in plain text:
   - What was changed and why
   - Which files were modified/added/deleted
   - Any measurable impact (e.g., bundle size, performance)

2. Stage all modified files **plus** the changelog file:
   ```bash
   git add <changed-files> CHANGELOG-<topic>.md
   ```

3. Commit with a descriptive message:
   ```bash
   git commit -m "<type>: <concise description>"
   ```

4. Push to remote:
   ```bash
   // turbo
   git push origin main
   ```

## Rules

- **Never** commit code without an accompanying changelog file
- The changelog should be human-readable markdown
- Use descriptive topic names (e.g., `CHANGELOG-perf.md`, `CHANGELOG-ui-fixes.md`)
- If amending a commit, include the changelog in the amended commit
