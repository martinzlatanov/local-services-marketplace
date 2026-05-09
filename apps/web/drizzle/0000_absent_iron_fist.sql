CREATE TYPE "public"."client_rating_categories" AS ENUM('communication', 'quality', 'punctuality');--> statement-breakpoint
CREATE TYPE "public"."job_category" AS ENUM('PLUMBING', 'ELECTRICAL', 'CLEANING', 'GARDENING', 'MOVING', 'HANDYMAN', 'PAINTING', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."provider_rating_categories" AS ENUM('paymentReliability', 'communicationClarity', 'professionalism');--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" varchar(32) DEFAULT 'PENDING' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"category" "job_category" NOT NULL,
	"description" text NOT NULL,
	"timeframe" varchar(100) NOT NULL,
	"city_area" varchar(100) NOT NULL,
	"client_id" varchar(320) NOT NULL,
	"provider_id" varchar(320),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"reviewee_id" integer NOT NULL,
	"review_type" varchar(32) NOT NULL,
	"client_communication" integer,
	"client_quality" integer,
	"client_punctuality" integer,
	"provider_payment_reliability" integer,
	"provider_communication_clarity" integer,
	"provider_professionalism" integer,
	"text" text NOT NULL,
	"photo_url" varchar(500),
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(32) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "unique_job_reviewer" ON "reviews" USING btree ("job_id","reviewer_id");--> statement-breakpoint
CREATE INDEX "approved_reviews_idx" ON "reviews" USING btree ("reviewee_id","approved_at");