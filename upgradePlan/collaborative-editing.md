# Collaborative Real-Time Editing — Implementation Plan

**Status:** Planned (not yet started)  
**Estimated effort:** 2–3 weeks  
**Priority:** Future upgrade

---

## Goal

Enable two or more users to simultaneously edit the same shared document with real-time cursor positions, presence indicators, and conflict-free merging — while preserving TextAgent's zero-knowledge encryption model.

---

## Architecture Decision

### Recommended: Yjs (CRDT) + WebRTC (Peer-to-Peer)

| Factor | Decision |
|--------|----------|
| **Sync engine** | [Yjs](https://github.com/yjs/yjs) — CRDT library, ~45KB, battle-tested |
| **Transport** | WebRTC via [y-webrtc](https://github.com/yjs/y-webrtc) — true P2P, no content on server |
| **Signaling** | Firebase Realtime DB (already in stack) or free `y-webrtc` signaling server |
| **Editor** | [CodeMirror 6](https://codemirror.net/6/) with [y-codemirror.next](https://github.com/yjs/y-codemirror.next) binding |
| **Encryption** | Symmetric AES-GCM key shared via URL hash (existing pattern) — all WebRTC traffic is E2E encrypted |

### Why not alternatives?
- **Firebase relay:** Firebase would see sync operations (breaks zero-knowledge promise)
- **Liveblocks/PartyKit:** 3rd-party SaaS, adds cost and external dependency
- **Custom OT server:** Massive effort, needs hosted backend

---

## Phased Implementation

### Phase 1: Replace Editor (2–3 days)

**Goal:** Swap `<textarea>` for CodeMirror 6 without breaking any features.

#### Files to modify:
- `index.html` — replace `<textarea id="markdown-editor">` with CodeMirror mount point
- **[NEW]** `js/editor-codemirror.js` — CodeMirror 6 setup, extensions, keybindings
- `js/app-core.js` — update `M.markdownEditor` references to CodeMirror API
- `js/editor-features.js` — adapt find/replace, word wrap, focus mode to CM6 API
- `js/cloud-share.js` — update `.value` reads/writes to CM6 `.state.doc.toString()` / `dispatch`
- `js/workspace.js` — same `.value` → CM6 API migration
- `js/ai-assistant.js` — cursor position, text insertion via CM6 transactions
- `js/speechToText.js` — text insertion at cursor
- `css/editor.css` — adapt styles for CodeMirror's DOM structure

#### Key risks:
- All features that read/write `M.markdownEditor.value` must be audited (~40 call sites)
- Undo/redo is now managed by CodeMirror, not browser native
- Performance with very large documents (CodeMirror is generally faster than textarea)

#### Verification:
- All existing tests pass
- Manual test: templates, AI chat, DocGen, speech-to-text, find/replace, word wrap
- Performance: 10K-line document renders without lag

---

### Phase 2: Add Yjs + WebRTC (2–3 days)

**Goal:** Two browsers editing the same document in real-time.

#### New files:
- **[NEW]** `js/collab.js` — Yjs document, WebRTC provider, room management
- **[NEW]** `js/collab-ui.js` — Presence indicators, colored cursors, user list

#### New dependencies (via CDN/ESM):
```
yjs                  ~45KB
y-webrtc             ~15KB  
y-codemirror.next    ~5KB
lib0                 ~20KB (Yjs dependency)
```

#### How it works:
1. Owner clicks **Share → Collaborate** (new mode alongside Quick Share and Secure Share)
2. A Yjs `Y.Doc` is created, bound to the CodeMirror editor
3. A `WebrtcProvider` connects to a signaling server with a room ID = document ID
4. The encryption key from the URL hash is used as the WebRTC room password
5. Collaborators open the same `#id=...&k=...` link → join the room → Yjs syncs state
6. When the last peer disconnects, the final state is auto-saved to Firebase (existing flow)

#### Signaling server options:
- **Option A:** Use the free default `y-webrtc` signaling servers (zero cost, community-run)
- **Option B:** Deploy a tiny signaling endpoint on Firebase Functions (~10 lines of code)
- **Option C:** Use Firebase Realtime Database as a signaling relay

---

### Phase 3: Presence & Cursor UI (1 day)

**Goal:** Show who's editing and where.

#### Features:
- Colored remote cursors with name labels (via `y-codemirror.next` awareness)
- User count badge on the shared banner: "2 editors"
- "User joined" / "User left" toasts
- Anonymous by default (auto-generated names like "Fox", "Owl", "Bear")

#### UI placement:
- Cursors rendered inline by CodeMirror's decoration API
- User list in the shared document banner (top of editor)

---

### Phase 4: E2E Encryption for Collab (2–3 days)

**Goal:** Ensure all WebRTC traffic is encrypted with the shared key.

#### Approach:
- Yjs syncs binary update messages between peers
- Wrap the `y-webrtc` provider's `broadcastMessage` with AES-GCM encrypt/decrypt
- The key is derived from the URL hash `k=` parameter (never sent to any server)
- Signaling server only sees encrypted room join requests + ICE candidates

#### Encryption flow:
```
Editor change → Yjs update (binary) → AES-GCM encrypt → WebRTC send
                                                            ↓
WebRTC receive → AES-GCM decrypt → Yjs apply update → Editor update
```

---

### Phase 5: Adapt Existing Features (3–5 days)

**Goal:** Make all TextAgent features work with the new editor and collab.

| Feature | Adaptation needed |
|---------|-------------------|
| Templates | Insert via CM6 transaction instead of `.value =` |
| DocGen tags | Replace output insertion to use CM6 dispatch |
| AI Assistant | Text insertion at cursor via CM6 |
| Speech-to-Text | Same — insert via CM6 |
| Find & Replace | Use CM6's built-in search extension |
| Word Wrap | CM6 `EditorView.lineWrapping` extension |
| Zen / Focus mode | Style adjustments for CM6 container |
| Auto-save | Read from `doc.toString()` instead of `.value` |
| Import/Export | Same pattern, different read/write API |
| Executable blocks | Read code from CM6 doc |

---

### Phase 6: Testing & Edge Cases (2–3 days)

#### Scenarios to test:
- [ ] 2 users typing simultaneously in different parts of the document
- [ ] 2 users typing at the exact same position (conflict resolution)
- [ ] User disconnects and reconnects (state should sync)
- [ ] User joins after the document has been edited (full state sync)
- [ ] Large document (10K+ lines) — performance
- [ ] Mobile browser support (WebRTC on iOS Safari)
- [ ] Offline editing → reconnect → merge
- [ ] 5+ simultaneous editors (stress test)
- [ ] Encryption key mismatch (should fail gracefully)
- [ ] Browser tab close during active session

---

## Migration & Backwards Compatibility

- Existing share links (`#id=...&k=...`) continue to work as read-only snapshots
- New collab links use an additional parameter: `#id=...&k=...&collab=1`
- Users can still use Quick Share (snapshot) and Secure Share (passphrase) — collab is a third option
- The `<textarea>` fallback can be kept for browsers that don't support CodeMirror 6 (very old browsers)

---

## Cost Impact

| Item | Cost |
|------|------|
| Yjs + y-webrtc | Free (MIT license) |
| CodeMirror 6 | Free (MIT license) |
| Signaling server | Free (community servers) or ~$0/month (Firebase Functions) |
| Firebase Firestore | Existing — no change |
| **Total** | **$0** |

---

## Alternative: Lightweight "Live View" (2–3 days)

If full collab is too complex, a lighter option:

- Owner auto-saves encrypted snapshots to Firebase every 3–5 seconds
- Viewers listen via `onSnapshot()` and auto-refresh
- **One writer, many viewers** — no conflict resolution needed
- Uses 100% existing infrastructure
- Could be implemented as a stepping stone before full collab

---

## Decision Log

| Date | Decision |
|------|----------|
| 2026-03-16 | Plan created. Not yet prioritized for implementation. |
