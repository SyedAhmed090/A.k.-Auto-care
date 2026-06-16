-- Adds the tracking_carrier column the admin order screen and the public
-- order-tracking API already read/write (see app/api/admin/orders/[id]/route.ts
-- and app/api/order-tracking/route.ts). It had been added to production
-- out-of-band with no migration — this backfills the missing migration so a
-- fresh database matches the application code. Idempotent. Run in the Supabase
-- SQL editor.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_carrier TEXT;
