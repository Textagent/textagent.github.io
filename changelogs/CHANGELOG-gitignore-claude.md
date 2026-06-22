# Ignore local Claude Code state

- Added `.claude` to `.gitignore` so local Claude Code config (settings, launch.json, scheduled-task lock, and session worktrees under `.claude/worktrees/`) is never accidentally committed

---

## Summary

The `.claude/` directory holds machine-specific Claude Code state and a nested git worktree from prior sessions. It does not belong in version control, so it is now ignored alongside `node_modules`, `dist`, and test artifacts.
