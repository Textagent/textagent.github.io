# NSE India Dashboard Template

**Date:** 2026-03-17

## Summary
Added a new "NSE India Dashboard" template to the Finance category that fetches live FII/DII institutional flow data, market indices, and market status directly from NSE India's APIs via CORS proxy.

## Changes

### Modified
- **js/templates/finance.js** — Added 4th template `NSE India Dashboard` to `window.__MDV_TEMPLATES_FINANCE`

### Template Features
- **FII/DII Activity** — `{{API:}}` tag calling `nseindia.com/api/fiidiiTradeReact` via `corsproxy.io`, with a JavaScript code block to parse NSE's raw array format and output a formatted buy/sell/net table with Indian number formatting
- **NSE Market Indices** — `{{API:}}` tag calling `nseindia.com/api/allIndices`
- **Market Status** — `{{API:}}` tag calling `nseindia.com/api/marketStatus`
- **API Quick Reference** — Comprehensive table of NSE's undocumented public API endpoints (market data, equity, derivatives, analysis)
