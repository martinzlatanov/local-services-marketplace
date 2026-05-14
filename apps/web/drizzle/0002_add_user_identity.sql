-- 0002_add_user_identity.sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
