---
description: How to commit and push code changes with a detailed changelog
---

// turbo-all

## Steps

1. Run `git status --short` in the project root to see all changed files.

2. Create a `CHANGELOG-<topic>.md` file in the project root. The changelog MUST follow this two-part format:

### Part 1: Quick-Read Bullet List (at the top)
A flat list of every change made, one bullet per change. This is for fast scanning. No headers, no grouping — just bullets.

```markdown
# <Title> — <Short Description>

- <change 1>
- <change 2>
- <change 3>
- Fixed: <bug fix 1>
- Fixed: <bug fix 2>
```

**Rules for the bullet list:**
- One bullet per discrete change (not per file)
- Be specific — say what was changed, not just "updated X"
- Prefix bug fixes with `Fixed:`
- Include technical details where helpful (CSS properties, px values, function names)
- This section should be readable in 30 seconds

### Part 2: Detailed Sections (after a `---` divider)

```markdown
---

## Summary
<1-2 sentence overview of the change and its purpose>

---

## 1. <Feature/Fix Name>
**Files:** `<file1>`, `<file2>`
**What:** <Describe the specific technical change made>
**Impact:** <Describe the user-visible or architectural impact>

## 2. <Feature/Fix Name>
**Files:** `<file3>`
**What:** <Describe the specific technical change made>
**Impact:** <Describe the user-visible or architectural impact>

---

## Files Changed (N total)

| File | Lines Changed | Type |
|------|:---:|------|
| `<file>` | +X −Y | <Brief description> |
```

**Rules for detailed sections:**
- Every feature/fix gets its own numbered section
- Each section MUST list the specific files changed (`**Files:**`)
- Each section MUST describe what changed (`**What:**`) and why it matters (`**Impact:**`)
- Include a summary table at the bottom listing ALL files with approximate line counts
- Use clear, specific language — avoid vague descriptions

3. Stage the changelog and all changed files:
```
git add CHANGELOG-<topic>.md <files...>
```

4. Commit with a descriptive message following conventional commits format:
```
git commit -m "feat|fix|refactor|chore: <short description>

<bullet list of key changes>"
```

5. Push to origin:
```
git push origin main
```
