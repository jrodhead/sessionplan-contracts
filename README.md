# @sessionplan/contracts

Type declarations, closed vocabularies and shared rules for the SessionPlan API.

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

Besides types, the package has three kinds of runtime export: `ContractVersion`, which
mirrors the package version so clients can report the contract revision they were
built against; **closed vocabularies** as frozen `const` data
(`WORKSPACE_SAFETY_PROFILES`, `TRAINING_TYPES`, `MODALITIES`, `MOVEMENT_PATTERNS`,
`MUSCLES`, `EXERCISE_LEVELS`, `LOG_TYPES_BY_TRAINING_TYPE`, `LOG_TYPE_INPUTS`,
`DISTANCE_MODALITIES`), so every service reads the same list of allowed values; and
**shared rules** (`inferLogType`), so every service that picks an exercise's log type
picks the same one.

```ts
import { ContractVersion } from '@sessionplan/contracts';

console.log(ContractVersion); // "0.4.0"
```

## Scope

This package is the single source of truth for the API wire contract. It contains
`interface` / `type` declarations, `ContractVersion`, closed-vocabulary `const` data,
and a small number of shared rules. A function belongs here only when two or more
services must reach the same answer and a disagreement would be stored or seen by
the user, and only if it is pure, synchronous and total, imports nothing outside this
package, and ships with a case-table test. `inferLogType` is the one such rule today.
Runtime builders, validators, parsers of one service's own shapes, and helpers stay
in the API and its clients.

| Module       | Covers                                                        |
| ------------ | ------------------------------------------------------------- |
| `common`     | Shared primitives: `JsonValue`, units, scopes, pagination     |
| `profile`    | Physical profile + training-context narrative shapes          |
| `context`    | `GenerationContext` and its nested context blocks             |
| `workspaces` | Workspace list/detail responses                               |
| `sessions`   | Session create/update requests and responses                  |
| `logs`       | Performance log content + `PerformanceSummary`                |
| `exercises`  | Exercise resolution and search responses; the log type rule   |
| `reports`    | Progress report content and list/detail responses             |
| `health`     | `/health` diagnostics response                                |
| `public-catalogs` | Public location session catalog responses and provenance |

## Versioning

While in `0.x`, minor versions may introduce breaking changes. Consumers pin an
**exact** version (`"@sessionplan/contracts": "0.4.0"`).

**To publish a release or bump a consumer, see [`docs/runbook.md`](docs/runbook.md).**
It covers the publish flow (tag-triggered and manual), consumer update ordering,
breaking-change rules, and what to do about a bad published version.

## Development

```sh
npm install
npm run build      # emit dist/ declarations + js
npm run typecheck  # type-check without emitting
npm test           # vitest, including the log type case table
```
