# Space-Aware Share Flow Updates

**Date:** March 28, 2026

## Overview
Re-engineered the "Add to Space" feature to be part of the pre-share workflow, ensuring users can generate a single, meaningful URL that includes both the space context and the document itself.

## Changes
- **Pre-Share Space Selection:** Moved the "Add to Space" dropdown from the post-share result modal into the initial Share Options modal.
- **Unified URL Generation:** Sharing a document to a space now simultaneously creates the share link and associates it with the space, returning a unified URL (`#space=<slug>&s=<id>`).
- **Enhanced Document Routing:** Updated the hash parser (`M.loadSharedMarkdown`) to properly read and execute compound URLs containing both `space` and `s` parameters, ensuring the document loads seamlessly within the space context.
- **Clickable Space Management Items:** Converted the document titles in the "My Spaces" editor modal into clickable anchor tags (`<a>`) that open the shared document in a new tab using the new context-aware URL format.
- **UI Polish:** Added focus states, hover effects, and cleaner typography to the new select dropdown and management links in `spaces.css`.

## Impact
- **No More Duplicate Links:** Eliminates user confusion by generating a firm link only *after* all contexts (like spaces) have been selected.
- **Better UX:** Managers can now easily review the documents they've added to a space directly from their management modal with a single click.
