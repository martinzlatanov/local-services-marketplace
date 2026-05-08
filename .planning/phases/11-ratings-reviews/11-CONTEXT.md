# Phase 11: Ratings & Reviews — Context & Decisions

**Date:** 2026-05-08  
**Phase:** 11 / Ratings & Reviews  
**Status:** Context captured; ready for planning

---

## Domain

Clients and providers exchange ratings and reviews after a job is marked COMPLETED. Reviews are subject to admin approval before appearing on the reviewed party's public profile. Both parties can see reviews directed at them (limited visibility).

---

## Locked Requirements (from REQUIREMENTS.md)

- **RATING-01**: After closing a job, client can submit a numeric rating (1–5) and optional text review for the provider
- **RATING-02**: A job can only be rated once
- **RATING-03**: Provider's ratings are visible on their public profile (average score + review list)

*Phase 11 expands these into mutual reviews (provider→client and client→provider).*

---

## Implementation Decisions

### Review Submission Model
- **Mutual reviews**: Both clients and providers can leave reviews for each other after a job reaches `COMPLETED` status.
- **One review per job, per direction**: A client can review the provider for job X exactly once; a provider can review the client for job X exactly once. (Prevents multiple reviews of the same work; encourages deliberate feedback.)
- **Eligibility trigger**: Reviews unlock when a job transitions to `COMPLETED`; either party can submit their review at any time after that.

### Rating Categories

**Client reviewing Provider:**
- Communication (1–5)
- Quality (1–5)
- Punctuality (1–5)
- Overall rating = simple average of the three categories
- Required text field (review comment)
- Optional photo upload (before/after work, proof of completion)

**Provider reviewing Client:**
- Different categories: Payment Reliability, Communication Clarity, Professionalism (1–5 each)
- Overall rating = simple average
- Required text field
- Optional photo (if applicable; e.g., proof of payment, communication screenshot — subject to privacy/appropriateness)

### Approval & Visibility
- **Approval requirement**: Reviews are hidden from public view until manually approved by an admin user.
- **Pending state**: Unapproved reviews are completely hidden from the reviewed party's profile; no "pending approval" badge or counter visible to clients.
  - (Rationale: Prevents psychological pressure on reviewers; keeps profile clean until reviewed.)
- **Admin access**: Admins can view a moderation queue of pending reviews; approve or reject each one.
- **Visibility scope** (Limited model):
  - A provider can see only reviews directed at them (by clients).
  - A client can see only reviews directed at them (by providers).
  - Reviews do NOT appear publicly on user-to-user profile pages; they exist in a separate "My Reviews" or "Reviews About Me" section only the reviewed party can access.
  - *Rationale*: Reduces social pressure; encourages honest feedback.

### Photo Storage & Handling
- **Storage method**: Vercel Blob Storage (file-based cloud storage).
- **Upload flow**:
  - Client/provider selects image file during review submission.
  - Backend uploads to Vercel Blob; stores blob URL in the database.
  - On retrieval, return blob URL; frontend displays as `<img src={blobUrl} />`.
- **Constraints**: 
  - Single image per review (not a gallery).
  - File size limit: 5 MB.
  - Accepted formats: JPEG, PNG, WebP.
  - No moderation of image content in this phase (defer image flagging to v2).

---

## Code Context & Reusable Assets

### Existing Patterns (from prior phases)

1. **Drizzle ORM + PostgreSQL**: 
   - Schema already in `apps/web/lib/db/schema.ts`; new tables (reviews, admin_approvals) follow same pattern.
   - Use `pgEnum` for rating categories; use `serial` for IDs; `timestamp` for audit timestamps.

2. **API Route Structure**:
   - All routes in `apps/web/app/api/`.
   - Authentication via JWT middleware (already established in Phase 2).
   - Error responses: `HttpStatusCode` + `{ error: string }` body.

3. **Shared Types**:
   - All DTOs (ReviewSubmitRequest, ReviewResponse, ReviewListResponse) must live in `packages/types`.
   - Define enums: `ReviewCategory` (for client reviews), `ClientReviewCategory` (for provider reviews).
   - Import and use across web and mobile.

4. **WebSocket for Real-Time Updates** (Phase 6):
   - Review approvals should trigger WebSocket broadcast to affected user (if connected).
   - Event type: `"review_approved"` with reviewee ID and review summary.

### Database Schema Footprint

**New tables needed:**
- `reviews` — reviewerId, revieweeId, jobId, rating, categoryRatings (JSON), text, photoUrl, createdAt
- `review_approvals` — reviewId, approvedBy (adminId), approvedAt, rejectionReason (nullable)

**Indexes:**
- `reviews(revieweeId, approvedAt)` — for fetching approved reviews on a profile
- `reviews(jobId)` — for checking if a job has been reviewed
- `review_approvals(createdAt)` — for admin moderation queue

---

## Canonical Refs

- `.planning/PROJECT.md` — Project context; ratings & reviews mentioned in requirements
- `.planning/REQUIREMENTS.md` — RATING-01, RATING-02, RATING-03; CLOSE-01, CLOSE-02 (job closure triggering review eligibility)
- `.planning/ROADMAP.md` — Phase 10 establishes job closure; Phase 11 adds review system
- `apps/web/lib/db/schema.ts` — Existing Drizzle schema; new review tables follow this pattern
- `packages/types/` — Where ReviewDTO, ReviewCategory enums must be defined

---

## Deferred Ideas

- **Image moderation** — Automatic flagging of inappropriate photos; manual review by admin. (v2 feature)
- **Spam/abuse detection** — Flagging reviews as fake or abusive; filtering/hiding them. (v2 feature)
- **Review responses** — Reviewee can reply to reviews they receive. (v2 feature)
- **Rating badges** — "Top Rated", "5-star Service Provider" badges earned by hitting thresholds. (v2 feature)
- **Review filtering/sorting** — Sort by rating, date, relevance. (v2 feature)
- **Provider bidding based on reviews** — Show job to providers with high ratings first. (Out of scope; differs from instant-accept model)

---

## Next Steps

1. **Plan Phase 11** → `/gsd-plan-phase 11` to create detailed task breakdown
2. **Research** → Planner will investigate Vercel Blob API, admin dashboard UX patterns, photo validation
3. **Execution** → Implement schema → API routes → admin approval dashboard → frontend review forms

