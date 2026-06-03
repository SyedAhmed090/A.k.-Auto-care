-- Run this in Supabase SQL Editor after 001_orders.sql

CREATE TABLE IF NOT EXISTS promo_codes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT NOT NULL UNIQUE,
  discount     NUMERIC(5,4) NOT NULL,   -- 0.10 = 10%
  min_spend    NUMERIC(12,2) NOT NULL DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT true,
  uses         INT NOT NULL DEFAULT 0,
  max_uses     INT,                     -- NULL = unlimited
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Seed existing hardcoded promo codes
INSERT INTO promo_codes (code, discount, min_spend) VALUES
  ('AKCARE10', 0.10, 0),
  ('DETAIL20', 0.20, 5000),
  ('LAUNCH15', 0.15, 0)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_public" ON promo_codes;
CREATE POLICY "block_public" ON promo_codes FOR ALL TO anon USING (false);
