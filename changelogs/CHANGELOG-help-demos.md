# Help Mode & Feature Demos — Screenshots, Demos & Button Coverage

- Added 6 new demo recordings: Workspace Sidebar (19), Context Memory (20), Help Mode (21), Email to Self (22), Disk Workspace (23), API & Linux Tags (24)
- Added 4 new static screenshots: Context Memory, Help Mode, API/Linux Tags, Email to Self
- Added 12 new Help Mode button entries: Memory Tag, File Tree, C++/Rust/Go/Java Compile, Bash/Math/Python/HTML/JS/SQL coding blocks
- Updated API GET, API POST, and Linux help entries to point to dedicated `24_api_linux_tags.png` demo
- Updated Share button help to point to `22_email_to_self.webp` (covers share + email flow)
- Expanded Feature Demos DEMO_MAP from 9 → 24 entries covering all recorded demos
- Updated README with 4 new screenshots in the 📸 section and 6 new feature demos in the 🎬 section

---

## Summary
Comprehensive update to in-app Help Mode coverage, Feature Showcase demo badges, README screenshots, and feature demo recordings. Every new feature added in recent releases now has visual documentation in the README and interactive help within the app.

---

## 1. New Demo Recordings
**Files:** `public/assets/demos/19_workspace_sidebar.webp`, `20_context_memory.webp`, `21_help_mode.webp`, `22_email_to_self.webp`, `23_disk_workspace.webp`, `24_api_linux_tags.png`
**What:** Recorded 6 animated WebP demos and 1 PNG screenshot covering Workspace Sidebar (file tree, create/rename/duplicate/delete), Context Memory (Memory tag, folder attach, memory selector), Help Mode (teal highlights, popover, demo video panel), Email to Self (share modal with email input), Disk Workspace (disk controls, file switching, refresh), and API/Linux Tags (API CALL card, Linux Compile card, toolbar overflow dropdowns).
**Impact:** Visual documentation for all recently added features is now available for README and in-app help.

## 2. New Static Screenshots
**Files:** `assets/context-memory.png`, `assets/help-mode.png`, `assets/api-linux-tags.png`, `assets/email-to-self.png`
**What:** Captured high-quality PNG screenshots of Context Memory (Memory + AI Generate + Agent Flow cards), Help Mode (Bold popover with keyboard shortcut + demo video panel), API/Linux Tags (API CALL GET card + Linux Compile Python card), and Email to Self (encrypted link + email input modal).
**Impact:** README Screenshots section now covers 10 features instead of 6.

## 3. Help Mode Button Coverage
**Files:** `js/help-mode.js`
**What:** Added 12 new HELP_DATA entries for buttons that previously had no help popover: Memory Tag, File Tree (#qab-files), C++ Compile, Rust Compile, Go Compile, Java Compile, Bash/Math/Python/HTML/JS/SQL coding blocks. Updated 4 existing entries: API GET/POST and Linux now point to `24_api_linux_tags.png`, Share now points to `22_email_to_self.webp`.
**Impact:** Clicking ❓ Help now provides help popovers with correct descriptions and Watch Demo buttons for every toolbar button.

## 4. Feature Demos DEMO_MAP Expansion
**Files:** `js/feature-demos.js`
**What:** Expanded DEMO_MAP from 9 entries (demos 01–09) to 24 entries (demos 01–24). Added keyword-to-demo mappings for formatting toolbar, AI model selector, sync scrolling, TOC, voice dictation, AI doc tags, template variables, agent flow, compile & run, workspace sidebar, context memory, help mode, email to self, disk workspace, and API calls.
**Impact:** Feature Showcase template headings for all features now show ▶ Demo badges with clickable fullscreen video modals.

## 5. README Updates
**Files:** `README.md`
**What:** Added 4 new screenshots (Context Memory, Help Mode, API/Linux, Email to Self) in the 📸 section. Added 6 new `<details open>` feature demo sections (19–24) in the 🎬 section with descriptive titles, descriptions, and embedded demo images.
**Impact:** README now has 10 screenshots and 24 feature demos, covering every major feature.

---

## Files Changed (14 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `README.md` | +75 −2 | New screenshots + feature demo sections |
| `js/help-mode.js` | +87 −4 | 12 new + 4 updated help entries |
| `js/feature-demos.js` | +15 −0 | 15 new DEMO_MAP entries |
| `css/editor.css` | +5 −0 | Minor style fix |
| `assets/context-memory.png` | new | Static screenshot |
| `assets/help-mode.png` | new | Static screenshot |
| `assets/api-linux-tags.png` | new | Static screenshot |
| `assets/email-to-self.png` | new | Static screenshot |
| `public/assets/demos/19_workspace_sidebar.webp` | new | Animated demo |
| `public/assets/demos/20_context_memory.webp` | new | Animated demo |
| `public/assets/demos/21_help_mode.webp` | new | Animated demo |
| `public/assets/demos/22_email_to_self.webp` | new | Animated demo |
| `public/assets/demos/23_disk_workspace.webp` | new | Animated demo |
| `public/assets/demos/24_api_linux_tags.png` | new | Static demo screenshot |
