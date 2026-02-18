# Diversity-Aware Randomization

> Technical reference for the sliding-window exclusion algorithm that powers the "Randomize" button across the wizard and Quick Mode.

## Problem

Naive `Math.random()` selection from a small pool (8-10 suggestions per field) frequently repeats the same value on consecutive clicks. Users perceive this as broken — "I clicked randomize three times and got the same thing twice."

## Solution: Sliding-Window Exclusion

Instead of picking uniformly from the full pool every time, we maintain a **recent window** per field and exclude those items from the candidate pool. When the window fills up, the oldest entry drops off — guaranteeing every option eventually becomes available again.

```
Window size: 3 (configurable, default 5)
Pool: [A, B, C, D, E]

Click 1  recent=[]           candidates=[A,B,C,D,E]  → picks C  → recent=[C]
Click 2  recent=[C]          candidates=[A,B,D,E]    → picks A  → recent=[C,A]
Click 3  recent=[C,A]        candidates=[B,D,E]      → picks E  → recent=[C,A,E]
Click 4  recent=[C,A,E]      candidates=[B,D]        → picks D  → recent=[A,E,D]  ← C drops off
Click 5  recent=[A,E,D]      candidates=[B,C]        → picks B  → recent=[E,D,B]  ← A drops off
Click 6  recent=[E,D,B]      candidates=[A,C]        → picks C  → recent=[D,B,C]  ← C is fresh again
```

### Graceful Degradation

When the pool is smaller than or equal to the window (e.g., a field with only 2 suggestions), **every** option would be excluded. The algorithm detects this — if the filtered candidate pool is empty, it falls back to uniform random over the full pool. This means:

- The algorithm **never deadlocks**, regardless of pool size vs. window size
- Small pools still get randomized (just with possible repeats)
- No special-casing needed at the call site

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Layer 1: Pure Algorithm                                         │
│  web/src/lib/diverse-pick.ts                                     │
│                                                                  │
│  diversePick(options, recent) → T                                │
│  pushRecent(recent, value, maxSize) → T[]                        │
│                                                                  │
│  Zero dependencies. Works with any equatable type.               │
│  Exported types: PickableField, PickableCategory                 │
├──────────────────────────────────────────────────────────────────┤
│  Layer 2: Composition                                            │
│  web/src/lib/diverse-pick.ts                                     │
│                                                                  │
│  buildRandomPrompt(categories, picker) → Record<string, ...>     │
│  flattenPromptToText(prompt) → string                            │
│                                                                  │
│  Composes the picker across all 13 categories.                   │
│  Key derivation: output keys come from field key prefixes        │
│  (e.g. "subject.description" → "subject"), NOT category.id.     │
│  This handles the data model vs. UI label divergence             │
│  (e.g. category id="setting" but fields use "environment.*").    │
├──────────────────────────────────────────────────────────────────┤
│  Layer 3: React Binding                                          │
│  web/src/hooks/useDiversePick.ts                                 │
│                                                                  │
│  useDiversePick<T>(windowSize?) → (fieldKey, options) => T       │
│                                                                  │
│  Thin hook: useRef<Map<string, T[]>> for per-field tracking.     │
│  Generic over T (default string). Stable callback via useCallback│
├──────────────────────────────────────────────────────────────────┤
│  Layer 4: Integration                                            │
│                                                                  │
│  WizardStep.tsx     — Per-field randomize button                 │
│  Quick Mode page    — Full-prompt randomization via              │
│                       buildRandomPrompt + hook picker            │
│                                                                  │
│  Both use the identical algorithm. Zero duplication.             │
└──────────────────────────────────────────────────────────────────┘
```

## API Reference

### `diversePick<T>(options, recent): T`

Pick a random item from `options`, excluding items in `recent`. Falls back to the full pool when all options are exhausted.

| Param | Type | Description |
|-------|------|-------------|
| `options` | `readonly T[]` | Available items (must be non-empty — throws otherwise) |
| `recent` | `readonly T[]` | Items to exclude from candidates |
| **Returns** | `T` | A randomly selected item |

**Throws:** `Error` if `options` is empty.

### `pushRecent<T>(recent, value, maxSize?): T[]`

Append `value` to `recent` and trim to `maxSize`. Returns a new array (immutable — never mutates the input).

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `recent` | `readonly T[]` | — | Current window |
| `value` | `T` | — | Value to append |
| `maxSize` | `number` | `5` | Maximum window size |
| **Returns** | `T[]` | — | New array, trimmed from the front |

### `buildRandomPrompt(categories, picker): Record<string, Record<string, string>>`

Iterate all categories and fields, calling `picker(fieldKey, suggestions)` for each. Returns a nested record keyed by derived category name.

**Key derivation rule:** The output key for each category is the first segment of its first field's key (e.g., `"subject.description"` → `"subject"`). Falls back to `category.id` only when the category has zero fields.

### `flattenPromptToText(prompt): string`

Flatten the nested record into a comma-separated string. Skips empty values.

### `useDiversePick<T>(windowSize?): (fieldKey, options) => T`

React hook returning a stable picker function. Tracks recent picks per `fieldKey` in a `useRef` map — survives re-renders without triggering them.

## Invariants (Proven by Tests)

The test suite (`web/src/lib/diverse-pick.test.ts`, 35 tests) proves these properties:

| # | Property | What breaks if violated |
|---|----------|------------------------|
| 1 | **Exclusion correctness** — items in `recent` are never picked when alternatives exist | Users see immediate repeats |
| 2 | **Graceful degradation** — empty candidate pool falls back to full pool | Algorithm deadlocks on small fields |
| 3 | **Type generality** — works with strings, numbers, frozen `readonly` arrays | Can't use with non-string suggestion types |
| 4 | **Statistical diversity** — 100 picks from 5 options yields ≥3 distinct values | Single value dominates despite large pool |
| 5 | **Immutability** — `pushRecent` never mutates input; returns new array | Shared state corruption across components |
| 6 | **Window sliding** — trims oldest entries first, preserves most recent | Window grows unbounded or drops wrong items |
| 7 | **Integration** — 12-round sequence with window=3 has no triple repeats | Algorithm layers don't compose correctly |
| 8 | **Key derivation** — output keys come from field prefixes, not category IDs | Prompt data model diverges from wizard structure |
| 9 | **Round-trip fidelity** — `build → flatten` preserves all non-empty values including unicode | Prompt assembly silently drops user data |

## Design Decisions

**Why a sliding window instead of a shuffle?**
Fisher-Yates shuffle guarantees every item appears before any repeats — but it requires tracking position through the full permutation. The sliding window is simpler (3 lines of core logic), composable (works identically for single-field clicks and full-prompt randomization), and the "no recent repeats" guarantee is perceptually equivalent for 8-10 suggestion pools.

**Why `Set`-based exclusion instead of index tracking?**
`diversePick` uses `new Set(recent)` for O(1) lookups during filtering. For pools of 8-10 items this is marginal, but it keeps the algorithm correct for arbitrarily large pools without changing the implementation.

**Why derive keys from field prefixes instead of category IDs?**
The wizard's data model uses dot-notation keys like `"environment.location"` — the first segment maps to the `ImagePrompt` type tree. Category IDs are UI labels (`"setting"`, `"technical"`) that don't always match. Deriving from field keys keeps the output aligned with the data model, not the UI.

**Why `DEFAULT_RECENT_WINDOW = 5`?**
Most fields have 8-10 suggestions. A window of 5 excludes roughly half the pool, which maximizes perceived variety while still allowing the algorithm to find candidates quickly. Window size is configurable per hook instance if a different trade-off is needed.
