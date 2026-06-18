-- D-08: Wire the existing set_updated_at() trigger function (created in
-- 006_products.sql) to the orders table. Currently orders.updated_at is only
-- updated by explicit application code in the admin route; any other update
-- path (migrations, bulk scripts) would silently leave it stale.

DROP TRIGGER IF EXISTS orders_updated_at ON orders;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
