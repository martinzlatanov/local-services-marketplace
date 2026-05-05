import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { Role } from '@local/types'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 320 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 32 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Note: unique index applied via SQL migration in apps/web/drizzle/0000_initial_user.sql
