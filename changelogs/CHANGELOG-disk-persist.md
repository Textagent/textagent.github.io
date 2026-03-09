# Disk Persistence + Header Controls

- Rename now persists to disk via `renameFileInPath()` (was using root-only `renameFile()`)
- Delete now removes file from disk via `deleteFileFromPath()` (was missing entirely)
- Tree auto-refreshes after disk rename/delete complete (chained via `.then()`)
- Added refresh (🔄) and disconnect (✕) buttons to sidebar header next to folder name
- Header buttons show when connected, hide when disconnected
- Both header and footer buttons wired to same handlers
