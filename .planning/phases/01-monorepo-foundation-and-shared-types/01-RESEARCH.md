# Phase 1: Monorepo Foundation & Shared Types - Research

**Researched:** 2026-05-05
**Domain:** npm workspaces monorepo, TypeScript strict mode, Next.js 16, Expo SDK 55, shared types package
**Confidence:** HIGH (core findings verified via official docs and npm registry)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** The backend API lives inside `apps/web` as Next.js Route Handlers — there is NO separate `apps/api`. (ROADMAP plans reference `apps/api` incorrectly — all plans must use `apps/web`.)
- **D-02:** ORM is Drizzle ORM (not Prisma). (ROADMAP references "Prisma schema" — ignore those; use Drizzle schema/migrations.)
- **D-03:** Database is Neon (serverless PostgreSQL).
- **D-04:** Deployment target is serverless (Netlify or similar managed platform).
- **D-05:** Package manager: npm workspaces (built-in, no extra tooling required).
- **D-06:** Exactly two apps (`apps/web`, `apps/mobile`) and one package (`packages/types`).
- **D-07:** A single `npm install` at the root resolves all inter-package dependencies via workspace references.
- **D-08:** `packages/types` must export: `JobStatus` enum (`PENDING`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`), `Role` enum (`CLIENT`, `PROVIDER`), all job DTO interfaces, all API request/response wrapper types, and error response shape.
- **D-09:** No local type duplicates in apps — all cross-platform contracts from `packages/types`.
- **D-10:** TypeScript strict mode across all packages — non-negotiable per curriculum.
- **D-11:** Shared `tsconfig.base.json` at root; each app extends it.

### Claude's Discretion

- Types package build strategy (raw TS source via project references vs compiled output) — Claude chooses the approach that works cleanly with npm workspaces and Expo's Metro bundler.
- App skeleton depth (bare shells vs framework boilerplate) — Claude uses `create-next-app` and `create-expo-app` where appropriate.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TYPES-01 | All DTOs, API response shapes, and enums are defined in `packages/types` | Raw TS source export pattern; package.json `exports` field with `.ts` entry; `transpilePackages` in Next.js; Expo SDK 55 auto-handles Metro resolution |
| TYPES-02 | Web (`apps/web`) and mobile (`apps/mobile`) import types exclusively from `packages/types` — no local type duplication | Workspace reference `"@local/types": "*"` in both apps; TypeScript path aliases not needed — workspace symlink resolves the package name directly |
| TYPES-03 | Job status enum, role enum, and all request/response interfaces are defined once in `packages/types` | Single `src/index.ts` barrel export; `const enum` avoided (Metro incompatibility); use `enum` or string union types |
</phase_requirements>

---

## Summary

This phase scaffolds an npm workspaces monorepo with two apps (`apps/web`, `apps/mobile`) and one shared types package (`packages/types`). The critical technical challenge is making `packages/types` consumable from both Next.js 16 (Turbopack/Node) and Expo SDK 55 (Metro bundler) without a build step.

**Prescribed package name:** `@local/types`. Use this name in all `package.json` files and import statements throughout the project.

**Prescribed build strategy:** Raw TypeScript source export with no compilation step. `packages/types` sets `"main": "./src/index.ts"` and both consuming apps transpile it themselves. Next.js handles this via `transpilePackages: ['@local/types']` in `next.config.ts`. Expo SDK 55 handles this automatically — Metro's built-in monorepo support (introduced SDK 52) resolves workspace packages and transpiles TypeScript source without manual `metro.config.js` changes.

**Prescribed typecheck strategy:** No TypeScript project references. Each workspace package has its own `typecheck` script running `tsc --noEmit`. Root orchestrates via `npm run typecheck --workspaces --if-present`. This satisfies the ROADMAP success criterion ("zero errors in strict mode") without the complexity of `composite: true` and declaration emitting on a types-only package.

The shared `tsconfig.base.json` uses `"moduleResolution": "bundler"` paired with `"module": "preserve"` — the canonical TypeScript 5.4+ pairing for bundler environments. This matches what Expo's own `tsconfig.base` uses (`expo/tsconfig.base` sets `moduleResolution: bundler`, `module: preserve`, `target: ESNext`), and it is compatible with Next.js 16's default config. Strict mode is set at the base level and inherited by all apps.

**Primary recommendation:** Raw TS source export from `packages/types`, named `@local/types`, `moduleResolution: bundler` + `module: preserve` in `tsconfig.base.json`, `transpilePackages` in `next.config.ts`, no `metro.config.js` needed for SDK 55, per-workspace `tsc --noEmit` orchestrated from root.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Shared type definitions (enums, DTOs, API shapes) | `packages/types` | — | Single source of truth; both apps import from here |
| Web frontend + API Route Handlers | `apps/web` (Next.js) | — | D-01: backend lives in apps/web, no separate apps/api |
| Mobile app | `apps/mobile` (Expo) | — | Provider experience only |
| Monorepo dependency resolution | npm workspaces (root) | — | D-05: npm workspaces, single `npm install` |
| TypeScript compilation/type-checking | Each app's own `tsc --noEmit` | Root npm orchestration | Raw source export — each consumer type-checks independently |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.4 | Web app framework + API Route Handlers | Curriculum mandated; latest stable [VERIFIED: npm registry] |
| expo | 55.0.20 | Mobile app framework | Curriculum mandated; latest stable [VERIFIED: npm registry] |
| typescript | 6.0.3 | Type system | Curriculum mandated strict mode; latest stable [VERIFIED: npm registry] |
| react | 19.2.5 | UI library | Required by Next.js 16 and Expo SDK 55 [VERIFIED: npm registry] |
| react-native | 0.85.2 | Mobile runtime | Required by Expo SDK 55 [VERIFIED: npm registry] |

### Supporting (Phase 1 only — scaffold tools, not runtime deps)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| create-next-app | 16.2.4 | Scaffold apps/web | Run once; generates tsconfig, next.config.ts, app/ directory [VERIFIED: npm registry] |
| create-expo-app | 3.5.3 | Scaffold apps/mobile | Run once with `--template blank-typescript` [VERIFIED: npm registry] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw TS source export | Compiled output (`tsc` to `dist/`) | Compiled output requires a build step and watch process during dev; unnecessary complexity for a types-only package that is never published |
| `moduleResolution: bundler` | `moduleResolution: nodenext` | `nodenext` requires `.js` extensions on imports — breaks Metro's resolver; `bundler` works with both Turbopack and Metro |
| npm workspaces | pnpm / Turborepo | D-05 locks npm; pnpm would be cleaner for isolation but adds tooling |
| `enum` | `const enum` | `const enum` is inlined at compile time — Metro does not handle this correctly across module boundaries; use regular `enum` |
| Per-workspace tsc | TypeScript project references | Project references require `composite: true` + declaration emit; adds complexity with no benefit for a types-only private package |

**Version verification:** All versions confirmed against npm registry on 2026-05-05.

---

## Architecture Patterns

### System Architecture Diagram

```
[Root package.json]
   workspaces: ["apps/*", "packages/*"]
   scripts.typecheck: npm run typecheck --workspaces --if-present
         |
         |-- npm install (hoists deps, symlinks workspace packages)
         |
   ┌─────┴──────────────────────────────────┐
   |                                         |
[apps/web]                            [apps/mobile]
Next.js 16                            Expo SDK 55
Turbopack bundler                     Metro bundler
transpilePackages: ['@local/types']   SDK 55 built-in monorepo support
  |                                        |
  | import { JobStatus } from             | import { JobStatus } from
  |   '@local/types'                      |   '@local/types'
  |                 |                      |
  └─────────────────┤──────────────────────┘
                    |
             [packages/types]
             name: "@local/types"
             main: "./src/index.ts"
             src/index.ts (raw TS source — no build step)
```

Data flow for type consumption:
1. Developer writes `import { JobStatus } from '@local/types'` in either app
2. npm workspace symlink resolves `@local/types` to `packages/types/`
3. Next.js: Turbopack reads `packages/types/src/index.ts` directly (via `transpilePackages`)
4. Expo/Metro: Metro resolves the symlink and transpiles the TS source (SDK 55 built-in)
5. TypeScript (`tsc --noEmit`) follows the `"types": "./src/index.ts"` field for type checking

### Recommended Project Structure

```
[root]/
├── package.json          # workspaces: ["apps/*", "packages/*"], typecheck script
├── tsconfig.base.json    # strict: true, moduleResolution: bundler, module: preserve
├── apps/
│   ├── web/              # Next.js 16 — frontend + API Route Handlers
│   │   ├── package.json  # "@local/types": "*", typecheck script
│   │   ├── tsconfig.json # extends ../../tsconfig.base.json, jsx: preserve
│   │   └── next.config.ts # transpilePackages: ['@local/types']
│   └── mobile/           # Expo SDK 55 — provider mobile app
│       ├── package.json  # "@local/types": "*", typecheck script
│       ├── tsconfig.json # extends ../../tsconfig.base.json
│       └── app.json      # Expo config
└── packages/
    └── types/            # @local/types — shared TypeScript contracts
        ├── package.json  # main: ./src/index.ts, types: ./src/index.ts, typecheck script
        ├── tsconfig.json # extends ../../tsconfig.base.json
        └── src/
            └── index.ts  # barrel export of all enums, DTOs, API shapes
```

### Pattern 1: Raw TypeScript Source Export (packages/types)

**What:** `packages/types/package.json` points `main` and `types` directly at the TypeScript source. No compilation, no build step, no watch process.

**When to use:** Types-only package used exclusively within a monorepo (never published to npm). Both consuming bundlers (Turbopack, Metro) can transpile TypeScript.

```json
// packages/types/package.json
// Source: Expo monorepo docs + Next.js transpilePackages docs [CITED]
{
  "name": "@local/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "*"
  }
}
```

### Pattern 2: tsconfig.base.json

**What:** Root-level shared TypeScript config extended by all packages.

**When to use:** Mandatory — D-11 requires this pattern.

```json
// tsconfig.base.json (root)
// Source: expo/tsconfig.base (GitHub) verified; Next.js 16 defaults verified [CITED]
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "moduleResolution": "bundler",
    "module": "preserve",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

Note on `module: preserve` + `moduleResolution: bundler`: These two settings are the canonical TypeScript 5.4+ pair for bundler environments. `module: preserve` tells TypeScript not to transform module syntax (the bundler handles it); `moduleResolution: bundler` relaxes the extension requirement. They work together — this is not an either/or choice. [VERIFIED: expo/tsconfig.base source]

```json
// apps/web/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", ".next/types/**/*.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

`"jsx": "preserve"` overrides the base's `"react-jsx"` — Next.js requires `preserve` so Turbopack handles the JSX transform. [CITED: nextjs.org/docs/app/api-reference/config/typescript]

```json
// apps/mobile/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx"
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

```json
// packages/types/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Pattern 3: next.config.ts for Workspace Package Transpilation

**What:** `transpilePackages` tells Next.js/Turbopack to transpile TypeScript source from the workspace package rather than treating it as pre-compiled.

**When to use:** Required when `packages/types` exports raw TS source.

```typescript
// apps/web/next.config.ts
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages [CITED]
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@local/types'],
}

export default nextConfig
```

### Pattern 4: Per-Workspace Typecheck Orchestration

**What:** Each workspace has its own `typecheck` script. Root orchestrates with `--workspaces --if-present`.

**When to use:** Replaces TypeScript project references for this monorepo — simpler, no emission required.

```json
// root package.json (scripts section)
{
  "scripts": {
    "typecheck": "npm run typecheck --workspaces --if-present"
  }
}
```

`--if-present` skips workspaces that don't have a `typecheck` script. `--workspaces` runs across all workspace members. npm exits non-zero if any workspace script fails.

### Pattern 5: packages/types Barrel Exports

**What:** Single `src/index.ts` that exports all enums, DTOs, and API contract types required by D-08.

```typescript
// packages/types/src/index.ts
// D-08 required exports:

export enum JobStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum Role {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
}

// Job DTO (shape returned from API)
export interface JobDto {
  id: string
  status: JobStatus
  version: number
  category: string
  description: string
  timeframe: string
  cityArea: string
  clientId: string
  providerId: string | null
  createdAt: string
  updatedAt: string
}

// API response wrappers
export interface ApiSuccessResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  error: string
  code: string
  statusCode: number
}

// Request shapes (used by both web and mobile)
export interface CreateJobRequest {
  category: string
  description: string
  timeframe: string
  cityArea: string
}

export interface AcceptJobRequest {
  version: number
}

export interface UpdateJobStatusRequest {
  status: JobStatus
}
```

### Anti-Patterns to Avoid

- **`const enum` in shared packages:** Metro does not correctly handle `const enum` inlining across module boundaries. Use regular `enum` or `as const` string objects instead.
- **`moduleResolution: nodenext` in tsconfig.base.json:** Requires explicit `.js` extensions on all imports. Metro's resolver does not support this extension pattern for TypeScript source. Use `bundler` instead.
- **Defining types in apps:** Any type defined in `apps/web` or `apps/mobile` that describes an API shape or shared contract violates D-09. All shared contracts live in `packages/types`.
- **TypeScript project references:** For this monorepo, project references add complexity (`composite: true`, declaration emit) with no benefit. Use per-workspace `tsc --noEmit`.
- **`workspace:*` protocol:** npm supports it but it is optional. Using `"*"` is simpler and functionally identical for a private monorepo. [VERIFIED: Expo monorepo docs]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Workspace package resolution | Custom symlinks or `npm link` | npm workspaces (built-in) | Workspaces auto-symlinks on `npm install`; manual linking breaks on CI |
| Metro monorepo config | Custom `watchFolders` + `nodeModulesPaths` in metro.config.js | Expo SDK 55 built-in monorepo support | SDK 52+ auto-detects and configures Metro for workspaces [VERIFIED: Expo docs] |
| Transpiling workspace TS source in Next.js | Webpack loaders / custom babel config | `transpilePackages` in next.config.ts | Built-in since Next.js 13.0 [CITED: nextjs.org] |
| Cross-workspace typecheck orchestration | Shell scripts | `npm run typecheck --workspaces --if-present` | Built into npm 11; exits non-zero on first failure |

**Key insight:** The entire monorepo resolution and transpilation problem is solved by two config values: `transpilePackages` in next.config.ts and Expo SDK 55's built-in Metro monorepo support. Do not introduce Turborepo, nx, or custom Metro plugins.

---

## Common Pitfalls

### Pitfall 1: Scaffold Tools Generate Standalone tsconfig (Not Extending Base)

**What goes wrong:** Both `create-next-app` and `create-expo-app` generate their own `tsconfig.json` with hardcoded settings that do not extend `../../tsconfig.base.json`. `tsc --noEmit` run from root won't typecheck workspace packages through the extends chain.

**Why it happens:** Scaffold tools don't know about the monorepo root config.

**How to avoid:** After scaffolding, update each app's `tsconfig.json` to add `"extends": "../../tsconfig.base.json"` and remove any duplicated options that the base already covers (strict, skipLibCheck, etc.). Keep app-specific settings (Next.js plugins, jsx override, include paths).

**Warning signs:** `tsc --noEmit` behaves differently when run inside `apps/web` vs from root; apps have different strict mode settings.

### Pitfall 2: Next.js jsx Setting Conflict

**What goes wrong:** `tsconfig.base.json` sets `"jsx": "react-jsx"` (needed by Expo). Next.js requires `"jsx": "preserve"` in `apps/web/tsconfig.json`. If `apps/web` doesn't override this, Next.js may warn and produce incorrect output.

**Why it happens:** Next.js does its own JSX transform pipeline; it needs to receive JSX as-is (`preserve`) so Turbopack processes it.

**How to avoid:** Always set `"jsx": "preserve"` explicitly in `apps/web/tsconfig.json` as a local override. The app-level setting takes precedence over the base.

**Warning signs:** Next.js dev console warning about jsx setting; type errors on JSX expressions in web app.

### Pitfall 3: Duplicate React Versions Causing Metro Failure

**What goes wrong:** If `apps/web` and `apps/mobile` declare different React version ranges, npm may hoist two copies, causing Metro to fail with a "only one copy of React" error.

**Why it happens:** npm workspaces hoist shared dependencies to root `node_modules`; two incompatible version specifiers cannot both hoist.

**How to avoid:** Pin both apps to the same React version (`"react": "19.2.5"` in both). Verify with `npm ls react` after install — should show a single version.

**Warning signs:** Metro error about multiple React instances; `npm ls react` shows two versions.

### Pitfall 4: packages/types Not Included in Workspace Glob

**What goes wrong:** `@local/types` is not resolved because the root `package.json` `workspaces` field does not include `packages/*`.

**Why it happens:** Configuration oversight — forgetting to add the `packages/*` glob.

**How to avoid:** Root `package.json` must have `"workspaces": ["apps/*", "packages/*"]`. Verify with `npm ls @local/types` — should show the local path, not a registry miss.

**Warning signs:** `npm ls @local/types` shows nothing; `import from '@local/types'` fails with "module not found".

### Pitfall 5: PROJECT.md Incorrectly Lists apps/api

**What goes wrong:** `PROJECT.md` (Monorepo structure section) still shows `apps/api` in the monorepo layout. Plans that read only PROJECT.md may scaffold an `apps/api` directory that does not exist in this architecture.

**Why it happens:** PROJECT.md was not updated after D-01 was locked in the discussion phase.

**How to avoid:** CONTEXT.md D-01 supersedes PROJECT.md. There is NO `apps/api`. All API code lives in `apps/web/app/api/` as Next.js Route Handlers. Any plan that creates `apps/api` is incorrect.

**Warning signs:** Any task creating an `apps/api` directory.

---

## Code Examples

### Root package.json

```json
{
  "name": "local-services-marketplace",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "typecheck": "npm run typecheck --workspaces --if-present",
    "dev:web": "npm run dev --workspace=apps/web",
    "dev:mobile": "npm run start --workspace=apps/mobile"
  },
  "devDependencies": {
    "typescript": "^6.0.3"
  }
}
```

### apps/web/package.json (key fields)

```json
{
  "name": "web",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@local/types": "*",
    "next": "^16.2.4",
    "react": "^19.2.5",
    "react-dom": "^19.2.5"
  }
}
```

### apps/mobile/package.json (key fields)

```json
{
  "name": "mobile",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@local/types": "*",
    "expo": "~55.0.20",
    "react": "19.2.5",
    "react-native": "0.85.2"
  }
}
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | TypeScript compiler (`tsc`) — type-checking only for this phase |
| Config file | Per-workspace `tsconfig.json` |
| Quick run command | `npm run typecheck --workspaces --if-present` |
| Full suite command | `npm run typecheck --workspaces --if-present` (same — no runtime tests in this phase) |

This phase has no runtime behavior to test — it is a foundation phase. The only validation is that TypeScript compiles cleanly in strict mode with zero errors across all packages.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TYPES-01 | All enums and DTOs defined in packages/types | Type check | `npm run typecheck --workspaces --if-present` | Wave 0: create packages/types/src/index.ts |
| TYPES-02 | Apps import from @local/types only | Type check + grep audit | `npm run typecheck --workspaces --if-present` | Wave 0: verify no local type defs |
| TYPES-03 | JobStatus and Role enums exported from packages/types | Type check | `npm run typecheck --workspaces --if-present` | Wave 0: define in packages/types |

### Sampling Rate

- **Per task commit:** `npm run typecheck --workspaces --if-present` from root
- **Per wave merge:** `npm run typecheck --workspaces --if-present` from root
- **Phase gate:** All workspaces typecheck green with zero errors before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `packages/types/src/index.ts` — define all required exports (TYPES-01, TYPES-03)
- [ ] `packages/types/tsconfig.json` — extends base, includes src/
- [ ] `apps/web/tsconfig.json` — extends base, jsx: preserve override
- [ ] `apps/mobile/tsconfig.json` — extends base
- [ ] Root `tsconfig.base.json` — strict, moduleResolution: bundler, module: preserve
- [ ] Each package: `typecheck` script in package.json

*(No test framework install needed — this phase uses the TypeScript compiler only)*

---

## Security Domain

This is a types-only foundation phase with no runtime code, endpoints, or data handling. No ASVS categories apply in this phase. Security controls (authentication, input validation, access control) are deferred to Phases 2+.

| ASVS Category | Applies | Reason |
|---------------|---------|--------|
| V2 Authentication | No | No auth code in this phase |
| V3 Session Management | No | No session code in this phase |
| V4 Access Control | No | No access control in this phase |
| V5 Input Validation | No | No runtime input in this phase |
| V6 Cryptography | No | No cryptographic operations in this phase |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16 (requires 20.9+), npm workspaces | ✓ | v25.8.1 | — |
| npm | Workspaces, package management | ✓ | 11.11.0 | — |
| npx | create-next-app, create-expo-app | ✓ | 11.11.0 | — |
| git | Version control | ✓ | 2.50.1 | — |

No missing dependencies. All phase prerequisites are available. Node.js v25.8.1 exceeds the Next.js 16 minimum of v20.9.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `npm run typecheck --workspaces --if-present` exits non-zero if any workspace typecheck fails | Validation Architecture | If npm continues on failure (some versions do), the phase gate check would give a false green. Mitigation: verify exit code behavior, or use a simple shell loop as fallback |
| A2 | Scaffold tool (`create-next-app@16.2.4`) accepts `--yes` to use recommended defaults including TypeScript and Tailwind | Standard Stack | Scaffold may prompt interactively; planner should document exact flags tested during execution |

---

## Open Questions (RESOLVED)

1. **npm --workspaces exit code on first failure**
   - What we know: `npm run <script> --workspaces --if-present` runs the script in each workspace. npm documentation states it runs all workspaces and collects results.
   - What's unclear: Whether npm 11 exits non-zero if one workspace fails but others succeed, or whether it runs all and exits 0 if the majority succeed.
   - Recommendation: The phase gate verification step should run `npm run typecheck --workspaces --if-present` and then explicitly check `echo $?` — or alternatively, add a root-level `typecheck` script that runs per-workspace `tsc --noEmit` calls sequentially with `&&`.
   - **RESOLVED:** Plan 01-03 Task 3 implements the `&&`-chained per-workspace typecheck as an explicit fallback (`npm run typecheck --workspace=packages/types && npm run typecheck --workspace=apps/web && npm run typecheck --workspace=apps/mobile`), guaranteeing a non-zero exit on any workspace failure independent of npm orchestrator exit-code behavior.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `metro.config.js` with watchFolders + nodeModulesPaths | Expo SDK 52+ auto-configures Metro for monorepos | SDK 52 (late 2024) | Eliminates ~20 lines of boilerplate metro config |
| `next-transpile-modules` npm package | `transpilePackages` in next.config.js | Next.js 13.0 | Built-in; no extra dependency needed |
| `moduleResolution: node` | `moduleResolution: bundler` | TypeScript 5.0 (2023) | Works without `.js` extension requirements; correct for bundler environments |
| `const enum` | `enum` or `as const` object | Ongoing best practice | `const enum` is unsafe across module boundaries; Metro inlining fails |
| TypeScript project references for monorepos | Per-workspace `tsc --noEmit` | Ongoing simplification | Project references require composite + declaration emit — unnecessary for private types-only packages |

**Deprecated/outdated:**
- `next-transpile-modules`: replaced by `transpilePackages` since Next.js 13; do not install.
- Manual Metro `watchFolders` config: only needed for SDK < 52; Expo SDK 55 makes this obsolete.

---

## Sources

### Primary (HIGH confidence)

- npm registry (`npm view <package> version`) — all package versions verified 2026-05-05
- [Expo monorepos guide](https://docs.expo.dev/guides/monorepos/) — Metro auto-config for SDK 52+, npm workspaces support, workspace:* protocol [VERIFIED]
- [Next.js transpilePackages](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages) — syntax, version history (added v13.0.0) [VERIFIED]
- [Next.js TypeScript config](https://nextjs.org/docs/app/api-reference/config/typescript) — tsconfig requirements, jsx: preserve requirement [VERIFIED]
- [expo/tsconfig.base on GitHub](https://github.com/expo/expo/blob/main/packages/expo/tsconfig.base.json) — moduleResolution: bundler, module: preserve, jsx: react-jsx [VERIFIED]
- [Next.js installation docs](https://nextjs.org/docs/app/getting-started/installation) — Node.js 20.9+ minimum requirement [VERIFIED]
- npm workspaces docs (`npm help workspaces`) — --workspaces --if-present flag behavior [VERIFIED]

### Secondary (MEDIUM confidence)

- [Nx blog: Managing TypeScript Packages in Monorepos](https://nx.dev/blog/managing-ts-packages-in-monorepos) — raw source vs compiled output tradeoffs, package.json exports field patterns

### Tertiary (LOW confidence)

- [Expo GitHub issue #30143](https://github.com/expo/expo/issues/30143) — historical npm workspaces issue (SDK 51); resolved in SDK 52+. Confirms SDK 52+ is the minimum to avoid npm workspace friction.

---

## Metadata

**Confidence breakdown:**
- Standard stack (versions): HIGH — verified via npm registry
- Architecture (raw source export pattern): HIGH — confirmed via official Next.js and Expo docs
- Pitfalls: HIGH — verified by cross-referencing official docs and direct file inspection (PROJECT.md)
- TypeScript config values: HIGH — verified against expo/tsconfig.base source and Next.js docs
- Per-workspace tsc orchestration: MEDIUM — npm workspaces exit behavior not tested empirically; flagged in Open Questions

**Research date:** 2026-05-05
**Valid until:** 2026-08-05 (90 days — Next.js and Expo release frequently; re-verify if Expo SDK 56 or Next.js 17 releases)
