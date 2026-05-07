# Neon Production Database Setup

## 1. Create Neon Project
1. Go to https://console.neon.tech
2. Click "New Project"
3. Name: `local-services-marketplace-prod`
4. Region: Choose closest to your Vercel deployment (e.g., AWS US East)
5. Postgres version: 16 (latest)

## 2. Get Connection String
1. In project dashboard, click "Connection Details"
2. Copy the connection string (psql format)
3. It looks like: `postgres://user:password@ep-xxx.region.cloud.neon.tech/dbname?sslmode=require`

## 3. Configure Drizzle for Production
Update `drizzle.config.ts` to support production migrations:

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './apps/web/lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: true,
} satisfies Config
```

## 4. Run Migrations
```bash
# Set production DATABASE_URL
export DATABASE_URL="postgres://user:pass@ep-xxx..."

# Push schema to production
npx drizzle-kit push:pg

# Or use migrations
npx drizzle-kit migrate
```

## 5. Verify
```bash
# Test connection
psql "$DATABASE_URL" -c "\dt"
# Should show: users, jobs tables
```

## 6. Vercel Environment Variables
After creating the Neon project:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL` with your Neon production connection string
3. Add `JWT_SECRET` with a strong random key
4. Redeploy: `vercel --prod`
