---
phase: 05-backend-job-acceptance-and-concurrency
slug: backend-job-acceptance-and-concurrency
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-06T13:05:00Z
---

# Phase 05 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Client → API (/api/jobs/:id/accept) | Untrusted input: job ID, version number, JWT token | Job acceptance request |
| Provider → Accept Endpoint | Authenticated provider submits acceptance request | Job ID, version, user context |
| Provider → GET /api/jobs | Untrusted input: cityArea, status query parameters | Job listing request |
| Concurrent requests | Race condition on same job acceptance | Version-conflict-prone operation |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-05-01 | Spoofing | /api/jobs/:id/accept | mitigate | JWT validated via getAuthenticatedUser; PROVIDER role enforced (returns 403 if not PROVIDER) | closed |
| T-05-02 | Tampering | Job acceptance (version) | mitigate | Version check in WHERE clause (`eq(jobs.version, payload.version)`) ensures atomic update; no stale acceptance possible | closed |
| T-05-03 | Information Disclosure | Error responses | mitigate | Generic error messages returned (e.g., `{ errors: { version: 'conflict_job_already_accepted' } }`); no internal DB state exposed | closed |
| T-05-04 | Denial of Service | Accept endpoint | accept | Rate limiting not in scope for v1; low-value target (job acceptance is low-frequency) | closed |
| T-05-05 | Elevation of Privilege | Role check | mitigate | Explicit check `user.role !== Role.PROVIDER` returns 403; CLIENT role cannot accept jobs | closed |
| T-05-06 | Tampering | GET /api/jobs | mitigate | Query parameters validated; cityArea is string match, status must be valid JobStatus enum value; defaults to PENDING-only | closed |
| T-05-07 | Denial of Service | GET /api/jobs | accept | No pagination yet; low-risk for v1 (limited job volume in MVP) | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-05-01 | T-05-04 | Rate limiting for job acceptance endpoint not implemented in MVP; job acceptance is a low-frequency operation with low incentive for abuse | GSD | 2026-05-06 |
| R-05-02 | T-05-07 | Pagination not implemented for GET /api/jobs; acceptable for MVP with limited job volume; can be added when dataset grows | GSD | 2026-05-06 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-06 | 7 | 7 | 0 | GSD Security Auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-06
