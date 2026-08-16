# Changelog

All notable changes to `@sessionplan/contracts` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
While in `0.x`, minor version bumps may include breaking changes.

## [Unreleased]

## [0.1.8] - 2026-08-16

### Added

- `PossibleDuplicate` and `ExerciseWithScope.possible_duplicate` — an optional, non-blocking warning returned by `POST /api/exercises` when a new exercise closely matches an existing one. Advisory by design: legitimately distinct exercises (a machine and a free-weight version of one movement) match the check, so it must never be treated as a rejection. Additive and optional; consumers that ignore it are unaffected.

### Changed

- `ContractVersion` and package version bumped to `0.1.8`.

## [0.1.7] - 2026-08-12

### Added

- `RecentSessionTemplateItem.notes` and `RecentSessionTemplateItem.children[].notes` — bounded item-level notes in recent-session templates, so generation can see that an exercise was substituted rather than reading it as a new exercise with no history.

### Changed

- `ContractVersion` and package version bumped to `0.1.7`.

## [0.1.6] - 2026-07-03

### Added

- Public catalog contracts for location session catalog resolve, option preview, authenticated instantiation, attribution, and linked-session provenance.
- `PerformanceLogContent.linkedSessionProvenance` for server-issued provenance on logs attached to copied public catalog sessions.
- `SessionWithScope.linked_session_provenance` for session responses that include copied public catalog provenance.

### Changed

- `ContractVersion` and package version bumped to `0.1.6`.

## [0.1.5] - 2026-06-29

### Added

- Recent session templates now include structured text blocks so generation consumers can preserve text-heavy session continuity.
- `RecentSessionTextBlock` defines the supported heading, paragraph, bullet, step, and callout shapes used in generation context.

### Changed

- `ContractVersion` and package version bumped to `0.1.5`.

## [0.1.4] - 2026-06-26

### Changed

- `MovementLimitationsContext` is prose-only; the block-level `status` field was removed so multiple limitations can describe their own status in user-authored text.
- `ContractVersion` and package version bumped to `0.1.4`.

## [0.1.3] - 2026-06-26

### Added

- `MovementLimitationsContext` prose contract for canonical movement-limitation profile context.
- `ProfileContext.movementLimitationsContext` for generation and report consumers.

### Changed

- `ContractVersion` and package version bumped to `0.1.3`.
- Structured `movementLimitations` and `activeAggravatingPatternTags` were removed from generation contracts in favor of prose context.

## [0.1.2] - 2026-06-15

### Changed

- Narrow `ProfileContext` and workspace training context contracts so generation
  profile data contains visible narrative blocks, movement limitations, training
  availability, and `trainingProgram.weeklyPlan` only.

## [0.1.1]

### Changed

- Ship as CommonJS so the package is consumable from both CommonJS
  (`sessionplan-api`) and ESM (`sessionplan-mcp`, `sessionplan-app`) consumers.
  `0.1.0` was ESM-only and could not be type-imported from CommonJS projects.

## [0.1.0]

### Added

- Initial type-only contract package extracted from the SessionPlan API.
- Modules: `common`, `profile`, `context`, `workspaces`, `sessions`, `logs`,
  `exercises`, `reports`, `health`.
- `ContractVersion` runtime constant mirroring the package version.
