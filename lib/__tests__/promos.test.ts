import { describe, it, expect } from "vitest";
import { PROMOS } from "@/lib/promos";

// D-07: The hardcoded PROMOS dict is now intentionally empty. Promo codes are
// managed exclusively in the promo_codes DB table (seeded by 002_promo_codes.sql).
// The test suite is updated to reflect that the dict is a no-op fallback.
describe("PROMOS catalogue (D-07: DB is the authority)", () => {
  it("is an empty dict — all codes live in the DB, not in code", () => {
    expect(Object.keys(PROMOS)).toHaveLength(0);
  });
});
