# API / Backend Router Audit — A.K. Auto Care
Date: 2026-06-17 · Scope: app/api/**, backend service libs

## Summary
The backend route layer is, overall, in strong shape. Every public mutation endpoint (`orders`, `contact`, `newsletter`, `reviews`, `sample-request`, `promo`, `order-tracking`, `cart/save`) consistently applies the same three-part guard: `checkCsrf()` → `rateLimit()` → Zod `safeParse`, and prices/discounts/stock are recomputed server-side in `orders` rather than trusted from the client. Admin routes practice defense-in-depth: in addition to the `proxy.ts` perimeter (documented in `CONTRIBUTING.md` as this Next variant's renamed middleware, matcher `["/admin/:path*","/api/admin/:path*"]`), each admin handler independently calls `requireAdmin()`/`requireRole()`, which re-checks `admin_users.active` live and fails closed. Both cron routes (`abandoned-cart`, `low-stock`) are correctly gated by a `Bearer ${CRON_SECRET}` check and match `vercel.json`. Error handling is notably disciplined — no handler leaks `error.message`, stack traces, or raw DB errors to clients (raw errors are at most `console.error`'d server-side). The main residual issues are several **unbounded full-table read/export endpoints** (analytics, orders export with `select("*")`, newsletter export, reports/sales, stats) that scale with table size, a few **HTTP-status correctness nits** (chart returns 200 on failure; `contact-messages/[id]` returns 500 instead of 404 for missing rows), some **unvalidated date query params** interpolated as filter values, and a **latent (non-exploitable) HTML-injection sink** in the abandoned-cart email template (auto-fixed). No exploitable auth bypass, IDOR, injection, or unauthenticated data-exposure was found.

> **Audit limitation:** `node_modules` is not installed in this checkout (the declared `next@16.2.6` package and the `node_modules/next/dist/docs/` guides referenced by AGENTS.md are absent on disk; `npm install` is disallowed by the ground rules). Next-16-specific behavior was therefore validated against the code's own usage (`after()` from `next/server`, `params: Promise<>`, `req.nextUrl`) and the project's `CONTRIBUTING.md`, not the official guides. `proxy.ts` is treated as the wired middleware per `CONTRIBUTING.md` ("middleware is now `proxy.ts`"), NOT as dead code.

## Endpoint inventory
| Route | Methods | Auth | Validation | Rate-limited | Notes |
|---|---|---|---|---|---|
| `api/orders` | POST | CSRF + public | Zod body (full) | `orders:ip` 5/60s | Server-side price/stock/promo recompute. Good. |
| `api/contact` | POST | CSRF + public | Zod body | `contact:ip` 3/10m | Persists + best-effort email. |
| `api/newsletter` | POST | CSRF + public | Zod (email) | `newsletter:ip` 3/60m | Upsert + optional provider forward. |
| `api/reviews` | GET, POST | CSRF (POST) + public | Zod body (POST); GET `product_id` raw value-filter | `reviews:ip` 3/60m | GET unauth read of approved reviews (intended). 201 on create. |
| `api/sample-request` | POST | CSRF + public | Zod body | `sample:ip` 5/10m | Snapshots sample_price server-side. |
| `api/promo` | POST | CSRF + public | Zod body | `promo:ip` 10/60s | DB then hardcoded fallback. |
| `api/order-tracking` | POST | CSRF + public | Zod (orderId+email) | `order-tracking:ip` 10/60s | Scoped by email+id (`.ilike(email).eq(id)`). 404 on miss. |
| `api/cart/save` | POST | CSRF + public | Zod on `cartData`; `sessionId`/`email` raw | `cart-save:ip` 20/60s | **A-06**: `email`/`sessionId` unvalidated (no email format, no length cap). |
| `api/cart/recover` | GET | HMAC token (no CSRF needed, GET) | token sig + exp | none | Timing-safe HMAC verify, 410 on expiry. Good. |
| `api/cron/abandoned-cart` | GET | `Bearer CRON_SECRET` | n/a | none | Mints HMAC recovery token. Matches vercel.json. |
| `api/cron/low-stock` | GET | `Bearer CRON_SECRET` | n/a | none | Threshold from settings. Matches vercel.json. |
| `api/admin/login` | POST | CSRF + public (gate) | inline (`email`/`password` typeof) | `admin-login:ip` 5/15m | Timing-safe compares; per-user + legacy secret. |
| `api/admin/logout` | POST | CSRF + public | none | none | Clears cookie. |
| `api/admin/upload` | POST | `requireAdmin` + CSRF | file type allowlist + size + content-type | none | **A-09**: relies on declared MIME, not magic-byte sniff. UUID filename (no traversal). |
| `api/admin/products` | GET, POST | `requireAdmin` + CSRF (POST) | Zod (POST) | none | **A-04**: POST 400 returns `details: error.flatten()`. 201 on create. |
| `api/admin/products/[id]` | GET, PATCH, DELETE | `requireAdmin`; DELETE `requireRole(owner,manager)` + CSRF | Zod (PATCH) | none | **A-04** flatten leak. IDOR n/a (global catalog). |
| `api/admin/products/bulk` | PATCH | `requireRole(owner,manager)` + CSRF | Zod discriminated union | none | **A-04** flatten leak. Per-row price writes, no txn. |
| `api/admin/promos` | GET, POST | GET `requireAdmin`; POST `requireRole(owner,manager)` + CSRF | Zod (POST) | none | 409 on duplicate. `select("*")` on small table. |
| `api/admin/promos/[id]` | PATCH, DELETE | PATCH `requireAdmin`; DELETE `requireRole(owner,manager)` + CSRF | Zod (PATCH) | none | Clean. |
| `api/admin/staff` | GET, POST | `requireRole(owner)` + CSRF (POST) | Zod (POST) | none | Owner-only. Password hashed. 409 dup. |
| `api/admin/staff/[id]` | PATCH, DELETE | `requireRole(owner)` + CSRF | Zod (PATCH) | none | Self-lockout guards. Good. |
| `api/admin/settings` | GET, PATCH | GET `requireAdmin`; PATCH `requireRole(owner,manager)` + CSRF | Zod per-group | none | Audited. Clean. |
| `api/admin/reviews` | GET | `requireAdmin` | `approved`/`product_id` raw value-filters | none | Exposes `user_email` (admin only). |
| `api/admin/reviews/[id]` | PATCH, DELETE | `requireAdmin` + CSRF | Zod (PATCH) | none | Clean. |
| `api/admin/sample-requests` | GET | `requireAdmin` | `status`/`search` (sanitized) | none | Bounded `.range(0,999)`. |
| `api/admin/sample-requests/[id]` | PATCH, DELETE | `requireAdmin` + CSRF | Zod (PATCH) | none | Clean. |
| `api/admin/contact-messages` | GET | `requireAdmin` | `status`/`search` (sanitized) | none | Bounded `.range(0,999)`. |
| `api/admin/contact-messages/[id]` | PATCH, DELETE | `requireAdmin` + CSRF | Zod (PATCH); DELETE none | none | **A-05**: missing id → PATCH 500 / DELETE 200. Bare `catch{}` (not logged). |
| `api/admin/orders` | GET | `requireAdmin` | paginated; `dateFrom/To` raw | none | **A-03**: date params unvalidated. `page` no upper bound. |
| `api/admin/orders/[id]` | GET, PATCH | `requireAdmin`; refund→`requireRole(owner,manager)` + CSRF | Zod (PATCH) | none | Uses `after()` for status email. Audited. Good. |
| `api/admin/orders/bulk` | POST | `requireAdmin` + CSRF | Zod (uuid[] ≤100) | none | Bare `catch{}`. |
| `api/admin/orders/export` | GET | `requireRole(owner,manager)` | `dateFrom/To` raw | none | **A-02**: `select("*")` + **unbounded** full export. CSV formula-guard present. |
| `api/admin/orders/chart` | GET | `requireAdmin` | none | none | **A-07**: returns **200 `{days:[]}` on error** (masks failure). |
| `api/admin/newsletter` | GET | `requireAdmin` | `search` (LIKE-escaped) | none | Bounded `.range(0,4999)`. |
| `api/admin/newsletter/export` | GET | `requireRole(owner,manager)` | `search` (LIKE-escaped) | none | **A-02**: **unbounded** PII export. CSV formula-guard present. |
| `api/admin/customers` | GET | `requireAdmin` | `search` (sanitized), `sort` allowlist | none | Bounded `.range(0,499)`. |
| `api/admin/analytics` | GET | `requireAdmin` | none | none | **A-02**: **unbounded** read of all orders + all products. |
| `api/admin/reports/sales` | GET | `requireAdmin` | `from/to` raw; `groupBy`/`format` allowlist | none | **A-02/A-03**: unbounded if no date filter; date params unvalidated. CSV guard present. |
| `api/admin/stats` | GET | `requireAdmin` | none | none | **A-02**: revenue query selects all order `total`s (unbounded sum). |
| `api/admin/inventory` | GET, PATCH | `requireAdmin` (PATCH: CSRF before auth) | Zod (PATCH) | none | **A-08**: PATCH checks CSRF before auth (both still enforced; ordering nit). Per-row writes, no txn. |
| `api/admin/audit-log` | GET | `requireRole(owner,manager)` | `action` (raw `%..%`), `limit` capped 500 | none | **A-10**: `limit` not lower-bounded (negative reaches `.limit()`). |
| `api/admin/email-templates` | GET, PATCH | GET `requireAdmin`; PATCH `requireRole(owner,manager)` + CSRF | Zod (PATCH) | none | Audited. Clean. |
| `api/admin/email-templates/test` | POST | `requireAdmin` + CSRF | Zod (key+email) | none | 503 if no key; 502 on Resend fail (detail logged, not returned). Clean. |

## Severity tally
| Critical | High | Medium | Low |
|---|---|---|---|
| 0 | 1 | 6 | 3 |

## Files modified (auto-fixes applied)
- `lib/abandoned-cart-email.ts` — Added an `escapeHtml()` helper and applied it to all user-influenced interpolations (`firstName`, `item.productName`, `item.variantLabel`, `item.image`) in the abandoned-cart email HTML. Output is byte-identical for legitimate input; closes a latent HTML-injection sink (finding A-01). Non-breaking.

## Findings
*(ordered by severity)*

### [A-01] Latent HTML/script injection in abandoned-cart email template — High
- **Location:** `lib/abandoned-cart-email.ts:32,44,50,51` (pre-fix)
- **Category:** Validation / Error-leak (output encoding)
- **Issue:** `firstName`, `item.productName`, `item.variantLabel`, and `item.image` were interpolated raw into the email HTML (`<img src="${item.image}">`, `<div>...${item.productName}</div>`). `email` is also interpolated but only inside `encodeURIComponent(...)` in a mailto, so it was already safe.
- **Impact:** If `cart_data` ever carried attacker-controlled `productName`/`image`, the recovery email (sent server-to-customer via cron) would render injected markup — stored-HTML/CSS injection or `<img>`-based content. **Currently NOT exploitable:** the only writer of `cart_data` is `app/api/cart/save/route.ts`, whose Zod `cartDataSchema` strips items down to `{productId, variantSku, quantity}` (`lib/cart-session.ts` sends `unknown[]`, but the server discards the extra fields), so `productName`/`variantLabel`/`image` are never persisted and render as empty strings today. The risk is a latent sink that becomes live the moment the stored shape is enriched.
- **Fix:** Added an `escapeHtml()` helper and wrapped all four interpolations.
- **Status:** ✅ Auto-fixed

### [A-02] Unbounded full-table reads / exports — Medium
- **Location:** `app/api/admin/analytics/route.ts:35-39` (all orders + all products, no `.limit/.range`); `app/api/admin/orders/export/route.ts:21` (`select("*")`, no limit); `app/api/admin/newsletter/export/route.ts:15-18` (no limit); `app/api/admin/reports/sales/route.ts:65` (no limit; with no `from/to` fetches all non-cancelled/refunded orders); `app/api/admin/stats/route.ts:16` (selects every order `total` to sum in memory)
- **Category:** REST (over-fetch / resource exhaustion)
- **Issue:** These admin endpoints read entire tables into the serverless function's memory with no cap. As `orders`/`newsletter_subscribers` grow, response time, memory, and egress grow linearly; large datasets risk function timeouts/OOM. The export endpoints additionally stream all rows to a CSV with no size ceiling.
- **Impact:** DoS-by-growth and slow admin pages. Low blast radius (auth-gated; owner/manager for exports), but a real scaling/availability concern. `orders/export` also uses `select("*")` (pulls every column incl. unused ones).
- **Fix:** Add an explicit upper bound (e.g. `.range(0, 49_999)`) or true server-side streaming/pagination to the export and analytics queries; for `stats`, compute the revenue sum with a DB aggregate (`.select("total.sum()")` / RPC) instead of summing in JS; narrow `orders/export` to the columns the CSV uses.
- **Status:** 🔧 Recommended

### [A-03] Unvalidated date query params interpolated into filters — Medium
- **Location:** `app/api/admin/orders/route.ts:41-42`; `app/api/admin/orders/export/route.ts:28-29`; `app/api/admin/reports/sales/route.ts:69-70`
- **Category:** Validation
- **Issue:** `dateFrom`/`dateTo` (and `from`/`to`) are read raw from the query string and concatenated into a timestamp string (e.g. `` `${dateFrom}T00:00:00` ``) passed to `.gte/.lte("created_at", …)`. They are never format-validated (no Zod, no date check). PostgREST treats the value as a filter literal (parameterized, not raw SQL), so this is **not SQL injection**, but a malformed value can produce a PostgREST cast error → generic 500, and the reports are silently wrong for garbage input.
- **Impact:** Limited — admin-only, no injection. Robustness/correctness gap.
- **Fix:** Validate with a small Zod schema (`z.string().regex(/^\d{4}-\d{2}-\d{2}$/)` or `z.coerce.date()`), reject with 400 on bad input.
- **Status:** 🔧 Recommended

### [A-04] Zod schema internals leaked in 400 responses — Medium
- **Location:** `app/api/admin/products/route.ts:65`; `app/api/admin/products/[id]/route.ts:74`; `app/api/admin/products/bulk/route.ts:45`
- **Category:** Error/leak
- **Issue:** Validation failures return `{ error: "Invalid data.", details: parsed.error.flatten() }`, exposing the full Zod field map (field names, nesting, constraint messages) to the client.
- **Impact:** Low — these are admin-only (owner/manager for bulk/delete), so the audience is trusted, but it leaks internal schema shape and is inconsistent with every other route (which return a bare generic message). Mild information disclosure.
- **Fix:** Drop the `details` field (return only `{ error: "Invalid data." }`) for parity, or gate it behind `NODE_ENV !== "production"`. *Not auto-applied:* the admin product-form UI may surface these field errors, so removing `details` is a response-contract change for the frontend — recommend coordinating with the UI owner.
- **Status:** 🔧 Recommended

### [A-05] Wrong status codes for missing resource on `contact-messages/[id]` — Medium
- **Location:** `app/api/admin/contact-messages/[id]/route.ts` — PATCH `~33-34`, DELETE `~51-52`
- **Category:** REST
- **Issue:** PATCH on a non-existent `id` hits `.single()`, which errors, is caught by a bare `catch {}`, and returns **500** instead of **404**. DELETE of a non-existent `id` is not an error in PostgREST, so it returns **200 `{ok:true}`** for a row that never existed. Both catch blocks swallow the error without `console.error` (harder to debug).
- **Impact:** Misleading semantics for clients/monitoring; a 500 where 404 is correct. No security impact.
- **Fix:** Use `.select().maybeSingle()` and return 404 when null on PATCH; check the deleted-row count (or pre-check existence) to return 404 on DELETE; add `console.error(err)` before the generic response.
- **Status:** 🔧 Recommended

### [A-06] `cart/save` accepts unvalidated `email` and `sessionId` — Medium
- **Location:** `app/api/cart/save/route.ts:26-30,43`
- **Category:** Validation
- **Issue:** Only `cartData` is Zod-validated. `sessionId` is checked for truthiness/`typeof string` but has **no length bound**; `email` is stored as `typeof email === "string" ? email : ""` with **no format check and no length cap**. Both are persisted to `abandoned_carts` and `email` is later used as the `to:` recipient by the cron mailer (`api/cron/abandoned-cart`).
- **Impact:** A junk/over-long `sessionId` bloats rows; a malformed `email` is written and then handed to Resend as a recipient (Resend rejects invalid addresses, so no open-relay, but it pollutes data and wastes send attempts). Unbounded string write is a minor abuse/storage vector despite the 20/60s rate limit.
- **Fix:** Validate with Zod: `sessionId: z.string().min(1).max(100)`, `email: z.string().email().max(254).optional().or(z.literal(""))`. Matches the style already used in `orders`/`reviews`.
- **Status:** 🔧 Recommended (touches the public cart contract; left to confirm the client always sends a parseable email)

### [A-07] `orders/chart` returns HTTP 200 on failure — Medium
- **Location:** `app/api/admin/orders/chart/route.ts:~40`
- **Category:** REST
- **Issue:** On any DB error the handler returns `200 { days: [] }` rather than a 5xx, and does not log the error. A backend failure is indistinguishable from "no data."
- **Impact:** Masks outages from the admin UI and monitoring; an empty chart is silently shown on real errors. Low blast radius.
- **Fix:** Return `500 { error: "..." }` on failure and `console.error(err)`. *Not auto-applied:* the dashboard likely renders the 200 empty-array shape gracefully; switching to 500 changes what the frontend receives, so confirm the UI handles the error status first.
- **Status:** 🔧 Recommended

### [A-08] Inventory PATCH checks CSRF before auth — Low
- **Location:** `app/api/admin/inventory/route.ts:38,41`
- **Category:** Access control (ordering)
- **Issue:** PATCH calls `checkCsrf(req)` (line 38) **before** `requireAdmin()` (line 41); every other mutating admin route checks auth first (or, like products, CSRF-then-auth — the codebase is itself inconsistent). Both checks run, so there is no bypass; this is purely an ordering nit. Note: failing CSRF before auth can reveal endpoint existence to an unauthenticated caller (a 403 vs 401), a negligible enumeration signal.
- **Impact:** Negligible. Consistency only.
- **Fix:** Standardize order (auth → CSRF) across all admin mutations. (Owned partly by Security agent re: the convention.)
- **Status:** 🔧 Recommended

### [A-09] Upload relies on declared MIME type, not content sniffing — Low
- **Location:** `app/api/admin/upload/route.ts:40-46,78`
- **Category:** Upload
- **Issue:** File type is decided from the client-supplied `file.type` against an allowlist; there is no magic-byte/content sniff. Size (5MB) and empty-file checks are present, and the stored filename is `crypto.randomUUID().<ext>` (no path traversal, no client-controlled name). The bucket is public-read.
- **Impact:** Low — auth-gated (admin), random filename, served from a separate Supabase storage origin (not the app origin), and `X-Content-Type-Options: nosniff` is set globally in `next.config.ts`. A spoofed `Content-Type` could store a non-image blob, but it can't execute in the app origin.
- **Fix:** Optionally verify the first bytes match the declared image type (magic-number check) before upload for defense-in-depth.
- **Status:** 🔧 Recommended

### [A-10] `audit-log` limit not lower-bounded — Low
- **Location:** `app/api/admin/audit-log/route.ts:13`
- **Category:** Validation
- **Issue:** `limit = Math.min(parseInt(searchParams.get("limit") ?? "200", 10) || 200, 500)`. The upper bound (500) and NaN fallback are handled, but a **negative** value (e.g. `?limit=-5`) passes `Math.min(-5, 500) = -5` straight to `.limit(-5)`.
- **Impact:** Negligible — owner/manager only; PostgREST treats a negative limit benignly (no rows / error caught → 500). Robustness nit.
- **Fix:** Clamp the lower bound: `Math.max(1, Math.min(parsed, 500))`.
- **Status:** 🔧 Recommended

## Cross-domain recommendations
- **Security agent — `proxy.ts` middleware wiring:** `CONTRIBUTING.md` documents that this Next variant renames middleware to `proxy.ts`, and the matcher (`/admin/:path*`, `/api/admin/:path*`) and exported `proxy()` are present. Because `node_modules` is not installed here, I could not confirm against the Next 16 runtime that `proxy.ts` is actually loaded as the middleware entrypoint. **Recommend the Security/infra agent verify at build/deploy time** that the proxy is invoked (e.g. confirm a request to `/api/admin/*` without a session cookie is rejected by the perimeter, not only by the per-route `requireAdmin`). The per-route checks are present on every admin handler regardless, so a non-wired proxy would not by itself create an exposure — but the redirect-to-login for `/admin/*` pages depends on it.
- **Security agent — auth/CSRF ordering convention (A-08):** standardize the auth-vs-CSRF check order across all admin mutations (the codebase mixes auth-first and CSRF-first).
- **Security/infra agent — rate-limiting on admin/cron:** public routes are well rate-limited, but admin mutations and the cron endpoints have no rate limit. Given cron is secret-gated and admin is auth-gated this is acceptable, but consider a coarse limiter on `admin-login` siblings and on the unbounded export endpoints (A-02) to blunt accidental hammering. (`lib/rateLimit.ts` is Security-owned.)
- **Data agent — DB aggregate for `stats` revenue & export pagination (A-02):** moving the revenue sum and large exports to DB-side aggregation/keyset pagination requires query/RPC changes in `lib/` (Data-owned). Also consider a stored upper bound on `abandoned_carts` writes (A-06) at the DB layer.
- **Data agent — IDOR posture on dynamic `[id]` routes:** all `[id]` admin routes operate on globally-scoped resources (single-tenant store, no per-user ownership), so `eq("id", id)` with admin auth is appropriate and no IDOR was found at the route-handler level. If multi-tenancy/customer accounts are ever added, these routes will need ownership scoping — flagging for the Security/Data deep-dive.
