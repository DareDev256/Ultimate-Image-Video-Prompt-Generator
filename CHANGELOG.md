# Changelog

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
