BEGIN;

-- 1. Remove rows with city_area values not present in the locations table (stale test data)
DELETE FROM "jobs"
WHERE "city_area" NOT IN (SELECT "name" FROM "locations");

-- 2. Add nullable integer column
ALTER TABLE "jobs" ADD COLUMN "location_id" INTEGER;

-- 3. Backfill: match existing city_area strings to location ids
UPDATE "jobs"
SET "location_id" = (
  SELECT "id" FROM "locations" WHERE "name" = "jobs"."city_area"
);

-- 4. Verify no NULLs remain (existing data must all be in the 10 canonical areas)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "jobs" WHERE "location_id" IS NULL) THEN
    RAISE EXCEPTION 'Backfill failed: NULL location_id found. Check for city_area values not in the locations table.';
  END IF;
END $$;

-- 5. Enforce NOT NULL
ALTER TABLE "jobs" ALTER COLUMN "location_id" SET NOT NULL;

-- 6. Add FK constraint
ALTER TABLE "jobs"
  ADD CONSTRAINT "jobs_location_id_locations_id_fk"
  FOREIGN KEY ("location_id") REFERENCES "locations"("id");

-- 7. Drop old varchar column
ALTER TABLE "jobs" DROP COLUMN "city_area";

COMMIT;
