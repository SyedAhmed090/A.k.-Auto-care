-- Run after 002_promo_codes.sql

-- Atomic promo use counter — prevents race condition on concurrent orders
CREATE OR REPLACE FUNCTION increment_promo_uses(promo_id UUID)
RETURNS void AS $$
  UPDATE promo_codes
  SET uses = uses + 1, updated_at = NOW()
  WHERE id = promo_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Product stock tracking table
CREATE TABLE IF NOT EXISTS product_stock (
  product_id  TEXT PRIMARY KEY,
  reserved    INT NOT NULL DEFAULT 0 CHECK (reserved >= 0)
);

ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "block_public" ON product_stock;
CREATE POLICY "block_public" ON product_stock FOR ALL TO anon USING (false);

-- Atomic stock reservation — prevents overselling on concurrent orders
CREATE OR REPLACE FUNCTION reserve_stock(p_product_id TEXT, qty INT)
RETURNS void AS $$
  INSERT INTO product_stock (product_id, reserved)
  VALUES (p_product_id, qty)
  ON CONFLICT (product_id)
  DO UPDATE SET reserved = product_stock.reserved + EXCLUDED.reserved;
$$ LANGUAGE SQL SECURITY DEFINER;
