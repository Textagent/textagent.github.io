# Shared View Banner UX Improvement

## Summary
Improved the shared document banner UX with auto-dismiss behavior and a non-intrusive floating pill indicator, replacing the persistent green bar that occupied screen space.

## Changes

### New Behavior
- **Auto-dismiss banner**: The green "Viewing shared markdown (read-only)" bar now auto-hides after 4 seconds with a smooth slide-up animation
- **Floating pill indicator**: A small green "🔒 Read-only" pill appears in the top-right corner after the banner collapses — always visible but non-intrusive
- **Re-expand on interaction**: Clicking the editor or the pill re-expands the full banner with "Edit Copy" and "Close" buttons; auto-hides again after 5 seconds
- **Dynamic share URL**: Share links now use `localhost` when running locally for easier development testing, and `textagent.github.io` in production

### Files Modified
- `js/modal-templates.js` — Added pill HTML element (`#shared-view-pill`)
- `js/cloud-share.js` — Added auto-dismiss timer logic, pill ↔ banner transitions, editor click/focus handlers, dynamic `SHARE_BASE_URL`
- `css/modals.css` — Added `banner-hidden` slide animation, `.shared-view-pill` styling with hover/active micro-animations, `.banner-collapsed` body class
- `styles.css` — Synced duplicate banner styles with the same auto-dismiss + pill additions
