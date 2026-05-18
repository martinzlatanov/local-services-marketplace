# Local Services Marketplace — Project Documentation

**Application:** LocalPro — Local Services Task Marketplace  
**Version:** 0.0.1  
**Date:** 2026-05-16

---

## 1. Project Description

LocalPro is a multi-platform full-stack marketplace connecting **Clients** (web) with **Service Providers** (mobile) for local tasks.

**Core flow:**
- Clients post jobs (plumbing, electrical, cleaning, gardening, moving, handyman, painting, other).
- Providers browse pending jobs in real time, accept them, and update status through the lifecycle.
- Reviews and ratings are submitted after completion; admins approve reviews before they become public.

**Who can do what:**
- **CLIENT** — Register/login, post jobs, view own jobs, submit reviews for providers.
- **PROVIDER** — Register/login, browse/accept jobs, update job status (ACCEPTED → IN_PROGRESS → COMPLETED), submit reviews for clients.
- **ADMIN** — Manage categories/locations, approve pending reviews, create users.

**Key features:**
- Optimistic concurrency control via `version` column on jobs.
- State machine enforcement: `PENDING → ACCEPTED → IN_PROGRESS → COMPLETED`.
- Real-time updates via WebSockets.
- Review system with category-specific ratings and admin moderation.
- Unified TypeScript types shared across web and mobile via `@local/types`.

---

## 2. Architecture

### 2.1 Technology Stack
- **Language:** TypeScript (strict mode)
- **Web Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS
- **Mobile Frontend:** React Native + Expo Router + React Native Paper
- **Backend:** Next.js API Routes (serverless)
- **Database:** Neon serverless PostgreSQL + Drizzle ORM
- **Real-time:** WebSocket server (ws) + client-side reconnection
- **Auth:** JWT (45 min expiry) + bcrypt password hashing + HTTP-only cookies
- **Testing:** Jest (web), TypeScript type-level tests (packages/types)

### 2.2 High-Level Components & Communication

```
┌────────────────────┐          ┌────────────────────┐
│   Web (Next.js)    │◄────────►│  Mobile (Expo)     │
│   - Clients        │   HTTP   │  - Providers       │
│   - Admin          │  + WS    │                    │
└─────────┬──────────┘          └─────────┬──────────┘
          │                               │
          │  API Routes (/api/*)          │
          │  (jobs, auth, reviews, users) │
          ▼                               ▼
┌─────────────────────────────────────────────────────┐
│              Next.js Backend (shared)               │
│  - Auth (JWT + bcrypt)                              │
│  - Drizzle ORM + Neon PostgreSQL                    │
│  - WebSocket server (broadcast per user)            │
│  - State machine + optimistic concurrency           │
└─────────────────────────────────────────────────────┘
```

**Data flow:**
- Web and mobile both consume the same REST API (`/api/jobs`, `/api/auth/*`, `/api/reviews`, etc.).
- WebSocket events (`JOB_UPDATED`, `review_approved`) are pushed to connected clients for the affected user.
- All DTOs and request/response shapes are defined in `packages/types` and imported by both clients.

**Key packages:**
- `apps/web` — Next.js client + API routes + Drizzle migrations
- `apps/mobile` — Expo React Native app
- `packages/types` — Shared TypeScript contracts (JobStatus, Role, JobDto, ReviewDTO, etc.)

---

## 3. Database Schema Design

### Main Tables & Relationships (simplified)

```
users
├── id (PK)
├── email (unique)
├── password_hash
├── name, avatar_url, status
└── created_at

user_roles
├── user_id (FK → users.id, PK composite)
└── role ('CLIENT' | 'PROVIDER' | 'ADMIN')

job_categories
├── id (PK)
└── name (unique)

locations
├── id (PK)
├── name (unique)
├── city, country

jobs
├── id (PK)
├── status (PENDING | ACCEPTED | IN_PROGRESS | COMPLETED)
├── version (integer, optimistic lock)
├── category_id (FK → job_categories.id)
├── location_id (FK → locations.id)
├── description, timeframe
├── client_id (FK → users.id)
├── provider_id (FK → users.id, nullable)
├── created_at, updated_at

reviews
├── id (PK)
├── job_id (FK → jobs.id)
├── reviewer_id (FK → users.id)
├── reviewee_id (FK → users.id)
├── review_type ('client' | 'provider')
├── client_* ratings (communication, quality, punctuality)
├── provider_* ratings (paymentReliability, communicationClarity, professionalism)
├── text, photo_url
├── approved_at (nullable)
├── created_at, updated_at
└── unique constraint (job_id, reviewer_id)
```

**Relationships:**
- One user → many roles (via `user_roles`)
- One job → one category, one location
- One job → one client, optional one provider
- One job → many reviews (one per participant after completion)
- Reviews are public only after `approved_at` is set by admin

---

## 4. Local Development Setup Guide

### Prerequisites
- Node.js 18+
- npm (or pnpm)
- PostgreSQL (local) or Neon account
- Expo CLI (for mobile)

### 1. Clone & Install
```bash
git clone <repo>
cd local-services-marketplace
npm install
```

### 2. Environment Variables
Create `.env.local` in `apps/web`:
```env
DATABASE_URL=postgres://user:pass@localhost:5432/local_services
JWT_SECRET=your-super-secret-key
```

For production (Neon):
```bash
export DATABASE_URL="postgres://...@ep-xxx.region.aws.neon.tech/db?sslmode=require"
```

### 3. Database Migrations
```bash
cd apps/web
npx drizzle-kit push:pg          # or migrate
npx drizzle-kit generate:pg      # after schema changes
```

Seed initial data (categories & locations) via admin endpoints or SQL.

### 4. Run Web (Next.js)
```bash
npm run dev:web
# http://localhost:3000
```

### 5. Run Mobile (Expo)
```bash
npm run dev:mobile
# Scan QR or run on iOS/Android simulator
```

### 6. WebSocket Server
The WebSocket server starts automatically with Next.js dev server (see `server.js` and `lib/ws/server.ts`).

### 7. Type Checking & Tests
```bash
npm run typecheck
npm test --workspace=apps/web
```

### 8. Admin Access
Register a user with role `ADMIN` via `/api/admin/*` endpoints or database insert.

---

## 5. Key Folders and Files

### Root
- `package.json` — workspace root, scripts for web/mobile/typecheck
- `tsconfig.base.json` — shared TypeScript config (strict mode)
- `AGENTS.md` — project guidelines for AI agents
- `NEON-SETUP.md` — production database instructions

### `apps/web`
- `app/` — Next.js App Router pages & API routes
  - `api/jobs/*` — job CRUD + state transitions + optimistic concurrency
  - `api/auth/*` — register, login, me, logout
  - `api/reviews/*` — create reviews, admin approval queue, public profiles
  - `api/admin/*` — category/location/user management
  - `dashboard/`, `browse/`, `providers/[id]/`, `admin/*` — UI pages
- `lib/db/` — Drizzle schema (`schema.ts`), client (`client.ts`), query helpers (`job-query.ts`)
- `lib/auth.ts` — JWT, bcrypt, user/role helpers
- `lib/websocket.ts` + `lib/ws/server.ts` — real-time client & server
- `components/` — Navbar, ReviewForm, UserRating, admin cards, etc.
- `contexts/AuthContext.tsx` — React context for auth state
- `drizzle.config.ts` — Drizzle Kit config pointing to `lib/db/schema.ts`
- `drizzle/` — migration SQL files (auto-generated)

### `apps/mobile`
- `app/` — Expo Router file-based navigation
  - `(auth)/` — login, register
  - `(app)/(tabs)/` — feed, active-jobs, settings
  - `(app)/onboarding.tsx` — service area selection
- `contexts/AuthContext.tsx` — auth + API base URL logic
- `lib/api.ts` — typed fetch wrappers for jobs/reviews
- `lib/storage.ts` — SecureStore wrapper
- `components/AvatarInitials.tsx`

### `packages/types`
- `src/index.ts` — single source of truth for all DTOs, enums, request shapes
  - `JobStatus`, `Role`, `JobDto`, `CreateJobRequest`, `ReviewDTO`, WebSocket events, etc.
- `src/index.test.ts` — type-level compile tests

### Other notable files
- `apps/web/app/api/jobs/[id]/route.ts` — PATCH implements state machine + version check
- `apps/web/app/api/reviews/route.ts` — complex review creation + multiple query patterns
- `apps/mobile/app/_layout.tsx` — navigation guard + auth + service area routing

---

**End of Documentation**  
Generated from codebase analysis on 2026-05-16.
