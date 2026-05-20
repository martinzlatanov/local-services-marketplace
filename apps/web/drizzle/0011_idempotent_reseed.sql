-- Migration: 0011_idempotent_reseed
-- Purpose: Idempotent re-seed for job_categories and locations lookup tables.
-- Safe to re-run: duplicate rows are skipped without error.
-- DO NOT edit migrations 0004-0007 — this is the safe replay path per D-09/D-10/D-11.

INSERT INTO "job_categories" ("name") VALUES
  ('PLUMBING'),
  ('ELECTRICAL'),
  ('CLEANING'),
  ('GARDENING'),
  ('MOVING'),
  ('HANDYMAN'),
  ('PAINTING'),
  ('OTHER')
ON CONFLICT (name) DO NOTHING;

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
  ('Stoke Newington, London')
ON CONFLICT (name) DO NOTHING;
