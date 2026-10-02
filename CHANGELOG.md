# Changelog

All notable changes to `@sessionplan/contracts` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
While in `0.x`, minor version bumps may include breaking changes.

## [Unreleased]

## [0.2.0] - 2026-10-02

### Changed

- **The muscle vocabulary names what a lifter trains, and no value contains another.** `back`, `shoulders` and `core` are replaced by `lats`, `upper-back`, `side-delts`, and the existing `abs`/`obliques`/`lower-back`; `neck`, `abductors`, `tibialis` and `feet-ankles` are added (23 values). **Breaking:** the three removed values no longer validate.
- `ContractVersion` and package version bumped to `0.2.0`.

### Added

- **`MUSCLE_LABELS` and `MUSCLE_GROUPS`** give each muscle its display label and its body region, for grouped filters.
- **Weekly volume separates direct from indirect work.** Optional `directSets` (primary muscle) and `indirectSets` (secondary) on `WeeklyMuscleVolume`; `sets` keeps its meaning.

## [0.1.11] - 2026-09-29

### Added

- **Exercise taxonomy vocabularies as one published source.** `TRAINING_TYPES`, `MODALITIES`, `MOVEMENT_PATTERNS`, `MUSCLES`, `EXERCISE_LEVELS` and `LOG_TYPES_BY_TRAINING_TYPE`, with their types, plus optional classification fields on the exercise request, response and list shapes (exercise-taxonomy-by-training-type).
- **This week's conditioning reaches the AI.** Optional `conditioning` and `completion` on `SameWeekSession`. Additive; consumers that ignore them are unaffected.

### Changed

- `ContractVersion` and package version bumped to `0.1.11`.

## [0.1.10] - 2026-09-20

### Added

- `WorkspaceSafetyProfile` and `WORKSPACE_SAFETY_PROFILES`, plus an optional `safetyProfile` on `WorkspaceSettings`. A workspace selects a safety posture from a closed set and the server renders the instruction text; the workspace never supplies text of its own. Absent means the default posture, so existing workspaces are unaffected. Additive — `WorkspaceSettings` already carried an index signature, so no consumer breaks (SES-276).

### Changed

- `ContractVersion` and package version bumped to `0.1.10`.

## [0.1.9] - 2026-09-07

### Added

- `RecentSessionTemplate.completion.notes` — the session-level note the user wrote when logging, carried into generation context alongside the other completion signals. Previously the bundle reported what happened in a session (`completionStatus`, `sessionRpe`, `skippedSections`, set-level data) but never why, so a deliberate load change was indistinguishable from a regression. Additive and optional; consumers that ignore it are unaffected. See SES-275.

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
