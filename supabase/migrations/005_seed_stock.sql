-- Seed product_stock with initial reserved=0 for all products.
-- Run once after 003_stock_functions.sql.
-- The stock ceiling comes from data/products.ts; reserved tracks units committed to orders.

INSERT INTO product_stock (product_id, reserved) VALUES
  ('p1',  0),
  ('p2',  0),
  ('p3',  0),
  ('p4',  0),
  ('p5',  0),
  ('p6',  0),
  ('p7',  0),
  ('p8',  0),
  ('p9',  0),
  ('p10', 0),
  ('p11', 0),
  ('p12', 0),
  ('p13', 0),
  ('p14', 0)
ON CONFLICT (product_id) DO NOTHING;
