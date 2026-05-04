# Phase 1: Monorepo Foundation & Shared Types - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold the npm workspaces monorepo with two apps (`apps/web`, `apps/mobile`) and one shared package (`packages/types`). Define every cross-platform TypeScript contract in `packages/types`. All apps must build cleanly with `tsc --noEmit` in strict mode before this phase is complete. No application logic — foundation only.

</domain>

<decisions>
## Implementation Decisions

### Corrected Architecture (resolved during discussion)
- **D-01:** The backend API lives inside `apps/web` as Next.js Route Handlers — there is NO separate `apps/api`. The ROADMAP plans incorrectly reference `apps/api` and must be revised.
- **D-02:** ORM is **Drizzle ORM** (not Prisma). The ROADMAP plans incorrectly reference "Prisma schema" throughout — all instances must be changed to Drizzle schema/migrations.
- **D-03:** Database is **Neon** (serverless PostgreSQL) — not generic PostgreSQL.
- **D-04:** Deployment target is serverless (Netlify or similar managed platform).

### Monorepo Structure
- **D-05:** Package manager: **npm workspaces** (built-in, no extra tooling required).
- **D-06:** Monorepo has exactly two apps and one package:
  ```
  [root]/
  ├── apps/
  │   ├── web/      # Next.js — frontend (React + Tailwind) + backend (API Route Handlers) + Drizzle
  │   └── mobile/   # Expo/React Native
  └── packages/
      └── types/    # Shared TypeScript: DTOs, Enums, API contracts
  ```
- **D-07:** A single `npm install` at the root resolves all inter-package dependencies via workspace references.

### Shared Types Package (`packages/types`)
- **D-08:** `packages/types` must export: `JobStatus` enum (`PENDING`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`), `Role` enum (`CLIENT`, `PROVIDER`), all job DTO interfaces, all API request/response wrapper types, and the error response shape.
- **D-09:** Neither `apps/web` nor `apps/mobile` defines local type duplicates — all cross-platform contracts come from `packages/types`.

### TypeScript Configuration
- **D-10:** TypeScript strict mode across all packages — non-negotiable per curriculum.
- **D-11:** Shared `tsconfig.base.json` at root; each app extends it.

### Claude's Discretion
- Types package build strategy (raw TS source via project references vs compiled output) — Claude chooses the approach that works cleanly with npm workspaces and Expo's Metro bundler.
- App skeleton depth (bare shells vs framework boilerplate) — Claude uses `create-next-app` and `create-expo-app` where appropriate.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specification
- `.planning/PROJECT.md` — project goals, constraints, key decisions
- `.planning/REQUIREMENTS.md` — TYPES-01, TYPES-02, TYPES-03 (this phase's requirements)
- `.planning/ROADMAP.md` — Phase 1 success criteria (NOTE: plans reference Prisma/apps/api incorrectly — see D-01 through D-04 above for corrections)

### Codebase Maps
- `.planning/codebase/STACK.md` — technology stack (Drizzle + Neon confirmed)
- `.planning/codebase/ARCHITECTURE.md` — architectural patterns (being updated to reflect corrections)

### Coding Guidelines
- `behavioral-guideines.md` — simplicity-first, surgical changes, goal-driven execution
- `Agents.md` — TypeScript strict mode, shared types contract, state machine rules

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code.

### Established Patterns
- TypeScript strict mode is mandated across all packages (from `Agents.md`).
- Shared types rule: all cross-platform contracts in `packages/types`, never duplicated in apps.

### Integration Points
- `packages/types` is the integration seam — every subsequent phase imports from it.
- `apps/web` Route Handlers are the API surface — mobile and web both consume it.

</code_context>

<specifics>
## Specific Ideas

- The architecture follows a client-server model: React frontend (Next.js pages) + Next.js Route Handlers (API) in a single `apps/web` app; Expo mobile in `apps/mobile`.
- Serverless deployment on a managed platform (Netlify or similar) with Neon as the database.
- The `packages/types` package is the contract layer — planner should ensure it's consumable from both Next.js (Node/browser) and Expo (Metro bundler) without issues.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Monorepo Foundation & Shared Types*
*Context gathered: 2026-05-04*
