# Changelog — Game Tag Inline Code Fix

**Date:** 2026-03-18

## Summary

Fixed `{{@Game:}}` tags inside inline code backticks being incorrectly rendered as Game Builder cards instead of plain text.

## Problem

In the Feature Showcase template's "AI Document Tags" row, `` `{{@Game:}}` `` was rendering as a full Game Builder card with engine selectors, model dropdowns, and action buttons — despite being wrapped in backticks (inline code), which should display it as literal text.

All other DocGen tags (`{{@AI:}}`, `{{@Image:}}`, `{{@Draw:}}`, etc.) correctly displayed as inline code text because their respective modules included inline code span detection in `getFencedRanges()`.

## Root Cause

`game-docgen.js`'s `getFencedRanges()` only detected fenced code blocks (triple backticks) but was missing inline code span detection (single backticks). This allowed the tag regex to match `{{@Game:}}` even when it appeared inside inline code.

## Changes

### Modified

- **`js/game-docgen.js`** — Added inline code span detection (`/\`([^\`\n]+)\`/g`) to `getFencedRanges()`, matching the pattern already used by `ai-docgen.js`, `draw-docgen.js`, `api-docgen.js`, and `linux-docgen.js`.
