# A.K. Auto Care — Master Website Audit Report

**Date:** 2026-06-17
**Site:** A.K. Auto Care — automotive paint-correction & detailing products (e-commerce storefront + admin portal)
**Stack:** Next.js 16.2.6 (App Router) · React 19 · TypeScript · Supabase/Postgres · Tailwind CSS v4 · Zustand · Upstash (rate-limit) · Vercel
**Method:** Five specialized subagents audited the codebase in parallel, each owning an exclusive set of files (so concurrent safe-fix edits could not collide). Each agent produced a detailed report under [`audit-reports/`](./audit-reports/) with `file:line` citations, applied **low-risk mechanical fixes** within its scope, and left higher-risk items as recommendations. This audit was conducted **independently** of the pre-existing `audit_report.md` (no agent read it), as a second opinion.

> **Scope of code changes in this pass:** Per the agreed deliverable ("reports + safe fixes"), **27 files received auto-applied safe fixes** (accessibility attributes, SEO metadata, security header, output-encoding). Everything touching auth/crypto, CSP policy, SQL migrations, pricing/stock logic, and binary assets was deliberately **left as a recommendation**, not changed.

---

## 0. Validation status (post-fix)

The aggregate of all auto-applied edits was validated after the agents finished:

| Check | Result |
|---|---|
| `tsc --noEmit` (typecheck) | ✅ **0 errors** (after generating the git-ignored `next-env.d.ts` that Next normally emits at build) |
| `eslint` | ✅ **Pass** (exit 0; only pre-existing `set-state-in-effect` warnings in untouched admin pages) |
| `vitest run` | ✅ **40/40 tests pass** (5 files) |

No auto-fix introduced a type error, lint error, or test failure.

> **Environment note:** `node_modules` was absent in the checkout, so the agents reasoned about Next.js-16 behavior from the repository's own code and `CONTRIBUTING.md` (which documents that this Next variant renames middleware to **`proxy.ts`**). The orchestrator installed dependencies (`npm ci`, 420 pkgs) afterward to run the validation above.

---

## 1. Executive summary

**The backend is genuinely well-engineered, and the audit confirms it.** Pricing, discounts, shipping, and stock are all recomputed **server-side** in `app/api/orders/route.ts` (the primary e-commerce fraud vector is closed), every `/api/admin/**` route enforces `requireAdmin`/`requireRole` + CSRF + Zod **independently of** the `proxy.ts` perimeter, every public mutation applies CSRF + rate-limit + Zod, both cron routes are `CRON_SECRET`-gated, Supabase **RLS is enabled on every PII/financial table**, the service-role key never reaches the client, user reviews render as React-escaped text (no stored XSS), money is stored as `NUMERIC` (never float), and the rendering layer already uses ISR/SSG with `next/image` and structured data. **No remotely-exploitable Critical security vulnerability was found** (no auth bypass, no IDOR, no injection, no committed secrets).

**The real risks cluster in four places:**

1. **Database integrity & migration hygiene** — a duplicate-`017` migration silently deletes a product (and cascades to reviews) on every apply, and two commerce **race conditions** (promo over-redemption, stock oversell) exist in the check-then-act pattern.
2. **Reporting correctness at scale** — admin analytics/stats read entire tables into memory and will return **silently wrong revenue** once `orders` exceeds PostgREST's 1000-row default cap.
3. **Admin auth design** — a single `ADMIN_SECRET` doubles as both the login password *and* the token-signing key, sessions can't be revoked before UTC midnight, and there's no account lockout/MFA.
4. **Front-end polish** — heavy raw assets (1.9 MB orphaned video, 214–289 KB images), and (now-fixed) accessibility/indexability gaps.

### Severity tally (per-domain, as reported)

| Domain | Critical | High | Medium | Low | Files auto-fixed | Detailed report |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Frontend / UI / a11y | 0¹ | 3 | 9 | 6 | **13** | [`01-frontend-ui.md`](./audit-reports/01-frontend-ui.md) |
| API / Backend router | 0 | 1 | 6 | 3 | **1** | [`02-api-backend.md`](./audit-reports/02-api-backend.md) |
| Auth / Security (OWASP) | 0 | 3 | 5 | 5 | **1** | [`03-auth-security.md`](./audit-reports/03-auth-security.md) |
| Performance / SEO | 0 | 5 | 7 | 4 | **12** | [`04-performance-seo.md`](./audit-reports/04-performance-seo.md) |
| Data layer | **2** | 5 | 5 | 3 | 0² | [`05-data-layer.md`](./audit-reports/05-data-layer.md) |
| **Total** | **2** | **17** | **32** | **21** | **27** | |

¹ The Frontend agent rated 3 missing-form-label issues "Critical" on an accessibility scale; they are serious AT barriers (all now fixed) but not security/availability-critical, so they are normalized to **High** in the unified priorities below.
² The Data agent's session was interrupted before its two type edits persisted; they were reclassified to **Recommended** (see its report's validation note). All its findings still stand.

---

## 2. Critical vulnerabilities

### 🔴 C-1 · Duplicate `017_` migration deletes a product (and cascades to reviews) — `D-01`
**`supabase/migrations/017_bpo_product.sql` + `017_real_catalog.sql`**
Both files share the `017_` prefix; the CLI resolves ties alphabetically, so `017_bpo_product.sql` inserts product `p15` **first**, then `017_real_catalog.sql` runs an unconditional `DELETE FROM products;` (line 9) that wipes `p15` and cascades through `product_variants` and `reviews`. On a freshly provisioned database the BPO product **does not exist**, and re-applying the migration **purges all products and their reviews** every time.
**Fix:** Renumber `017_real_catalog.sql` to run *before* `017_bpo_product.sql` (or after, re-adding `p15`); scope the `DELETE` to the six demo IDs instead of the whole table. The Data report ships ready-to-use migration `026_re_add_bpo_product.sql`. **Adopt timestamped migration filenames** to prevent future prefix collisions.

### 🔴 C-2 · Promo-code `max_uses` TOCTOU race → over-redemption — `D-02`
**`app/api/orders/route.ts:112-120,161` + `supabase/migrations/003_stock_functions.sql:4-9`**
The order path checks `uses < max_uses`, then increments **after** the order insert via a plain `UPDATE … SET uses = uses + 1`. Two concurrent checkouts both pass the guard and both increment — a limited promo (e.g. "first 50") can be redeemed past its cap. No `CHECK (uses <= max_uses)` and no row lock.
**Fix:** Single atomic statement — `UPDATE promo_codes SET uses = uses + 1 WHERE id = $1 AND (max_uses IS NULL OR uses < max_uses) RETURNING id`; treat "no row" as exhausted. Ready-to-use migration `021_atomic_promo_check.sql` is in the Data report.

---

## 3. High-priority fixes

### Security & access control
- **H-1 · `ADMIN_SECRET` is both the login password and the HMAC signing key** (`S-01`, `lib/adminToken.ts`, `app/api/admin/login/route.ts:60`, `.env.example:13`). Leaking or weak-choosing one value compromises *both* authentication and token forgery; rotation logs out every admin. The example literally ships `change-me-to-a-long-random-string`. → Split into a distinct `ADMIN_TOKEN_SIGNING_KEY` (≥32 random bytes); migrate fully to per-user `admin_users` accounts and retire the shared-secret login.
- **H-2 · Sessions can't be revoked before UTC midnight** (`S-02`, `S-08`). Tokens validate purely against `utcDay()`; logout only clears the caller's cookie, and the edge `proxy.ts` trusts the token without the live `admin_users` freshness check. → Add a `tokenVersion`/`jti` claim (logout & "disable account" bump it) and align token expiry to the 8 h cookie.
- **H-3 · No admin account lockout or MFA; login throttle is per-IP only** (`S-04`). The in-memory limiter is per-instance when Upstash is unconfigured. → Per-account failed-attempt lockout, **mandatory Upstash in production**, TOTP MFA for the owner.
- **H-4 · Admin pages rely solely on `proxy.ts`** (`S-07`). The dashboard layout does no server-side session check. → Add `await getAdminSession()` + `redirect()` in `app/admin/(dashboard)/layout.tsx` for defense-in-depth.
- **H-5 · User-enumeration timing oracle on admin login** (`S-05`, `app/api/admin/login/route.ts:44-50`). The slow scrypt verify runs *only* when the email matches an active user, and error messages differ. → Always run a decoy scrypt; return an identical message.

### Data integrity & correctness
- **H-6 · Stock oversell race** (`D-09`). `reserve_stock` increments unconditionally with no ceiling/lock — concurrent orders for the last unit can both succeed. Not exploitable today (stock seeded 0) but live once stock is set. → Migration `024_reserve_stock_ceiling.sql` (in Data report).
- **H-7 · Analytics & stats fetch ALL order rows** (`D-05`, `A-02`; `app/api/admin/analytics/route.ts:37`, `stats/route.ts:16`). Past PostgREST's 1000-row default cap, **revenue figures are silently truncated/wrong**. → Push aggregation to SQL (`select("total.sum()")`); paginate/cap exports.
- **H-8 · Missing composite index on `reviews(product_id, approved)`** (`D-06`). The hot public-reviews query filters both columns; only one single-column index is used. → Migration `022_reviews_composite_idx.sql`.
- **H-9 · Dual source of truth for promos** (`D-07`). `lib/promos.ts` hardcodes the same codes as the `promo_codes` table; the static fallback ignores expiry/`max_uses`/`active`. → Remove or clearly mark as break-glass-only.

### Performance / SEO / Accessibility (the clusters with the highest user impact)
- **H-10 · Transactional/utility pages were indexable** (`P-01`, `P-02`). ✅ **Auto-fixed** — added `robots: noindex` to checkout, cart, and search layouts.
- **H-11 · Account auth pages have no metadata/noindex** (`P-03`). They're `"use client"` `page.tsx` files, so metadata can't be extracted. → Split into a thin server wrapper exporting metadata (recommended; needs a file rename).
- **H-12 · Heavy/raw assets** (`P-06`, `P-07`, `P-10`, `P-11`): 214 KB hero PNG, **orphaned 1.9 MB video** in `public/`, 225 KB favicon source, 289 KB OG image. → Convert the shield to SVG/AVIF, delete the unused video, compress the OG/favicon sources.
- **H-13 · `<Image fill>` without `sizes`** (`P-05`) over-fetches images on mobile. → Add explicit `sizes`.
- **H-14 · Form fields had no label associations** (`F-01`–`F-03`). ✅ **Auto-fixed** on the account, sample-request, and order-tracking forms (AT users previously could not identify these inputs).
- **H-15 · Latent HTML injection in the abandoned-cart email** (`A-01`). ✅ **Auto-fixed** — added `escapeHtml()` around all user-influenced interpolations.

---

## 4. What was auto-fixed in this pass (27 files, all validated)

| Domain | Files | Nature of change |
|---|:---:|---|
| Frontend / a11y | 13 | `htmlFor`↔`id` label associations, `aria-label`/`aria-expanded`/`aria-controls`, `role="dialog"`/`role="status"`, `type="button"` on non-submit buttons, dialog `aria-labelledby`. Files incl. `account/AccountClient`, `SampleRequestButton`, `order-tracking/OrderTrackingClient`, `Header`, `MiniCart`, `ShopClient`, `CartClient`, `CategoryPageClient`, `error.tsx`, three `loading.tsx`, admin `OrdersClient`. |
| Performance / SEO | 12 | `robots: noindex` on checkout/cart/search; `alternates.canonical` + Twitter cards on shop/about/contact/order-tracking/faq/blog; root-layout Twitter card; sitemap de-duplication of policy URLs; expanded `robots.ts` disallow list. |
| Auth / Security | 1 | `next.config.ts` — added inert `X-Permitted-Cross-Domain-Policies: none` (additive hardening; CSP untouched). |
| API / Backend | 1 | `lib/abandoned-cart-email.ts` — `escapeHtml()` helper applied to all user-influenced email interpolations. |
| Data layer | 0 | Type edits were **not** applied (agent interrupted, and `province`/generated-types changes are not unambiguously safe — see Data report). |

---

## 5. Structural & architectural recommendations (cross-cutting themes)

1. **Adopt timestamped migrations & wrap destructive DDL in guards.** The `017` collision (C-1) is a direct symptom of sequential numbering. Move to `YYYYMMDDHHmmss_*.sql`; never ship a bare `DELETE FROM <table>` in a re-runnable migration.
2. **Make the commerce core concurrency-safe.** Promo redemption (C-2) and stock reservation (H-6) both use check-then-act. Convert both to single atomic conditional `UPDATE … RETURNING` statements (proposed migrations 021 & 024). This is the single most important structural change for correctness under load.
3. **Push aggregation/pagination into Postgres.** Analytics, stats, and the CSV exports (H-7) read whole tables into the serverless function. Use SQL aggregates and keyset pagination; this fixes both the >1000-row correctness bug and the scaling/availability risk.
4. **Separate secrets and make admin sessions revocable.** Split the password from the signing key (H-1) and add a `tokenVersion` claim + server-side layout guard (H-2, H-4). Treat per-user `admin_users` as the only login path.
5. **Establish single sources of truth.** Several places mirror the DB in static code — `lib/promos.ts` vs `promo_codes` (H-9), `data/products.ts` functions shadowing `lib/products.ts` (`D-15`), and the footer's inline newsletter form duplicating `NewsletterSignup` (`F-20`). Each is a future-divergence footgun; delete the mirror or annotate it as non-authoritative.
6. **Treat metadata & accessibility as defaults, not afterthoughts.** Adopt the server-wrapper + client-component split for `"use client"` pages so every route can export metadata/noindex (H-11), and add a skip-to-content link in the root layout (`CR-05`). The a11y label gaps (now fixed) should be caught by an `eslint-plugin-jsx-a11y` rule going forward.
7. **Optimize the asset pipeline.** Convert the brand shield to SVG, remove the orphaned video, and compress OG/favicon sources (H-12). Consider `app/opengraph-image.tsx` via `ImageResponse` for per-route OG images.
8. **Harden headers & logging incrementally (test first).** Migrate the inline GA/Pixel bootstrap to hash-based `script-src` to drop `'unsafe-inline'` without losing SSG (`S-12`); add COOP/CORP after verifying GA/Pixel/Supabase still load (`S-13`); audit failed logins and PII exports (`S-17`).

---

## 6. Strengths to preserve (do **not** rebuild)

- **Server-authoritative checkout** — prices, promos, shipping, and stock recomputed server-side (`app/api/orders/route.ts`).
- **Defense-in-depth on admin** — `proxy.ts` perimeter **plus** per-route `requireAdmin`/`requireRole` + CSRF + Zod on every handler; `staff/[id]` blocks self-lockout; refunds require owner/manager.
- **Consistent public-mutation guard** — CSRF → rate-limit → Zod on every public POST.
- **Data layer security** — RLS enabled on all PII/financial tables (`anon USING (false)`), service-role key server-only, parameterized RPCs, sanitized PostgREST search filters.
- **No stored XSS** — reviews render as React-escaped text; JSON-LD serializes controlled objects.
- **Clean secret hygiene** — `.env.example` placeholders only; `.gitignore` ignores `.env*`; CI uses a placeholder key.
- **Solid rendering & SEO base** — ISR/SSG, `next/image`, `metadataBase`, Organization/Product/BreadcrumbList/FAQPage/BlogPosting structured data, `next/script` for analytics.
- **Good craftsmanship details** — money as `NUMERIC`, atomic `reserve_stock` ON CONFLICT (just needs a ceiling), correct focus-trap hook, `prefers-reduced-motion` handling, timing-safe compares in the Node login path.

---

## 7. How to read the detailed reports

Each finding has a stable ID you can cite: **F-** (frontend), **A-** (API), **S-** (security/OWASP), **P-** (performance/SEO), **D-** (data). Every entry includes `file:line`, impact, a concrete fix, and a status (`✅ Auto-fixed` / `🔧 Recommended`). Ready-to-apply SQL for the data-layer fixes (migrations `021`–`026`) is in [`audit-reports/05-data-layer.md`](./audit-reports/05-data-layer.md).

| # | Domain | Report |
|---|---|---|
| 1 | Frontend / UI / Accessibility | [`audit-reports/01-frontend-ui.md`](./audit-reports/01-frontend-ui.md) |
| 2 | API / Backend router | [`audit-reports/02-api-backend.md`](./audit-reports/02-api-backend.md) |
| 3 | Authentication & Security (OWASP) | [`audit-reports/03-auth-security.md`](./audit-reports/03-auth-security.md) |
| 4 | Performance & SEO | [`audit-reports/04-performance-seo.md`](./audit-reports/04-performance-seo.md) |
| 5 | Data layer | [`audit-reports/05-data-layer.md`](./audit-reports/05-data-layer.md) |

### Suggested fix order
1. **C-1, C-2** (migration data-loss + promo race) — before any production data accumulates.
2. **H-6, H-7** (stock race + revenue-truncation) — before stock/volume go live.
3. **H-1 → H-5** (admin auth hardening) — before/at launch.
4. **H-8 → H-15** (indexes, SEO, assets, a11y) — most are quick wins; several already auto-fixed.

*End of master report.*
