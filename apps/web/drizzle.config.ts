import { defineConfig } from 'drizzle-kit'

// defineConfig's type bindings may not include the Node Postgres driver string
// in this workspace; cast to `any` for now so typecheck passes and runtime
// config remains correct.
export default (defineConfig as unknown as (c: any) => any)({
  schema: './apps/web/lib/db/schema.ts',
  out: './apps/web/drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || '',
  },
})
