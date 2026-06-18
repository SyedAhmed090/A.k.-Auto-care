-- D-10: Add FK constraint from product_stock.product_id → products.id with
-- ON DELETE CASCADE, and clean up orphaned rows from the old seed catalog.
-- Previously product_stock had no FK so deleting products left stale rows.

-- Remove orphaned stock rows for products that no longer exist
DELETE FROM product_stock
WHERE product_id NOT IN (SELECT id FROM products);

-- Add FK with cascade (idempotent via DO block checking pg_constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'product_stock_product_id_fkey'
      AND conrelid = 'product_stock'::regclass
  ) THEN
    ALTER TABLE product_stock
      ADD CONSTRAINT product_stock_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END;
$$;

-- Ensure every current product has a stock row (safe for existing rows)
INSERT INTO product_stock (product_id, reserved)
SELECT id, 0 FROM products
ON CONFLICT (product_id) DO NOTHING;
