# Calculator — Live-Expression Display + Paste-Into-Top-Line

- Top expression line now shows the **full expression** as you type — every digit, operator and bracket appears immediately (e.g. `(2+3)^4*4` is fully visible before pressing `=`)
- Bottom result line shows a **live running total** evaluated from the partial expression on every keystroke; falls back to the current operand when the partial isn't yet evaluable (half-open bracket, trailing operator)
- Pasting into the small top expression line now **replaces** that line and **evaluates immediately** — no more append-to-`0` artefact, no follow-up Enter/blur required
- `commitExprEdit` skips re-running `applyPasted` if the line already matches the latest history entry, preventing duplicate "edit" rows when the user clicks away after a paste
- Top + bottom lines stay in sync through paste, button input, keyboard input, and history-row edits

---

## Summary
Two small but visible behaviour changes to the Tools → Calculator template that ship as a single `html-autorun` edit:

1. **Live expression on the top line.** Previously the small dim line above the result only showed the *committed chain* (e.g. `(2+3)^4*` while the user was typing `4`). It now shows the entire expression including the current operand (`(2+3)^4*4`), matching how an iOS-style calculator would render a complete typed expression before `=` is pressed. The bottom big line continues to show a live partial-evaluation result.

2. **Paste into the small top line.** Pasting a full expression like `(2+3)^4*4` directly onto the small expression line now evaluates instantly. The previous handler concatenated pasted text onto whatever was rendered there (often `"0"`), producing `"0(2+3)^4*4"` → `Error`. Paste is now treated as a complete replacement and routed straight to `applyPasted` (same code path as paste-into-result and the keyboard Enter handler).

---

## 1. Live Expression Display
**Files:** `js/templates/tools.js`
**What:** Collapsed the `pending` and "typing an operand" branches of `show()` into a single branch that writes `chain.join('') + (pending ? '' : cur)` to the top line. The bottom line shows `safeEval(partial)` where `partial` is `chain.slice(0,-1).join('')` when an operator is pending, otherwise the full `topExpr` itself — giving a live partial result on every keystroke.
**Impact:** Users see the full expression they are typing, matching the iOS Calculator visual model. Bug squashed: previously the top line "lost" the current operand whenever a digit was typed (because `chain.join('')` excluded it).

## 2. Paste-Into-Expression-Line Fix
**Files:** `js/templates/tools.js`
**What:** The `exprLine.addEventListener('paste', …)` handler used to write `(exprLine.textContent || '').replace(/=\s*$/, '') + txt` into the DOM and rely on a later blur to commit. That concatenated the pasted text onto the initial-state `"0"` (since `show()` had set the line to the running expression). Replaced with `applyPasted(txt); exprLine.blur()` — the pasted clipboard text is routed straight to the safe evaluator, in line with how the bottom result line already handled paste.
**Impact:** Paste a complete expression into the small expression line and it evaluates instantly (`(2+3)^4*4` → top `(2+3)^4*4 =`, bottom `2500`). Whitespace, commas and unicode operators (`×`, `÷`, `−`) are normalised via the same `normalize()` call. Unsafe inputs (e.g. `alert(1)`) still get rejected as `Error` by the existing strict allowlist.

## 3. Blur Dedup
**Files:** `js/templates/tools.js`
**What:** `commitExprEdit()` now early-returns when the line's trimmed text already equals the most recent history entry's `expr`. This prevents the post-paste blur from re-running `applyPasted` and creating a duplicate history row (paste → display shows `"expr ="` → user clicks elsewhere → blur fires → re-evaluate that same `"expr"`).
**Impact:** History stays clean — one entry per logical calculation, not one per paste + one per blur.

---

## Files Changed (1 total)

| File | Lines Changed | Type |
|------|:---:|------|
| `js/templates/tools.js` | +17 −16 | `show()` simplification + paste-replaces-line + blur dedup |
