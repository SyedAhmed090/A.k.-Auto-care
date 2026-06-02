-- Run this in your Supabase SQL editor to create/update the orders table.
-- If the table already exists, only run the ALTER TABLE statements at the bottom.

CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Customer
  email           TEXT NOT NULL,
  phone           TEXT,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,

  -- Delivery
  address         TEXT NOT NULL,
  city            TEXT NOT NULL,
  postcode        TEXT NOT NULL,
  country         TEXT NOT NULL DEFAULT 'PK',

  -- Fulfilment
  shipping_method TEXT,
  payment_method  TEXT NOT NULL DEFAULT 'cod',
  tracking_number TEXT,
  status          TEXT NOT NULL DEFAULT 'pending',
  -- status values: pending | confirmed | processing | shipped | delivered | cancelled | refunded

  -- Financials (PKR, server-computed)
  items           JSONB NOT NULL DEFAULT '[]',
  subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping        NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  promo_code      TEXT,

  -- Admin
  notes           TEXT
);

-- Add missing columns if the table already exists:
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method TEXT;

-- Row Level Security: only service-role key can read/write (admin + server)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Block all public access (service role bypasses RLS automatically)
DROP POLICY IF EXISTS "block_public" ON orders;
CREATE POLICY "block_public" ON orders FOR ALL TO anon USING (false);
