CREATE TABLE "job_categories" (
  "id"   SERIAL PRIMARY KEY,
  "name" VARCHAR(64) NOT NULL,
  CONSTRAINT "job_categories_name_unique" UNIQUE ("name")
);

INSERT INTO "job_categories" ("name") VALUES
  ('PLUMBING'),
  ('ELECTRICAL'),
  ('CLEANING'),
  ('GARDENING'),
  ('MOVING'),
  ('HANDYMAN'),
  ('PAINTING'),
  ('OTHER');
