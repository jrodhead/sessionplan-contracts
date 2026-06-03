# Changelog

All notable changes to `@sessionplan/contracts` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
While in `0.x`, minor version bumps may include breaking changes.

## [0.1.1] - Unreleased

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
