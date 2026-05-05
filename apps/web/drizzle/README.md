# Database Migrations

This folder contains SQL migrations for the Local Services Marketplace backend.

## Files

- `0000_initial_user.sql` — Initial schema for user authentication (creates `users` table with email uniqueness and password hash storage).

## How to Apply Migrations

### Prerequisites

1. A PostgreSQL database (e.g., Neon serverless Postgres)
2. Connection string (format: `postgres://user:password@host/dbname`)

### Option 1: Using `psql` (PostgreSQL CLI)

```bash
# Set your database connection string
export DATABASE_URL="postgres://user:password@host/dbname"

# Apply all migrations
psql "$DATABASE_URL" < 0000_initial_user.sql
```

### Option 2: Using Node.js script

From the project root:

```bash
# Set your Neon connection string
export DATABASE_URL="postgres://user:password@host/dbname"

# Install pg if needed
npm install pg

# Run the migration
node -e "
const fs = require('fs');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
(async () => {
  await client.connect();
  const sql = fs.readFileSync('apps/web/drizzle/0000_initial_user.sql', 'utf8');
  await client.query(sql);
  console.log('Migration applied successfully');
  await client.end();
})().catch(e => { console.error(e); process.exit(1); });
"
```

### Option 3: Using Drizzle Kit (if configured)

```bash
# From workspace root
cd apps/web
npx drizzle-kit migrate --database postgres://user:password@host/dbname
```

## Verifying the Migration

After applying the migration, verify the schema was created:

```bash
psql "$DATABASE_URL" -c "\dt users"
psql "$DATABASE_URL" -c "\di users_email_unique"
```

Expected output:
- `users` table with columns: id, email, password_hash, role, created_at
- Unique index on `users(email)`

## Notes

- Migrations are idempotent (safe to run multiple times)
- The `users` table enforces a unique constraint on email addresses
- Passwords are stored as hashes only (never plaintext)
- All timestamps use UTC (TIMEZONE WITH TIME ZONE)
