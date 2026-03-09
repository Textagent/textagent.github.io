# Fix Context Menu + Tree Refresh

- Fixed context menu for disk tree: auto-add untracked files to workspace on right-click so rename/delete/duplicate work on ALL files in the tree
- Fixed stale tree: `loadDiskTree()` called after create, duplicate, rename, delete so changes show immediately
- Fixed inline rename in tree mode: finds tree nodes via `[data-path]` + `.ws-tree-name` instead of `[data-file-id]` + `.ws-file-name`
- Preserves directory prefix during rename (e.g., `subfolder/file.md` → `subfolder/newname.md`)
