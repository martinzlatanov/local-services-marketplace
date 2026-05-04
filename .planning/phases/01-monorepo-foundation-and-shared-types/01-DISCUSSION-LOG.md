# Phase 1: Monorepo Foundation & Shared Types - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-04
**Phase:** 1-Monorepo Foundation & Shared Types
**Areas discussed:** Stack correction, App structure, Package manager

---

## Stack Correction

Before gray area discussion, the user surfaced a correction to the planned tech stack:

**Correct stack:**
- Backend: Next.js API Route Handlers (NOT a separate Node.js backend)
- Database: Neon (serverless PostgreSQL) + Drizzle ORM (NOT Prisma)
- Frontend: Next.js + React + TypeScript + Tailwind
- Mobile: React Native + Expo

**Impact:** The ROADMAP plans incorrectly reference `apps/api` as a separate backend and use "Prisma schema" throughout. These must all be corrected to reflect Drizzle and the unified `apps/web` architecture.

**Notes:** The codebase mapper (STACK.md) correctly identified Drizzle + Neon. ARCHITECTURE.md and all ROADMAP plans need updating.

---

## App Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Unified apps/web | Next.js app with frontend pages + API Route Handlers — apps/web serves both web UI and REST API | ✓ |
| Separate apps/web + apps/api | Two Next.js apps — frontend separate from backend | |

**User's choice:** Unified `apps/web` — confirmed via curriculum specification: "The Next.js app will hold your back-end APIs + Web client app."

**Notes:** Monorepo has two apps only (`apps/web`, `apps/mobile`) plus `packages/types`. Serverless deployment (Netlify or similar) with Neon as serverless database.

---

## Package Manager

| Option | Description | Selected |
|--------|-------------|----------|
| npm workspaces | Built-in to Node.js, no extra install, simple setup | ✓ |
| pnpm workspaces | Faster installs, strict dependency isolation, requires pnpm globally | |

**User's choice:** npm workspaces

**Notes:** Standard choice for simplicity. Single `npm install` at root resolves all workspace dependencies.

---

## Claude's Discretion

- Types package build strategy (raw TS project references vs compiled output)
- App skeleton depth (bare shells vs create-next-app / create-expo-app boilerplate)

## Deferred Ideas

None.
