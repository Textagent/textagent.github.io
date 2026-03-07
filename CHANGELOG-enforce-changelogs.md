# CHANGELOG — Enforce Changelog Requirement

## Summary
Strengthened changelog enforcement across both GitHub Actions and the Antigravity agent commit workflow.

## What Changed

### `.agent/workflows/commit.md`
- Added **explicit rule**: NEVER use `--no-verify` flag
- Added **explicit rule**: NEVER make empty commits (`--allow-empty`)
- Clarified that the GitHub Action `require-changelog.yml` enforces this server-side
- Made rules more prominent and unambiguous
- Added recommendation for docs-only commits

### `.github/workflows/require-changelog.yml` (no changes)
- Already blocks pushes and PRs without `CHANGELOG-*.md` files
- Skips docs-only commits (.md, .txt, .json)
- Working correctly as-is

## Impact
- Agent will always create changelogs before committing
- Agent will never bypass pre-commit hooks with `--no-verify`
- GitHub Actions will reject any push without a changelog for code changes
