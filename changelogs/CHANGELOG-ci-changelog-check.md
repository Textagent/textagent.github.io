# CI — Exclude Deletions from Changelog-Location Check

- Added `--diff-filter=ACMR` to both `git diff --name-only` invocations in the `check-changelog` job of `.github/workflows/deploy.yml`
- The job now only inspects Added / Copied / Modified / Renamed paths; pure deletions are ignored

---

## Summary
The `check-changelog` CI gate was firing on commits that **removed** a root-level `CHANGELOG-*.md` file. Because `git diff --name-only` returns the path of a file regardless of whether it was added, modified, or deleted, the regex `^CHANGELOG-.*\.md$` matched the deleted root-level changelog and the job failed with `❌ FAILED: Changelog found in repo root`.

This meant any legitimate cleanup commit that moved a stray root changelog into `changelogs/` (or removed an identical duplicate) would be blocked — the very kind of fix the rule wants to encourage.

## 1. Workflow Fix
**Files:** `.github/workflows/deploy.yml`
**What:** Both `git diff` calls in the `check-changelog` step now pass `--diff-filter=ACMR`, restricting the file list to Added / Copied / Modified / Renamed entries. Deletions are excluded.
**Impact:** Cleanup commits that remove or move root-level changelogs into `changelogs/` no longer fail the gate. New violations (a fresh `CHANGELOG-*.md` added at the repo root) are still caught, because added files are kept in the filter.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `.github/workflows/deploy.yml` | +8 −5 | Added `--diff-filter=ACMR` and updated step comment |
