# Changelog

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
