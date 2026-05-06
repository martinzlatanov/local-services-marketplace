-- Create job category enum
CREATE TYPE job_category AS ENUM ('PLUMBING', 'ELECTRICAL', 'CLEANING', 'GARDENING', 'MOVING', 'HANDYMAN', 'PAINTING', 'OTHER');

-- Create jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  version INTEGER NOT NULL DEFAULT 1,
  category job_category NOT NULL,
  description TEXT NOT NULL,
  timeframe VARCHAR(100) NOT NULL,
  city_area VARCHAR(100) NOT NULL,
  client_id VARCHAR(320) NOT NULL,
  provider_id VARCHAR(320),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
