-- Sample requests: B2B "Order a Sample" lead capture.
-- A customer requests a small sample bucket of a product and tells us their
-- estimated monthly usage so we can forecast future bulk orders. Stored
-- service-role only (never exposed to the public anon client) and surfaced in
-- the admin portal, mirroring the contact_messages inbox.

CREATE TABLE IF NOT EXISTS sample_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_slug  TEXT,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  city          TEXT,
  address       TEXT,
  business_name TEXT,
  monthly_usage TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sample_requests_status_idx  ON sample_requests(status);
CREATE INDEX IF NOT EXISTS sample_requests_created_idx ON sample_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS sample_requests_product_idx ON sample_requests(product_id);

-- Service-role only: never readable/writable by the anon (public) client.
ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role only" ON sample_requests;
CREATE POLICY "Service role only" ON sample_requests USING (auth.role() = 'service_role');
