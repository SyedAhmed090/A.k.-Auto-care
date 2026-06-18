-- D-06: Replace two single-column indexes on reviews with a composite partial
-- index that matches the hot query: approved reviews for a given product.
-- The existing separate indexes (product_id) and (approved) require Postgres to
-- use one and re-filter in memory. The composite partial index turns this into
-- a single index scan for: WHERE product_id = $1 AND approved = true ORDER BY created_at DESC.

DROP INDEX IF EXISTS reviews_approved_idx;

CREATE INDEX IF NOT EXISTS reviews_product_approved_created_idx
  ON reviews (product_id, created_at DESC)
  WHERE approved = true;
