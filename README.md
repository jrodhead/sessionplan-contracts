# @sessionplan/contracts

Type declarations for the SessionPlan API.

> **Public for installation convenience; not a stable external contract until 1.0.**
> These types describe the shapes exchanged between the SessionPlan API and its
> first-party clients (the MCP server, the web app). They may change without a
> major version bump while the package is in the `0.x` range. Do not depend on
> this package for third-party integrations yet.

## Install

```sh
npm install @sessionplan/contracts
```

## Usage

```ts
import type {
  GenerationContext,
  WorkspaceListResponse,
  SessionResponse,
  ResolveExercisesResponse,
  PerformanceSummary,
  HealthResponse,
} from '@sessionplan/contracts';
```

Besides types, the package has two kinds of runtime export: `ContractVersion`, which
mirrors the package version so clients can report the contract revision they were
built against, and **closed vocabularies** as frozen `const` arrays
(`WORKSPACE_SAFETY_PROFILES`, `TRAINING_TYPES`, `MODALITIES`, `MOVEMENT_PATTERNS`,
`MUSCLES`, `EXERCISE_LEVELS`, `LOG_TYPES_BY_TRAINING_TYPE`), so every service reads
the same list of allowed values.

```ts
import { ContractVersion } from '@sessionplan/contracts';

console.log(ContractVersion); // "0.1.7"
```

## Scope

This package is the single source of truth for the API wire contract. It contains
`interface` / `type` declarations, `ContractVersion`, and closed-vocabulary `const`
arrays — data, never logic. Runtime builders, validators, and helpers stay in the
API and its clients.

| Module       | Covers                                                        |
| ------------ | ------------------------------------------------------------- |
| `common`     | Shared primitives: `JsonValue`, units, scopes, pagination     |
| `profile`    | Physical profile + training-context narrative shapes          |
| `context`    | `GenerationContext` and its nested context blocks             |
| `workspaces` | Workspace list/detail responses                               |
| `sessions`   | Session create/update requests and responses                  |
| `logs`       | Performance log content + `PerformanceSummary`                |
| `exercises`  | Exercise resolution and search responses                      |
| `reports`    | Progress report content and list/detail responses             |
| `health`     | `/health` diagnostics response                                |
| `public-catalogs` | Public location session catalog responses and provenance |

## Versioning

While in `0.x`, minor versions may introduce breaking changes. Consumers pin an
**exact** version (`"@sessionplan/contracts": "0.1.7"`).

**To publish a release or bump a consumer, see [`docs/runbook.md`](docs/runbook.md).**
It covers the publish flow (tag-triggered and manual), consumer update ordering,
breaking-change rules, and what to do about a bad published version.

## Development

```sh
npm install
npm run build      # emit dist/ declarations + js
npm run typecheck  # type-check without emitting
```
