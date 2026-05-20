# LocalPro — Local Services Marketplace

A multi-platform full-stack marketplace connecting **Clients** (web) with **Service Providers** (mobile) for local tasks.

## Live Deployments

| App | Platform | URL |
|-----|----------|-----|
| Web (Next.js) | Vercel | https://web-gules-six-7paux4gsbf.vercel.app |
| Mobile (Expo web) | Netlify | https://local-services-marketplace.netlify.app |
| Database | Neon serverless PostgreSQL | Managed via [neon.tech](https://neon.tech) |

**Test credentials**: `james.hartley@gmail.com` / `password123` (Client) · `tom.reeves@gmail.com` / `password123` (Provider) · `admin@admin.com` / `admin` (Admin)

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

Migrations live in [`apps/web/drizzle/`](apps/web/drizzle/), tracked by [`apps/web/drizzle/meta/_journal.json`](apps/web/drizzle/meta/_journal.json). See [`apps/web/drizzle/README.md`](apps/web/drizzle/README.md) for the full migration table and manual apply instructions.

```bash
cd apps/web
npx drizzle-kit migrate
```

## Architecture

```mermaid
graph TD
    subgraph Clients
        WEB[Web Browser\nNext.js / React]
        MOB[Mobile App\nReact Native / Expo]
    end

    subgraph "Next.js App (apps/web)"
        API[API Routes\n/api/*]
        WS[WebSocket Server\nws]
        AUTH[Auth\nJWT + bcrypt]
        ORM[Drizzle ORM]
    end

    subgraph "Shared"
        TYPES[packages/types\nShared DTOs & Enums]
    end

    subgraph "Infrastructure"
        DB[(Neon PostgreSQL)]
    end

    WEB -->|HTTP + cookies| API
    WEB -->|WebSocket| WS
    MOB -->|HTTP + Bearer token| API
    API --> AUTH
    API --> ORM
    WS --> ORM
    ORM --> DB
    WEB -.->|imports| TYPES
    MOB -.->|imports| TYPES
    API -.->|imports| TYPES
```

## Database Schema

```mermaid
erDiagram
    users {
        serial id PK
        varchar email
        text password_hash
        varchar name
        text avatar_url
        varchar status
        timestamp created_at
    }

    user_roles {
        integer user_id FK
        varchar role
    }

    job_categories {
        serial id PK
        varchar name
    }

    locations {
        serial id PK
        varchar name
        varchar city
        varchar country
    }

    jobs {
        serial id PK
        varchar status
        integer version
        integer category_id FK
        text description
        varchar timeframe
        integer location_id FK
        integer client_id FK
        integer provider_id FK
        timestamp created_at
        timestamp updated_at
    }

    reviews {
        serial id PK
        integer job_id FK
        integer reviewer_id FK
        integer reviewee_id FK
        varchar review_type
        integer client_communication
        integer client_quality
        integer client_punctuality
        integer provider_payment_reliability
        integer provider_communication_clarity
        integer provider_professionalism
        text text
        text photo_url
        timestamp approved_at
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ user_roles : "has"
    users ||--o{ jobs : "posts (client)"
    users ||--o{ jobs : "accepts (provider)"
    job_categories ||--o{ jobs : "categorises"
    locations ||--o{ jobs : "located at"
    jobs ||--o{ reviews : "has"
    users ||--o{ reviews : "writes"
    users ||--o{ reviews : "receives"
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

## Documentation

Extended docs live in [`docs/`](docs/):

- [PROJECT-DOCUMENTATION.md](docs/PROJECT-DOCUMENTATION.md) — full project reference
- [NEON-SETUP.md](docs/NEON-SETUP.md) — database setup
- [PRODUCTION-ACCESS.md](docs/PRODUCTION-ACCESS.md) — production environment
- [MOBILE-EMULATOR-TEST-GUIDE.md](docs/MOBILE-EMULATOR-TEST-GUIDE.md) — mobile testing
- [E2E-STATUS.md](docs/E2E-STATUS.md) — end-to-end test status

## License

MIT
