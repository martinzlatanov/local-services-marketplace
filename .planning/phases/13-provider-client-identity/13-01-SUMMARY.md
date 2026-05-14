---
phase: 13-provider-client-identity
plan: "01"
subsystem: database
tags: [drizzle, postgres, neon, types, schema, migration]

requires:
  - phase: 12
    provides: reviews table and ReviewDTO types already in place

provides:
  - PublicUserDto interface in packages/types/src/index.ts
  - PublicUserDto interface in apps/web/lib/types.ts (local copy)
  - name and avatarUrl nullable columns in users table (schema.ts + live Neon DB)
  - Migration file 0002_add_user_identity.sql

affects:
  - 13-02 (API route reads name/avatarUrl from users; imports PublicUserDto)
  - 13-03 (web identity section and provider profile page use PublicUserDto)
  - 13-04 (mobile getUser helper returns PublicUserDto)

tech-stack:
  added: []
  patterns:
    - "Nullable columns added via ALTER TABLE ADD COLUMN IF NOT EXISTS (idempotent)"
    - "PublicUserDto kept separate from AuthUserDto — profile fields never in auth payload"
    - "Both packages/types and apps/web/lib/types.ts updated manually (no wildcard re-export)"

key-files:
  created:
    - apps/web/drizzle/0002_add_user_identity.sql
  modified:
    - packages/types/src/index.ts
    - apps/web/lib/types.ts
    - apps/web/lib/db/schema.ts

key-decisions:
  - "D-08: Migration prefix 0002_ confirmed — 0000_* and 0001_* already existed"
  - "D-10: PublicUserDto shape locked — id, email, name, avatarUrl, role, createdAt; passwordHash excluded"
  - "apps/web/lib/types.ts is a full local copy, not a re-export — both files updated manually"
  - "drizzle-kit v0.18.1 has no push:pg command; migration applied via psql directly"

patterns-established:
  - "PublicUserDto: safe DTO projection pattern — never spread DB row, always enumerate fields"

requirements-completed: [IDENTITY-05]

duration: 15min
completed: 2026-05-14
---

# Phase 13 Plan 01: Foundation — Types, Schema, Migration Summary

**PublicUserDto added to shared types and web local copy; users table extended with nullable name/avatar_url columns via idempotent SQL migration applied to live Neon DB**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-05-14T21:30:00Z
- **Completed:** 2026-05-14T21:45:00Z
- **Tasks:** 5
- **Files modified:** 4 (3 modified, 1 created)

## Accomplishments

- `PublicUserDto` exported from `packages/types/src/index.ts` with exactly the D-10 shape (no passwordHash)
- `PublicUserDto` mirrored in `apps/web/lib/types.ts` (full local copy, not re-export)
- `users` pgTable in `apps/web/lib/db/schema.ts` extended with `name: varchar(100)` and `avatarUrl: text` — both nullable, no default
- Migration file `0002_add_user_identity.sql` created with two idempotent `ADD COLUMN IF NOT EXISTS` statements
- Both columns confirmed present in live Neon database (`name character varying(100)`, `avatar_url text`, both nullable)

## Task Commits

1. **T01-01: Add PublicUserDto to packages/types** - `40ac3fa` (feat)
2. **T01-02: Add PublicUserDto to apps/web/lib/types.ts** - `a4b789c` (feat)
3. **T01-03: Add name/avatarUrl columns to schema.ts** - `9531df4` (feat)
4. **T01-04: Write migration 0002_add_user_identity.sql** - `ac3c5ac` (feat)
5. **T01-05: drizzle-kit push (DB applied via psql)** - no file commit (operational)

## Files Created/Modified

- `packages/types/src/index.ts` — PublicUserDto interface appended after AuthUserDto
- `apps/web/lib/types.ts` — PublicUserDto interface appended after AuthUserDto (local copy)
- `apps/web/lib/db/schema.ts` — name and avatarUrl columns added to users pgTable
- `apps/web/drizzle/0002_add_user_identity.sql` — new migration with two nullable ALTER TABLE ADD COLUMN statements

## Decisions Made

- Both `packages/types/src/index.ts` and `apps/web/lib/types.ts` updated manually — research confirmed `apps/web/lib/types.ts` is a full copy, not a wildcard re-export. Assumption A1 in RESEARCH.md was resolved correctly.
- Migration applied via `psql` directly rather than `drizzle-kit push` (see Deviations).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] drizzle-kit v0.18.1 has no PostgreSQL push command**
- **Found during:** Task 5 (Run drizzle-kit push)
- **Issue:** The plan specifies `npx drizzle-kit push` but drizzle-kit v0.18.1 only supports `push:mysql` — there is no `push:pg` command in this version. The command exits with "unknown command".
- **Fix:** Applied the migration SQL directly via `psql $DATABASE_URL` using the exact statements from `0002_add_user_identity.sql`. Both `ALTER TABLE` statements executed and returned `ALTER TABLE`.
- **Files modified:** None (operational fix — no code change needed)
- **Verification:** `psql $DATABASE_URL -c "\d users"` confirms both `name character varying(100)` and `avatar_url text` columns are present and nullable.
- **Committed in:** N/A (operational, no file artifacts)

---

**Total deviations:** 1 auto-fixed (1 blocking — drizzle-kit version mismatch)
**Impact on plan:** Identical outcome to `drizzle-kit push`. Migration is idempotent (`IF NOT EXISTS`). No scope creep.

## Issues Encountered

- Worktree does not have `.env.local` — DATABASE_URL sourced from the main repo's `apps/web/.env.local` for the psql command.

## Known Stubs

None — this plan adds schema and types only. No UI or data flow wired yet.

## User Setup Required

None — migration was applied automatically to the live Neon database.

## Next Phase Readiness

- `PublicUserDto` is available in both type systems — Plans 13-02, 13-03, 13-04 can import it immediately.
- `name` and `avatar_url` columns are live in the Neon database — the `GET /api/users/[id]` endpoint (Plan 13-02) can select them without further migration.
- No blockers for downstream plans.

---
*Phase: 13-provider-client-identity*
*Completed: 2026-05-14*
