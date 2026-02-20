# Changelog

## [0.9.0] - 2026-02-20

### Removed
- Deleted deprecated `generateCompactJSON` export — all callers migrated to `generateJSON(prompt, true)` which has been the canonical API since 0.7.0
- Removed 10 stale imports of `generateCompactJSON` across 5 test files

### Changed
- Renamed `generateCompactJSON` describe blocks to `generateJSON compact mode` for clarity — tests now exercise the `compact` parameter directly instead of through a wrapper

## [0.8.5] - 2026-02-19

### Added
- Complexity analysis section in `docs/diversity-picking.md` — documents O(n) time/space for `diversePick`, O(w) for `pushRecent`, O(c×f) for `buildRandomPrompt`, and O(v) for `flattenPromptToText` with real-world scale context
- Three usage examples in diversity-picking doc — per-field randomize button (React), full-prompt Quick Mode pattern, and headless usage outside React for tests/scripts
- Six new proven invariants (#10–#15) in the invariants table: probabilistic fairness (chi-squared), pigeonhole coverage, reference equality semantics, large pool correctness, per-field isolation, and negative maxSize boundary

### Changed
- Updated test count in diversity-picking doc from 35 to 59 tests across 10 describe blocks — reflects all edge-case, probabilistic, and boundary tests added in 0.8.2–0.8.3
- Updated README documentation section with expanded description of diversity-picking doc contents

## [0.8.4] - 2026-02-19

### Changed
- Enhanced README hero section with a punchier tagline that sells the Flash Era personality and zero-blank-box-anxiety value prop
- Added "At a Glance" quick-stats table below the badge row — 6 key numbers (13 categories, 7,000+ prompts, 3 models, 417 tests, 2 platforms, 240 patterns) for instant scanability
- Added "What Makes This Different" subsection under "Why This Exists" — highlights diversity-aware randomization, model-aware output, composable architecture, and test invariants as portfolio differentiators
- Improved screenshot alt text from generic labels to descriptive captions that communicate what each screen shows
- Added "Why This Exists" entry to Table of Contents (was missing despite the section existing)
- Polished footer with a thematic closing line that ties the Flash Era aesthetic to the engineering story

## [0.8.3] - 2026-02-19

### Added
- 13 new tests for diversity-picking algorithm covering probabilistic fairness (chi-squared distribution sanity), pigeonhole coverage guarantee (window = n-1 forces all options before repeats), negative maxSize boundary, empty-suggestions contract propagation, field iteration order preservation, whitespace-only value behavior in flatten, mixed empty/populated category structure, insertion-order preservation in flatten output, and full-cycle multi-category simulation with diversity + structure invariants
- Total test count: 404 → 417 (17 files), assertions: 1,832 → 2,144

## [0.8.2] - 2026-02-19

### Added
- 11 new tests for diversity-picking edge cases and algorithm invariants — reference equality semantics for object options (Set uses `===`, not structural equality), duplicate handling in both `diversePick` and `pushRecent`, `maxSize=0` boundary, large pool (1000 options) correctness, single-segment and multi-dot key parsing in `buildRandomPrompt`, category prefix collision behavior ("last wins" documented), window eviction proof (items slide out and become re-eligible), full-window graceful degradation, and per-field history isolation simulating the real `useDiversePick` hook pattern
- Total test count: 393 → 404 (17 files), assertions: 1,707 → 1,832

## [0.8.1] - 2026-02-19

### Fixed
- Synced `web/package.json` version from `0.1.0` to `0.8.1` — was never bumped from the Next.js scaffold default, causing a 20-release drift from CHANGELOG versions

### Changed
- Added `.todoignore` at project root — excludes `node_modules/`, `.next/`, `dist/`, `build/`, `coverage/`, and `.git/` from TODO/code-debt scanning to prevent upstream dependency internals (e.g. Zod's `from-json-schema.js` TODOs for `uniqueItems`/`contains`) from being flagged as project debt

## [0.8.0] - 2026-02-18

### Changed
- Extracted `MODEL_NAMES`, `MODEL_COLORS`, and `isValidModel` type guard into shared `web/src/lib/models.ts` — eliminates 4× copy-pasted model metadata across wizard, quick, preview, and generate pages
- Created `useCopyToClipboard` hook (`web/src/hooks/useCopyToClipboard.ts`) — replaces 3× duplicated `useState`/`setTimeout` clipboard pattern in quick, preview, and result pages, with proper timer cleanup via `useRef`
- Replaced raw `['nano-banana', 'openai', 'kling'].includes()` checks with `isValidModel()` type guard in wizard and preview pages — adding a model is now a single-file change

## [0.7.9] - 2026-02-18

### Added
- Technical reference document `docs/diversity-picking.md` — comprehensive deep-dive into the sliding-window exclusion algorithm covering the problem statement, step-by-step click trace, graceful degradation behavior, 4-layer architecture diagram (pure algorithm → composition → React binding → integration), full API reference for all 5 exported functions/hooks, 9 proven invariants table with consequence analysis, and design decision rationale (window vs shuffle, Set-based exclusion, key derivation strategy, default window sizing)
- Linked new diversity-picking doc from README Documentation section

## [0.7.8] - 2026-02-18

### Changed
- Added collapsible "Proven properties" table to Diversity-Aware Randomization README section — documents 8 algorithmic properties verified by the 35-test suite (exclusion, graceful degradation, type generality, statistical diversity, window sliding, integration, key derivation, round-trip fidelity)
- Updated Engineering Highlights diversity row with exported interfaces, full function inventory, and cross-link to proven properties
- Refined test table description for diversity suite with superset-recent, immutability, 12-round no-triple-repeat, and build→flatten round-trip detail

## [0.7.7] - 2026-02-18

### Changed
- Exported `PickableField` and `PickableCategory` interfaces from `diverse-pick.ts` — consumers can now type-check against the expected shape instead of duck-typing
- Replaced `||` with `??` (nullish coalescing) in `buildRandomPrompt` category key derivation — only falls back to `category.id` when no fields exist, not on empty string
- Added inline documentation explaining why output keys derive from field key prefixes rather than category IDs (data model vs UI label divergence)

### Added
- 14 tests for `buildRandomPrompt` and `flattenPromptToText` — covers category key derivation, field pass-through, empty categories, unicode handling, empty value filtering, and build-flatten round-trip integration with diversity picker
- Total test count: 379 → 393 (17 files), assertions: 1,687 → 1,707

## [0.7.6] - 2026-02-17

### Changed
- Expanded "Diversity-Aware Randomization" README section from 4-line overview to full algorithm walkthrough with step-by-step click trace showing window sliding and graceful fallback behavior
- Added architecture table mapping the 4-layer stack (pure algorithm → React hook → wizard → Quick Mode) with file paths
- Enhanced feature bullet with cross-link to architecture detail section
- Updated Engineering Highlights and Challenges & Solutions entries with test counts, cross-links, and fallback documentation
- Improved test table description for diversity suite to explicitly name all tested functions

## [0.7.5] - 2026-02-17

### Changed
- Extracted `buildRandomPrompt` and `flattenPromptToText` pure functions from Quick Mode page into `diverse-pick.ts` — prompt assembly is now testable and reusable without React
- Made `useDiversePick` hook generic over value type `T` (default `string`) instead of hardcoded to `string`
- Reduced Quick Mode's `handleRandomize` from 18 lines of inline logic to 6 lines composing extracted utilities

## [0.7.4] - 2026-02-17

### Added
- 52 tests for web-side pure functions (`diverse-pick.ts`, `validation.ts`) — first test coverage for the web layer
- `diversePick` tests: empty array throw, exclusion behavior, full-pool fallback, statistical diversity, readonly safety, integration with `pushRecent` sliding window
- `validatePrompt` tests: type rejection (null/undefined/number/object/array/boolean), whitespace-only rejection, 10K char boundary, C0/C1 control char stripping, unicode preservation
- `validateApiKey` tests: format validation, injection defense (SQL, XSS, header injection), 256-char boundary, special character allowlist
- Total test count: 327 → 379 (17 files), assertions: 1,458 → 1,687

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
