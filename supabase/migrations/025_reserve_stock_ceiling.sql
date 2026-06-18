-- D-09: Replace reserve_stock with a version that enforces the stock ceiling.
-- The original function in 003_stock_functions.sql was an unconditional
-- INSERT … ON CONFLICT DO UPDATE that increments reserved without checking
-- whether reserved + qty would exceed the product's stock limit.
-- Two concurrent orders for the last unit could both succeed (overselling).
-- This version returns TRUE on success, FALSE when stock is insufficient.

CREATE OR REPLACE FUNCTION reserve_stock(p_product_id TEXT, qty INT)
RETURNS BOOLEAN AS $$
DECLARE
  ceiling_stock INT;
  updated_count INT;
BEGIN
  -- Read stock ceiling from products table
  SELECT stock INTO ceiling_stock FROM products WHERE id = p_product_id;

  IF ceiling_stock IS NULL THEN
    -- No ceiling defined — product has unlimited/untracked stock; allow reservation
    INSERT INTO product_stock (product_id, reserved)
    VALUES (p_product_id, qty)
    ON CONFLICT (product_id)
    DO UPDATE SET reserved = product_stock.reserved + EXCLUDED.reserved;
    RETURN TRUE;
  END IF;

  -- Atomically increment only if the ceiling is not breached
  UPDATE product_stock
  SET    reserved = reserved + qty
  WHERE  product_id = p_product_id
    AND  reserved + qty <= ceiling_stock;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count = 0 THEN
    -- Row may not exist yet — try to insert (only if qty alone fits in ceiling)
    INSERT INTO product_stock (product_id, reserved)
    VALUES (p_product_id, qty)
    ON CONFLICT (product_id) DO NOTHING;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    -- If insert also failed (row exists, ceiling already breached), return FALSE
  END IF;

  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
