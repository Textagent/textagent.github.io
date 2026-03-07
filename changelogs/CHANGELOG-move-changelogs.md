# CHANGELOG — Move Changelogs to Dedicated Folder

## Summary
Moved all 37 changelog files from the repo root to a dedicated `changelogs/` directory.

## What Changed

### `changelogs/` directory (NEW)
- Created dedicated directory for all changelog files
- Moved 37 `CHANGELOG-*.md` files and `CHANGELOG.md` from repo root

### `.github/workflows/require-changelog.yml`
- Updated grep pattern to check `changelogs/CHANGELOG-*.md` instead of root `CHANGELOG-*.md`

### `.agent/workflows/commit.md`
- Updated all paths and instructions to use `changelogs/` directory
- Added explicit rule: "All changelogs MUST be placed in the `changelogs/` directory"
