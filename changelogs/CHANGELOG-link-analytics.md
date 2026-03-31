# Link Analytics — Global Click Tracking, Likes & Live Presence

- Added `js/link-analytics.js` — new module for global cross-user analytics via Firestore
- Added `css/link-analytics.css` — styles for like widget, click badges, and analytics panel
- Click count badges appear inline next to each `<a>` link in the preview pane
- Badge counts are global (shared across ALL users) via Firestore `link_clicks` collection using `FieldValue.increment()`
- Badges seeded instantly from localStorage display cache; refreshed from Firestore in background
- Added floating 👍 Like button (fixed, bottom-right) — one like per session, saved to Firestore
- Like button disappears with a spring-bump → fade-out animation after being clicked
- Fixed: like button lifted above shared-view pill when `body.shared-view-active` to prevent overlap
- Fixed: like button lifts above composer FAB on mobile (`bottom: 80px` on ≤768px)
- Added live "X reading now" presence tracking via Firestore heartbeat/onSnapshot (20s heartbeat, 60s TTL)
- Added document view counter — increments once per session for shared docs (`link_clicks/views_{docId}`)
- Added analytics panel (slide-in from right) showing ranked link list with bar chart, opened via toolbar button
- Panel shows: total opens, live reader count, per-link click count + last clicked date
- Added `link_clicks` Firestore collection rules (open read/write for analytics, presence subcollection)
- Fixed: moved `link-analytics.js` out of `Promise.all` Phase 3a into its own `try/catch` await after Phase 3a
- Fixed: replaced fragile `readyState` bootstrap with `waitForPreview()` poll (100ms × 100 retries) to handle async module load order
- Updated `src/main.js` to import `link-analytics.css` and load `link-analytics.js`
- Updated `firestore.rules` to allow `link_clicks` collection and `readers` subcollection

---

## Summary
Implements a complete global analytics system for TextAgent shared documents. All metrics (link clicks, likes, document views, live readers) are stored in Firestore and shared across every user — not scoped to a single browser session.

---

## 1. Global Link Click Tracking
**Files:** `js/link-analytics.js`, `css/link-analytics.css`
**What:** Intercepts clicks on all `<a>` links in the markdown preview. Each click atomically increments a Firestore counter (`FieldValue.increment(1)`) under `link_clicks/{urlSHA256}`. A small pill badge renders inline after the link text showing the global click count.
**Impact:** Any user clicking a link in any TextAgent document contributes to a shared click count visible to everyone.

## 2. Floating Like Button
**Files:** `js/link-analytics.js`, `css/link-analytics.css`
**What:** Injects a fixed-position 👍 button (bottom-right) into the preview pane. One like per browser session (memory-only dedup). Saves to `link_clicks/likes_{shareDocId}` with Firestore realtime listener for live count. On click: spring animation → fade-out → `display:none`.
**Impact:** Readers of shared documents can express appreciation. Like count updates in realtime across all viewers.

## 3. Live Presence (Reading Now)
**Files:** `js/link-analytics.js`
**What:** When a shared doc is opened, writes a heartbeat document to `link_clicks/presence_{docId}/readers/{sessionId}` every 20s. A Firestore `onSnapshot` listener counts sessions with `lastSeen` within 60s and updates the green pulsing "X reading now" pill in the analytics panel header.
**Impact:** Shows how many people are actively reading a shared document right now, in realtime.

## 4. Document View Counter
**Files:** `js/link-analytics.js`
**What:** On first load of a shared doc per session, increments `link_clicks/views_{docId}.views` in Firestore. Displayed in the analytics panel as "N total opens".
**Impact:** Authors can see total lifetime opens of their shared documents.

## 5. Analytics Panel
**Files:** `js/link-analytics.js`, `css/link-analytics.css`
**What:** Slide-in right panel (420px wide, keyboard-dismissable) opened via a bar chart toolbar button. Fetches all click data from Firestore, renders a ranked list with proportional bars (gold/silver/bronze for top 3), total opens, and live reader count.
**Impact:** Central dashboard for all link and document engagement metrics.

## 6. Firestore Rules
**Files:** `firestore.rules`
**What:** Added `link_clicks/{docId}` collection rules (open read/write) and `readers/{sessionId}` subcollection rules (write limited to `{lastSeen: int}` shape, delete allowed for cleanup).
**Impact:** Enables anonymous read/write for analytics without touching the protected `shares` collection rules.

## 7. Module Load Fix
**Files:** `src/main.js`, `js/link-analytics.js`
**What:** Extracted from `Promise.all` Phase 3a into a standalone `try/catch await` after Phase 3a. Replaced `readyState` bootstrap with `waitForPreview()` — a 100ms polling loop that waits up to 10s for `M.markdownPreview`, `M.renderMarkdown`, and `M.db` to be available.
**Impact:** Eliminates silent initialization failures when the module loads before the preview element is wired.

---

## Files Changed (4 total)

| File | Type | Description |
|------|------|-------------|
| `js/link-analytics.js` | NEW | Core analytics module (~570 lines) |
| `css/link-analytics.css` | NEW | All styles for badges, like widget, panel |
| `src/main.js` | MODIFIED | CSS import + standalone module load |
| `firestore.rules` | MODIFIED | `link_clicks` collection + presence rules |
