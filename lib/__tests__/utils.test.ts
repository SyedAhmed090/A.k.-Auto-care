import { describe, it, expect } from "vitest";
import { cn, formatPrice, slugify, sanitizeSearchTerm } from "@/lib/utils";

describe("formatPrice", () => {
  it("rounds to the nearest rupee and adds thousands separators", () => {
    expect(formatPrice(1234.56)).toBe("Rs 1,235");
    expect(formatPrice(5000)).toBe("Rs 5,000");
    expect(formatPrice(0)).toBe("Rs 0");
  });

  it("rounds half up", () => {
    expect(formatPrice(199.5)).toBe("Rs 200");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates whitespace", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips non-word characters", () => {
    expect(slugify("Ceramic Coating 9H!")).toBe("ceramic-coating-9h");
  });
});

describe("sanitizeSearchTerm", () => {
  it("strips PostgREST filter delimiters", () => {
    // commas, parens, colon, quote and backslash must not survive
    const out = sanitizeSearchTerm('a,b(c):d"e\\f');
    expect(out).not.toMatch(/[,():"\\]/);
  });

  it("escapes SQL LIKE wildcards", () => {
    expect(sanitizeSearchTerm("50%_off")).toBe("50\\%\\_off");
  });

  it("preserves dots so email search works", () => {
    expect(sanitizeSearchTerm("user@mail.com")).toContain(".");
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeSearchTerm("  wax  ")).toBe("wax");
  });
});

describe("cn", () => {
  it("merges and dedupes Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold");
  });
});
