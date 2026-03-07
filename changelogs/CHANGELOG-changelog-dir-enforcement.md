# CHANGELOG — Enforce Changelogs in changelogs/ Directory

## Summary
Updated the GitHub Action to reject changelogs placed in the repo root and require them in `changelogs/`.

## What Changed

### `.github/workflows/require-changelog.yml`
- Added check: rejects any `CHANGELOG-*.md` file found in repo root with helpful move command
- Updated error messages to reference `changelogs/CHANGELOG-<topic>.md` path
- Existing check for `changelogs/CHANGELOG-*.md` unchanged
