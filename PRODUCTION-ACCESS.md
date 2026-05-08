# Production App Access Guide

## Current Deployment
- **URL:** https://web-atdwg1zkg-martinzlatanov-8547s-projects.vercel.app

## What You're Seeing
When you visit the root URL, you see:
```
Local Services Marketplace
Default status: PENDING
```

This is the **home page** — a placeholder that shows the app is running.

## How to Access the App

### As a Client (Web)
1. Go to: https://web-atdwg1zkg-martinzlatanov-8547s-projects.vercel.app/register
2. Create a new account (email: anything@test.com, password: any)
3. Select role: **Client**
4. Click register
5. You'll be redirected to the **Dashboard** where you can:
   - Post new jobs
   - View all your posted jobs with status

### As a Provider (Mobile - Expo)
1. Run the mobile app
2. Register a new account
3. Select role: **Provider**
4. Select your service area (city/area)
5. You'll see the **Feed** tab with jobs to accept

## Full E2E Test Flow

**Phase 1: Client Posts Job**
```
1. Go to: /register
2. Create client account
3. Fill job posting form
4. Submit
5. Verify job appears on dashboard with PENDING status
```

**Phase 2: Provider Accepts Job**
```
1. Open mobile app
2. Create provider account
3. Select service area (same as client's job)
4. Tap job in Feed tab
5. Tap "Accept Job"
6. Verify status changes to ACCEPTED
```

**Phase 3-5: Job Lifecycle**
```
See E2E-TEST-CHECKLIST.md for complete scenarios
```

## Direct Links for Testing

| Role | Action | Link |
|------|--------|------|
| Client | Register | /register |
| Client | Login | /login |
| Client | Dashboard | /dashboard |
| Provider | Register | /register |
| Provider | Login | /login |

## Database Status

⚠️ **Current Status:** Using local development database
- Production database setup pending (Step 2 of E2E setup)
- To use production: Configure Neon DATABASE_URL in Vercel

See: E2E-STATUS.md for database setup instructions

## Test Data

No seed data exists in production yet. You must:
1. Create a client account and post a job
2. Create a provider account and accept the job
3. Go through the full lifecycle

## What Should Work

✅ User registration (client/provider roles)
✅ User login
✅ Job posting form (clients only)
✅ Job dashboard (clients - view their jobs)
✅ Job feed (providers - view available jobs)
✅ Accept job flow (providers)
✅ Real-time WebSocket updates (if WS_URL is configured)

## What's Missing/Pending

❌ Production database (pending Step 2 setup)
❌ Real-time updates (needs NEXT_PUBLIC_WS_URL env var)
❌ Email verification (not implemented)
❌ Payment processing (not in v1.0 scope)

## Troubleshooting

**Issue: "Database connection failed"**
- Production database not yet configured
- Run: `./scripts/e2e-setup.sh` (see E2E-STATUS.md)

**Issue: "Real-time updates not working"**
- NEXT_PUBLIC_WS_URL not set in Vercel
- Add to Vercel dashboard and redeploy

**Issue: "Job doesn't appear in provider feed"**
- Check provider selected same city/area as client
- Check job status is PENDING in database

## Next Steps

1. Test locally:
   - Go to `/register`
   - Create test account
   - Post job or view available jobs

2. For production database:
   - Follow E2E-STATUS.md steps 1-2
   - Run `./scripts/e2e-setup.sh`
   - Configure Vercel env vars

3. For full E2E testing:
   - Follow E2E-TEST-CHECKLIST.md
   - Keep both web and mobile open
   - Verify real-time updates work

---

**Generated:** 2026-05-08
**Project:** Local Services Marketplace v1.0
**Status:** Code complete, production database pending
