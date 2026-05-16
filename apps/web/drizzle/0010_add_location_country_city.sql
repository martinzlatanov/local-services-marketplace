ALTER TABLE "locations"
  ADD COLUMN "city" VARCHAR(100),
  ADD COLUMN "country" VARCHAR(100);

-- Backfill from existing name field (format: "City, Country")
UPDATE "locations"
SET
  city    = TRIM(SPLIT_PART(name, ',', 1)),
  country = TRIM(SPLIT_PART(name, ',', 2))
WHERE name LIKE '%, %';
