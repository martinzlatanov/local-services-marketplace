CREATE TABLE "locations" (
  "id"   SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  CONSTRAINT "locations_name_unique" UNIQUE ("name")
);

INSERT INTO "locations" ("name") VALUES
  ('Clapham, London'),
  ('Hackney, London'),
  ('Islington, London'),
  ('Brixton, London'),
  ('Shoreditch, London'),
  ('Camden, London'),
  ('Peckham, London'),
  ('Dalston, London'),
  ('Bethnal Green, London'),
  ('Stoke Newington, London');
