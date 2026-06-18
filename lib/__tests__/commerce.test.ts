import { describe, it, expect } from "vitest";
import { gstAmount, filterAndSort, getShippingOptions } from "@/lib/commerce";
import { DEFAULT_SETTINGS } from "@/lib/settings";

const { shipping } = DEFAULT_SETTINGS;

describe("gstAmount", () => {
  it("extracts the GST portion from a GST-inclusive total (17%)", () => {
    // 1170 inclusive of 17% GST → 170 GST, 1000 net.
    expect(gstAmount(1170)).toBe(170);
  });

  it("returns 0 for a zero total", () => {
    expect(gstAmount(0)).toBe(0);
  });

  it("honours a custom GST rate", () => {
    expect(gstAmount(110, 0.1)).toBe(10);
  });

  it("rounds to two decimal places", () => {
    // 999.99 * (0.17/1.17) = 145.2976… → rounded to 145.3
    expect(gstAmount(999.99)).toBe(145.3);
  });
});

describe("getShippingOptions", () => {
  it("charges standard domestic shipping below the free threshold", () => {
    const opts = getShippingOptions("PK", shipping.freeThreshold - 1);
    const standard = opts.find((o) => o.id === "pk-standard")!;
    expect(standard.price).toBe(shipping.domestic.standard);
    expect(opts.find((o) => o.id === "pk-express")!.price).toBe(shipping.domestic.express);
  });

  it("makes standard shipping free at/above the free threshold", () => {
    const opts = getShippingOptions("PK", shipping.freeThreshold);
    expect(opts.find((o) => o.id === "pk-standard")!.price).toBe(0);
  });

  it("treats an empty country as domestic (PK)", () => {
    const opts = getShippingOptions("", 100);
    expect(opts.every((o) => o.id.startsWith("pk-"))).toBe(true);
  });

  it("returns international options for non-PK destinations", () => {
    const opts = getShippingOptions("US", 100);
    expect(opts.map((o) => o.id)).toEqual(["intl-standard", "intl-express"]);
    expect(opts[0].price).toBe(shipping.international.standard);
  });

  it("never makes international shipping free regardless of subtotal", () => {
    const opts = getShippingOptions("GB", 9_999_999);
    expect(opts.every((o) => o.price > 0)).toBe(true);
  });
});

describe("filterAndSort", () => {
  const products = [
    { price: 300, createdAt: "2024-01-01", featured: false, inStock: true },
    { price: 100, createdAt: "2024-03-01", featured: true, inStock: false },
    { price: 200, createdAt: "2024-02-01", featured: false, inStock: true },
  ];

  it("filters out out-of-stock products when inStockOnly is set", () => {
    const result = filterAndSort(products, { inStockOnly: true, sort: "" });
    expect(result.every((p) => p.inStock)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("sorts ascending and descending by price", () => {
    const asc = filterAndSort(products, { inStockOnly: false, sort: "price-asc" });
    expect(asc.map((p) => p.price)).toEqual([100, 200, 300]);
    const desc = filterAndSort(products, { inStockOnly: false, sort: "price-desc" });
    expect(desc.map((p) => p.price)).toEqual([300, 200, 100]);
  });

  it("sorts newest by createdAt descending", () => {
    const result = filterAndSort(products, { inStockOnly: false, sort: "newest" });
    expect(result[0].createdAt).toBe("2024-03-01");
  });

  it("defaults to featured-first ordering", () => {
    const result = filterAndSort(products, { inStockOnly: false, sort: "featured" });
    expect(result[0].featured).toBe(true);
  });
});
