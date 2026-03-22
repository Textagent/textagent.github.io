# Agent Panel Floating Toggle & Auto-Naming — UX Improvements

- Agent Containers panel now accessible when header is fully hidden (level 2) via a floating toggle button
- Floating toggle button positioned next to the restore pill with 35% resting opacity, fully reveals on hover
- QAB "Agents" dropdown item now wires directly to Agent Panel toggle
- Badge count synced across header button and floating button (both update simultaneously)
- Workspace files named "Untitled" now auto-derive their name from the first 10 characters of content
- Auto-naming strips leading `#` headings, keeps only ASCII letters and spaces, appends `.md`
- Auto-naming is debounced (400ms) and skipped for manually renamed files and disk-mode files
- Empty content reverts file name back to "Untitled.md"
- Added demo-showcase template asset

---

## Summary

Two UX improvements: (1) the Agent Containers panel is now reachable even when the full header is hidden, via a floating pill-style toggle button that mirrors the header badge count; (2) workspace files auto-derive their name from content, eliminating the need to manually rename "Untitled" files.

---

## 1. Agent Panel Floating Toggle
**Files:** `css/agent-panel.css`, `js/agent-panel.js`
**What:** Added a fixed-position floating button (`agent-panel-floating-toggle`) that appears only when `body.header-hidden` is active (header visibility level 2). The button includes a synced badge showing the count of running containers. The QAB "Agents" dropdown item is also wired to toggle the panel. Badge update logic refactored to iterate over both `agent-badge` and `floating-agent-badge` IDs.
**Impact:** Users can now access the Agent Containers panel without restoring the full header, maintaining the distraction-free writing experience while keeping container management accessible.

## 2. Auto-Naming from Content
**Files:** `js/workspace.js`
**What:** Added `autoNameFromContent()` function that listens to editor `input` events (debounced 400ms). When the active file is named "Untitled.md" and hasn't been manually renamed, it extracts the first 10 ASCII-letter characters from content (stripping leading `#` headings) and sets the file name. A `manuallyRenamed` map tracks files that were explicitly renamed by the user, preventing auto-naming from overriding intentional names. Clearing content reverts the name to "Untitled.md".
**Impact:** New files automatically get meaningful names as users type, reducing friction in multi-file workflows without interfering with intentional renames.

## 3. Demo Showcase Template
**Files:** `public/assets/templates/demo-showcase.md`
**What:** New template asset file for the demo showcase.
**Impact:** Provides a pre-built template for showcasing features.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `css/agent-panel.css` | +35 | Floating toggle button styles |
| `js/agent-panel.js` | +32 −8 | QAB wiring, floating button, synced badges |
| `js/workspace.js` | +50 | Auto-naming from content |
| `public/assets/templates/demo-showcase.md` | +new | Demo showcase template |
