BEGIN;

-- 1. Add nullable integer column
ALTER TABLE "jobs" ADD COLUMN "category_id" INTEGER;

-- 2. Backfill: resolve enum string to FK id
UPDATE "jobs"
SET "category_id" = (
  SELECT "id" FROM "job_categories" WHERE "name" = "jobs"."category"::text
);

-- 3. Verify no NULLs remain (will error and roll back if any row failed to match)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "jobs" WHERE "category_id" IS NULL) THEN
    RAISE EXCEPTION 'Backfill failed: NULL category_id found in jobs table';
  END IF;
END $$;

-- 4. Enforce NOT NULL
ALTER TABLE "jobs" ALTER COLUMN "category_id" SET NOT NULL;

-- 5. Add FK constraint
ALTER TABLE "jobs"
  ADD CONSTRAINT "jobs_category_id_job_categories_id_fk"
  FOREIGN KEY ("category_id") REFERENCES "job_categories"("id");

-- 6. Drop old enum column
ALTER TABLE "jobs" DROP COLUMN "category";

-- 7. Drop pgEnum type (no longer referenced)
DROP TYPE "job_category";

COMMIT;
