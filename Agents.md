# AGENTS.md

## 1. Project Context
**Application:** Local Services Task Marketplace.
**Scope:** A multi-platform full-stack application connecting Service Providers (Mobile) with Clients (Web).
**Core Logic:** Job posting, real-time bidding/acceptance, and lifecycle management of local tasks.

## 2. Technology Stack
Adhere to the following stack as defined in the course curriculum:
*   **Language:** TypeScript (Strict Mode).
*   **Web Frontend:** Next.js (App Router).
*   **Mobile Frontend:** React Native via Expo.
*   **Backend:** Node.js with RESTful API architecture.
*   **Database:** Relational (PostgreSQL) using Prisma ORM.
*   **Real-time Communication:** WebSockets for live status updates.

## 3. Architectural Guidelines
### 3.1. Unified Type System
*   Define all Data Transfer Objects (DTOs), API response shapes, and Enums in a shared `packages/types` directory.
*   Ensure both Web and Mobile clients import these types to maintain schema synchronization.

### 3.2. State Management & Concurrency
*   **Source of Truth:** The database is the absolute source of truth.
*   **Optimistic Concurrency:** Implement a `version` column in the `Jobs` table. Every update request must include the current `version` to prevent race conditions during job acceptance.
*   **State Machine:** Enforce valid transitions: `PENDING` -> `ACCEPTED` -> `IN_PROGRESS` -> `COMPLETED`. 

## 4. Operational Instructions
*   **Tone & Style:** Maintain an active, clinical, and professional tone.
*   **Communication:** Avoid filler praise or sycophantic openers. Never use "I hope this finds you well" or equivalent phrases in generated drafts.
*   **Implementation:** Build features in vertical slices (Backend API + Web UI + Mobile UI) to ensure functional parity across platforms.
*   **Error Handling:** Implement standardized API error codes (400 for bad requests, 409 for state conflicts).