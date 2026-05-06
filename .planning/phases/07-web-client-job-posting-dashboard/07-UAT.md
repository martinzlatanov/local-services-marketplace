---
status: testing
phase: 07-web-client-job-posting-dashboard
source:
  - 07-01-SUMMARY.md
  - 07-02-SUMMARY.md
started: 2026-05-06T00:00:00Z
updated: 2026-05-06T00:00:00Z
---

## Current Test
number: 1
name: Job Posting Form Submission
expected: |
  - User can fill out the job posting form with category, description, timeframe, and city/area.
  - On submit, the form sends a POST request to `/api/jobs`.
  - If successful, the form clears, and the job list refreshes with the new job.
awaiting: user response

## Tests

### 1. Job Posting Form Submission
expected: |
  - User can fill out the job posting form with category, description, timeframe, and city/area.
  - On submit, the form sends a POST request to `/api/jobs`.
  - If successful, the form clears, and the job list refreshes with the new job.
result: pending

### 2. Job Dashboard Display
expected: |
  - User sees a list of their posted jobs on the dashboard.
  - Each job is displayed as a card with category, description, timeframe, city/area, and current status.
  - Empty state displays "No jobs posted yet" if no jobs exist.
result: pending

### 3. Real-Time Job Updates
expected: |
  - When a job's status changes (e.g., `PENDING` → `ACCEPTED`), the corresponding job card updates in real-time.
  - Visual indicators (badges) reflect the current status.
result: pending

## Summary
total: 3
passed: 0
issues: 0
pending: 3
skipped: 0

## Gaps
[none yet]