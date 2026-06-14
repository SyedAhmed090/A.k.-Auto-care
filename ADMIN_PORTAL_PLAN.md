# A.K. Auto Care — Admin Portal Build Plan

A specification for the 14 missing backend capabilities, written so a developer can pick up
each item and build it. Each item lists: **Goal**, **Why it matters**, **What to build**
(database / API / admin UI / storefront), **Effort**, and **Dependencies**.

**Stack context (already in the repo):** Next.js (modified — read `node_modules/next/dist/docs/`
before using framework APIs), TypeScript, Supabase (Postgres + Auth + Storage available),
Tailwind + CSS design tokens, Resend for email. Admin auth is currently a single shared
`ADMIN_SECRET` with a SHA-256 daily-token cookie (`lib/adminAuth.ts`, `middleware.ts`).
Existing admin API routes live under `app/api/admin/**`. Business config is hardcoded in
`lib/constants.ts` and `lib/commerce.ts`.

**Effort key:** S = ½–1 day · M = 1–3 days · L = ~1 week+ (single developer).

---

## PHASE 1 — Surface data you already collect (highest ROI, lowest effort)

### 1. Newsletter subscribers view
- **Goal:** A screen to view, search, and export everyone who subscribed.
- **Why:** Signups already write to the `newsletter_subscribers` table (`email`, `source`,
  `created_at`). Right now there is no way to see or use this list — it's a marketing asset
  sitting idle.
- **Build:**
  - **Database:** none needed (table exists). Optional: add `unsubscribed_at timestamptz null`
    so you can honor unsubscribes without deleting the row.
  - **API:** `GET /api/admin/newsletter` — paginated list + search by email, sortable by date.
    `GET /api/admin/newsletter/export` — CSV download (email, source, signup date).
    Optional `DELETE /api/admin/newsletter/[id]`.
  - **Admin UI:** new nav item "Newsletter". Table (email, source, date), search box,
    total count, "Export CSV" button. Mirror the existing Customers page layout.
  - **Storefront:** none.
- **Effort:** S
- **Dependencies:** none.

### 2. Abandoned carts view
- **Goal:** See abandoned carts and whether recovery is working.
- **Why:** `abandoned_carts` is populated (`session_id`, `email`, `cart_data` JSONB,
  `email_sent_at`, `recovered_at`) and a cron job already sends recovery emails
  (`/api/cron/abandoned-cart`). You're running a recovery campaign with zero visibility into
  it — no idea how many carts abandon, how many emails sent, or how much revenue you recovered.
- **Build:**
  - **Database:** none (table exists). Make sure `cart_data` stores enough to show line items
    and a cart value.
  - **API:** `GET /api/admin/abandoned-carts` — list with email, item count, cart value
    (sum from `cart_data`), created date, "email sent?" and "recovered?" flags; filter by
    recovered/not. Add a small summary endpoint or compute in the same call: total abandoned,
    emails sent, recovered count, recovered value.
  - **Admin UI:** new nav item "Abandoned Carts". Summary stat strip at top
    (abandoned / emailed / recovered / recovered Rs), then a table. Row expands to show the
    cart contents.
  - **Storefront:** none.
- **Effort:** M
- **Dependencies:** none.

### 3. Contact-form message inbox
- **Goal:** A stored, reviewable log of contact submissions with a handled/unhandled state.
- **Why:** Today `/api/contact` **emails the message and stores nothing**. If the email is
  missed, the inquiry is lost forever. No archive, no follow-up tracking.
- **Build:**
  - **Database:** new table `contact_messages` (`id`, `name`, `email`, `subject`, `message`,
    `status` enum `new|read|handled` default `new`, `created_at`). RLS: service-role only.
  - **API:** modify `/api/contact` to INSERT into the table **in addition to** sending the
    email (keep the email). `GET /api/admin/contact-messages` (list + filter by status),
    `PATCH /api/admin/contact-messages/[id]` (set status).
  - **Admin UI:** new nav item "Messages" with an unread badge count. List (name, subject,
    date, status), click to read full message, "Mark handled" + "Reply" (mailto/WhatsApp link).
  - **Storefront:** none (contact form unchanged for the user).
- **Effort:** M
- **Dependencies:** none.

---

## PHASE 2 — Remove the developer dependency

### 5. Settings page (the big one)
- **Goal:** Edit business-critical configuration without a code change + redeploy.
- **Why:** Config splits two ways today, and **both require a redeploy to change**:
  - *Truly hardcoded constants* — GST % and shipping rates/thresholds live as literals in
    `lib/commerce.ts`.
  - *Env-var-backed* — WhatsApp number, JazzCash/EasyPaisa details, and social URLs read from
    `process.env.* ?? <fallback>` in `lib/constants.ts`. Editable via env, but still a redeploy.
  Either way there's no in-app way to change them, so a DB-backed Settings page is the right
  call. This is the single biggest day-to-day limitation, especially for pricing/shipping.
- **Build:**
  - **Database:** new `settings` table as key/value JSON (`key text primary key,
    value jsonb, updated_at`). Seed it with the current hardcoded values so nothing changes
    on launch. Groups: `shipping`, `tax`, `payment`, `store`, `social`.
  - **API:** `GET /api/admin/settings`, `PATCH /api/admin/settings` (validate each group).
    Add a cached server-side `getSettings()` helper that reads the table (with a short cache)
    and **refactor `lib/commerce.ts` / `lib/constants.ts` to read from it** with the current
    constants as fallback defaults.
  - **Admin UI:** new nav item "Settings" with tabbed sections:
    - *Shipping* — domestic/international rates, express rates, free-shipping threshold, ETAs.
    - *Tax* — GST rate + inclusive/exclusive toggle.
    - *Payments* — JazzCash / EasyPaisa / bank account fields.
    - *Store* — name, email, address, hours, WhatsApp number, map query.
    - *Social* — Instagram/Facebook/TikTok/YouTube URLs.
  - **Storefront:** reads the same settings (checkout shipping calc, footer, contact page).
    Test checkout math carefully after the refactor.
- **Effort:** L
- **Dependencies:** touches checkout pricing — regression-test cart/checkout totals.
- **Risk note:** highest-blast-radius item here because it rewires pricing. Do it carefully,
  keep constants as fallbacks, and verify totals before/after.

### 7. Product image upload
- **Goal:** Upload images in the product form instead of pasting URLs.
- **Why:** Images are **URL-only** today — you must host elsewhere and paste links. Standard
  expectation is drag-and-drop upload.
- **Build:**
  - **Storage:** Supabase Storage bucket (e.g. `product-images`), public read. (Supabase is
    already in the stack, so this is the natural choice — no new vendor.)
  - **API:** `POST /api/admin/upload` — accepts a file, uploads to the bucket, returns the
    public URL. Validate type/size; generate a unique path.
  - **Admin UI:** in `app/admin/(dashboard)/products/ProductForm.tsx`, replace/augment the "Images (URLs)" section with a
    file picker + drag-drop that uploads and shows thumbnails; keep the URL field as a fallback.
    Allow reordering and delete.
  - **Storefront:** none (still renders image URLs).
- **Effort:** M
- **Dependencies:** Supabase Storage bucket + policy setup.

### 6. Bulk product tools
- **Goal:** Act on many products at once.
- **Why:** Products are edited one at a time. No bulk price change, bulk feature/unfeature, or
  bulk category move — painful when prices shift across a range.
- **Build:**
  - **API:** `PATCH /api/admin/products/bulk` — accept an array of IDs + an operation
    (set featured, set category, adjust price by % or fixed, set in-stock).
  - **Admin UI:** add row checkboxes + a bulk-action bar to the Products page (reuse the
    pattern already built for Orders bulk actions). Confirm before applying.
  - **Storefront:** none.
- **Effort:** M
- **Dependencies:** none (pattern already exists on Orders).

---

## PHASE 3 — Reporting an owner actually runs the business on

### 9. Richer dashboard
- **Goal:** Decision-grade metrics, not just 4 counters.
- **Why:** Dashboard shows total orders, revenue, pending, today + a 30-day revenue line.
  Missing what you'd actually act on.
- **Build:**
  - **API:** extend `/api/admin/stats` (or add `/api/admin/analytics`) to compute:
    best-selling products (by qty and by revenue, from `orders.items` JSONB), average order
    value, repeat-customer rate, revenue this month vs last, revenue by category, and
    new-vs-returning split.
  - **Admin UI:** add cards/sections to the dashboard: "Top products", "AOV", "This month vs
    last", "Revenue by category" (small bar list). Reuse the existing chart component style.
  - **Storefront:** none.
- **Effort:** M
- **Dependencies:** none. (Aggregating `items` JSONB across orders is the main work; consider
  a Postgres view for performance once order volume grows.)

### 11. Customer LTV & segments
- **Goal:** Understand customer value beyond a spend column.
- **Why:** You can sort by top spenders, but there's no LTV, no repeat-vs-new, no "at-risk"
  view.
- **Build:**
  - **Database:** extend the `customer_summary` view (or add a new view) with
    first_order_at, average_order_value, days_since_last_order.
  - **API:** add segment filters to `/api/admin/customers` (VIP = top spenders, repeat =
    order_count > 1, at-risk = no order in N days, new = single recent order).
  - **Admin UI:** segment filter chips on the Customers page; show LTV/AOV in the customer
    drawer.
  - **Storefront:** none.
- **Effort:** M
- **Dependencies:** builds on the existing Customers page + view.

### 10. Sales / financial export
- **Goal:** Summary exports for accounting, not just per-order rows.
- **Why:** There's an orders CSV, but no sales summary or tax (GST) report by period.
- **Build:**
  - **API:** `GET /api/admin/reports/sales?from=&to=` — returns totals: gross sales, discounts,
    shipping collected, GST portion, net, order count; downloadable CSV. Group by day/month.
  - **Admin UI:** a "Reports" section (could live under Dashboard or Settings) with a date-range
    picker and "Download" — or just wire the export button.
  - **Storefront:** none.
- **Effort:** S–M
- **Dependencies:** GST rate from Settings (#5) if you want it accurate post-refactor.

### 8. Low-stock alerting
- **Goal:** Get told when stock runs low instead of going to look.
- **Why:** Inventory shows OK/Low/Out but never **notifies** you.
- **Build:**
  - **Database:** optional `low_stock_threshold` per product (default e.g. 5); store in
    Settings or on the product.
  - **API/Job:** a daily cron (pattern exists: `/api/cron/abandoned-cart`) that finds products
    at/under threshold and emails you a digest via Resend. Optionally a dashboard widget
    "Low stock (N)".
  - **Admin UI:** a "Low stock" badge/widget on the dashboard linking to a filtered inventory
    view.
  - **Storefront:** none.
- **Effort:** S–M
- **Dependencies:** Resend (already configured); cron scheduling (Vercel cron already in use).

---

## PHASE 4 — Surface the rest of the captured data

### 4. Customer profiles in admin
- **Goal:** See a customer's saved profile, not just order-derived info.
- **Why:** Registered customers save `full_name`, `phone`, `address`, `city`, `province`,
  `postcode` to the `profiles` table, but admin only sees the order-based `customer_summary`.
  The "Customers" page is really "people who ordered".
- **Build:**
  - **Database:** none (`profiles` exists; has RLS — admin must read via service role).
  - **API:** extend `/api/admin/customers` (or the drawer's fetch) to join/lookup the
    `profiles` row by email/auth id and return saved address details.
  - **Admin UI:** show saved profile (phone, full address, province) in the customer drawer;
    distinguish "registered account" vs "guest" customers.
  - **Storefront:** none.
- **Effort:** S–M
- **Dependencies:** confirm how `profiles.id` (auth user) maps to order email.

### 14. Order `notes` field — ✅ ALREADY SHIPPED (no work)
- **Status:** Done. The notes field is fully rendered and editable on the order detail screen
  (`app/admin/(dashboard)/orders/[id]/OrderActions.tsx:61`). Verified against the code — nothing
  to build. Kept here only so the 14-item list stays complete.
- **Effort:** none.

### 13. Email template management
- **Goal:** Edit and test-send transactional emails from admin.
- **Why:** Order-status and recovery email wording lives in code; you can't tweak copy or
  send a test without a developer.
- **Build:**
  - **Database:** `email_templates` table (`key`, `subject`, `body_html`, `updated_at`) seeded
    from current templates; supports a few variables ({{name}}, {{order_id}}, {{status}}).
  - **API:** `GET/PATCH /api/admin/email-templates`, `POST /api/admin/email-templates/test`
    (send to a given address). Refactor the send helpers to read templates from the table.
  - **Admin UI:** a "Email Templates" section: pick a template, edit subject/body, send test.
  - **Storefront:** none.
- **Effort:** L
- **Dependencies:** touches the transactional send path — test order-status + recovery emails
  after refactor.

---

## PHASE 5 — Governance (do before you hire help)

### 12. Staff logins, roles, permissions & audit log
- **Goal:** Individual admin accounts with roles, and a record of who changed what.
- **Why:** The entire admin is one shared `ADMIN_SECRET`. No individual logins, no roles
  (everyone can delete products and refund orders), and no audit trail. A real risk once
  more than one person has access.
- **Build:**
  - **Database:** `admin_users` (`id`, `email`, `password_hash`, `role` enum
    `owner|manager|staff`, `active`, `created_at`); `audit_log` (`id`, `admin_user_id`,
    `action`, `entity`, `entity_id`, `meta` jsonb, `created_at`).
  - **Auth:** replace the single-secret flow in `lib/adminAuth.ts` + `middleware.ts` with
    per-user login (hash + verify, keep the httpOnly session cookie pattern). Add a role check
    helper used by sensitive API routes (delete/refund/settings = owner/manager only).
  - **API:** admin-user CRUD (owner only); write an `audit_log` row on every create/update/
    delete/status-change across existing admin routes; `GET /api/admin/audit-log`.
  - **Admin UI:** "Staff" page (invite/disable users, set roles) and an "Activity log" view.
  - **Storefront:** none.
- **Effort:** L
- **Dependencies:** **touches authentication for the whole admin** — highest-risk change here.
  Do it as its own focused effort with careful testing; don't bundle with other work.

---

## Suggested build order (by ROI)

| Order | Item(s) | Phase | Effort | Notes |
|------:|---------|-------|:------:|-------|
| 1 | #1 Newsletter, #3 Contact inbox, #2 Abandoned carts | 1 | S–M | Data already collected; fast wins |
| 2 | #5 Settings page | 2 | L | Removes developer dependency; test pricing |
| 3 | #7 Image upload, #6 Bulk product tools | 2 | M | Daily-friction removers |
| 4 | #9 Dashboard, #10 Sales export, #8 Low-stock alerts | 3 | S–M | Reporting |
| 5 | #4 Profiles, #11 LTV/segments | 3–4 | S–M | Finish surfacing data (#14 already shipped) |
| 6 | #13 Email templates | 4 | L | Refactors send path |
| 7 | #12 Staff/roles/audit log | 5 | L | Do before adding staff; isolate it |

## Cross-cutting notes for whoever builds this
- **New nav items** (Newsletter, Messages, Abandoned Carts, Settings, Staff, Activity) go in
  `app/admin/AdminNav.tsx` — the responsive sidebar already supports more items.
- **Reuse existing patterns:** the Orders page already has pagination, search, CSV export,
  bulk actions, and a confirm-dialog (`app/admin/ConfirmDialog.tsx`) — copy these rather than
  reinventing.
- **Modified Next.js:** read `node_modules/next/dist/docs/` before using any framework API.
- **Two items rewire shared paths** — #5 (pricing) and #12 (auth) — keep them isolated and
  regression-test. #13 touches the email send path.
- **Supabase Storage** (for #7) and **Vercel cron** (for #8) are already available in the stack.
