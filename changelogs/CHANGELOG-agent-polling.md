# Changelog — Agent Status Polling Fix

**Date:** 2026-03-25

## Summary

Added a circuit breaker to `getLocalStatus()` in `agent-cloud.js` to eliminate repeated `/api/agents/status` 404 errors on static hosting (GitHub Pages).

## Problem

The agent panel polls `getLocalStatus()` every 15 seconds to update the badge count. On GitHub Pages (where no backend exists), every poll resulted in a 404 error, spamming the browser console with dozens of `Failed to load resource: 404` messages.

## Changes

### Modified: `js/agent-cloud.js`
- Added `_localStatusFailed` circuit breaker flag
- After the first 404/network failure (when no custom agent URL is configured), all subsequent calls return `{ agents: [], docker: false }` immediately — zero network requests
- Circuit breaker only activates on the default origin (not when `AGENT_CUSTOM_URL` is set by the user)
- Resets on successful response, so local development with agent-runner still works normally
