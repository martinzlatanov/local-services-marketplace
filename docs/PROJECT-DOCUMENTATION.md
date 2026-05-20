# Local Services Marketplace — Project Documentation

**Application**: LocalPro — Local Services Task Marketplace
**Version**: 0.0.1
**Date**: 2026-05-20

---

## 1. Project Description

LocalPro is a multi-platform full-stack marketplace connecting **Clients** (web) with **Service Providers** (mobile) for local tasks.

**Core flow**:
- Clients post jobs (plumbing, electrical, cleaning, gardening, moving, handyman, painting, other).
- Providers browse pending jobs in real time, accept them, and update status through the lifecycle.
- Reviews and ratings are submitted after completion; admins approve reviews before they become public.

**Who can do what**:
- **CLIENT** — Register/login, post jobs, view own jobs, submit reviews for providers.
- **PROVIDER** — Register/login, browse/accept jobs, update job status (ACCEPTED → IN_PROGRESS → COMPLETED), submit reviews for clients.
- **ADMIN** — Manage categories/locations, approve reviews, create users.

**Key features**:
- Optimistic concurrency control via `version` column on jobs.
- State machine enforcement: `PENDING → ACCEPTED → IN_PROGRESS → COMPLETED`.
- Real-time updates via WebSockets.
- Review system with category-specific ratings and admin moderation.
- Unified TypeScript types shared across web and mobile via `@local/types`.

---

## 2. Architecture

### 2.1 Technology Stack
- **Language**: TypeScript (strict mode)
- **Web Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS
- **Mobile Frontend**: React Native + Expo Router + React Native Paper
- **Backend**: Next.js API Routes (serverless)
- **Database**: Neon serverless PostgreSQL + Drizzle ORM
- **Real-time**: WebSocket server (ws) + client-side reconnection
- **Auth**: JWT (45 min expiry) + bcrypt password hashing + HTTP-only cookies
- **Testing**: Jest (web), TypeScript type-level tests (packages/types)

### 2.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              LOCAL SERVICES MARKETPLACE                         │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐                    ┌─────────────────────────┐
│   Web (Next.js)         │                    │  Mobile (Expo)          │
│   apps/web/             │                    │  apps/mobile/           │
│                         │                    │                         │
│  ┌───────────────────┐  │   HTTP/WS          │  ┌───────────────────┐  │
│  │  React Frontend   │◄┼────────────────────►│  │  React Native    │  │
│  │  (Client UI)      │  │                    │  │  (Provider UI)   │  │
│  └────────┬──────────┘  │                    │  └────────┬──────────┘  │
│           │             │                    │           │            │
│  ┌────────▼──────────┐  │                    │  ┌────────▼──────────┐  │
│  │  API Route        │  │                    │  │  API Client      │  │
│  │  Handlers         │  │                    │  │  (fetch wrappers) │  │
│  └────────┬──────────┘  │                    │  └────────┬──────────┘  │
└───────────┼─────────────┘                    └──────────┼─────────────┘
            │                                           │
            │  API Routes (/api/*)                      │
            │  jobs, auth, reviews, users               │
            ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    Next.js Backend (serverless)                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐               │
│  │  Auth            │  │  Job Lifecycle   │  │  WebSocket Hub   │               │
│  │  JWT + bcrypt    │  │  State Machine   │  │  Broadcast per   │               │
│  │  HTTP-only cookies│  │  version check   │  │  user session    │               │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘               │
│  ┌──────────────────┐  ┌──────────────────┐                                     │
│  │  Drizzle ORM     │  │  Review System   │                                     │
│  │  + Neon Postgres │  │  Admin approval  │                                     │
│  └──────────────────┘  └──────────────────┘                                     │
└───────────────────────────────────┬─────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     Neon (Serverless PostgreSQL)                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │ users    │ │ jobs     │ │ reviews  │ │user_roles│ │locations │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
│                  Source of Truth                                               │
└─────────────────────────────────────────────────────────────────────────────────┘

Shared Contracts:
┌─────────────────────────────────────────────────────────────────────────────────┐
│  packages/types/ — DTOs, Enums, API shapes                                      │
│  Imported by: web frontend, mobile frontend, backend API                        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Data Flow Diagram

```
┌──────────────┐      POST /api/jobs       ┌──────────────────┐
│  Client Web  │ ───────────────────────►  │  Backend API     │
│  (Posts job) │                           │  (Creates job)   │
└──────┬───────┘                           └────────┬─────────┘
       │                                           │
       │  GET /api/jobs?cityArea=X                │ INSERT jobs
       │  (PENDING jobs filtered)                ▼
       │                              ┌──────────────────┐
       │                              │  Neon PostgreSQL  │
       │                              └────────┬─────────┘
       │                                       │
       │         ┌─────────────────────────────┘
       │         ▼
       │  ┌──────────────────┐
       │  │  Provider Mobile │
       │  │  (Sees PENDING)  │
       │  └────────┬─────────┘
       │           │
       │  POST /api/jobs/:id/accept
       │  (version included)
       │           │
       ▼           ▼
┌──────────────────────────────────────────────────────────┐
│  CONCURRENCY: version check in WHERE clause              │
│  First match → HTTP 200, version++                       │
│  Second match → HTTP 409 Conflict                        │
└─────────────────────────────┬────────────────────────────┘
                              │
                              │ WebSocket broadcast
                              ▼
                    ┌──────────────────┐
                    │  Client Web      │
                    │  (Sees ACCEPTED) │
                    └──────────────────┘
```

**Data flow**:
- Web and mobile both consume the same REST API (`/api/jobs`, `/api/auth/*`, `/api/reviews`, etc.).
- WebSocket events (`JOB_UPDATED`, `review_approved`) are pushed to connected clients for the affected user.
- All DTOs and request/response shapes are defined in `packages/types` and imported by both clients.

**Key packages**:
- `apps/web` — Next.js client + API routes + Drizzle migrations
- `apps/mobile` — Expo React Native app
- `packages/types` — Shared TypeScript contracts (JobStatus, Role, JobDto, ReviewDTO, etc.)

---

## 3. Database Schema Design

### 3.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   users     │       │   user_roles    │       │  job_       │
│─────────────│       │─────────────────│       │ categories  │
│ id (PK)     │◄──┐   │ user_id (FK)   │   ┌──►│─────────────│
│ email       │   └──►│ role (PK)      │   │   │ id (PK)     │
│ password_hash│       │ (CLIENT|PROV|ADM)│  │   │ name        │
│ name        │       └─────────────────┘   │   └─────────────┘
│ avatar_url  │                              │
│ status      │                              │   ┌─────────────┐
│ created_at  │                              └──►│  locations   │
└──────┬──────┘                                 │─────────────│
       │                                        │ id (PK)     │
       │                                        │ name        │
       │                                        │ city        │
       │                                        │ country     │
       ▼                                        └─────────────┘
┌─────────────────┐
│     jobs        │
│─────────────────│
│ id (PK)         │
│ status          │◄──┐
│ version         │   │
│ category_id(FK) │───┘
│ location_id(FK) │───┘
│ description     │
│ timeframe       │
│ client_id (FK)  │◄──┐
│ provider_id(FK) │───┘
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│    reviews      │       │ review_approvals│
│─────────────────│       │─────────────────│
│ id (PK)         │◄──┐   │ review_id (FK)  │
│ job_id (FK)     │   │   │ approved_by(FK) │
│ reviewer_id(FK) │───┘   │ approved_at     │
│ reviewee_id(FK) │       │ rejection_reason│
│ review_type     │       └─────────────────┘
│ client_* ratings│
│ provider_* ratings│
│ text            │
│ photo_url       │
│ approved_at     │
│ created_at      │
└─────────────────┘
```

### 3.2 Main Tables & Relationships (simplified)

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

**Relationships**:
- One user → many roles (via `user_roles`)
- One job → one category, one location
- One job → one client, optional one provider
- One job → many reviews (one per participant after completion)
- Reviews are public only after `approved_at` is set by admin

---

## 4. State Machine Diagram

```
                    ┌──────────────┐
                    │   CREATED    │
                    └──────┬───────┘
                           │
                           ▼
┌─────────┐    Client     ┌────────────┐    Provider    ┌────────────┐    Provider    ┌─────────────┐
│ PENDING │──────────────►│  ACCEPTED  │──────────────►│ IN_PROGRESS│─────────────►│  COMPLETED  │
└────┬────┘  POST /api/jobs  └─────┬─────┘  POST accept  └─────┬──────┘  PATCH status  └──────┬──────┘
     │                            │                          │                           │
     │    Concurrent accept       │                          │                           │
     │    detected → 409          │                          │                           │
     │                            │                          │                           │
     └────────────────────────────┘                          │                           │
              Invalid transition                             │                           │
              (e.g. PENDING→COMPLETED)                      │                           │
                                                            │                           │
                                                            │     Client closes        │
                                                            │                           │
                                                            └───────────────────────────┘
                                                              CLOSE-01: PATCH status
```

---

## 5. API Endpoints

```
┌──────────────────────────────────────────────────────────────────────────┐
│  AUTH                                                                      │
│  POST   /api/auth/register  — Register user (email, password, role)      │
│  POST   /api/auth/login     — Login (returns JWT in httpOnly cookie)    │
│  GET    /api/auth/me        — Get current user profile                   │
│  POST   /api/auth/logout    — Invalidate session                         │
├──────────────────────────────────────────────────────────────────────────┤
│  JOBS                                                                      │
│  GET    /api/jobs              — List PENDING jobs (filtered by area)   │
│  POST   /api/jobs              — Create job (client)                    │
│  GET    /api/jobs/:id          — Get job details                        │
│  PATCH  /api/jobs/:id/accept   — Accept job (provider, version check)   │
│  PATCH  /api/jobs/:id/status   — Update status (provider, state machine)│
│  GET    /api/jobs/mine         — Get ACCEPTED+IN_PROGRESS jobs          │
├──────────────────────────────────────────────────────────────────────────┤
│  REVIEWS                                                                   │
│  POST   /api/reviews           — Create review (after COMPLETED)        │
│  GET    /api/reviews            — List reviews (filtered by userId)     │
│  GET    /api/reviews/pending    — Pending reviews (admin)               │
│  PATCH  /api/reviews/:id/approve — Approve review (admin)              │
├──────────────────────────────────────────────────────────────────────────┤
│  ADMIN                                                                    │
│  GET    /api/admin/reviews/pending  — Pending reviews queue             │
│  PATCH  /api/admin/reviews/:id/approve — Approve review                │
│  GET    /api/users              — List users (admin)                    │
│  PATCH  /api/users/:id          — Suspend/activate user                │
│  PATCH  /api/users/:id/roles    — Assign/remove roles                  │
├──────────────────────────────────────────────────────────────────────────┤
│  USERS                                                                    │
│  GET    /api/users/:id          — Get public user profile               │
│  GET    /api/providers/:id      — Provider profile + reviews            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Local Development Setup Guide

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

### 3. Database Migrations
```bash
cd apps/web
npx drizzle-kit push:pg          # or migrate
npx drizzle-kit generate:pg      # after schema changes
```

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
The WebSocket server starts automatically with Next.js dev server.

### 7. Type Checking & Tests
```bash
npm run typecheck
npm test --workspace=apps/web
```

---

## 7. Key Folders and Files

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

---

**End of Documentation**
Generated from codebase analysis on 2026-05-20.
