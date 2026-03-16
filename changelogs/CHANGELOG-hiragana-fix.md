# Changelog — Hiragana Quiz & Kana Master Game Fixes

## Bug Fix (2026-03-16)

### Fixed
- **Hiragana Quiz not loading** — the prebuilt game showed a black screen when clicking Play because the closing `</script>` tag was double-escaped (`<\\/script>` instead of `<\/script>`), preventing the browser from recognizing it as a valid script terminator
- **Kana Master hearts not rendering** — the ♥ heart symbols were stored as double-escaped unicode (`\\u2665`) which rendered as literal text instead of the heart character
- **Kana Master celebration emoji broken** — the 🎌 flag emoji on the win screen was double-escaped (`\\ud83c\\udf8c`) and displayed as literal escape sequences instead of the emoji

### Files Modified
- `js/game-prebuilts.js` — fixed 3 escaping issues (line 784: script tag, line 828: hearts, line 832: flag emoji)
