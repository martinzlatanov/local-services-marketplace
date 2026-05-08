# Quick Fix: Add Environment Variables to Vercel

## The Problem
You're getting "Safari cannot find server" because:
- Vercel deployment doesn't have DATABASE_URL set
- API routes try to connect to database and fail
- Network request fails, browser shows error

## The Solution (5 minutes)

### Step 1: Go to Vercel Settings
1. Open: https://vercel.com/martinzlatanov-8547s-projects/web/settings/environment-variables

### Step 2: Add DATABASE_URL (Temporary)
For now, use your **local database** to test:

**Variable:** `DATABASE_URL`
**Value:** `postgresql://localservices_user:localservices_pass@localhost:5432/localservices`

⚠️ **Note:** This won't work in production (connects to your local machine), but it will let you verify the UI works.

### Step 3: Add JWT_SECRET
**Variable:** `JWT_SECRET`
**Value:** (generate with: `openssl rand -hex 32`)
Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

### Step 4: Redeploy
```bash
vercel --prod
```

Wait for deployment to complete (1-2 min).

### Step 5: Test
Go to: https://web-atdwg1zkg-martinzlatanov-8547s-projects.vercel.app/register

You should now see the registration form instead of error.

---

## Full E2E Setup (When Ready)

When you want to use a **production database**, follow `E2E-STATUS.md`:
1. Create Neon project
2. Run `./scripts/e2e-setup.sh`
3. Update DATABASE_URL in Vercel with Neon connection string

---

**Timeline:** 5 minutes to get the app working
**Current Issue:** Missing env vars = API fails
**Fix:** Add DATABASE_URL and JWT_SECRET to Vercel
