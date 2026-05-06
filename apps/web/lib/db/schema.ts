import { pgTable, serial, varchar, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'
import { Role } from '@local/types'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 320 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 32 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Note: unique index applied via SQL migration in apps/web/drizzle/0000_initial_user.sql

// Job category enum for PostgreSQL
export const jobCategoryEnum = pgEnum('job_category', [
  'PLUMBING',
  'ELECTRICAL',
  'CLEANING',
  'GARDENING',
  'MOVING',
  'HANDYMAN',
  'PAINTING',
  'OTHER',
])

// Jobs table with state machine support
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  status: varchar('status', { length: 32 }).notNull().default('PENDING'),
  version: integer('version').notNull().default(1),
  category: jobCategoryEnum('category').notNull(),
  description: text('description').notNull(),
  timeframe: varchar('timeframe', { length: 100 }).notNull(),
  cityArea: varchar('city_area', { length: 100 }).notNull(),
  clientId: varchar('client_id', { length: 320 }).notNull(),
  providerId: varchar('provider_id', { length: 320 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})