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

The package is **type-only** apart from a single runtime export, `ContractVersion`,
which mirrors the package version so clients can report the contract revision they
were built against.

```ts
import { ContractVersion } from '@sessionplan/contracts';

console.log(ContractVersion); // "0.1.1"
```

## Scope

This package is the single source of truth for the API wire contract. It contains
**only** `interface` / `type` declarations (plus `ContractVersion`). Runtime
builders, validators, and helpers stay in the API and its clients.

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

## Versioning

While in `0.x`, minor versions may introduce breaking changes. Consumers pin an
**exact** version (`"@sessionplan/contracts": "0.1.1"`). See the contracts release
playbook in the SES-80 work item for the publish/upgrade flow.

## Development

```sh
npm install
npm run build      # emit dist/ declarations + js
npm run typecheck  # type-check without emitting
```
