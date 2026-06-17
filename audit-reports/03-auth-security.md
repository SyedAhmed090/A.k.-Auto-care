# Authentication & Security Audit (OWASP) — A.K. Auto Care
Date: 2026-06-17 · Scope: proxy.ts, lib auth, utils/supabase, headers, api access-control

## Summary
The admin authentication model is built on a single shared `ADMIN_SECRET` that serves **both** as the legacy login password **and** as the HMAC signing key for all session tokens (`lib/adminToken.ts`, `.env.example:13`) — the highest-priority weakness: leaking, rotating, or brute-forcing one value compromises both authentication and token forgery, and rotation invalidates every live session. Sessions are stateless and day-scoped, so **logout cannot revoke a stolen cookie** before UTC midnight and there is **no token rotation, `jti`, or server-side revocation** (A07). Encouragingly, the data layer is strong: Supabase RLS is enabled on every sensitive table (`orders`, `admin_users`, `abandoned_carts`, etc.) with `anon USING (false)` / service-role-only policies, the service-role key never reaches the client, PostgREST `.or()` search filters are consistently run through `sanitizeSearchTerm()`, all `/api/admin/**` routes independently enforce `requireAdmin`/`requireRole` + CSRF + Zod beyond the proxy, user-generated reviews render as React-escaped text (no stored XSS), and `.env.example`/`.gitignore` are clean (placeholders only, `.env*` ignored). The most material residual risks are the shared-secret design, the absence of account lockout/MFA on admin login (rate-limit is per-IP only), a user-enumeration timing oracle in the per-user login branch, and admin pages relying solely on the proxy with no server-side session guard (defense-in-depth). No remotely exploitable Critical was found. One additive, non-breaking security header was auto-added; all auth/crypto/CSP changes are recommend-only.

## Severity tally
| Critical | High | Medium | Low |
|---|---|---|---|
| 0 | 3 | 5 | 5 |

## Files modified (auto-fixes applied)
- `next.config.ts` — added `X-Permitted-Cross-Domain-Policies: none` (inert, additive defense-in-depth header). CSP and all other policy values left untouched.

## Findings (grouped by OWASP category)

### A02 — Cryptographic Failures

#### [S-01] `ADMIN_SECRET` is reused as both the login password and the token signing key — High — A02
- **Location:** `lib/adminToken.ts:68-69,79,97` (signing) · `app/api/admin/login/route.ts:60-62` (same value as password) · `.env.example:13-14`
- **Issue:** A single secret is the legacy admin password (`crypto.timingSafeEqual(password, ADMIN_SECRET)`) **and** the HMAC-SHA256 key that signs every per-user (`v2.*`) session token and the legacy SHA-256 owner token. No key separation.
- **Exploit/Impact:** If the secret leaks (logs, env exfil, a low-entropy choice — the example literally ships `change-me-to-a-long-random-string`), an attacker can both log in as owner AND forge arbitrary `v2.<uid>.<role>` tokens for any role/uid. Rotating the secret to recover also instantly logs out every admin and breaks all live sessions. Brute-forcing the login password is equivalent to recovering the signing key.
- **Fix:** Split into two env vars — keep `ADMIN_SECRET` for the password and introduce a distinct `ADMIN_TOKEN_SIGNING_KEY` (≥32 random bytes) for HMAC. Phase out the legacy shared-secret login entirely in favour of per-user `admin_users` accounts. Document a strong-secret requirement.
- **Status:** 🔧 Recommended

#### [S-02] Stateless day-scoped sessions: no revocation, no rotation, logout cannot invalidate a stolen cookie — High — A02/A07
- **Location:** `lib/adminToken.ts:84-110` (verify) · `lib/adminAuth.ts:13-14` (`MAX_AGE` 8h) · `app/api/admin/logout/route.ts:9-11`
- **Issue:** Tokens are validated purely by recomputing the HMAC/SHA against `utcDay()`. There is no session store, no `jti`, no per-token expiry beyond "current UTC day", and no nonce. Logout only clears the cookie in the caller's browser — the token value stays valid until midnight UTC for anyone who copied it. The cookie `Max-Age` is 8h but token validity is "until end of UTC day" (0–24h), so the two disagree.
- **Exploit/Impact:** A stolen/leaked session cookie (XSS-adjacent, shared device, proxy logs) remains usable until UTC midnight regardless of logout. A disabled per-user account keeps page-level access until midnight (mitigated for API/data by the live `admin_users` re-check in `activeIdentity()`, but the proxy edge check trusts the token alone). No way to force-logout a compromised session.
- **Fix:** Move to a revocable session model: store a session id / token-version in `admin_users` (or a `sessions` table) and check it on sensitive routes, or add a short absolute expiry (e.g. `iat`+8h) inside the signed payload and a `tokenVersion` claim that logout/"sign out everywhere" increments. At minimum align token expiry with the 8h cookie `Max-Age` instead of UTC-day.
- **Status:** 🔧 Recommended

#### [S-03] Hand-rolled hex comparison in the Edge token path is not guaranteed constant-time — Low — A02
- **Location:** `lib/adminToken.ts:48-53` (`safeEqual`)
- **Issue:** Token verification on the Edge runtime uses a manual char-by-char XOR loop (it can't use `node:crypto.timingSafeEqual`). It early-returns on length mismatch and JS string indexing/charCodeAt timing is not formally constant-time.
- **Exploit/Impact:** A theoretical remote timing oracle on the HMAC/SHA digest. Practically very hard to exploit over a network against a 64-hex-char digest, but it is a known weakness pattern.
- **Fix:** Compare via Web Crypto by HMACing both sides with a random per-request key and comparing the results, or compare fixed-length byte arrays with a length-independent accumulator. Keep the existing `node:crypto.timingSafeEqual` usage in the Node login path (already correct at `login/route.ts:62`).
- **Status:** 🔧 Recommended

### A07 — Identification & Authentication Failures

#### [S-04] No admin account lockout / MFA; login rate-limit is per-IP only — High — A07/A04
- **Location:** `app/api/admin/login/route.ts:27-30` (`rateLimit("admin-login:"+ip, 5, 15m)`) · no lockout on `admin_users`
- **Issue:** Login throttling keys solely on client IP (`x-forwarded-for`). There is no per-account failure counter, no lockout/backoff, and no MFA. A distributed/botnet or rotating-proxy attacker bypasses the 5/15min IP cap. The in-memory limiter fallback (`lib/rateLimit.ts:30`) is per-instance, so without Upstash configured the effective limit multiplies across serverless instances.
- **Exploit/Impact:** Online password guessing against the shared `ADMIN_SECRET` (= the token signing key, see S-01) or against individual `admin_users` passwords, especially if Upstash creds are not set in production.
- **Fix:** Add a per-account failed-attempt counter with exponential backoff/temporary lockout (e.g. `admin_users.failed_attempts` + `locked_until`); require Upstash in production (fail closed or alert if absent); add TOTP MFA for the owner role. Consider CAPTCHA after N failures.
- **Status:** 🔧 Recommended

#### [S-05] User-enumeration timing/response oracle in the per-user login branch — Medium — A07
- **Location:** `app/api/admin/login/route.ts:44-50`
- **Issue:** The comment claims "Always run a verify to keep timing roughly constant," but the code is `const ok = user && user.active && (await verifyPassword(...))` — short-circuit evaluation means `verifyPassword` (a deliberately slow scrypt KDF) runs **only when the email matches an active user**. Unknown/inactive emails return materially faster, and the response body distinguishes per-user (`"Invalid email or password."`) from legacy (`"Invalid password."`).
- **Exploit/Impact:** An attacker can enumerate valid admin email addresses by measuring response latency, narrowing brute-force targets.
- **Fix:** Always perform a scrypt verification against a fixed dummy hash when the user is absent/inactive (compute on a constant decoy), then branch on the boolean. Keep error messages identical across branches.
- **Status:** 🔧 Recommended

#### [S-06] Customer-account auth has no app-layer rate limiting and depends on Supabase Auth defaults — Low — A07
- **Location:** `app/account/login/page.tsx:22` (`signInWithPassword`) · `app/account/reset-password/page.tsx:63` (`updateUser`) · `app/account/forgot-password`
- **Issue:** The customer auth flow runs entirely client-side against Supabase Auth (anon/publishable key). Brute-force protection, reset-token entropy/expiry, and email-enumeration hardening are delegated wholly to the Supabase GoTrue configuration — none of it is enforced or verifiable in this repo.
- **Exploit/Impact:** If the Supabase project's auth rate limits / email-enumeration protection are left at permissive defaults, customer accounts are guessable. Customer order/PII exposure is still gated by RLS (`profiles` own-row policy — good), so impact is account-takeover scoped, not mass data leak.
- **Fix:** In the Supabase dashboard, enable email-enumeration protection, set a short reset-token TTL, and confirm auth rate limits. Document these as required project settings in LAUNCH/README.
- **Status:** 🔧 Recommended

### A01 — Broken Access Control

#### [S-07] Admin pages render with no server-side session check — rely solely on `proxy.ts` — Medium — A01
- **Location:** `app/admin/(dashboard)/layout.tsx:3-10` (no auth) · `app/admin/(dashboard)/**/page.tsx` (client components) · enforcement lives only in `proxy.ts:40-42`
- **Issue:** The dashboard layout and pages perform no `getAdminSession()`/`requireAdmin` check server-side; the **only** gate for admin *pages* is the proxy matcher. If the matcher is mis-edited, a future `proxy.ts` regression occurs, or a path normalization quirk slips a route past the matcher, page shells render to anonymous users.
- **Exploit/Impact:** Limited today because every `/api/admin/*` data route independently calls `requireAdmin`/`requireRole`, so the rendered shell has no data. But it is a single-point-of-failure design and removes defense-in-depth.
- **Fix:** Add a server-side guard in `app/admin/(dashboard)/layout.tsx` (await `getAdminSession()`; `redirect("/admin/login")` if null). This is cheap and makes page protection independent of the proxy.
- **Status:** 🔧 Recommended

#### [S-08] Proxy is the sole edge gate and trusts the cookie token without the live `admin_users` freshness check — Medium — A01
- **Location:** `proxy.ts:24-37`
- **Issue:** The Edge proxy validates only the token signature/day (`verifyToken`). The "is this account still active / what is its current role" check lives in `activeIdentity()` (`lib/adminAuth.ts:66-89`), which runs in Node route handlers, **not** at the edge. So a disabled/role-changed per-user admin still passes the proxy for *page* navigation until token expiry; only the API data layer re-checks. Also, the matcher (`/admin/:path*`, `/api/admin/:path*`) intentionally excludes `/api/cron/*` — those self-guard with `CRON_SECRET`, which is correct, but it means the proxy is not the universal gate it appears to be.
- **Exploit/Impact:** A revoked admin retains the admin UI shell (no data) until midnight; combined with S-07 this widens the window. Cron exposure is acceptable (self-guarded) but should be explicitly understood.
- **Fix:** Pair with S-07 (server-side layout guard that calls `activeIdentity`), so disabled accounts lose page access immediately. Document why cron routes are matcher-excluded.
- **Status:** 🔧 Recommended

#### [S-09] `[id]` admin routes are object-scoped and authz-checked — no IDOR found (positive) — Informational — A01
- **Location:** all `app/api/admin/**/[id]/route.ts` (orders, products, staff, promos, reviews, sample-requests, contact-messages)
- **Issue:** Every dynamic route calls `requireAdmin`/`requireRole` first, then scopes the query with `.eq("id", id)` via the service-role client. The store is single-tenant (all objects belong to A.K. Auto Care), so there is no cross-user object to traverse to. `staff/[id]` additionally blocks self-demotion/self-delete (`staff/[id]/route.ts:30,74`) and refunds require owner/manager (`orders/[id]/route.ts:55-57`). See the matrix below.
- **Fix:** None required. (Hardening: the public `order-tracking` route correctly requires `email`+`orderId` match, so it is not an IDOR either — `order-tracking/route.ts:36-37`.)
- **Status:** ✅ Verified safe

### A03 — Injection

#### [S-10] PostgREST `.or()` search filters are sanitized — injection mitigated (positive) — Low — A03
- **Location:** `lib/utils.ts:23-28` (`sanitizeSearchTerm`) used by `orders/route.ts:33`, `orders/export/route.ts:25`, `customers/route.ts:76`, `sample-requests/route.ts:24`, `contact-messages/route.ts:24`; `lib/products.ts:191` escapes inline.
- **Issue:** User search input is interpolated into PostgREST `.or("col.ilike.%term%,...")` strings, which PostgREST parses — a classic filter-injection sink. All call sites strip the structural delimiters `,():"\\` and escape `%`/`_` before interpolation.
- **Exploit/Impact:** Residual: the `.` character is intentionally preserved (for email search). On its own `.` cannot terminate the `col.ilike.%...%` token or introduce a new condition (that needs `,` or `:`/`(`), so practical injection is blocked. Admin-only surface regardless.
- **Fix:** None required; consider switching to the PostgREST builder's parameterized `.ilike()` per-column with explicit `or` array if/when the client supports it, to remove string building entirely.
- **Status:** ✅ Verified mitigated

#### [S-11] No SQL/ORM injection in data queries; SQL stored in repo uses parameterized RPC — Informational — A03
- **Location:** `app/api/orders/route.ts:161,169` (`.rpc("increment_promo_uses", {...})`, `.rpc("reserve_stock", {...})`)
- **Issue:** All Supabase queries use the builder with bound values; RPC args are passed as objects, not string-concatenated SQL.
- **Status:** ✅ Verified safe

### A05 — Security Misconfiguration

#### [S-12] CSP relies on `script-src 'unsafe-inline'` (no nonce/hash) — Medium — A05
- **Location:** `next.config.ts:21` (`script-src 'self' 'unsafe-inline' ...`), `style-src 'unsafe-inline'` (line 22); inline GA init at `app/layout.tsx:124-126`
- **Issue:** `'unsafe-inline'` in `script-src` defeats CSP's core XSS-mitigation value — any injected inline `<script>` would execute. The config documents a deliberate trade-off (nonces force dynamic rendering and break SSG/ISR; inline `style={{}}` attributes can't be nonce-covered). That reasoning is sound for `style-src`, but `script-src` could be tightened without losing SSG by moving to **hash-based** allow-listing of the one inline GA bootstrap.
- **Exploit/Impact:** Currently low residual because no stored/reflected XSS sink was found (reviews are React-escaped, blog is hardcoded). But it removes the safety net if an XSS is introduced later.
- **Fix (recommend, do not auto-change CSP):** Replace inline `script-src 'unsafe-inline'` with `'sha256-...'` hashes for the static GA init snippet (the snippet is fixed, so a hash is stable and SSG-compatible), keeping `style-src 'unsafe-inline'` as-is. Add Meta Pixel's inline init to the hash set or externalize it. Re-test GA/Pixel after the change.
- **Status:** 🔧 Recommended

#### [S-13] Missing cross-origin isolation headers (COOP/COEP/CORP) and partial Permissions-Policy — Medium — A05
- **Location:** `next.config.ts:32-44` (security headers list)
- **Issue:** No `Cross-Origin-Opener-Policy`, `Cross-Origin-Embedder-Policy`, or `Cross-Origin-Resource-Policy`. `Permissions-Policy` only disables `camera/microphone/geolocation`, leaving many powerful features (e.g. `payment`, `usb`, `interest-cohort`, `browsing-topics`, `accelerometer`) unset.
- **Exploit/Impact:** Weaker isolation against cross-origin window references / Spectre-class side-channels and a broader-than-necessary feature surface. Low practical risk for this storefront but standard hardening.
- **Fix (recommend — high blast radius if auto-applied):** Add `Cross-Origin-Opener-Policy: same-origin` (verify no OAuth/WhatsApp popups depend on opener), `Cross-Origin-Resource-Policy: same-origin`, and extend Permissions-Policy with `payment=(), usb=(), browsing-topics=()` etc. Do **not** add COEP blindly — it can block the cross-origin GA/Pixel/Supabase image loads unless those responses send CORP; test before enabling. The truly inert `X-Permitted-Cross-Domain-Policies: none` was auto-added (S-00 below).
- **Status:** 🔧 Recommended (COOP/COEP/CORP) · ✅ Auto-fixed (`X-Permitted-Cross-Domain-Policies` only)

#### [S-14] Non-constant-time `CRON_SECRET` comparison — Low — A05/A02
- **Location:** `app/api/cron/low-stock/route.ts:9` and `app/api/cron/abandoned-cart/route.ts:18` (`authHeader !== \`Bearer ${cronSecret}\``)
- **Issue:** The cron bearer token is compared with `!==` (short-circuits on first differing byte) rather than a constant-time comparison.
- **Exploit/Impact:** Theoretical timing oracle on a high-entropy secret over the network — very low feasibility. The routes are otherwise correctly gated (return 401 if header mismatches; also 401 if `CRON_SECRET` unset).
- **Fix:** Compare with `crypto.timingSafeEqual` over equal-length buffers (guard length first). Reuse the same helper across both cron routes.
- **Status:** 🔧 Recommended

### A03/A05 — Stored XSS surface

#### [S-15] Admin email-template preview uses `dangerouslySetInnerHTML` on admin-authored body — Low — A03
- **Location:** `app/admin/(dashboard)/email-templates/page.tsx:219-224`
- **Issue:** The live preview injects `interpolate(draft.body, status)` as raw HTML. The body is admin-authored (owner/manager via `email-templates/route.ts:46`) and rendered in the admin's own browser; the same content is sent as outbound email HTML by design.
- **Exploit/Impact:** Self-XSS only (an admin pasting a malicious `<script>` into their own template preview). Not reachable by untrusted users. Note customer-facing UGC (reviews) is rendered safely as React text at `components/product/ReviewsSection.tsx:600,613` — no stored XSS there. JSON-LD `dangerouslySetInnerHTML` uses (`layout.tsx:107`, `blog/[slug]/page.tsx:74`, `products/[slug]/page.tsx:141`, etc.) serialize controlled objects — low risk.
- **Fix:** Render the preview through the existing safe `Markdown` component or sanitize with a allow-list before injection; restrict template editing to owner only.
- **Status:** 🔧 Recommended

### A10 — SSRF

#### [S-16] Upload route is not SSRF-prone; type/size/path checks are sound — Informational — A10
- **Location:** `app/api/admin/upload/route.ts:25-88`
- **Issue:** Upload accepts a multipart `File` only (no server-side fetch of a user URL → no SSRF), enforces a MIME allow-list (`ALLOWED`), 5MB cap, non-empty check, and stores under a server-generated `crypto.randomUUID()` filename (no path traversal). Auth (`requireAdmin`) + CSRF applied. `images.remotePatterns` (`next.config.ts:52-56`) is restricted to Unsplash/Wikimedia/`*.supabase.co` — no `fetch()` of arbitrary user-supplied URLs anywhere in `app/api/**`.
- **Exploit/Impact:** Residual nits: content is trusted by declared `file.type` only (no magic-byte sniffing), and the bucket is **public** so any uploaded image is world-readable by design. An authenticated admin could upload a polyglot, but served from a separate Supabase Storage origin with `X-Content-Type-Options: nosniff` site-wide.
- **Fix (optional): ** validate magic bytes match the declared MIME; consider stripping image metadata.
- **Status:** ✅ Verified low-risk

### A09 — Logging & Monitoring

#### [S-17] Audit log covers admin mutations but misses reads/failed logins; logs may capture IPs — Low — A09
- **Location:** `lib/audit.ts:15-30` · callers in staff/orders/products/email-template routes · failed login at `login/route.ts:48` (no audit)
- **Issue:** `logAudit` records create/update/delete/login *successes* with actor identity (good — no secrets/passwords are logged; `meta` records role/active/passwordReset booleans, not values). Gaps: **failed** logins are not audited (no detection of brute force), sensitive **reads** (PII exports — `newsletter/export`, `orders/export`, `customers`) are not logged, and `console.error` paths log full error objects which could include identifiers.
- **Exploit/Impact:** Reduced incident-response/forensics ability; cannot detect credential-stuffing from the audit trail.
- **Fix:** Audit failed logins (action `login.failed` with IP + attempted email hash), and PII bulk exports. Ensure error logging avoids dumping request bodies / PII.
- **Status:** 🔧 Recommended

### A04 — Insecure Design

#### [S-18] `cart/save` accepts client-chosen `sessionId` and unvalidated `email` (service-role write) — Low — A04
- **Location:** `app/api/cart/save/route.ts:26-49`
- **Issue:** Public endpoint upserts `abandoned_carts` keyed on a client-supplied `sessionId` (only `typeof === "string"`, no format/length bound) and stores `email` with only a `typeof` check (not Zod/email-validated). Service-role client bypasses RLS.
- **Exploit/Impact:** An attacker who guesses/learns another visitor's `sessionId` can overwrite that cart; and can seed an arbitrary `email` so the abandoned-cart cron later emails a victim a recovery link (low-impact spam/abuse). The recovery token itself is HMAC-signed (`cart/recover/route.ts:18-30`, constant-time) so cart data isn't directly exposed.
- **Fix:** Validate `email` with the same Zod email schema; bound `sessionId` length/charset; prefer a server-issued, unguessable session id (httpOnly cookie) over a client-provided one.
- **Status:** 🔧 Recommended

### Secret management & data leaks

#### [S-19] `.env.example` and `.gitignore` hygiene — clean (positive) — Informational
- **Location:** `.env.example` (all placeholders) · `.gitignore:37-38` (`.env*` ignored, `!.env.example` allowed)
- **Issue:** `.env.example` ships only placeholders (`change-me-...`, `your-service-role-key`, `re_xxxxxxxx`, `G-XXXXXXXXXX`) — **no real secret values committed**. `.gitignore` correctly ignores all `.env*` except the example. CI uses `placeholder-service-key` (`.github/workflows/ci.yml:44`). Service-role key referenced only server-side (`utils/supabase/admin.ts:8`); never via `NEXT_PUBLIC_*`.
- **Note:** `.env.example:13` documents that `ADMIN_SECRET` is both password and session secret — see S-01.
- **Fix:** None. Keep enforcing strong values in deployment (the example placeholders must never be used in prod).
- **Status:** ✅ Verified clean

## Access-control matrix (admin/[id] routes)
| Route | Authz check beyond proxy? | Object-scoped (IDOR-safe)? | Verdict |
|---|---|---|---|
| `orders/[id]` GET/PATCH | `requireAdmin`; refund→`requireRole(owner,manager)` | `.eq("id", id)`; single-tenant | ✅ Safe |
| `products/[id]` GET/PATCH/DELETE | `requireAdmin`; DELETE→`requireRole(owner,manager)` + CSRF | `.eq("id", id)` / `.eq("product_id", id)` | ✅ Safe |
| `staff/[id]` PATCH/DELETE | `requireRole(["owner"])` + CSRF; blocks self-demote/delete | `.eq("id", id)` | ✅ Safe |
| `promos/[id]` PATCH/DELETE | `requireAdmin`; DELETE→`requireRole(owner,manager)` + CSRF | `.eq("id", id)` | ✅ Safe |
| `reviews/[id]` PATCH/DELETE | `requireAdmin` + CSRF | `.eq("id", id)` | ✅ Safe |
| `sample-requests/[id]` PATCH/DELETE | `requireAdmin` + CSRF | `.eq("id", id)` | ✅ Safe |
| `contact-messages/[id]` PATCH/DELETE | `requireAdmin` + CSRF | `.eq("id", id)` | ✅ Safe |
| (public) `order-tracking` POST | rate-limit + CSRF; requires email+id match | `.ilike(email)`+`.eq(id)` both required | ✅ Not IDOR |

All admin `[id]` routes enforce authorization independently of `proxy.ts` and scope by primary key on a single-tenant dataset, so there is no cross-account object to enumerate. CSRF (`checkCsrf`) is applied on every mutating method observed.

## Cross-domain recommendations
- **Secret architecture (owner: auth/infra):** Separate the login secret from the token-signing key (S-01); make per-user `admin_users` accounts the only login path and retire the shared `ADMIN_SECRET` login; require ≥32-byte random secrets and document rotation procedure. Coordinate with the deployment/runbook (LAUNCH) owner.
- **Session lifecycle (owner: auth):** Introduce revocable sessions / a `tokenVersion` claim so logout and "disable account" take effect immediately at the edge (S-02, S-08), and add a server-side guard in the admin dashboard layout (S-07).
- **Anti-automation (owner: auth + infra):** Make Upstash rate-limiting mandatory in production and add per-account lockout + MFA for admin (S-04); enable Supabase Auth email-enumeration protection and reset-token TTLs for customer accounts (S-06).
- **Headers/CSP (owner: frontend/platform — high blast radius, test first):** Migrate the inline GA/Pixel bootstrap to hash-based `script-src` to drop `'unsafe-inline'` for scripts without losing SSG (S-12); add COOP/CORP and broaden Permissions-Policy after verifying GA/Pixel/Supabase still load (S-13).
- **Monitoring (owner: backend/ops):** Audit failed logins and PII exports; wire an alert on repeated `login.failed` (S-17). Sanitize error logging to avoid PII.
- **Input hardening (owner: backend):** Zod-validate `cart/save` email and bound `sessionId`; prefer server-issued session ids (S-18). Magic-byte-validate uploads (S-16).

_Redaction note: no real secret values were found committed; example placeholders were not reproduced verbatim where they resembled tokens. WebFetch of the Next.js 16 docs returned HTTP 403 and `node_modules/next/dist/docs/` is not present (dependencies not installed per ground rules), so Next 16-specific claims here are grounded in the actual repository code (`proxy.ts` is the sole, correctly-named edge boundary; no stale `middleware.ts` exists; `headers()` and `cookies()` usages were read directly) rather than re-asserted from documentation._
