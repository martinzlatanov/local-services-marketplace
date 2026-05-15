-- Step 1: Create user_roles junction table (D-01)
CREATE TABLE IF NOT EXISTS "user_roles" (
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" VARCHAR(32) NOT NULL,
  CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role")
);

-- Step 2: Backfill from users.role into user_roles
INSERT INTO "user_roles" ("user_id", "role")
SELECT "id", "role" FROM "users"
ON CONFLICT DO NOTHING;

-- Step 3: Add status column to users (D-04)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" VARCHAR(16) NOT NULL DEFAULT 'active';

-- Step 4: Add index on user_roles for lookup performance
CREATE INDEX IF NOT EXISTS "user_roles_user_id_idx" ON "user_roles"("user_id");
