---
phase: 11-ratings-reviews
plan: 01
subsystem: database-schema
tags: [schema, drizzle-orm, types, reviews]
date_completed: 2026-05-09
duration_minutes: 15
tasks_completed: 3
files_created: 2
files_modified: 2
commits: ["b93dc8d"]
---

# Phase 11 Plan 01: Database Schema & Types Foundation — Summary

**One-liner:** Established PostgreSQL schema for reviews table with Drizzle ORM enums and exported shared TypeScript types for client/provider ratings.

## Execution Overview

All three tasks completed successfully:

1. **Task 1: Define rating category enums** ✓
   - Added `clientRatingCategories` pgEnum: `['communication', 'quality', 'punctuality']`
   - Added `providerRatingCategories` pgEnum: `['paymentReliability', 'communicationClarity', 'professionalism']`
   - Positioned after existing `jobCategoryEnum` following project conventions

2. **Task 2: Create reviews table** ✓
   - Added `reviews` table with 16 columns:
     - IDs: `id` (serial PK), `jobId`, `reviewerId`, `revieweeId`
     - Ratings: 3 client fields + 3 provider fields (separate int columns)
     - Content: `text` (required), `photoUrl` (nullable)
     - Approval: `approvedAt` (nullable; null = pending)
     - Audit: `createdAt`, `updatedAt` with defaults
   - Enforced unique constraint on `(jobId, reviewerId)` per RATING-02
   - Added index on `(revieweeId, approvedAt)` for efficient approval queries
   - Used snake_case column names with camelCase JS accessors (matching project pattern)

3. **Task 3: Export review types** ✓
   - Added to `packages/types/src/index.ts`:
     - `ReviewDTO`: Complete review interface with all fields
     - `ClientRatingCategory`: Type union `'communication' | 'quality' | 'punctuality'`
     - `ProviderRatingCategory`: Type union `'paymentReliability' | 'communicationClarity' | 'professionalism'`
     - `ReviewStatus`: Type union `'pending' | 'approved'`
     - `ClientRatings` & `ProviderRatings`: Rating aggregate objects
   - All types properly exported at module level

## Verification Results

### Schema Validation
```bash
✓ pgEnum for clientRatingCategories defined
✓ pgEnum for providerRatingCategories defined
✓ reviews table exported with proper configuration
✓ Unique constraint on (jobId, reviewerId) configured
✓ Index on (revieweeId, approvedAt) configured
```

### Migration Generation
```
$ npx drizzle-kit generate
✓ Created migration: drizzle/0000_absent_iron_fist.sql
✓ Recognized 3 tables (users, jobs, reviews)
✓ Generated proper CREATE ENUM statements
✓ Generated reviews table with all 16 columns and constraints
```

### Type Checking
```
$ npm run typecheck --workspace=@local/types
✓ No TypeScript errors in types package
✓ All review types compile successfully
✓ Exports are properly recognized
```

### Generated SQL Artifacts
The migration created:
- Two new ENUM types: `client_rating_categories`, `provider_rating_categories`
- `reviews` table with all fields, defaults, and constraints
- Unique index: `unique_job_reviewer` on `(job_id, reviewer_id)`
- Performance index: `approved_reviews_idx` on `(reviewee_id, approved_at)`

## Key Design Decisions

### Separate Rating Columns vs JSON
Chose **separate int columns** for rating categories instead of JSON objects:
- Simpler Drizzle schema (no JSON casting needed)
- More efficient for filtering/aggregation queries
- Clear schema documentation via explicit columns
- Type safety from TypeScript union constraints

### ReviewType Denormalization
Included `reviewType` ('client' | 'provider') as explicit varchar column:
- Clarifies review direction without foreign key logic
- Enables efficient filtering in queries
- Matches CONTEXT.md decision for "who reviewed whom"

### Approval State via Timestamp
Used nullable `approvedAt` timestamp instead of boolean status:
- Provides audit trail (when approved)
- Supports future `approvedBy` field for admin tracking
- Query-efficient: `WHERE approvedAt IS NOT NULL` for visibility

## Success Criteria Achieved

- [x] `npm run db:generate` recognizes new tables/enums without errors
- [x] TypeScript check passes with no import errors (types package verified)
- [x] Database schema includes reviews table with unique constraint
- [x] `packages/types` exports all required types at module level
- [x] Migration SQL verified for correctness
- [x] No pre-existing tests failed due to schema changes

## Threat Model Coverage

All mitigations from RATING-01, RATING-02, RATING-03 addressed at schema level:

| Threat | Mitigation | Status |
|--------|-----------|--------|
| T-11-01: Reviewer identity tampering | `reviewerId` enforced via JWT verification (API layer) | Foundation ✓ |
| T-11-02: Visibility of pending reviews | `approvedAt` nullable; queries filter IS NOT NULL | Schema enforced ✓ |
| T-11-03: Multiple reviews per job | Unique constraint on (jobId, reviewerId) | Database enforced ✓ |
| T-11-04: Invalid rating values | Separate int columns (validation at API layer) | Ready for validation ✓ |

## Files Created/Modified

| File | Changes |
|------|---------|
| `apps/web/lib/db/schema.ts` | +40 lines: 2 enums + reviews table + constraints |
| `packages/types/src/index.ts` | +42 lines: 5 types/interfaces (ReviewDTO, categories, status, rating objects) |
| `apps/web/drizzle/0000_absent_iron_fist.sql` | Generated migration (NEW) |
| `apps/web/drizzle/meta/` | Generated metadata (NEW) |

## Commit

**Commit Hash:** `b93dc8d`

```
feat(11-01): add reviews schema and rating types foundation

- Add pgEnum definitions for client and provider rating categories
- Create reviews table with rating fields, constraints, and indexes
- Implement unique constraint on (jobId, reviewerId) per RATING-02
- Export ReviewDTO, ClientRatingCategory, ProviderRatingCategory, ReviewStatus from shared types
- Generate Drizzle migration for reviews table with proper schema
```

## Next Steps

This foundation enables:
- **Plan 11-02:** Review submission API endpoints (POST /api/reviews)
- **Plan 11-03:** Admin review approval dashboard
- **Plan 11-04:** Frontend review forms and submission flows
- **Plan 11-05:** Public review display and aggregation (ratings pages)

Wave 1 complete. Ready for Phase 11 Wave 2 planning.

## Deviations from Plan

None — plan executed exactly as written with all success criteria met.
