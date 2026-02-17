# Changelog

## [0.7.3] - 2026-02-17

### Changed
- Added "Data Pipeline" section to README documenting the 6 scripts that refresh and expand the prompt library (fetch → translate → extract → generate → update)
- Credited second prompt source `@YouMind-OpenLab/awesome-nano-banana-pro-prompts` (5,600+ prompts) — was previously undocumented
- Expanded multi-model table with per-model behavioral notes: DALL-E 3's revised-prompt feature, Kling's two-phase async polling architecture
- Updated Inspiration Gallery section with concrete numbers: 240 patterns across 5 categories, Showcase page with 13-category breakdowns
- Added `useInspirationData` hook to project structure (lazy-loading data layer for all prompt files)
- Expanded sound system description: 5 named sounds, off by default, opt-in, persisted preference
- Added Data Pipeline link to table of contents

## [0.7.2] - 2026-02-17

### Changed
- Added "Engineering Highlights" section to README — showcases technical decisions (zero-`any` types, composable pipeline, diversity-aware randomization, centralized validation, data-driven parsing, test invariants) with rationale for each
- Added "Diversity-Aware Randomization" and "Input Validation & Sanitization" architecture subsections documenting the sliding-window algorithm and centralized validation layer
- Updated project structure tree to reflect new files: `diverse-pick.ts`, `validation.ts`, `useDiversePick.ts`, `usePatterns.ts`
- Added 2 new Challenges & Solutions entries: randomize repetition fix and type safety at serialization boundaries
- Added "Zero Any" and "Assertions: 1,458" badges to header badge row

## [0.7.1] - 2026-02-17

### Security
- Added 7 HTTP security headers to all Next.js routes via `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `X-XSS-Protection`, `X-DNS-Prefetch-Control`
- Sanitized upstream API error responses in all 3 generation routes (nano-banana, openai, kling) — error messages from third-party APIs are no longer forwarded to the client, preventing info leakage of internal hostnames, request IDs, and API internals
- Added `.catch()` guards on all upstream `response.json()` error parsing to prevent unhandled exceptions when APIs return non-JSON error bodies
- Mapped upstream HTTP status codes to generic client-facing messages (401 → invalid key, 429 → rate limited, other → upstream failure)
- Audited npm dependencies: 0 vulnerabilities in `web/` (root has no lockfile — CLI uses Bun)
- Reviewed CLI arg parsing and API input validation — existing `validation.ts` sanitization (length limits, control char stripping, API key format regex) is solid, no injection vectors found

## [0.7.0] - 2026-02-16

### Changed
- Extracted `diversePick` pure function and `pushRecent` helper into `web/src/lib/diverse-pick.ts` — diversity-aware random selection with sliding-window recent exclusion
- Created `useDiversePick` React hook (`web/src/hooks/useDiversePick.ts`) wrapping the pure function with per-field-key recent tracking via `useRef`
- Refactored `WizardStep.tsx` randomize handler to use `useDiversePick` instead of naive `Math.random()` — consecutive clicks now cycle through varied suggestions
- Refactored Quick Mode `handleRandomize` to use `useDiversePick` — full-prompt randomization avoids repeating the same suggestion per field across clicks

## [0.6.0] - 2026-02-16

### Changed
- Eliminated all `any` types from `cleanObject` in `src/generators/json.ts` — replaced with `unknown` for full type safety at the serialization boundary
- Unified `generateJSON` and `generateCompactJSON` into a single `generateJSON(prompt, compact?)` API — `generateCompactJSON` is kept as a deprecated re-export for backward compatibility
- Replaced 5-branch `else if` preset parsing chain in `src/cli/args.ts` with a data-driven `PRESET_FLAGS` lookup map — adding new presets is now a one-line change
- Removed dead `presetFlags` array from `args.ts` (declared but never referenced)

## [0.5.4] - 2026-02-16

### Changed
- Upgraded README to portfolio-grade with table of contents for quick navigation
- Added "How It Works" 3-step visual flow diagram for instant comprehension of the product
- Promoted Quick Mode feature to prominent callout (was previously undocumented in README)
- Updated testing section to reflect 327 tests across 15 test files (was stale at 303/14)
- Added cross-cutting invariants row to test table (24 tests were missing from the table)
- Wrapped Project Structure and Challenges & Solutions in collapsible `<details>` sections to reduce scroll fatigue
- Added author attribution link in footer
- Added showcase count detail (30 hand-picked + 113 AI-generated)

## [0.5.3] - 2026-02-16

### Added
- Cross-cutting test suite (`src/cross-cutting.test.ts`) — 24 tests covering cross-format consistency (NL vs JSON generators stay in sync on the same ImagePrompt), cleanObject edge cases (nested array filtering, deep empty object collapse, falsy value preservation), PROMPT_SECTIONS pipeline invariants (purity, return type contracts, fragment validation), and parseArgs boundary conditions (missing flag values, unknown flags, trailing commas)
- Documents intentional asymmetry: `semantic_negatives` is JSON-only, no NL section handles it
- Total tests: 327 (up from 303)

## [0.5.2] - 2026-02-16

### Added
- Template-through-pipeline integration tests (`src/core/templates.test.ts`) — 36 tests verifying every built-in template produces valid natural language and JSON output, vibes survive the pipeline, deep nested fields survive cleanObject, template merging with user data works correctly, and template data integrity (slug format, description length, aspect ratio consistency)
- Total tests: 303 (up from 267)

## [0.5.1] - 2026-02-16

### Fixed
- Widened `getNestedValue` type signature to accept `null | undefined` roots without throwing — matches runtime behavior that the function already handled safely
- Recovered 6 edge-case tests from failed agent branch (`passion/tests-diversity-picked-tests-mlofibhk`) that targeted the wrong file path after a refactor moved `setNestedValue`/`getNestedValue` to `lib/nested.ts`

### Added
- Tests for null/undefined root objects, falsy value preservation (`''`, `0`, `false`), in-place intermediate mutation, independent branch isolation, and a full wizard simulation roundtrip (267 total tests, up from 261)

## [0.5.0] - 2026-02-15

### Changed
- Converted `showPostGenerationMenu` from unbounded recursion to iterative `while` loop — eliminates stack overflow risk in long sessions with repeated copy/save actions
- Replaced 5 duplicated `p.cancel('Cancelled'); process.exit(0)` blocks in `prompts.ts` with a single `exitIfCancelled` assertion function that also provides TypeScript type narrowing
- Extracted `getNestedValue`/`setNestedValue` from `prompts.ts` into shared `src/lib/nested.ts` with proper `Record<string, unknown>` typing (replaced `any`), added guard against primitive intermediates in `setNestedValue`

### Added
- Unit tests for `getNestedValue` and `setNestedValue` (`src/lib/nested.test.ts`) — 13 tests covering dot-notation traversal, missing paths, null traversal, intermediate creation, sibling preservation, and primitive-to-object overwrite

## [0.4.5] - 2026-02-15

### Added
- API reference documentation (`docs/API.md`) covering all three generation endpoints (Nano Banana, DALL-E 3, Kling) with request/response schemas, validation rules, error codes, and rate limiting behavior
- Full CLI command reference with all flags, shortcuts, and usage examples
- Validation rules table documenting prompt length limits, control character stripping, and API key format requirements
- Documentation section in README linking to API reference and contributing guide

## [0.4.4] - 2026-02-15

### Changed
- Redesigned README as a portfolio-grade landing page with centered hero section, test count badge, and "Why This Exists" value proposition
- Added Quick Start section for instant onboarding (clone → run in 2 commands)
- Replaced ASCII architecture diagrams with Mermaid flowcharts (renders natively on GitHub)
- Restructured testing section as a scannable table with per-module test counts
- Converted Challenges & Solutions from prose paragraphs to a comparison table
- Promoted Privacy & Security to its own top-level section
- Added back-to-top navigation link and centered footer

## [0.4.3] - 2026-02-15

### Added
- Unit tests for category data integrity (`src/core/categories.test.ts`) — 16 tests validating all 13 categories are in `allCategories` and `categoryMap`, unique names and emojis, field key dot-notation validity, no duplicate keys across categories, non-empty suggestions, and core category prompt_type/subject.description presence
- Unit tests for display text wrapping (`src/cli/display.test.ts`) — 11 tests covering word-boundary wrapping, exact-width boundaries, long words exceeding width, unicode wrapping, empty input, and displayOutput integration via console capture
- Unit tests for Gemini analyzer error paths and parsing (`src/analyzer/gemini.test.ts`) — 14 tests covering missing API key error, missing file error, JSON markdown fence stripping (`\`\`\`json` and plain `\`\`\``), MIME type detection for all 5 supported formats plus fallback, and documents a known limitation where triple backticks inside JSON string values get silently stripped

## [0.4.2] - 2026-02-14

### Added
- Unit tests for all 13 section generator functions (`src/generators/sections.test.ts`) — 56 tests covering empty inputs, partial data, deduplication logic (hair style vs structure), action/body_position precedence, accessory field filtering, film texture date_stamp "none" exclusion, vibes formatting tiers (1/2/3+/4+), and PROMPT_SECTIONS pipeline order verification

## [0.4.1] - 2026-02-14

### Added
- Comprehensive TSDoc for the entire `ImagePrompt` type tree (`src/types/prompt.ts`) — every interface and field now has descriptions, examples, and cross-references
- JSDoc for all 13 section generators in `sections.ts` — documents output format, precedence rules, and edge cases
- JSDoc for `generateNaturalLanguage`, `generateJSON`, `generateCompactJSON`, and `cleanObject` with `@example` blocks and `{@link}` references
- Architecture note in README referencing inline documentation

## [0.4.0] - 2026-02-14

### Changed
- Extracted generic `useLocalStorage<T>` hook (`web/src/hooks/useLocalStorage.ts`) — typed, SSR-safe localStorage sync with cross-tab updates via `StorageEvent`
- Refactored `useFavorites` to use `useLocalStorage` — eliminated manual load/save boilerplate, fixed stale-closure bug in `toggleFavorite` by making it atomic
- Refactored `useFreeTier` to use `useLocalStorage` — removed standalone `getStoredUsage`/`saveUsage` functions, reduced from 86 to 52 lines

## [0.3.2] - 2026-02-13

### Added
- Unit tests for `JsonStore` (`src/lib/json-store.test.ts`) — 11 tests covering load defaults, deep-clone isolation, save/overwrite, roundtripping complex structures, exists check, and ensureDir callback
- Unit tests for packs and templates (`src/core/core.test.ts`) — 18 tests covering pack composition, preset expansion, deduplication, always-include-core invariant, full-coverage assertion, template integrity, unique names, and listing API surface

## [0.3.1] - 2026-02-13

### Fixed
- Fixed Passion Agent failures caused by hardcoded hook paths in `~/.claude/settings.json` — replaced `/Users/t./` with `$HOME` so hooks resolve correctly on both MacBook Pro and Mac Mini
- Root-caused 6 consecutive agent failures: SessionEnd hook `session-auto-save.mjs` couldn't be found on Mac Mini (user `tdot`) because paths were synced from MacBook Pro (user `t.`) via Syncthing

### Added
- Unit tests for CLI argument parser (`src/cli/args.test.ts`) — 22 tests covering all 15 flag branches, shorthand aliases, pack comma-splitting, favorites subcommands, and combined flag handling

## [0.3.0] - 2026-02-12

### Changed
- Extracted generic `JsonStore<T>` class into `src/lib/json-store.ts` to eliminate duplicated load/save boilerplate across storage modules
- Refactored `config.ts`, `favorites.ts`, and `presets.ts` to use `JsonStore` — reduced combined storage code by ~30% (52 deletions, 35 insertions)
- `presets.ts` uses a `storeFor(name)` factory pattern for its directory-backed collection
- Deep-clones default values to prevent shared-reference mutation bugs

## [0.2.3] - 2026-02-12

### Security
- Added centralized input validation and sanitization for all API routes (nano-banana, openai, kling)
- Enforce 10,000 character prompt length limit to prevent abuse via oversized payloads
- Strip control characters (null bytes, C0/C1 range) from prompts before forwarding to APIs
- Validate API key format and length (max 256 chars, alphanumeric + limited special chars)
- Updated Next.js from 16.1.1 to 16.1.6 to fix 3 high-severity vulnerabilities (DoS via Image Optimizer, HTTP deserialization DoS, unbounded memory via PPR)
- Verified no hardcoded API keys or secrets anywhere in codebase

## [0.2.2] - 2026-02-12

### Changed
- Added live demo link, bug report, and feature request links to README header
- Added environment variables table documenting `GEMINI_API_KEY` server-side scope
- Added "Deploy Your Own" section with Vercel one-click deploy button and manual instructions
- Added API key pricing table with per-image costs for Gemini, DALL-E 3, and Kling
- Fixed prompt count discrepancy: updated from 1,050+ to 1,180+ to match actual data

## [0.2.1] - 2026-02-12

### Changed
- Rewrote README as portfolio-grade documentation covering both web app and CLI tool
- Added multi-model comparison table, free tier documentation, CLI command reference
- Added architecture section with composable pipeline diagram and page flow
- Restructured project tree to reflect full codebase (analyzer, hooks, inspiration, data pipeline)
- Screenshots now displayed in responsive table layout
- Tech stack shown as web/CLI comparison table
- Added badges for Bun runtime and MIT license

## [0.2.0] - 2026-02-12

### Changed
- Refactored natural language generator into composable section pipeline
- Extracted 13 independent prompt section generators into `sections.ts`
- Reduced `natural.ts` from 131 lines to 18 lines using `flatMap` pipeline pattern
- Each section (subject, hair, clothing, camera, etc.) is now an independently testable pure function
- Exported `PROMPT_SECTIONS` array and individual section functions for external use and custom pipelines

## [0.1.1] - 2026-02-12

### Added
- Unit tests for prompt building edge cases: action/body_position precedence, section ordering, deep nesting cleanup, Unicode handling, generator consistency
- Testing section in README

### Fixed
- 15 pre-existing test failures caused by capitalization sensitivity when testing sections in isolation without a subject
