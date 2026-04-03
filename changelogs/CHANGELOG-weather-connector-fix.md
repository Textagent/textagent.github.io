# Weather Connector — Enhanced Output & Debug Tracing

- Weather connector now outputs city name in header (`[Live Weather Report — Tokyo]`)
- Added fetch timestamp to weather context for recency verification
- Added hourly forecast (every 3 hours, next 24h) to weather context
- Added `city` config field to Weather connector registry for user-customizable city label
- Added debug logging to `getActiveContext()` — traces which connectors are enabled and their fetch results
- Fixed: error catch in `getActiveContext` now logs failed connector ID and error message instead of silently swallowing

---

## Summary

Improved the Weather connector's context output to be more explicit and model-friendly, added a city name config field, and added debug tracing to diagnose cases where weather data doesn't reach the AI model.

---

## 1. Weather Context Formatting
**Files:** `js/connectors.js`
**What:** Replaced terse `[Weather — Open-Meteo (lat:..., lon:...)]` header with `[Live Weather Report — Tokyo (via Open-Meteo API)]` plus fetch timestamp, location line, and hourly forecast block (8 data points at 3h intervals).
**Impact:** Small models like Gemma 4 E2B can now find and reference weather data in multi-source context thanks to clearer headers.

## 2. City Config Field
**Files:** `js/connectors.js`
**What:** Added `city` config field to the `openmeteo` registry entry. The value (default: `Tokyo`) appears in the weather report header. Users can customize this via the connector config modal.
**Impact:** Weather reports are labeled with the user's city name, making the context more natural for AI grounding.

## 3. Debug Tracing
**Files:** `js/connectors.js`
**What:** `getActiveContext()` now logs `[Connectors] Enabled connectors: [...]` and per-connector result previews (first 100 chars or NULL). Error catches log the connector ID and error message.
**Impact:** Enables diagnosing "weather data missing from context" issues via browser console.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/connectors.js` | +34 −6 | Weather output enhancement, city field, debug logging |
