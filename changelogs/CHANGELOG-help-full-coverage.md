# Changelog — Help Mode: Full Button Coverage

**Date:** 2026-03-23

## Summary

Added 17 missing entries to the Help Mode `HELP_DATA` registry in `help-mode.js`. Previously, clicking these toolbar buttons in help mode produced no popover. Now every button in the UI shows its name, description, keyboard shortcut (if any), and a "Watch Demo" link.

## Buttons Added

| Category | Buttons |
|----------|---------|
| Draw / Git / Tools | Draw (Excalidraw), GitHub Analysis, Web Scrape, Web Search |
| AI Tags | Translate, TTS (Kokoro), STT (Transcribe), Game Builder |
| Media | Video Player, Embed Grid, YouTube |
| Coding & Execution | LaTeX Block, Run All |
| Header / QAB | File Tree (#workspace-toggle), Page View (A4), Agent Containers, Find & Replace |

## Files Changed

- **`js/help-mode.js`** — Added 17 new entries to `HELP_DATA` object (~112 lines)

## Notes

- All 17 demo assets already existed in `public/assets/demos/` — no new files needed.
- Build passes cleanly with zero errors.
