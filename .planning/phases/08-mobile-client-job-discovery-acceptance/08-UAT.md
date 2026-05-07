---
status: partial
phase: 08-mobile-client-job-discovery-acceptance
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md, 08-03-SUMMARY.md]
started: 2026-05-07T00:00:00Z
updated: 2026-05-07T00:01:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Onboarding screen
expected: On first launch as a provider (or when no service area is stored in SecureStore), the app shows a one-time onboarding screen with a city area picker and a "Save area" button. Selecting an area and tapping "Save area" stores the choice and navigates to the Feed tab. Subsequent launches skip onboarding and go straight to the feed.
result: skipped
reason: requires device/emulator interaction

### 2. Feed tab — job list
expected: After onboarding, the Feed tab displays a list of PENDING jobs filtered to the provider's selected service area. Each card shows category, description, timeframe, and city area.
result: skipped
reason: requires device/emulator interaction

### 3. Pull-to-refresh
expected: Pulling down on the Feed tab triggers a network request and refreshes the job list with any new or removed PENDING jobs.
result: skipped
reason: requires device/emulator interaction

### 4. WebSocket live updates
expected: When a job's status changes from PENDING (e.g., accepted by another provider), it disappears from the feed automatically without the user manually refreshing.
result: skipped
reason: requires device/emulator interaction

### 5. Feed empty state
expected: When no PENDING jobs exist in the service area, the Feed shows a meaningful empty state message — not a blank screen.
result: skipped
reason: requires device/emulator interaction

### 6. Job detail screen
expected: Tapping a job card from the Feed navigates to a detail screen showing the full job info (category, description, timeframe, city area) and an "Accept job" button.
result: skipped
reason: requires device/emulator interaction

### 7. Accept a job — happy path
expected: Tapping "Accept job" on the detail screen sends the accept request with the job's current version. On a 200 response, the screen navigates back to the feed and the accepted job is no longer listed.
result: skipped
reason: requires device/emulator interaction

### 8. Accept a job — 409 conflict
expected: If the same job is concurrently accepted by another provider, tapping "Accept job" shows a "Job already taken" snackbar and automatically navigates back to the feed.
result: skipped
reason: requires device/emulator interaction

### 9. Settings — service area edit
expected: The Settings tab shows the currently stored service area. Tapping the edit control opens a dialog. The dialog has "Keep current area" and "Update area" buttons. Choosing "Update area" and selecting a new city saves it to SecureStore and updates the displayed area.
result: skipped
reason: requires device/emulator interaction

### 10. Settings — logout
expected: The Settings tab has a logout option. Tapping it clears the stored auth token and service area and redirects to the login screen.
result: skipped
reason: requires device/emulator interaction

## Summary

total: 10
passed: 0
issues: 0
skipped: 10
pending: 0

## Gaps

[none yet]
