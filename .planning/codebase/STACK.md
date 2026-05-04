# Technology Stack

**Analysis Date:** 2026-05-04
**Status:** PLANNED — no code exists yet. This document reflects the intended stack from `Agents.md`.

## Languages

**Primary:**
- TypeScript (Strict Mode) — all layers: web, mobile, backend, shared types

## Runtime

**Environment:**
- Node.js — backend API server

**Package Manager:**
- Not yet specified; monorepo tooling (e.g., npm workspaces or pnpm) implied by `packages/types` shared layer
- Lockfile: not yet present

## Frameworks

**Web Frontend:**
- Next.js (App Router) — client-facing web application
- React + TypeScript (strict mode)
- Tailwind CSS — styling

**Mobile Frontend:**
- React Native via Expo — service provider mobile application

**Backend:**
- Next.js API Routes — backend API (same Next.js app as frontend)

**Real-time:**
- WebSockets — live job status updates between backend and clients

## Database

**Database:**
- Neon — serverless PostgreSQL, source of truth for all application state

**ORM:**
- Drizzle ORM — database client and schema management

## Monorepo Structure

**Shared Types Package:**
- `packages/types` — DTOs, API response shapes, and Enums shared across web and mobile clients
- Both web (Next.js) and mobile (Expo) import from this package to maintain schema synchronization

## Key Design Constraints

- TypeScript strict mode is non-negotiable across all packages
- The database is the absolute source of truth — no client state overrides it
- Shared types package is the contract between frontend and backend

---

*Stack analysis: 2026-05-04*
