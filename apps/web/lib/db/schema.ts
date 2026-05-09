import { pgTable, serial, varchar, text, timestamp, integer, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core"
import { Role } from "@/lib/types"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 32 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Note: unique index applied via SQL migration in apps/web/drizzle/0000_initial_user.sql

// Job category enum for PostgreSQL
export const jobCategoryEnum = pgEnum("job_category", [
  "PLUMBING",
  "ELECTRICAL",
  "CLEANING",
  "GARDENING",
  "MOVING",
  "HANDYMAN",
  "PAINTING",
  "OTHER",
])

// Rating category enums for reviews
export const clientRatingCategories = pgEnum("client_rating_categories", [
  "communication",
  "quality",
  "punctuality",
])

export const providerRatingCategories = pgEnum("provider_rating_categories", [
  "paymentReliability",
  "communicationClarity",
  "professionalism",
])

// Jobs table with state machine support
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  status: varchar("status", { length: 32 }).notNull().default("PENDING"),
  version: integer("version").notNull().default(1),
  category: jobCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  timeframe: varchar("timeframe", { length: 100 }).notNull(),
  cityArea: varchar("city_area", { length: 100 }).notNull(),
  clientId: varchar("client_id", { length: 320 }).notNull(),
  providerId: varchar("provider_id", { length: 320 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Reviews table for client and provider ratings
export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id").notNull(),
    reviewerId: integer("reviewer_id").notNull(),
    revieweeId: integer("reviewee_id").notNull(),
    reviewType: varchar("review_type", { length: 32 }).notNull(), // 'client' or 'provider'
    // Client rating fields (when reviewType = 'client')
    clientCommunication: integer("client_communication"),
    clientQuality: integer("client_quality"),
    clientPunctuality: integer("client_punctuality"),
    // Provider rating fields (when reviewType = 'provider')
    providerPaymentReliability: integer("provider_payment_reliability"),
    providerCommunicationClarity: integer("provider_communication_clarity"),
    providerProfessionalism: integer("provider_professionalism"),
    // Review content
    text: text("text").notNull(),
    photoUrl: text("photo_url"), // Support large data URLs (~5MB)
    // Approval state
    approvedAt: timestamp("approved_at"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueJobReviewer: uniqueIndex("unique_job_reviewer").on(table.jobId, table.reviewerId),
    approvedReviewsIndex: index("approved_reviews_idx").on(table.revieweeId, table.approvedAt),
  })
)
