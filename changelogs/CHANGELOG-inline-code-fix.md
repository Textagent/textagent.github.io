# Fix: API & Linux tags rendered as HTML inside inline code

## Changes
- `js/api-docgen.js` — added inline code span detection to `getFencedRanges()`
- `js/linux-docgen.js` — added inline code span detection to `getFencedRanges()`

## Problem
`{{API:}}` and `{{Linux:}}` references inside backticks (e.g. `` `{{API:}}` ``) in the Feature Showcase table were being parsed by the tag processors and converted into raw HTML placeholder cards instead of displaying as text.

## Root Cause
`ai-docgen.js` already detected inline code spans (single backticks) in its `getFencedRanges()` function, but `api-docgen.js` and `linux-docgen.js` only detected fenced code blocks (triple backticks). Tags inside inline code were not protected.

## Fix
Added the same inline code span regex (`/`([^`\n]+)`/g`) to `getFencedRanges()` in both `api-docgen.js` and `linux-docgen.js`, matching the existing pattern in `ai-docgen.js`.
