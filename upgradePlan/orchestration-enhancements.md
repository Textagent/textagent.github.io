# TextAgent Orchestration Enhancements

Add advanced execution flow control to TextAgent's block execution engine — parallel execution, conditional branching, loops, and event triggers.

## Current Architecture

TextAgent's execution engine has 3 layers:
- [exec-registry.js](file:///Users/jyotibose/textagent.github.io/js/exec-registry.js) — Scans document, assigns stable IDs, maintains block list
- [run-requirements.js](file:///Users/jyotibose/textagent.github.io/js/run-requirements.js) — 6-pass compiler: scan → enrich → resolve → validate → model plan → summarize
- [exec-controller.js](file:///Users/jyotibose/textagent.github.io/js/exec-controller.js) — Sequential top-to-bottom execution loop with events, abort, progress UI

Current execution is a **flat sequential `for` loop** over document-ordered blocks. Variables flow via `M._vars` (set/get) and `M._execContext`.

## User Review Required

> [!IMPORTANT]
> **Scope Decision**: These are 4 independent features of increasing complexity. I recommend implementing them **one phase at a time**, starting with Phase 1 (Parallel) which has the highest impact-to-effort ratio.
>
> **Which phases do you want to build?**
> 1. ✅ Parallel execution only (quickest win)
> 2. ✅ Parallel + Conditional (solid workflow upgrade)
> 3. ✅ Parallel + Conditional + Loops (full pipeline control)
> 4. ✅ All four (complete orchestration OS)

> [!WARNING]
> **Syntax choice**: The proposed syntax uses annotations inside code block headers and markdown comments. This avoids breaking existing templates. However, if you prefer a different syntax (e.g., new DocGen tags like `{{@If:}}`), we should decide before implementation.

---

## Proposed Changes

### Phase 1: Parallel Block Execution

Users can group blocks that run concurrently using `@parallel` annotations.

**Syntax:**
```markdown
<!-- @parallel: group1 -->
```python @var: data1
fetch_data("source_a")
```

```python @var: data2
fetch_data("source_b")
```
<!-- @/parallel -->

```python
# This runs after both data1 and data2 are ready
combine($(data1), $(data2))
```
```

#### [MODIFY] [exec-registry.js](file:///Users/jyotibose/textagent.github.io/js/exec-registry.js)
- Add `scanParallelGroups(markdown)` — detect `<!-- @parallel: name -->` / `<!-- @/parallel -->` comment pairs
- Tag blocks with `_parallelGroup` property when they fall inside a parallel region
- Add `_parallelGroupId` for barrier synchronization

#### [MODIFY] [exec-controller.js](file:///Users/jyotibose/textagent.github.io/js/exec-controller.js)
- Replace flat `for` loop in `executeBlocks()` with a group-aware scheduler:
  - Blocks without `_parallelGroup` → sequential (current behavior)
  - Blocks with same `_parallelGroup` → `Promise.all()` concurrent execution
  - After parallel group completes → continue sequential flow
- Update progress bar to show "Running 3 blocks in parallel" when applicable
- Ensure variable writes from parallel blocks are safe (they write to different vars)

#### [MODIFY] [run-requirements.js](file:///Users/jyotibose/textagent.github.io/js/run-requirements.js)
- **Pass 2 (Enrich)**: Detect and label parallel groups
- **Pass 4 (Validate)**: Error if two parallel blocks write the same `@var:` name
- **Pass 4 (Validate)**: Error if a parallel block reads a var produced by a block in the same parallel group
- Display parallel group info in preflight dialog

---

### Phase 2: Conditional Branching

Blocks can be conditionally skipped based on variable values.

**Syntax:**
```markdown
```python @var: sentiment
analyze_sentiment($(text))
```

<!-- @if: $(sentiment) == "positive" -->
{{AI: Write a congratulations message about: $(text) @var: response}}
<!-- @else -->
{{AI: Write an empathetic message about: $(text) @var: response}}
<!-- @/if -->
```

#### [NEW] [exec-flow.js](file:///Users/jyotibose/textagent.github.io/js/exec-flow.js)
- New module (~150 lines) for flow control evaluation
- `evaluateCondition(expr, vars)` — evaluates simple conditions:
  - String equality: `$(var) == "value"`
  - Truthiness: `$(var)` (truthy if non-empty)
  - Negation: `!$(var)`
  - Contains: `$(var) contains "word"`
  - Numeric comparisons: `$(var) > 5`
- Export on `M._execFlow`

#### [MODIFY] [exec-registry.js](file:///Users/jyotibose/textagent.github.io/js/exec-registry.js)
- Detect `<!-- @if: condition -->`, `<!-- @else -->`, `<!-- @/if -->` comment markers
- Tag blocks with `_ifCondition`, `_ifBranch` ("then" / "else"), `_ifGroupId`

#### [MODIFY] [exec-controller.js](file:///Users/jyotibose/textagent.github.io/js/exec-controller.js)
- Before each block: if it has `_ifCondition`, evaluate it using current vars
- Skip blocks in the wrong branch
- Update block status UI to show "⏭ Skipped (condition false)"

#### [MODIFY] [run-requirements.js](file:///Users/jyotibose/textagent.github.io/js/run-requirements.js)
- Validate `@if` blocks have matching `@/if`
- Show conditional branches in preflight dialog

---

### Phase 3: Loop / Iteration

Repeat blocks for each item in a list variable.

**Syntax:**
```markdown
```python @var: items
["apple", "banana", "cherry"]
```

<!-- @each: $(items) as item -->
{{AI: Write a haiku about $(item) @var: haiku_$(item)}}
<!-- @/each -->
```

#### [MODIFY] [exec-flow.js](file:///Users/jyotibose/textagent.github.io/js/exec-flow.js)
- Add `parseList(value)` — parse JSON array or newline-separated list from var
- Add `expandEachBlock(block, items)` — create N copies of block, each with `$(item)` bound

#### [MODIFY] [exec-registry.js](file:///Users/jyotibose/textagent.github.io/js/exec-registry.js)
- Detect `<!-- @each: $(var) as item -->` / `<!-- @/each -->`
- Tag blocks with `_eachSource`, `_eachAlias`, `_eachGroupId`

#### [MODIFY] [exec-controller.js](file:///Users/jyotibose/textagent.github.io/js/exec-controller.js)
- When hitting an `@each` group: resolve the list var, expand blocks, execute sequentially (or parallel if nested in `@parallel`)
- Dynamically update progress total when loops expand

#### [MODIFY] [run-requirements.js](file:///Users/jyotibose/textagent.github.io/js/run-requirements.js)
- Warn if `@each` source var isn't produced by an earlier block
- Show loop info in preflight

---

### Phase 4: Event-Driven Triggers

Blocks that react to other blocks completing (for reactive pipelines).

**Syntax:**
```markdown
```python @var: data
fetch_data()
```

<!-- @on: data -->
{{AI: Summarize this data: $(data) @var: summary}}
<!-- @/on -->

<!-- @on: summary -->
{{TTS: $(summary)}}
<!-- @/on -->
```

#### [MODIFY] [exec-flow.js](file:///Users/jyotibose/textagent.github.io/js/exec-flow.js)
- Add event trigger registry: `_onTriggers[varName] → [blockGroup]`
- Integration with existing event emitter in exec-controller

#### [MODIFY] [exec-registry.js](file:///Users/jyotibose/textagent.github.io/js/exec-registry.js)
- Detect `<!-- @on: varName -->` / `<!-- @/on -->`
- Tag blocks with `_onTrigger`, `_onGroupId`

#### [MODIFY] [exec-controller.js](file:///Users/jyotibose/textagent.github.io/js/exec-controller.js)
- After each block sets a variable, check if any `@on` blocks are triggered
- Execute triggered blocks asynchronously (fire-and-forget or awaited based on config)


---

## Verification Plan

### Automated Tests

Extend existing [exec-engine.spec.js](file:///Users/jyotibose/textagent.github.io/tests/feature/exec-engine.spec.js) Playwright tests.

**Run command:**
```bash
cd /Users/jyotibose/textagent.github.io && npx playwright test tests/feature/exec-engine.spec.js
```

**New test cases per phase:**

| Phase | Test | Description |
|-------|------|-------------|
| 1 | `parallel annotation scanning` | Registry detects `@parallel` comments and tags blocks |
| 1 | `parallel execution completes` | Two math blocks in `@parallel` produce results faster than sequential |
| 1 | `parallel var conflict detected` | Compiler errors on two parallel blocks writing same var |
| 2 | `if/else scanning` | Registry detects `@if`/`@else`/`@/if` markers |
| 2 | `condition evaluation` | `exec-flow.js` evaluates equality, truthiness, negation |
| 2 | `conditional skip` | Blocks in wrong branch show "Skipped" status |
| 3 | `each scanning` | Registry detects `@each` markers |
| 3 | `loop expansion` | 3-item list produces 3 block executions |
| 4 | `on trigger scanning` | Registry detects `@on` markers |
| 4 | `event trigger fires` | Block runs when its trigger var is set |

### Manual Verification

1. Open TextAgent at `http://localhost:5174`
2. Load a template with `@parallel` blocks and click "Run All"
3. Verify progress bar shows "Running N blocks in parallel"
4. Confirm both blocks produce results and downstream block receives both vars
