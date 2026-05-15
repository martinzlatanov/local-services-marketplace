-- Convert jobs.client_id and jobs.provider_id from varchar to integer
ALTER TABLE "jobs" ALTER COLUMN "client_id" TYPE integer USING "client_id"::integer;
ALTER TABLE "jobs" ALTER COLUMN "provider_id" TYPE integer USING "provider_id"::integer;

-- Add foreign key constraints
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "users"("id");
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "users"("id");
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "jobs"("id");
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id");
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "users"("id");
