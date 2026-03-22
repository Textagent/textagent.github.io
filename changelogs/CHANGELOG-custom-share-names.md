# Custom Named Share Links

- Users can provide a custom name (e.g. `mynotes`) when sharing, producing clean URLs like `#s=mynotes`
- Custom name input field added to Share Options modal (used by both Quick Share and Secure Share)
- Custom name input field added to LLM Memory "Share as Link" card
- Names are case-insensitive (stored lowercase) and validated: 3–50 chars, letters/numbers/hyphens only
- Reserved names blocked (`js`, `css`, `dist`, `index`, `api`, `admin`, etc.)
- Uniqueness enforced via Firestore — duplicate names show "This name is currently unavailable"
- Error messages displayed inline below the custom name input (not in the passphrase error area)
- Empty custom name field gracefully falls back to auto-generated short IDs (existing behavior)

---

## Summary
Users can now optionally provide a memorable, custom name for any share link instead of getting a random auto-generated ID. The feature works across Quick Share, Secure Share, and LLM Memory export.

---

## 1. Custom Name Input UI
**Files:** `js/modal-templates.js`, `css/modals.css`
**What:** Added a "Custom Link Name" input field to the share options modal (before the view lock section) with a `#s=` prefix indicator and helper text. Added a compact custom name input to the LLM Memory share tab. Styled with a flex wrapper matching the existing modal aesthetic.
**Impact:** Users see an optional input field when sharing. The prefix shows them what the final URL will look like.

## 2. Slug Validation & Uniqueness
**Files:** `js/cloud-share.js`
**What:** Added `validateSlug()` function with regex validation (`/^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$/`), reserved word list (18 entries), and length checks. Added `getCustomSlugFromInput()` helper to read and validate the input. Updated `createCompactShare()` to accept `customSlug` option — if provided, checks Firestore existence before writing; if taken, throws descriptive error.
**Impact:** Invalid or reserved names are rejected client-side before any Firestore call. Duplicate names produce a clear error message.

## 3. Share Flow Integration
**Files:** `js/cloud-share.js`, `js/llm-memory.js`
**What:** Updated `doQuickShare()` and `doSecureShare()` to read the custom name input and pass to their respective Firestore write paths. Updated share button error handler to route name-related errors to the custom name error div instead of the passphrase error area. Updated `openShareOptionsModal()` to reset the custom name field. Updated LLM Memory "Generate Link" handler to read its own custom name input and pass to `createCompactShare()`.
**Impact:** Custom names work in all three share flows with proper error handling and UI reset.

---

## Files Changed (4 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/modal-templates.js` | +12 −3 | Custom name input HTML for share modal + LLM memory tab |
| `js/cloud-share.js` | +65 −25 | Slug validation, uniqueness check, share flow integration |
| `js/llm-memory.js` | +17 −3 | Custom name support in Generate Link handler |
| `css/modals.css` | +52 −0 | Styling for custom name input wrapper |
