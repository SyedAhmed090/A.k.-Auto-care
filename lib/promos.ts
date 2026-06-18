// D-07: The canonical source of truth for promo codes is the promo_codes DB
// table (seeded by 002_promo_codes.sql). The old hardcoded PROMOS dict was a
// stale mirror — it bypassed expiry, max_uses, and active checks enforced by
// the DB, and created a divergence risk as codes were added/changed via admin.
//
// The dict is now a no-op fallback: it is intentionally empty so that a DB
// outage disables promos rather than silently accepting stale codes.
// All promo validation goes through the DB only.
//
// DO NOT add codes here — use the admin portal or a DB migration instead.
export const PROMOS: Record<string, { discount: number; minSpend: number }> = {};
