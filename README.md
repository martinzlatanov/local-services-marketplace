# LocalPro — Local Services Marketplace

A multi-platform full-stack marketplace connecting **Clients** (web) with **Service Providers** (mobile) for local tasks.

## Overview

LocalPro enables clients to post jobs (plumbing, electrical, cleaning, gardening, moving, handyman, painting, etc.) and service providers to browse, accept, and complete them in real time.

**Core Flow**:
- Clients post jobs with descriptions, categories, and locations
- Providers browse pending jobs and accept them
- Job status transitions: `PENDING → ACCEPTED → IN_PROGRESS → COMPLETED`
- Reviews and ratings are submitted after completion; admins approve reviews before they become public

**Roles**:
- **CLIENT** — Register/login, post jobs, view own jobs, submit reviews
- **PROVIDER** — Register/login, browse/accept jobs, update job status, submit reviews
- **ADMIN** — Manage categories/locations, approve reviews, create users

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Web Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS
- **Mobile Frontend**: React Native + Expo Router + React Native Paper
- **Backend**: Next.js API Routes (serverless)
- **Database**: Neon serverless PostgreSQL + Drizzle ORM
- **Real-time**: WebSocket server (ws) + client-side reconnection
- **Auth**: JWT (45 min expiry) + bcrypt + HTTP-only cookies

## Project Structure

```
local-services-marketplace/
├── apps/
│   ├── web/              # Next.js web app (clients + admin)
│   │   ├── app/
│   │   │   ├── api/      # API routes (jobs, auth, reviews, admin)
│   │   │   ├── dashboard/
│   │   │   ├── browse/
│   │   │   └── admin/
│   │   ├── lib/
│   │   │   ├── db/       # Drizzle schema & client
│   │   │   ├── auth.ts   # JWT + bcrypt
│   │   │   └── websocket.ts
│   │   └── components/
│   └── mobile/           # Expo React Native app (providers)
│       ├── app/
│       ├── contexts/
│       ├── lib/api.ts
│       └── lib/storage.ts
├── packages/
│   └── types/            # Shared TypeScript contracts
├── drizzle/              # Migration SQL files
└── package.json
```

## Local Development

### Prerequisites
- Node.js 18+
- npm (or pnpm)
- PostgreSQL (local) or Neon account
- Expo CLI (for mobile)

### Setup

```bash
# Clone and install
git clone <repo>
cd local-services-marketplace
npm install

# Environment variables - create .env.local in apps/web
DATABASE_URL=postgres://user:pass@localhost:5432/local_services
JWT_SECRET=your-super-secret-key
```

### Run Development Servers

```bash
# Web (Next.js)
npm run dev:web
# http://localhost:3000

# Mobile (Expo)
npm run dev:mobile

# Type checking
npm run typecheck
```

### Database

```bash
cd apps/web
npx drizzle-kit push:pg
npx drizzle-kit generate:pg
```

## Key Features

- **Optimistic Concurrency** — `version` column on jobs prevents race conditions
- **State Machine** — Enforced transitions: `PENDING → ACCEPTED → IN_PROGRESS → COMPLETED`
- **Real-time Updates** — WebSocket events for job status changes
- **Review System** — Category-specific ratings with admin moderation
- **Unified Types** — Shared TypeScript contracts across web and mobile

## API Endpoints

- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/jobs` — List jobs
- `POST /api/jobs` — Create job
- `PATCH /api/jobs/[id]` — Update job status (with version check)
- `POST /api/reviews` — Create review
- `GET /api/admin/reviews/pending` — Pending reviews for admin
- `PATCH /api/admin/reviews/[id]/approve` — Approve review

## License

MIT
