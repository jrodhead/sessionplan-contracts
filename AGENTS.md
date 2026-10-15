# sessionplan-contracts Agent Guide

Shared TypeScript wire types for SessionPlan API consumers. Touch this repo when request/response shapes shared across services change, or when a shared rule (such as `inferLogType`) does.

## First Context

- Read `README.md` for package scope, versioning, and development commands.
- Read `docs/runbook.md` before publishing, bumping a consumer pin, or making a breaking change.
- Read `../sessionplan-business/product-design/agentic-workspace.md` for cross-repo workflow.
- Read affected producer/consumer `AGENTS.md` files before changing types.

## Key Constraints

- This package holds types, `ContractVersion`, closed-vocabulary `const` data, and shared rules.
- A function belongs here only if all hold: (1) two or more services must reach the same answer from the same inputs, and disagreement would be stored or seen by the user; (2) it is pure, synchronous and total — no I/O, clock, randomness or environment; (3) it imports nothing outside this package, and its inputs and output are types exported here; (4) it ships with a case-table test in this repo.
- Changing a rule's output for any input is a behaviour change: bump the minor and record it under `### Changed`.
- Runtime builders, validators, parsers of one service's own shapes, and service helpers stay in producer/consumer repos.
- Consumers pin exact versions. Any changed existing shape requires coordinated producer and consumer updates.
- Additive optional fields are the safest compatibility path, but still require versioning and consumer awareness.
- `sessionplan-api` is the contract producer; `sessionplan-mcp` and `sessionplan-app` are consumers.

## High-Risk Changes

- Changing existing exported shapes without updating the API producer and every exact-pinned consumer.
- Adding runtime builders, validators, or service helpers to this package, or a function that fails any of the four shared-rule conditions above.
- Changing a shared rule's output without a minor bump: consumers pin exact versions, so a changed rule reaches each service only when its pin moves.
- Publishing or building declarations that do not match the source types consumed by API/MCP/app.
- Treating a `0.x` version bump as harmless when consumers deploy independently.

## Common Commands

```bash
npm run typecheck
npm test
npm run build
```

Run `npm run build` when declaration output, package publishing, or consumer updates are part of the task.

Publishing is **not** `npm run build` — see `docs/runbook.md` for the release flow. Publish before updating consumer pins; a consumer can never pin a version that is not on npm yet.

## Cross-Repo Awareness

- Do not change contracts in isolation. Update API exports and exact-pinned consumer package versions in the same work set when required.
- Health endpoints expose `contractsVersion`; keep version expectations aligned across services.
