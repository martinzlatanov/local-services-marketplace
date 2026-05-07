# Phase 10: End-to-End Polish & Deployment - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning
**Source:** ROADMAP.md Phase 10

<domain>
## Phase Boundary

**Goal:** The system is deployed to production environments and passes a full lifecycle test

**Depends on:** Phase 7 (Web Client), Phase 9 (Mobile Client Active Job Execution)

**Scope:**
- Deploy web app to Vercel
- Provision Neon production database
- Full lifecycle end-to-end test (register → post job → accept → complete)
- Verify real-time updates in production environment
</domain>

<decisions>
## Implementation Decisions

### D-01: Vercel Deployment
- Deploy web app (Next.js) to Vercel with environment variables for production Neon database
- Use `vercel --prod` for production deployment

### D-02: Neon Production Database
- Provision Neon production database separate from development
- Run Drizzle migrations on production database
- Update connection strings in Vercel environment variables

### D-03: End-to-End Test Script
- Create manual test checklist covering full lifecycle
- Test: Register as client → Post job → Register as provider → Accept job → Start Work → Finish Work
- Verify real-time updates work in production environment

### D-04: Environment Configuration
- Production environment variables must include:
  - `DATABASE_URL` (Neon production)
  - `JWT_SECRET` (for auth tokens)
  - `NEXT_PUBLIC_WS_URL` (WebSocket URL if using separate WS server)
- Mobile app should use production API URL

### the agent's Discretion
- Exact Vercel project configuration steps
- Neon project creation workflow
- Mobile app build/deployment to Expo (if required)
- E2E test automation approach (manual vs automated)
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Deployment
- `apps/web/next.config.ts` — Next.js configuration for production build
- `drizzle.config.ts` — Drizzle ORM configuration for migrations

### Database
- `apps/web/lib/db/client.ts` — Database client setup (Neon serverless)
- `drizzle/` — Migration files (0000_initial_user.sql, 0001_add_jobs.sql)

### Mobile
- `apps/mobile/app.json` — Expo configuration
- `apps/mobile/package.json` — Dependencies and scripts

### Previous Phases
- Phase 7 SUMMARY — Web client job posting
- Phase 9 SUMMARY — Mobile active job execution
</canonical_refs>

<specifics>
## Specific Ideas

- Use Vercel CLI for deployment (`vercel --prod`)
- Use Drizzle Kit for production migrations (`drizzle-kit push:pg`)
- Create E2E_TEST.md checklist for manual verification
- Consider Expo EAS for mobile deployment if needed
</specifics>

<deferred>
## Deferred Ideas

None — Phase 10 scope is focused on deployment and E2E testing
</deferred>

---

*Phase: 10-end-to-end-polish-deployment*
*Context gathered: 2026-05-07 via ROADMAP.md*
