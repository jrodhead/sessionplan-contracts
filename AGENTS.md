# sessionplan-contracts Agent Guide

Shared TypeScript wire types for SessionPlan API consumers. Touch this repo when request/response shapes shared across services change.

## First Context

- Read `README.md` for package scope, versioning, and development commands.
- Read `../sessionplan-business/product-design/agentic-workspace.md` for cross-repo workflow.
- Read affected producer/consumer `AGENTS.md` files before changing types.

## Key Constraints

- This package is type-only apart from `ContractVersion`.
- Runtime builders, validators, and service helpers stay in producer/consumer repos.
- Consumers pin exact versions. Any changed existing shape requires coordinated producer and consumer updates.
- Additive optional fields are the safest compatibility path, but still require versioning and consumer awareness.
- `sessionplan-api` is the contract producer; `sessionplan-mcp` and `sessionplan-app` are consumers.

## High-Risk Changes

- Changing existing exported shapes without updating the API producer and every exact-pinned consumer.
- Adding runtime builders, validators, or service helpers to this type-focused package.
- Publishing or building declarations that do not match the source types consumed by API/MCP/app.
- Treating a `0.x` version bump as harmless when consumers deploy independently.

## Common Commands

```bash
npm run typecheck
npm test
npm run build
```

Run `npm run build` when declaration output, package publishing, or consumer updates are part of the task.

## Cross-Repo Awareness

- Do not change contracts in isolation. Update API exports and exact-pinned consumer package versions in the same work set when required.
- Health endpoints expose `contractsVersion`; keep version expectations aligned across services.
