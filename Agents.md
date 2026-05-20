# AGENTS.md

## 1. Project Context
**Application:** Local Services Task Marketplace.
**Scope:** A multi-platform full-stack application connecting Service Providers (Mobile) with Clients (Web).
**Core Logic:** Job posting, real-time bidding/acceptance, and lifecycle management of local tasks.

## 2. Technology Stack
Adhere to the following stack as defined in the course curriculum:
*   **Language:** TypeScript (Strict Mode).
*   **Web Frontend:** Next.js (App Router) + React + Tailwind CSS.
*   **Mobile Frontend:** React Native via Expo.
*   **Backend:** Next.js API Routes.
*   **Database:** Neon serverless PostgreSQL using Drizzle ORM.
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



## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan: