# Contributing to A.K. Auto Care

Thanks for helping improve the store. This guide covers local setup, the quality
gates, and how changes get merged.

> **Heads up — Next.js 16:** this project runs on Next.js 16, which renamed and
> changed several conventions (e.g. middleware is now `proxy.ts`). When in doubt,
> read the bundled docs under `node_modules/next/dist/docs/` rather than relying
> on older Next.js knowledge. See `AGENTS.md`.

## Prerequisites

- **Node 22** (see `.nvmrc` — run `nvm use`)
- npm (the repo ships a `package-lock.json`; use `npm ci` for reproducible installs)

## Local setup

```bash
nvm use            # Node 22
npm ci             # install exact locked dependencies
cp .env.example .env.local   # then fill in Supabase + ADMIN_SECRET
npm run dev        # http://localhost:3000
```

The app degrades gracefully without a real database: the product/data layer falls
back to local fixtures, so most pages render with placeholder Supabase values.

## Quality gates

Every change must pass the same four checks CI runs (`.github/workflows/ci.yml`).
Run them locally before opening a PR:

```bash
npm run lint        # eslint (eslint-config-next)
npx tsc --noEmit    # TypeScript typecheck
npm test            # Vitest unit tests
npm run build       # production build
```

- **Lint:** must be error-free. The React-Compiler-era `react-hooks/*` rules are
  set to warnings (see `eslint.config.mjs` for the rationale) — don't add new
  warnings without cause.
- **Types:** `strict` mode is on. Avoid `any`; the Supabase client is fully typed
  via `types/supabase.ts` — extend that file when you add tables/columns.
- **Tests:** unit tests live in `lib/__tests__/`. Add tests for any new pure
  logic, especially anything touching pricing, shipping, promos, or auth tokens.

## Database migrations

SQL migrations live in `supabase/migrations/`, numbered sequentially
(`NNN_description.sql`). They are applied by hand in the Supabase SQL editor.
When you change the schema:

1. Add a new numbered, **idempotent** migration (`IF NOT EXISTS` / `IF EXISTS`).
2. Update `types/supabase.ts` to match so the typed client stays accurate.

## Branching & pull requests

- Branch off `main`; never commit directly to `main`.
- Keep commits focused and write a clear, imperative subject line.
- Open a PR; CI must be green before merge.
- Don't commit secrets — `.env*` is gitignored (only `.env.example` is tracked).

## Project layout

| Path | What lives there |
|---|---|
| `app/` | App Router routes, layouts, API route handlers |
| `app/api/` | Server route handlers (orders, admin, crons, …) |
| `components/` | Reusable React components |
| `lib/` | Framework-free domain logic (commerce, promos, auth, email) |
| `lib/__tests__/` | Vitest unit tests |
| `utils/supabase/` | Supabase client factories (public / server / admin) |
| `data/` | Static catalogue fallbacks (products, categories, bundles) |
| `types/` | Shared types incl. generated Supabase `Database` types |
| `supabase/migrations/` | Sequential SQL migrations |
