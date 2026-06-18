-- D-02: Replace increment_promo_uses with an atomic check-and-increment.
-- The original function in 003_stock_functions.sql was a plain UPDATE with no
-- guard, allowing a TOCTOU race: two concurrent requests could both pass the
-- uses < max_uses check and both increment, exceeding max_uses.
-- This version atomically checks and increments in a single UPDATE statement.
-- Returns TRUE if the increment succeeded (promo valid & not exhausted),
-- FALSE if max_uses was already reached (caller should reject the order).

CREATE OR REPLACE FUNCTION increment_promo_uses(promo_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE promo_codes
  SET    uses       = uses + 1,
         updated_at = NOW()
  WHERE  id         = promo_id
    AND  active     = true
    AND  (max_uses IS NULL OR uses < max_uses);

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
