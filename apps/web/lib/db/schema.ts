import { pgTable, serial, varchar, text, timestamp, integer, pgEnum, uniqueIndex, index, primaryKey } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  name: varchar("name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  status: varchar("status", { length: 16 }).notNull().default("active"),
})

// Note: unique index applied via SQL migration in apps/web/drizzle/0000_initial_user.sql

// User roles junction table (D-01: multi-role support)
export const userRoles = pgTable(
  "user_roles",
  {
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 32 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.role] }),
  })
)

// Job categories lookup table (replaces job_category pgEnum)
export const jobCategories = pgTable("job_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
})

// Locations lookup table (replaces city_area varchar)
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
})

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
  categoryId: integer("category_id").notNull().references(() => jobCategories.id),
  description: text("description").notNull(),
  timeframe: varchar("timeframe", { length: 100 }).notNull(),
  locationId: integer("location_id").notNull().references(() => locations.id),
  clientId: integer("client_id").notNull().references(() => users.id),
  providerId: integer("provider_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Reviews table for client and provider ratings
export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id").notNull().references(() => jobs.id),
    reviewerId: integer("reviewer_id").notNull().references(() => users.id),
    revieweeId: integer("reviewee_id").notNull().references(() => users.id),
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
