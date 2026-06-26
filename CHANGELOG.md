# Changelog

All notable changes to `@sessionplan/contracts` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
While in `0.x`, minor version bumps may include breaking changes.

## [Unreleased]

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
