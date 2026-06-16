-- Paid samples: an optional per-product price for the sample bucket.
-- `products.sample_price` is the admin-managed price (Rs) shown on the sample
-- request form; `sample_requests.sample_price` snapshots it at request time so
-- the recorded lead reflects the price the customer was quoted. Both nullable —
-- a null price keeps the sample a free request for that product.

ALTER TABLE products        ADD COLUMN IF NOT EXISTS sample_price integer;
ALTER TABLE sample_requests ADD COLUMN IF NOT EXISTS sample_price integer;
