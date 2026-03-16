# Mobile Column Layout Gap — Fixed large white gap in mobile stacked view

- Fixed: Huge white gap between formatting toolbar and editor in mobile column view (≤1080px)
- Fixed: Similar vertical layout gap in Presentation (PPT) mode on mobile
- Prevented closed workspace sidebar from consuming vertical space in column flex layout

---

## Summary
Fixed a layout bug where the workspace sidebar pushed the editor pane down in mobile/tablet stacked (column) view even when closed, creating a massive white gap.

---

## 1. Workspace Sidebar Mobile Layout Fix
**Files:** `css/workspace.css`
**What:** Added `height: 0` to the default `.workspace-sidebar` state instead of relying purely on `width: 0`, and restored `height: auto` when `.open`.
**Impact:** Prevents the closed sidebar from acting as an invisible vertical spacer in the `flex-direction: column` layout (triggering at ≤1080px), completely eliminating the giant whitespace below the toolbar in both Split and PPT modes.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `css/workspace.css` | +2 −1 | CSS Fix |
