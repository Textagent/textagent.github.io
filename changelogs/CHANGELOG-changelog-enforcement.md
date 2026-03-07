# Changelog Enforcement Setup

**Date:** 2026-03-06

## Changes

- Added `.githooks/pre-commit` — local git hook that blocks commits without a `CHANGELOG-*.md` file
- Added `.github/workflows/require-changelog.yml` — GitHub Action that fails pushes/PRs without a changelog
- Added `.agent/workflows/commit.md` — Antigravity workflow ensuring changelogs are always created
- Configured `core.hooksPath` to `.githooks` for local enforcement

## How It Works

- Code commits without a `CHANGELOG-*.md` → ❌ blocked locally + on GitHub
- Docs-only commits (`.md`, `.txt`, `.json`) → ✅ allowed without changelog
