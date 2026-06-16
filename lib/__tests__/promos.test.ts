import { describe, it, expect } from "vitest";
import { PROMOS } from "@/lib/promos";

describe("PROMOS catalogue", () => {
  it("defines the expected launch codes", () => {
    expect(Object.keys(PROMOS).sort()).toEqual(["AKCARE10", "DETAIL20", "LAUNCH15"]);
  });

  it("has discounts expressed as fractions in (0, 1)", () => {
    for (const [code, promo] of Object.entries(PROMOS)) {
      expect(promo.discount, code).toBeGreaterThan(0);
      expect(promo.discount, code).toBeLessThan(1);
    }
  });

  it("has non-negative minimum spends", () => {
    for (const [code, promo] of Object.entries(PROMOS)) {
      expect(promo.minSpend, code).toBeGreaterThanOrEqual(0);
    }
  });

  it("gates DETAIL20 behind a Rs 5,000 minimum spend", () => {
    expect(PROMOS.DETAIL20.minSpend).toBe(5000);
    expect(PROMOS.DETAIL20.discount).toBeCloseTo(0.2);
  });
});
