# Dual-Key Form Sharing — Implementation Plan (Final)

## Goal

Secure form sharing with dual links, encrypted responses, and creator-only response viewing. When a `{{Form:}}` doc is shared, generate two links: a **creator link** (with `&rk=` for viewing responses) and a **respondent link** (`&m=fill`, preview-locked, fill-only).

## Architecture

```
Creator writes {{Form:}} → clicks Share
        ↓
createCompactShare() detects form → generates rk + SHA-256(rk) = rkHash
        ↓
Stores in Firestore: { d, k, t, wt, rkHash }
        ↓
Produces TWO links:
  Creator:    #s=<id>&rk=<rkString>     (rkHash validates ownership)
  Respondent: #s=<id>&m=fill            (preview-locked, no rk)
        ↓
On load: hash URL's rk → compare with stored rkHash → show/hide Responses button
```

> [!NOTE]
> `rk` is NOT stored in Firestore (only its SHA-256 hash `rkHash` is). This preserves zero-knowledge: even inspecting the Firestore doc doesn't reveal the key.

---

## Changes Made

### Security Fixes (Critical)

| # | Issue | File | Fix |
|---|-------|------|-----|
| 1 | XSS in response table | `form-engine.js` | Added `escapeHtml()` for all cell values |
| 2 | Plain-text response fallback | `form-engine.js` | Removed `storeResponsePlain()` — encryption-only |
| 3 | Unvalidated `rk` parameter | `cloud-share.js` | SHA-256 `rkHash` stored in Firestore, validated on load |
| 4 | Submit blocked on creator view | `cloud-share.js` | Exempted `.form-dg-submit` from read-only interceptor |

### Reliability & UX Fixes

| # | Issue | File | Fix |
|---|-------|------|-----|
| 5 | Columns from first response only | `form-engine.js` | Collect column keys from ALL responses |
| 6 | Stale comment | `form-engine.js` | Removed |
| 7 | No re-submit prevention | `form-docgen.js` | Button disabled + "⏳ Submitting…" |
| 8 | Missing form title in viewer | `form-engine.js` | Extracted from response data or DOM |
| 9 | Help/demo missing for Forms | `help-mode.js` | Added `32_form_sharing.webp` demo |

---

## Files Modified

#### [MODIFY] [cloud-share.js](file:///Users/jyotibose/textagent.github.io/js/cloud-share.js)
- `hashResponseKey()` — SHA-256 hash of rk using `crypto.subtle.digest`
- `doQuickShare()` / `doSecureShare()` — detect forms, generate rk, pass rkHash
- `createCompactShare()` — store `rkHash` in Firestore doc
- `loadSharedMarkdown()` — validate URL's rk against stored rkHash
- Read-only interceptor — exempt `.form-dg-submit` and `.form-dg-responses-btn`

#### [MODIFY] [form-engine.js](file:///Users/jyotibose/textagent.github.io/js/form-engine.js)
- `escapeHtml()` — XSS prevention for response table
- Removed `storeResponsePlain()` — encryption-only storage
- Dynamic column collection from all responses
- Form title in response viewer header

#### [MODIFY] [form-docgen.js](file:///Users/jyotibose/textagent.github.io/js/form-docgen.js)
- Re-submit prevention (disabled button + status text)

#### [MODIFY] [firestore.rules](file:///Users/jyotibose/textagent.github.io/firestore.rules)
- `rkHash` field allowed in share document schemas (both quick and secure share)

#### [MODIFY] [help-mode.js](file:///Users/jyotibose/textagent.github.io/js/help-mode.js)
- Form help entry → dedicated `32_form_sharing.webp` demo

#### [NEW] [32_form_sharing.webp](file:///Users/jyotibose/textagent.github.io/public/assets/demos/32_form_sharing.webp)
- Demo recording of full form sharing flow

---

## Firestore Rules (Deployed)

```
rkHash — optional string field in share documents
responses subcollection — world-writable (create), world-readable, immutable (no update)
```

## Verification Results

| Test | Result |
|------|--------|
| Form creation + sharing | ✅ Dual links generated |
| Respondent submission | ✅ Success message shown |
| Re-submit prevention | ✅ Button disabled after click |
| Creator response viewer | ✅ Form title + correct columns |
| Valid rk → Responses button | ✅ Appears correctly |
| Fake rk → rejected | ✅ No Responses button (new shares only) |
| `npm run build` | ✅ Clean build |

> [!IMPORTANT]
> Legacy shares (created before rules deployment) don't have `rkHash` stored. The code safely rejects `rk` for legacy docs. Only newly shared forms get full rk validation.
