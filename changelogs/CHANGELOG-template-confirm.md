# Template Toggle Fix + Confirmation Dialog

## Summary

Fixed template switching bug when cloud session IDs are in the URL, and added a
confirmation dialog before replacing editor content with a new template.

## Changes

### Bug Fix — Template toggle broken with cloud session hash

When a cloud auto-save session hash (`#id=...&k=...`) was in the URL, toggling
between template categories stopped working correctly.

**Root cause:** `selectTemplate()` never cleared the shared-doc state
(`readOnly`, `isViewingSharedDoc`, URL hash, cloud doc keys in localStorage).

**Fix:** Extracted a reusable `clearCloudSession()` helper in `cloud-share.js`
that clears all shared-doc state and stops the cloud-save timer. Called from
`selectTemplate()` in `templates.js`.

### Feature — Confirmation dialog before template replacement

When the user selects a template while the editor has meaningful content (non-empty
and not the default Feature Showcase), a confirmation dialog now appears:

- **"Replace editor content?"** with the template name
- **Cancel** button preserves current content
- **Use Template** button loads the template
- Undo hint reminds user they can `Ctrl+Z` to recover
- Styled consistently with the existing clear-confirm overlay

If the editor is empty or has the default content, the template loads immediately
without prompting.

## Files Modified

- `js/cloud-share.js` — Extracted `clearCloudSession()`, refactored banner handlers
- `js/templates.js` — Added confirmation dialog, refactored into `loadTemplate()` + `showTemplateConfirm()` + `selectTemplate()`

## Testing

- 13/13 Playwright tests pass (8 UI panel + 5 integration)
- Browser-verified: category toggling, session hash clearing, confirmation flow
