# SessionPlan Contracts Release Runbook

**Package**: [`@sessionplan/contracts`](https://www.npmjs.com/package/@sessionplan/contracts)
**Repo**: `sessionplan-contracts`
**Owner**: Jared Headrick, jared@sessionplan.ai
**Last Updated**: August 12, 2026

This is a **published npm package**, not a deployed service. There is nothing to
roll back in place: once a version is on npm it is immutable, and the only way
"back" is to publish a new version or have consumers pin the previous one.

---

## Table of Contents

1. [Release Flow](#release-flow)
2. [Publishing](#publishing)
3. [Updating Consumers](#updating-consumers)
4. [Verifying a Release](#verifying-a-release)
5. [Breaking Changes](#breaking-changes)
6. [Common Issues](#common-issues)
7. [Emergency Procedures](#emergency-procedures)
8. [Useful Commands](#useful-commands)

---

## Release Flow

Ordering matters. Publish, **then** consume — a consumer can never pin a version
that does not exist yet.

1. Make the contract change in `src/`. Bump `package.json` version (minor =
   additive, major = breaking, per [Breaking Changes](#breaking-changes)).
2. Bump `ContractVersion` in `src/index.ts` to the **same** value. The publish
   workflow does not check this, but the health endpoints report it — a mismatch
   silently misreports which contract a service was built against.
3. Add a `CHANGELOG.md` entry, including a `### Changed` note recording the
   `ContractVersion` / package bump (existing convention).
4. `npm run typecheck && npm test && npm run build`.
5. Open a PR, merge to `main`.
6. [Publish](#publishing) from merged `main`.
7. [Update consumers](#updating-consumers) that actually need the new version.
8. Deploy the producer (`sessionplan-api`) before or with consumers when runtime
   behavior changed, not just types.

### Who consumes this package

| Repo | Role | Pins |
|---|---|---|
| `sessionplan-api` | **Producer** — the API defines the wire shapes | exact |
| `sessionplan-mcp` | Consumer | exact |
| `sessionplan-app` | Consumer | exact |

All three pin an **exact** version (no caret). That is deliberate: an additive
release does not force every consumer to move. Only bump the consumers that
actually need the new surface — the rest can stay behind indefinitely and still
build. See `AGENTS.md` for the cross-repo constraints.

---

## Publishing

### Automated (preferred)

`.github/workflows/publish.yml` fires on a pushed `v*` tag. It verifies the tag
matches `package.json`, runs `npm ci`, builds, and **stages** the version with
npm trusted publishing (OIDC): npm exchanges the run's GitHub OIDC token for a
short-lived token that can only stage. There is no stored secret, and npm
attaches a provenance attestation (the repo is public).

**A staged version is not released until you approve it** on npmjs.com (the
package's staged versions, or `npm stage list` / `npm stage approve <id>`),
which asks for your 2FA. This works from a phone. Someone who can push a tag
can stage a version but cannot release one.

```bash
git checkout main && git pull
git tag v0.4.0          # must match package.json exactly, minus the leading v
git push origin v0.4.0
```

Watch it: `gh run list --repo jrodhead/sessionplan-contracts`

The trusted publisher is configured on npmjs.com (package → Settings → Trusted
Publisher → GitHub Actions): user `jrodhead`, repository `sessionplan-contracts`,
workflow `publish.yml`, no environment, and "publish directly / manage
dist-tags" left **off** (staged publishing only). Renaming the workflow file or the repo
breaks publishing until that entry is updated. Switched from the `NPM_TOKEN`
secret on 2026-10-14 (SES-306), after the token path failed with `EOTP` for
every release since `v0.1.7`.

### Manual (fallback)

```bash
npm login                # npm sessions expire; check with `npm whoami` first
npm run typecheck && npm test
npm publish              # prepublishOnly runs clean + build automatically
                         # 2FA is enforced — expect an OTP prompt, or pass --otp=<code>
```

Tag the release afterwards so the repo still records what shipped:

```bash
git tag v0.1.7 && git push origin v0.1.7
```

(The tag will trigger the workflow, which will fail at the publish step because
the version already exists. Harmless, but noisy — another reason to fix it.)

`package.json` sets `publishConfig.access: public` and ships only `dist/`, so no
extra flags are needed. Do **not** run `npm run build` and then hand-edit `dist/`
— `prepublishOnly` wipes and rebuilds it.

### Prerequisites

- Automated path: the trusted publisher entry on npmjs.com (above). No secret.
- Manual path: npm account with publish rights on the `@sessionplan` scope,
  plus your 2FA authenticator.

---

## Updating Consumers

For each consumer that needs the new version:

```bash
cd ../sessionplan-api          # or -mcp / -app
# edit package.json: "@sessionplan/contracts": "0.1.7"   (exact, no caret)
npm install
npx tsc --noEmit
npm test
```

Commit the `package.json` **and** `package-lock.json` together.

### If the API shipped a local type widening

When a contract field is needed before the package is published, the API
sometimes carries a temporary local widening rather than blocking on a release
(e.g. `TemplateItemWithNotes` in `lib/context-bundler.ts`, added for SES-192).
These are meant to be short-lived. After bumping the pin:

1. Delete the local alias and use the contract type directly.
2. Remove any casts in tests that existed only to satisfy it.
3. `npx tsc --noEmit` — this is what proves the published contract actually
   carries the field, rather than the local alias having masked its absence.

---

## Verifying a Release

```bash
npm view @sessionplan/contracts version           # latest published
npm view @sessionplan/contracts versions          # full history
```

After consumers deploy, both health endpoints report the contract version they
were built against:

```bash
curl -s https://api.sessionplan.ai/api/health | jq .contractsVersion
curl -s https://mcp.sessionplan.ai/api/health | jq .version
```

`sessionplan-api` also sets an `X-Contracts-Version` response header. A service
reporting an older version than expected means its deploy did not pick up the
pin bump — check that `package-lock.json` was committed.

---

## Breaking Changes

While in `0.x`, **minor versions may break**. Consumers are protected by exact
pins, not by semver.

A change is breaking if it removes a field, narrows a type, renames anything, or
makes an optional field required. Adding an **optional** field is the safe path.

For a breaking change:

1. Major bump (or minor while in `0.x`), with an explicit `### Breaking` note in
   `CHANGELOG.md` naming every affected shape.
2. Update the API producer and **every** exact-pinned consumer in the same
   coordinated change set — do not publish and leave consumers to discover it.
3. Link the consumer update PRs from the contracts PR.
4. Run `npx tsc --noEmit` + tests in every consumer before any deploy.

Never publish internal-only endpoint shapes. This package is public.

---

## Common Issues

### 1. `npm publish` returns 401

**Cause**: npm session expired. Sessions are not long-lived.

**Resolution**: `npm whoami` to confirm, then `npm login` (`--auth-type=web`
prints a link you can open on another device). Only affects the manual path —
the workflow uses trusted publishing.

### 2. Publish workflow fails on "Tag does not match package.json version"

**Cause**: the tag and `package.json` disagree (e.g. tagged `v0.1.7` against a
`0.1.6` package, or tagged before merging the version bump).

**Resolution**: delete the tag, fix the version, re-tag from merged `main`:

```bash
git tag -d v0.1.7 && git push origin :refs/tags/v0.1.7
```

### 3. Publish workflow fails with `EOTP` or `ENEEDAUTH`

**Cause**: npm did not accept the run as a trusted publisher, so it fell back to
asking for credentials. Usually the trusted publisher entry on npmjs.com no
longer matches (repo, user or workflow filename changed), or the workflow lost
`permissions: id-token: write`, or npm on the runner is older than 11.5.1.

**Resolution**: check the entry under the package's Settings → Trusted
Publisher against the repo and `publish.yml`, then re-run the job. The manual
path still works in the meantime.

### 3b. Tag pushed but nothing published, and no workflow run

**Cause**: the tag did not match the `v*` trigger, or was created locally and
never pushed.

**Resolution**: `git ls-remote --tags git@github.com:jrodhead/sessionplan-contracts.git`
to confirm the tag reached the remote, then
`gh run list --repo jrodhead/sessionplan-contracts`.

### 4. Consumer typechecks locally but fails in CI

**Cause**: `package-lock.json` was not committed alongside the `package.json`
pin bump, so CI's `npm ci` installs the old version.

**Resolution**: commit both files together.

### 5. A published version is wrong

npm versions are immutable. See [Emergency Procedures](#emergency-procedures) —
do not attempt to republish the same number.

---

## Emergency Procedures

### Bad version published

**Do not unpublish.** npm blocks unpublish after 72 hours, and even inside that
window it breaks any consumer that already installed it.

1. Publish a corrected patch version immediately (`0.1.8`, not a re-publish of
   `0.1.7`).
2. Deprecate the bad one so installs warn:
   ```bash
   npm deprecate @sessionplan/contracts@0.1.7 "Broken: <reason>. Use 0.1.8."
   ```
3. Consumers are on exact pins, so anyone who has not bumped is unaffected. Only
   repos that already moved to the bad version need a follow-up PR.

### Suspected publish credential leak

The automated path holds no long-lived credential. If a personal npm token or
session may have leaked: revoke it at npmjs.com → Access Tokens, and check npm's
publish history for versions you did not release. If an old `NPM_TOKEN` secret
is still on the GitHub repo, delete it (`gh secret delete NPM_TOKEN --repo
jrodhead/sessionplan-contracts`) — nothing uses it.

---

## Useful Commands

```bash
# Development
npm run typecheck   # type-check without emitting
npm test            # vitest
npm run build       # emit dist/
npm run clean       # rm -rf dist

# Release
npm whoami                                        # check npm session
git tag v0.1.7 && git push origin v0.1.7          # automated publish
npm publish                                       # manual publish

# Inspection
npm view @sessionplan/contracts version
npm view @sessionplan/contracts versions
gh run list --repo jrodhead/sessionplan-contracts
git ls-remote --tags git@github.com:jrodhead/sessionplan-contracts.git
```

---

## Related

- `AGENTS.md` — cross-repo constraints and high-risk changes
- `README.md` — package scope and module map
- `sessionplan-business/product-design/operations-runbook.md` — cross-service incident criteria
- `sessionplan-business/product-design/production-deployment-checklist.md` — pre-deploy verification for consumers
