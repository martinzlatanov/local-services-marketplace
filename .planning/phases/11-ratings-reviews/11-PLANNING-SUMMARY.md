# Phase 11: Ratings & Reviews — Planning Complete

**Date:** 2026-05-09  
**Phase:** 11 / Ratings & Reviews  
**Status:** ✓ Plans created; ready for execution  
**Plans Created:** 4 across 4 sequential waves  

---

## Phase Goal

> Clients and providers can rate and review each other after job completion; reviews require admin approval before appearing on provider profiles. Real-time notifications alert providers when their review goes public.

---

## Plan Breakdown

### Wave 1: Foundation (Plan 01)
**Database Schema & Shared Types**

- Defines `clientRatingCategories` and `providerRatingCategories` enums (pgEnum in Drizzle)
- Creates `reviews` table with fields: jobId, reviewerId, revieweeId, reviewType, clientRating/providerRating, text, photoUrl, approvedAt, timestamps
- Enforces `unique(jobId, reviewerId)` for RATING-02 (one review per job per direction)
- Indexes `(revieweeId, approvedAt)` for efficient profile queries
- Exports ReviewDTO and rating category types from packages/types

**Tasks:** 3  
**Autonomy:** Yes  
**Duration:** ~15 min

**Key artifact:** reviews table with constraint + type exports

---

### Wave 2: Backend APIs (Plan 02)
**Review Submission, Query, & Approval Endpoints**

- **POST /api/reviews:** Submit review with validation (job status, ratings 1–5, text, photo size/type), return 409 on duplicate
- **GET /api/reviews:** Query reviews by jobId (internal) or userId (profile, public). Profile query returns approved reviews + aggregate ratings per category
- **POST /api/reviews/approve:** Admin-only endpoint updates approvedAt, includes TODO for WebSocket broadcast (Wave 4)
- **GET/DELETE /api/reviews/[id]:** Detail view (visibility rules) and self-delete pending reviews

**Tasks:** 4  
**Autonomy:** Yes  
**Duration:** ~45 min

**Key artifacts:** Three API routes with full CRUD, error handling, and photo validation

---

### Wave 3: Frontend UI (Plan 03)
**Review Forms & Profile Display Components**

- **ReviewForm:** Collects 3-category star ratings (1–5), optional text (max 1000 chars), optional photo. Supports client and provider variants. POSTs to /api/reviews, shows 409 error on duplicate, displays success notification.
- **ReviewDisplay:** Renders approved reviews on profile with average ratings per category, reviewer name + date, review text, photo thumbnails (click → modal expansion), empty state.
- **Job detail page integration:** Shows ReviewForm conditionally (only if status === COMPLETED and not yet reviewed). Displays "You've reviewed this job" if already submitted.
- **Provider profile integration:** Shows ReviewDisplay with GET /api/reviews?userId=X&approved=true. Displays average ratings prominently.

**Tasks:** 4  
**Autonomy:** Yes  
**Duration:** ~50 min

**Key artifacts:** ReviewForm and ReviewDisplay components, page integrations

---

### Wave 4: Admin & Real-Time (Plan 04)
**Moderation Dashboard & WebSocket Integration**

- **/admin/reviews page:** Admin-only dashboard listing all pending reviews (approvedAt IS NULL). Shows reviewer name, reviewee, all ratings, text excerpt, photo thumbnail, date. Approve/Reject buttons. Pending count badge. Empty state if queue is empty.
- **ReviewApprovalCard:** Reusable card displaying single pending review with full details. Approve/Reject buttons with loading states. Error handling.
- **POST /api/reviews/approve enhancement:** Adds WebSocket broadcast. After approvedAt updated, emits 'review_approved' event with {reviewId, revieweeId, reviewerName}. Fire-and-forget (does not fail approval if WebSocket fails).
- **WebSocket listener:** Client-side `review_approved` event handler in apps/web/lib/websocket.ts. Triggers refresh of ReviewDisplay when matching revieweeId receives notification (real-time profile update without page reload).

**Tasks:** 4 + 1 checkpoint (human verification)  
**Autonomy:** No (includes blocking checkpoint after tasks)  
**Duration:** ~40 min + checkpoint

**Key artifacts:** Admin dashboard, WebSocket integration, real-time flow

**Checkpoint:** Manual verification that full workflow works (submission → pending queue → admin approval → profile visibility + real-time notification)

---

## Requirements Coverage

| Requirement | Plan | Task | Implementation |
|-------------|------|------|-----------------|
| **RATING-01** | 01, 02, 03 | Schema, API, Form | ReviewDTO with 3 rating categories; form collects and submits; API stores and returns |
| **RATING-02** | 01, 02 | Schema constraint, API validation | `unique(jobId, reviewerId)` at schema; API returns 409 on duplicate |
| **RATING-03** | 01, 02, 03 | Schema, Query API, Display | reviews table; GET /api/reviews?userId=X&approved=true; ReviewDisplay on profile |

---

## Locked Decisions Implementation

### D-03: Mutual Reviews, Per-Direction Categories
- **Wave 1:** Schema supports separate `clientRating` and `providerRating` objects
- **Wave 2:** API determines `reviewType` from job ownership; validates correct rating structure per reviewer type
- **Wave 3:** ReviewForm collects appropriate categories per `reviewType` prop

### D-04: Approval Workflow, No Pending Badge Visible
- **Wave 1:** `approvedAt` field nullable; null = pending
- **Wave 2:** All GET queries filter `WHERE approvedAt IS NOT NULL` (hides pending)
- **Wave 4:** Admin approves → updates `approvedAt`; reviewee sees no "pending" status or badge

### D-05: Vercel Blob Storage, 5 MB Limit, JPEG/PNG/WebP
- **Wave 2:** POST /api/reviews validates photo: file size < 5 MB, content-type checked, URL from Vercel Blob API
- **Wave 3:** ReviewForm includes photo upload UI with file size validation and preview

### D-06: Real-Time WebSocket Updates
- **Wave 4:** POST /api/reviews/approve broadcasts 'review_approved' event with revieweeId targeting
- **Wave 4:** Client-side listener in ReviewDisplay refreshes review list on notification

---

## Security Posture

### Threat Model Summary (STRIDE)

**Trust Boundaries:**
1. Client→API: Untrusted input (rating values, text, photo)
2. API→Database: Trusted (enforced by Drizzle constraints)
3. Admin→Approval: Role check enforced (403 non-admin)
4. Reviewee identity: Derived from job record, never client input
5. WebSocket broadcast: Internal event system (trusted)

**Key Mitigations:**
- T-11-01: reviewerId must match JWT authenticated user
- T-11-02: Pending reviews hidden (approvedAt IS NOT NULL filter)
- T-11-03: unique(jobId, reviewerId) prevents duplicates at schema
- T-11-05: revieweeId derived from job, admin cannot tamper
- T-11-14: /admin/reviews restricted to admin role

---

## Execution Strategy

### Sequential Waves (Dependencies)
```
Wave 1 (Foundation)
    ↓
Wave 2 (Backend APIs — depends on schema + types)
    ↓
Wave 3 (Frontend UI — depends on API endpoints)
    ↓
Wave 4 (Admin + WebSocket — depends on review flow)
```

### Parallelization Within Waves
- **Wave 1:** Tasks 1–3 can run in parallel (all modify schema.ts + types, no inter-task dependencies)
- **Wave 2:** Tasks 1–4 can run in parallel (different route files)
- **Wave 3:** Tasks 1–4 can run in parallel (different components + pages)
- **Wave 4:** Tasks 1–3 can run in parallel; Task 4 sequential (depends on Task 3); Checkpoint blocks before completion

### Estimated Effort
- **Wave 1:** ~15 min (3 small tasks, schema + types)
- **Wave 2:** ~45 min (4 API routes, validation, error handling)
- **Wave 3:** ~50 min (2 components, 2 page integrations, styling)
- **Wave 4:** ~40 min (admin page, card component, WebSocket, checkpoint)

**Total:** ~2.5–3 hours for full phase

---

## Known Gaps (Future Phases)

- **Photo filtering:** No NSFW/spam detection on image upload
- **Bulk moderation:** Admin can only approve one review at a time
- **Review editing:** After approval, reviews immutable (no edit capability)
- **Reviewer anonymization:** Reviewer name visible (could be optional in v2)
- **Review responses:** Providers cannot reply to reviews
- **Rate limiting:** No per-user, per-job rate limit on submissions
- **Helpful votes:** All reviews treated equally (no "helpful" votes or sorting)

---

## Next Steps

**To execute Phase 11:**

```bash
# Execute Wave 1 (Foundation)
/gsd-execute-phase 11 --wave 1

# Then proceed sequentially to Wave 2, 3, 4
# (Each wave must complete before the next begins)
```

**All plans ready for executor agent consumption.**
