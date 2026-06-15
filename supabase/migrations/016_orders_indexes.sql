-- Performance: the orders table had no indexes, yet nearly every admin screen
-- filters/sorts/searches it (orders list, stats, chart, analytics, reports, and
-- the customer_summary view's `group by lower(email)`). These additive indexes
-- turn those seq scans into index scans. Safe to run anytime. Run in the
-- Supabase SQL editor.
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON orders (status);
CREATE INDEX IF NOT EXISTS orders_email_lower_idx ON orders (lower(email));
