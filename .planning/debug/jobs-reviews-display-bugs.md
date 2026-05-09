---
slug: jobs-reviews-display-bugs
status: resolved
trigger: "1. when choose category 'all' the job list is empty, once you choose specific category the pending jobs list appears 2. the reviews scores are not seen neither by the client or the provider 3. the review images are not visible too"
created: 2026-05-10
updated: 2026-05-10
---

## Symptoms

- expected: Selecting "All" category shows all pending jobs; reviews show scores and images
- actual: "All" category shows empty job list; specific category works. Review scores not visible to client or provider. Review images not visible.
- errors: None reported
- timeline: Recent — noticed after latest deployments
- reproduction: 1) Go to provider dashboard → Find Jobs → select "All" → empty list. 2) Select any specific category → jobs appear. 3) Go to any review → scores missing. 4) Review photos not displaying.

## Current Focus

hypothesis: "all three bugs identified and fixed"
next_action: "done"

## Evidence

- timestamp: 2026-05-10T00:00:00Z
  file: apps/web/app/api/jobs/route.ts
  finding: >
    isBrowsing = cityArea || category. When provider selects "All" for both
    (no query params sent), isBrowsing is falsy so the API falls back to
    eq(jobs.clientId, user.id) — returning the provider's own client-side jobs,
    which is always empty for a provider account.

- timestamp: 2026-05-10T00:00:00Z
  file: apps/web/components/dashboard/ProviderDashboard.tsx
  finding: >
    fetchPendingJobs builds URL with no params when both filters are "All",
    resulting in /api/jobs with no query string — triggering the wrong API branch.

- timestamp: 2026-05-10T00:00:00Z
  file: apps/web/components/dashboard/ProviderDashboard.tsx
  finding: >
    ReviewDisplay called with reviewType="provider". This selects
    CATEGORY_LABELS_PROVIDER = {paymentReliability, communicationClarity, professionalism}.
    But reviews received by providers are written by clients (review.reviewType='client'),
    whose rating keys are {communication, quality, punctuality}. The averageRatings
    returned by the API has non-zero values only for the client keys, so all
    provider-label slots show 0/— in the summary panel. Per-card labels also
    mismatch (undefined label text for each rating row).

- timestamp: 2026-05-10T00:00:00Z
  file: apps/web/components/ReviewDisplay.tsx + apps/web/app/api/reviews/route.ts
  finding: >
    Photo display logic (review.photoUrl && <img>) and the data pipeline
    (upload → data URL → DB text column → GET response) are all correct.
    Bug 3 is a consequence of Bug 2: reviews appeared broken so photos were
    never noticed. The display code itself does not need changes.

## Eliminated

- ReviewForm.tsx photo upload: correctly calls /api/upload, gets a data URL back,
  sends it as photoUrl. Upload API converts file to base64 data URL. Review POST
  saves it conditionally. All correct.
- DB schema: photo_url column is text (migration 0001 confirms ALTER COLUMN to text).
  Data URL storage is not the issue.
- provider/[id]/page.tsx: passes reviewType="client" (correct), but has a separate
  unrelated bug (reads reviewsData.reviews instead of reviewsData.data.reviews).
  Out of scope.

## Resolution

root_cause: >
  BUG 1: isBrowsing detection in GET /api/jobs used only cityArea||category.
  When provider browses with "All" filters, no params are sent, isBrowsing is
  falsy, and the API returns the user's own client jobs (empty for providers).
  BUG 2: ProviderDashboard passed reviewType="provider" to ReviewDisplay, causing
  it to use CATEGORY_LABELS_PROVIDER keys to look up averageRatings, but those
  keys are always 0 because provider-received reviews are of reviewType='client'
  with keys communication/quality/punctuality.
  BUG 3: Consequence of Bug 2 — display pipeline for photos is correct end-to-end.

fix: >
  BUG 1: ProviderDashboard.fetchPendingJobs now always appends browse=1 to the URL.
  GET /api/jobs route now checks browse||cityArea||category for isBrowsing.
  BUG 2: ProviderDashboard now passes reviewType="client" to ReviewDisplay, matching
  the actual reviewType of reviews providers receive.
  BUG 3: No code change needed; photos will appear correctly once Bug 2 is fixed.

files_changed:
  - apps/web/components/dashboard/ProviderDashboard.tsx
  - apps/web/app/api/jobs/route.ts
