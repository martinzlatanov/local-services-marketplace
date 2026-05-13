# Plan: Fix Vercel Deployment — `drizzle-kit` module not found

**Root Cause:** `drizzle.config.ts` sits inside `apps/web/` (the Next.js compilation tree) and imports `drizzle-kit`, which is a `devDependency`. During Vercel production builds, devDependencies are not installed. Next.js resolves and type-checks every `.ts` file it encounters, hits the missing `drizzle-kit` import, and fails with:

```
Type error: Cannot find module 'drizzle-kit' or its corresponding type declarations.
```

**Fix:** Move `drizzle.config.ts` out of the Next.js compilation tree to the monorepo root, where it belongs as a standard monorepo pattern.

## Steps

1. **Create `drizzle-root.config.ts` at monorepo root** — Move the config from `apps/web/drizzle.config.ts` to `./drizzle-root.config.ts`, updating the `schema` and `out` paths to be relative to the root:
   - `schema: './lib/db/schema.ts'` → `schema: './apps/web/lib/db/schema.ts'`
   - `out: './drizzle'` → `out: './apps/web/drizzle'`

2. **Delete `apps/web/drizzle.config.ts`** — Remove the file that triggers the build failure.

3. **Update package.json scripts** — Any `drizzle-kit` CLI commands (generate, push, migrate) currently using `--config` pointing to the old path must be updated to reference the new root config:
   - `"drizzle:generate": "drizzle-kit generate"` → `"drizzle:generate": "drizzle-kit generate --config drizzle-root.config.ts"`
   - Add similar flags wherever `drizzle-kit` is invoked.

4. **Optional safeguard — exclude from Next.js bundling:**
   Optionally add to `next.config.ts`:
   ```ts
   // No changes needed — moving the file out of apps/web/ is sufficient.
   ```

5. **Verify locally:**
   - Run `cd apps/web && npm run build` to confirm no more `drizzle-kit` type error.
   - Run `npm run drizzle:generate` from root to confirm schema generation still works.

## Expected Outcome
- Vercel production build passes without `drizzle-kit` installed (it's a dev-only tool).
- Drizzle schema generation still works when run locally or in CI from the monorepo root.
- No code changes to application logic needed.