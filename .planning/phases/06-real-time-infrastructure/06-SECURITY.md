---
phase: 06
slug: real-time-infrastructure
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-06
---

# Phase 06 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Client -> WebSocket Server | Untrusted WebSocket connections | JWT tokens, job update events |
| Client -> API | Untrusted status update requests | Job status changes, user credentials |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-06-01 | Spoofing | WebSocket Server | mitigate | Authenticate connections using JWT on handshake (verifyJwt in server.ts) | closed |
| T-06-02 | Information Disclosure | WebSocket Server | mitigate | Only broadcast events to the specific user ID associated with the connection (clients Map) | closed |
| T-06-03 | Elevation of Privilege | Status Update API | mitigate | Ensure the provider requesting the status update owns the job (providerId check in status/route.ts) | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|

*Accepted risks do not resurface in future audit runs.*

*If none: "No accepted risks."*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-06 | 3 | 3 | 0 | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-06
