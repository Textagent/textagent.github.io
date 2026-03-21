# Changelog — Share Preview Default

**Date:** 2026-03-22

## Summary

Changed the default shared link behavior so recipients see a clean preview-only view with the full header hidden.

## Changes

### `js/cloud-share.js`
- Default share "Open in view mode" pill → **Preview** (was Default)
- Shared links now open in **preview** mode instead of split mode
- Auto-hide full header (level 2 — no header, no QAB, no buttons) when viewing shared preview links
- Applied to both quick-share and secure-share paths
- Share hint always visible when Preview is pre-selected

### `js/app-init.js`
- Exposed `M.setHeaderLevel()` so cloud-share module can programmatically control header visibility on shared links
