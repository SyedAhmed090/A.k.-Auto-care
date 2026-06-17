# Data Layer Audit — A.K. Auto Care
Date: 2026-06-17 · Scope: supabase migrations (001–020), types/supabase.ts, types/order.ts, data libs, stores, static catalog

## Summary

The data layer is structurally sound for a small-volume e-commerce store: all tables with PII or financial data have RLS enabled, money is stored as `NUMERIC(12,2)` (never float), server-side price recomputation prevents cart-price spoofing, and the key product/order indexes were added in migration 016. Three issues require immediate attention. First, migrations `017_bpo_product.sql` and `017_real_catalog.sql` share the same numeric prefix; alphabetical resolution causes `017_real_catalog.sql`'s unconditional `DELETE FROM products` to wipe the BPO product added three lines earlier, and the cascade silently drops its variant row too. Second, a TOCTOU (time-of-check/time-of-use) race condition in promo-code redemption allows two concurrent checkout requests to both pass the `max_uses` guard before either increments the counter. Third, `types/order.ts` declares a `province` field that has no corresponding column in the `orders` table, and omits `updated_at` which does exist — a phantom field / missing field pair that will produce silent runtime errors. Five high-severity issues cover the analytics route fetching every order row with no pagination, the `stats` revenue query doing the same, missing `NOT NULL` tightening for financial columns, missing composite indexes, and the dual source of truth between `lib/promos.ts` and the `promo_codes` DB table.

---

## Schema overview

| Table | RLS? | Key indexes | Notable issues |
|---|---|---|---|
| `orders` | YES (block anon) | `created_at DESC`, `status`, `lower(email)` | No `updated_at` auto-trigger; `status`/`discount`/`created_at` are `NOT NULL` in SQL but typed nullable in `supabase.ts`; `province` accepted by API schema but not stored |
| `promo_codes` | YES (block anon) | UNIQUE on `code` | TOCTOU race on max_uses; no DB CHECK `uses <= max_uses` |
| `product_stock` | YES (block anon) | PK on `product_id` | `reserve_stock` is atomic (ON CONFLICT DO UPDATE); no FK to `products` table |
| `products` | YES (public read) | `category_slug`, `featured`, `sort_order`; implicit on `slug` (UNIQUE), `id` (PK) | No full-text / GIN search index; `price=0` seed data in `017_real_catalog` needs real values |
| `product_variants` | YES (public read) | `product_id` | UNIQUE on `sku` |
| `reviews` | YES (public read approved; service_role write) | `product_id`, `approved` | Separate composite index `(product_id, approved)` would be more efficient than two separate ones |
| `abandoned_carts` | YES (service_role only) | `email`, `(email_sent_at, recovered_at, created_at)` | No TTL/cleanup policy for old carts |
| `newsletter_subscribers` | YES (block anon) | UNIQUE on `email` | `created_at` is nullable in type but should not be |
| `profiles` | YES (per-user RLS) | PK (FK to auth.users) | `Relationships: []` in supabase.ts (missing FK declaration) |
| `contact_messages` | YES (service_role only) | `status`, `created_at DESC` | Good |
| `settings` | YES (service_role only) | PK on `key` | Good |
| `email_templates` | YES (service_role only) | PK on `key` | Good |
| `admin_users` | YES (service_role only) | `lower(email)` UNIQUE | Good |
| `audit_log` | YES (service_role only) | `created_at DESC` | No index on `(entity, entity_id)` for entity lookups |
| `sample_requests` | YES (service_role only) | `status`, `created_at DESC`, `product_id` | Good |

---

## Severity tally

| Critical | High | Medium | Low |
|---|---|---|---|
| 2 | 5 | 5 | 3 |

---

## Files modified (auto-fixes applied)

> **⚠️ Orchestrator validation note (added during compile):** **None applied.** This agent's session was interrupted (session limit) before its type edits persisted to disk; `git status` confirms neither `types/order.ts` nor `types/supabase.ts` was modified. The two changes originally marked "Auto-fixed" (D-03, D-04) have been **reclassified to Recommended** and were intentionally left unapplied because they are not unambiguously safe: `province` flows through the live order/checkout input (`app/api/orders/route.ts:25`, `app/checkout/page.tsx:162`), so removing it from `types/order.ts` could mask a real field; and `types/supabase.ts` is a **generated** file that should be regenerated via `supabase gen types`, not hand-edited. All other findings below are unaffected.

---

## Findings

### [D-01] Duplicate `017_*` prefix — `017_real_catalog.sql` wipes `017_bpo_product.sql` — Critical

- **Location:** `supabase/migrations/017_bpo_product.sql`, `supabase/migrations/017_real_catalog.sql`
- **Category:** MigrationHygiene | Integrity
- **Issue:** Both files share the numeric prefix `017_`. Supabase CLI resolves equal prefixes alphabetically: `017_bpo_product.sql` (b < r) executes first, inserting product `p15` (BPO Hardener) and its variant. `017_real_catalog.sql` then runs `DELETE FROM products;` (line 9) unconditionally, which cascades through `product_variants` (ON DELETE CASCADE from `006_products.sql:27`) and `reviews`, wiping `p15` and its variant before re-seeding six different products. On a fresh database the BPO product does not exist after both migrations run. Worse, the `delete from products;` is not wrapped in an idempotency guard — it will silently purge all products every time the migration is re-applied.
- **Impact:** BPO product `p15` is permanently absent from a freshly provisioned database. Any blog post referencing `[[product:BPO-STD]]` will silently resolve to nothing. The `delete from products` also voids all historical reviews (cascade) on any environment where the migration is re-run.
- **Fix:** The `017_real_catalog.sql` migration should have been numbered `018+` (it was the catalog replacement after the demo seed). Since migrations are immutable history, **renumber them** in source control — the file on disk must be renamed to a number that places `real_catalog` _after_ `bpo_product`. Additionally, the `p15` BPO record should be re-added in a new migration that runs after `017_real_catalog.sql`, or the DELETE should target only the six demo-seed IDs rather than the full table.
- **Status:** 🔧 Recommended — migration files are immutable; requires a new numbered migration to re-insert p15.

---

### [D-02] TOCTOU race condition on promo-code `max_uses` — Critical

- **Location:** `supabase/migrations/003_stock_functions.sql:4–9`, `app/api/orders/route.ts:112–120`
- **Category:** Integrity
- **Issue:** The order API checks `uses < max_uses` (line 114–115 of orders route), then — only _after_ a successful order insert — calls `increment_promo_uses(promo_id)` (line 161). Under concurrent load, two requests can both read `uses = N`, both pass the `N < max_uses` check, both insert orders, and both increment, ending at `uses = N+2` — exceeding `max_uses` by one. The `increment_promo_uses` function itself (`003_stock_functions.sql:4–9`) is a plain `UPDATE … SET uses = uses + 1` with no guard. There is no `CHECK (uses <= max_uses)` constraint on `promo_codes` and no `SELECT … FOR UPDATE` row lock.
- **Impact:** A limited-use promo (e.g., first-50-customers) can be redeemed more times than allowed. At high concurrency it could be abused intentionally (race two browser tabs).
- **Fix:** Replace the two-step check-then-update with a single atomic `UPDATE … WHERE uses < max_uses RETURNING id`. If the row is not returned, the code is exhausted. See proposed migration `021_atomic_promo_check.sql` below.
- **Status:** 🔧 Recommended

---

### [D-03] `types/order.ts` phantom `province` field + missing `updated_at` — High

- **Location:** `types/order.ts:18`, `types/order.ts` (missing `updated_at`)
- **Category:** TypeDrift
- **Issue:** The `Order` interface declares `province: string` (line 18), but the `orders` table has no `province` column — the field exists only on `profiles`. Any code that reads `order.province` will silently get `undefined` at runtime. Conversely, `updated_at` exists in the DB (`001_orders.sql:7`, `001_orders.sql:44`) but is absent from `Order`, causing TypeScript to miss it in admin update flows. Additionally, `phone` is declared `string` (required) but the DB column is nullable `TEXT` without `NOT NULL`.
- **Impact:** Silent `undefined` for province on all order reads; TypeScript will not catch it. Missing `updated_at` means admin code using `order.updated_at` has no type coverage.
- **Fix:** Add `updated_at?: string` (safe, additive). Treat the `province` removal with care: it is present in the order input schema (`app/api/orders/route.ts:25`) and checkout form, so confirm whether `orders` persists it (e.g. inside a JSONB address) before deleting the field. Correct `phone` to `phone: string | null`.
- **Status:** 🔧 Recommended (NOT applied — see validation note above)

---

### [D-04] `types/supabase.ts` nullable mismatch on `orders` financial columns — High

- **Location:** `types/supabase.ts:181` (`discount: number | null`), `types/supabase.ts:189` (`status: string | null`)
- **Category:** TypeDrift
- **Issue:** The `orders` DB table declares `discount NUMERIC(12,2) NOT NULL DEFAULT 0` and `status TEXT NOT NULL DEFAULT 'pending'` (`001_orders.sql:25,31`). The generated types in `supabase.ts` mark both as nullable (`number | null`, `string | null`). This forces unnecessary null-guards throughout the codebase and masks the fact that these columns always have values. Similarly, `created_at` is typed `string | null` but has a `DEFAULT NOW()` — while technically nullable for the brief window between ALTER TABLE and data insertion on an old row, newly inserted rows will never be null.
- **Impact:** Downstream code (admin analytics, stats) must null-coerce totals unnecessarily. If the nullable assumption propagates, a `null` discount could silently become `0` via coercion, masking data issues.
- **Fix:** Correct `discount`/`status` nullability in `Row`/`Insert`/`Update`. Because `types/supabase.ts` is generated, regenerate it via `supabase gen types` rather than hand-editing, or the change will be overwritten on the next type generation.
- **Status:** 🔧 Recommended (NOT applied — `types/supabase.ts` is a generated file; see validation note above)

---

### [D-05] Analytics and stats routes fetch ALL order rows — no pagination — High

- **Location:** `app/api/admin/analytics/route.ts:37–40`, `app/api/admin/stats/route.ts:16`
- **Category:** QueryEff
- **Issue:** `analytics/route.ts` fetches `select("email, total, status, created_at, items")` with no `.limit()` or `.range()` — every order row is loaded into Node.js memory for in-process aggregation. `stats/route.ts` line 16 similarly fetches all `total` values without pagination to compute revenue. For a store processing hundreds of orders these queries are acceptable, but as the table grows to thousands of rows they will become slow, memory-heavy, and will hit Supabase's default 1000-row response cap, silently truncating results.
- **Impact:** Revenue and analytics figures will be **silently wrong** once `orders` exceeds 1000 rows because PostgREST returns at most 1000 rows by default. The `analytics/route.ts` also decompresses `items` JSONB for every row in JS — this workload should be pushed to SQL aggregations.
- **Fix:** (a) For `stats/route.ts`, replace the `select("total")` + JS reduce with a Postgres aggregate: `select("total.sum()")`. (b) For `analytics/route.ts`, move monthly revenue, product aggregation, and category breakdown to SQL CTEs or views. At minimum, add `.limit(10000)` and document the cap.
- **Status:** 🔧 Recommended

---

### [D-06] Missing composite index `(product_id, approved)` on `reviews` — High

- **Location:** `supabase/migrations/007_reviews.sql:14–15`
- **Category:** Index
- **Issue:** Migration 007 creates two separate single-column indexes: `reviews_product_id_idx` on `(product_id)` and `reviews_approved_idx` on `(approved)`. Every approved-reviews query (used by the public reviews API at `app/api/reviews/route.ts:24`) filters on both columns simultaneously: `.eq("product_id", productId).eq("approved", true)`. Postgres will use only one of the single-column indexes and then re-filter in memory. A composite `(product_id, approved)` index turns this into a single index scan.
- **Impact:** Seq scan on the `approved` predicate for product review fetches; worsens as reviews grow.
- **Fix:** See proposed migration `021_reviews_composite_idx.sql` below.
- **Status:** 🔧 Recommended

---

### [D-07] Dual source of truth — `lib/promos.ts` hardcoded dict vs `promo_codes` DB table — High

- **Location:** `lib/promos.ts:3–7`, `supabase/migrations/002_promo_codes.sql:17–21`
- **Category:** SourceOfTruth
- **Issue:** The same three promo codes (`AKCARE10`, `DETAIL20`, `LAUNCH15`) are defined in two places: the `PROMOS` dict in `lib/promos.ts` and the seed data in `002_promo_codes.sql`. The API routes (`/api/promo`, `/api/orders`) consult the DB first and only fall back to `PROMOS` if the DB is unreachable. Any code reading `PROMOS` directly bypasses expiry, `max_uses`, and `active` checks enforced by the DB. The comment in `lib/promos.ts` says "Server-side promo definitions — never imported on the client" — but the correct authority for promo rules is the DB, and the hardcoded dict is a stale mirror.
- **Impact:** If an admin disables `AKCARE10` in the DB, the hardcoded fallback still accepts it during a DB outage. New promos added via the admin portal have no fallback. There is a silent divergence risk as codes are added/changed.
- **Fix:** Remove the hardcoded fallback or add a clear warning comment that the fallback is intentionally static and never to be considered authoritative. Alternatively, replace the dict with a no-op fallback (return invalid) and document that a DB outage simply disables promos rather than allowing stale codes.
- **Status:** 🔧 Recommended

---

### [D-08] `orders.updated_at` has no auto-trigger — Medium

- **Location:** `supabase/migrations/001_orders.sql:44`, `supabase/migrations/006_products.sql:45–53`
- **Category:** Schema
- **Issue:** The `set_updated_at()` trigger function is created in `006_products.sql` and wired to the `products` table only. The `orders` table also has an `updated_at` column, but no trigger keeps it current — the admin order-update route manually sets `updated_at: new Date().toISOString()` in application code (`app/api/admin/orders/[id]/route.ts`). If any other code path updates an order row without explicitly setting `updated_at`, the column will silently go stale.
- **Impact:** Admin UI showing order "last updated" time may be wrong for orders updated outside the main admin route (e.g., any future direct DB updates, migrations, or bulk scripts).
- **Fix:** See proposed migration below — wire `set_updated_at()` to `orders` too.
- **Status:** 🔧 Recommended

---

### [D-09] `reserve_stock` has no stock-ceiling check — Medium

- **Location:** `supabase/migrations/003_stock_functions.sql:22–28`, `app/api/orders/route.ts:78–85`
- **Category:** Integrity
- **Issue:** The order API checks `available = (product.stock ?? 99) - reserved` in application code before calling `reserve_stock`. However, `product.stock` is read from the `products` table via `getProductsByIds()` which queries DB in a separate round-trip earlier in the same request, with no row-level lock. A second concurrent order could read the same available count and both proceed. The `reserve_stock` SQL function (`003_stock_functions.sql:22–28`) is an unconditional `INSERT … ON CONFLICT DO UPDATE SET reserved = reserved + EXCLUDED.reserved` — it will increment even past the stock ceiling, and the only protection is the `CHECK (reserved >= 0)` constraint, which only prevents negative stock.
- **Impact:** Two concurrent orders for the last unit of a low-stock product could both succeed, resulting in overselling. At current catalog scale (all products at `stock=0`, `in_stock=false`) this is not immediately exploitable, but will become live once prices and stock are set.
- **Fix:** Add a `WHERE reserved + qty <= (SELECT stock FROM products WHERE id = p_product_id)` guard inside `reserve_stock`, or use `SELECT … FOR UPDATE` on both tables in a transaction. See proposed migration below.
- **Status:** 🔧 Recommended

---

### [D-10] `product_stock` has no FK to `products` — Medium

- **Location:** `supabase/migrations/003_stock_functions.sql:12`
- **Category:** Schema
- **Issue:** `product_stock.product_id` is `TEXT PRIMARY KEY` with no `REFERENCES products(id)` foreign key. The seed migration `005_seed_stock.sql` inserts rows keyed to the old demo catalog IDs (`p1`–`p14`), but after `017_real_catalog.sql` replaces those products with new IDs (`p1`–`p6` with new slugs), the stale `product_stock` rows for the old `p7`–`p14` IDs are never cleaned up. New product IDs added by `017_real_catalog` and `017_bpo_product` have no corresponding `product_stock` rows.
- **Impact:** `reserve_stock` calls for the new catalog IDs will work (INSERT on conflict) but there are orphaned rows for deleted IDs with no cleanup. If a new product is added without a corresponding `product_stock` row, the `reservedMap.get()` returns `undefined` → `0` in the order API, which is actually safe (defaults to fully available), so this is not a blocker.
- **Fix:** Add `REFERENCES products(id) ON DELETE CASCADE` to `product_stock.product_id` in a new migration, and re-seed rows for current product IDs.
- **Status:** 🔧 Recommended

---

### [D-11] `storage` bucket `product-images` has no explicit upload size/type policy — Medium

- **Location:** `supabase/STORAGE.md`
- **Category:** RLS
- **Issue:** The `STORAGE.md` notes the bucket is created as public (public read) on first upload, with writes restricted to the service-role key. It mentions "optional" file-size (5 MB) and MIME type restrictions. These are not enforced in code — the admin upload route (`/api/admin/upload`) does not validate file type or size before forwarding to Supabase Storage. If an attacker with a leaked service-role key (or a compromised admin session) calls the upload endpoint, they could upload arbitrary files.
- **Impact:** Malicious or oversized files could be uploaded. No immediate public exposure since only admin can upload, but a belt-and-suspenders approach is prudent.
- **Fix:** Add `maxFileSize` and `allowedMimeTypes` restrictions to the bucket via the dashboard or a storage migration script. Add server-side content-type and size validation in the upload route.
- **Status:** 🔧 Recommended

---

### [D-12] Cart store has no schema version — hydration mismatch risk — Medium

- **Location:** `store/cart.ts:112`, `store/wishlist.ts:53`
- **Category:** Store
- **Issue:** Both Zustand persist stores use a fixed key (`ak-cart`, `ak-wishlist`) with no `version` field and no `migrate` function. If the shape of `CartItem` or `WishlistItem` changes (e.g., a new required field is added), users with stale `localStorage` data will have their store silently rehydrated with the old shape, potentially causing runtime errors. The cart stores a full `Product` and `Variant` object — if the Product type gains a required field, old cached carts will have objects missing that field.
- **Impact:** After a deploy that changes the Product or Variant shape, returning users may see broken cart rendering or JS errors until they clear localStorage.
- **Fix:** Add `version: 1` and a `migrate` function to both stores. When the schema changes, bump the version and write a migration.
- **Status:** 🔧 Recommended

---

### [D-13] `lib/promos.ts` discount values are `NUMERIC(5,4)` — fractional precision acceptable but undocumented — Low

- **Location:** `supabase/migrations/002_promo_codes.sql:6`, `lib/promos.ts:3–7`
- **Category:** Schema
- **Issue:** `discount NUMERIC(5,4)` stores fractional multipliers (e.g., `0.10`). This is correct for percentage discounts but the column name `discount` is ambiguous — it could mean "discount amount" or "discount rate." The order API multiplies `subtotal * p.discount` (treating it as a rate), which is consistent with the seed values. However, the types file (`supabase.ts`) types it as plain `number`, and `lib/promos.ts` uses the same field name differently (as a decimal fraction vs. PKR amount). A comment in the migration clarifies `-- 0.10 = 10%` but this is easy to miss.
- **Impact:** Low risk — both code paths treat it consistently as a rate. Risk escalates if a developer mistakes it for an absolute amount.
- **Fix:** Rename the column to `discount_rate` in a future schema version, or add a DB `CHECK (discount > 0 AND discount <= 1)` constraint.
- **Status:** 🔧 Recommended (low priority)

---

### [D-14] `abandoned_carts` cron fetches without pagination — Low

- **Location:** `app/api/cron/abandoned-cart/route.ts:28–33`
- **Category:** QueryEff
- **Issue:** The abandoned-cart cron query already has `.limit(50)` — this is fine. However the `email_sent_at` update is done inside a sequential `for` loop (not batched), making N individual DB round-trips for up to 50 carts.
- **Impact:** 50 sequential DB writes per cron run — minor latency in a serverless function, no correctness issue.
- **Fix:** Batch the `email_sent_at` updates using `.in("id", sentIds)` after collecting sent IDs.
- **Status:** 🔧 Recommended (low priority)

---

### [D-15] `data/products.ts` static functions shadow `lib/products.ts` DB functions — Low

- **Location:** `data/products.ts:223–241`, `lib/products.ts`
- **Category:** SourceOfTruth
- **Issue:** `data/products.ts` exports `getFeaturedProducts`, `getProductsByCategory`, `getProductBySlug`, `getRelatedProducts`, and `searchProducts` — all working on the static in-memory array. `lib/products.ts` exports identically-named async functions querying the DB. Page-level imports (`app/page.tsx`, `app/products/[slug]/page.tsx`, `app/categories/[slug]/page.tsx`) correctly import from `lib/products` (DB), but `data/products.ts` also silently exports the static versions. A future developer adding a new page could easily import the wrong function.
- **Impact:** Stale catalog data served if the wrong import is used. No current pages are affected.
- **Fix:** Remove the named function exports from `data/products.ts` and leave only the type exports (`Product`, `Variant`) and the default array export (used as seed reference). Or mark them `@deprecated`.
- **Status:** 🔧 Recommended

---

## Proposed new migrations (SQL)

### `021_atomic_promo_check.sql` — fixes D-02 (TOCTOU race)

```sql
-- Replace increment_promo_uses with an atomic check-and-increment.
-- Returns TRUE if the increment succeeded (promo valid & not exhausted),
-- FALSE if max_uses was already reached.
CREATE OR REPLACE FUNCTION increment_promo_uses(promo_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE promo_codes
  SET    uses       = uses + 1,
         updated_at = NOW()
  WHERE  id         = promo_id
    AND  (max_uses IS NULL OR uses < max_uses);
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

_Usage in the order API: call this function instead of the check-then-call pattern, and treat a `FALSE` return as "promo exhausted — reject order"._

---

### `022_reviews_composite_idx.sql` — fixes D-06 (reviews index)

```sql
-- Replace the two single-column indexes with a composite that matches the
-- hot query: approved reviews for a given product.
DROP INDEX IF EXISTS reviews_approved_idx;
CREATE INDEX IF NOT EXISTS reviews_product_approved_idx
  ON reviews (product_id, approved)
  WHERE approved = true;  -- partial index — only indexes approved rows
```

---

### `023_orders_updated_at_trigger.sql` — fixes D-08 (missing trigger)

```sql
-- Wire the existing set_updated_at() trigger function to the orders table
-- so updated_at is kept current automatically.
CREATE OR REPLACE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

### `024_reserve_stock_ceiling.sql` — fixes D-09 (oversell risk)

```sql
-- Replace reserve_stock with a version that enforces the stock ceiling.
-- Returns TRUE if reservation succeeded, FALSE if insufficient stock.
CREATE OR REPLACE FUNCTION reserve_stock(p_product_id TEXT, qty INT)
RETURNS BOOLEAN AS $$
DECLARE
  ceiling INT;
  updated_count INT;
BEGIN
  SELECT stock INTO ceiling FROM products WHERE id = p_product_id;
  IF ceiling IS NULL THEN
    -- No ceiling defined — allow (unlimited stock product)
    INSERT INTO product_stock (product_id, reserved)
    VALUES (p_product_id, qty)
    ON CONFLICT (product_id)
    DO UPDATE SET reserved = product_stock.reserved + EXCLUDED.reserved;
    RETURN TRUE;
  END IF;

  UPDATE product_stock
  SET    reserved = reserved + qty
  WHERE  product_id = p_product_id
    AND  reserved   + qty <= ceiling;
  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count = 0 THEN
    -- Row may not exist yet — try INSERT
    INSERT INTO product_stock (product_id, reserved)
    VALUES (p_product_id, qty)
    ON CONFLICT (product_id) DO NOTHING;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
  END IF;

  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### `025_product_stock_fk_and_reseed.sql` — fixes D-10 (orphaned stock rows)

```sql
-- Clean up stale product_stock rows, add FK, reseed for current catalog.
DELETE FROM product_stock
WHERE product_id NOT IN (SELECT id FROM products);

-- Add FK with cascade so future product deletes clean up automatically.
ALTER TABLE product_stock
  ADD CONSTRAINT product_stock_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Ensure current products have a stock row (INSERT IGNORE existing).
INSERT INTO product_stock (product_id, reserved)
SELECT id, 0 FROM products
ON CONFLICT (product_id) DO NOTHING;
```

---

### `026_re_add_bpo_product.sql` — fixes D-01 (BPO product wiped by 017 ordering)

```sql
-- Re-insert the BPO Hardener Paste product that was silently removed when
-- 017_real_catalog.sql's DELETE FROM products ran after 017_bpo_product.sql.
INSERT INTO products
  (id, slug, name, category_slug, tagline, description, how_to_use, specs,
   price, images, stock, in_stock, featured, rating, reviews, badge, sort_order)
VALUES
('p15','bpo-hardener-paste','Benzoyl Peroxide (BPO) Hardener Paste','automotive-utility',
 'Industrial Curing Agent & Catalyst',
 'Our Benzoyl Peroxide (BPO) Hardener Paste is a premium-grade, highly stable catalyst
  specifically formulated to initiate the rapid curing of unsaturated polyester resins.',
 'Mix approximately 2-3% hardener paste by weight into the polyester resin, filler,
  or putty. Blend thoroughly until the colour is fully uniform. Apply within the working
  time, then allow to cure before sanding.',
 jsonb_build_array(
   jsonb_build_object(''label'',''Reactivity'',''value'',''Optimized — predictable, controllable cure with minimal shrinkage''),
   jsonb_build_object(''label'',''Dispersion'',''value'',''Excellent — smooth, homogeneous paste blends without streaking''),
   jsonb_build_object(''label'',''Mix indicator'',''value'',''High-visibility colour-coded pigment for uniform-mix confirmation''),
   jsonb_build_object(''label'',''Heat stability'',''value'',''Enhanced — resists separation during transport and long-term storage'')
 ),
 1000,
 jsonb_build_array(''https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80''),
 100, true, false, 0, 0, ''New'', 15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_variants (product_id, label, price, sku, sort_order)
VALUES (''p15'', ''Standard'', 1000, ''BPO-STD'', 0)
ON CONFLICT (sku) DO NOTHING;
```

_Note: single-quote escaping shown above — adjust to your SQL editor's conventions._

---

## Cross-domain recommendations

1. **Migration naming convention:** Adopt Supabase's timestamp-based filename format (`YYYYMMDDHHmmss_description.sql`) for all future migrations to eliminate numeric-prefix collision risk. The current `017_*` collision is a direct consequence of sequential numbering without timestamps.

2. **Stats revenue aggregation:** The `stats` route at `/api/admin/stats` fetches `select("total")` over every non-cancelled order with no limit. Replace with a `SUM` pushed to Postgres:
   ```ts
   supabase.from("orders")
     .select("total.sum()")
     .not("status", "in", '("cancelled","refunded")')
   ```
   This eliminates the 1000-row cap risk and the in-process JS reduce.

3. **Full-text search index for products:** `lib/products.ts:searchProducts` issues a four-column `ILIKE` OR query. Add a `tsvector` GIN index on `products`:
   ```sql
   ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector
     GENERATED ALWAYS AS (
       setweight(to_tsvector('english', coalesce(name,'')), 'A') ||
       setweight(to_tsvector('english', coalesce(tagline,'')), 'B') ||
       setweight(to_tsvector('english', coalesce(description,'')), 'C')
     ) STORED;
   CREATE INDEX products_search_gin ON products USING GIN (search_vector);
   ```

4. **`lib/promos.ts` is an authority risk:** As the admin portal matures, promo management will be DB-only. The hardcoded `PROMOS` dict is a footgun — it should either be deleted (accepting that DB outage = no promos) or clearly annotated as "emergency break-glass fallback, never to be updated" with a lint rule preventing changes.

5. **Cart store versioning:** Add `version: 1` to both Zustand persist configs now, before the Product schema changes. A version bump with a `migrate` function is cheap insurance against hydration mismatches on deploy.

6. **`profiles.Relationships` in `supabase.ts`:** The `profiles` table has `id UUID PRIMARY KEY REFERENCES auth.users(id)` but `types/supabase.ts` shows `Relationships: []`. This is a type-gen artifact (the `auth` schema is not included in the public schema type generation). No fix needed in code — just a documentation note.

7. **`order-tracking` uses `.ilike("email", email)`:** The `lower(email)` functional index from `016_orders_indexes.sql` will not be used by an `ilike` operator in Postgres (it would need `pg_trgm` GIN index for `ilike`, or use `lower()` equality). Consider normalizing to `lower(email)` equality match: `.eq("email", email.toLowerCase())` in the route, which will use the existing `lower(email)` expression index.

8. **`audit_log` missing entity lookup index:** The admin audit-log UI may filter by `entity + entity_id` (e.g., all actions on a specific order). Add a composite index: `CREATE INDEX audit_log_entity_idx ON audit_log (entity, entity_id);`.
