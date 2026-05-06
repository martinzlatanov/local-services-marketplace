---
phase: 06
slug: real-time-infrastructure
status: draft
threats_open: 3
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
| T-06-01 | Spoofing | WebSocket Server | mitigate | Authenticate connections using JWT on handshake | open |
| T-06-02 | Information Disclosure | WebSocket Server | mitigate | Only broadcast events to the specific user ID associated with the connection | open |
| T-06-03 | Elevation of Privilege | Status Update API | mitigate | Ensure the provider requesting the status update owns the job | open |

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
| 2026-05-06 | 3 | 0 | 3 | gsd-security-auditor |

---

## Sign-Off

- [ ] All threats have a disposition (mitigate / accept / transfer)
- [ ] Accepted risks documented in Accepted Risks Log
- [ ] `threats_open: 0` confirmed
- [ ] `status: verified` set in frontmatter

**Approval:** pending
