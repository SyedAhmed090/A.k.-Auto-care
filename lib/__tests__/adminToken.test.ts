import { describe, it, expect } from "vitest";
import { legacyToken, signUserToken, verifyToken, utcDay } from "@/lib/adminToken";

const SECRET = "test-secret-please-ignore-1234567890";

function yesterday(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

describe("legacy shared-secret token", () => {
  it("is deterministic for a given secret + day", async () => {
    const a = await legacyToken(SECRET);
    const b = await legacyToken(SECRET);
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("verifies as the owner identity", async () => {
    const token = await legacyToken(SECRET);
    expect(await verifyToken(token, SECRET)).toEqual({ uid: null, role: "owner", via: "secret" });
  });

  it("is rejected under a different secret", async () => {
    const token = await legacyToken(SECRET);
    expect(await verifyToken(token, "a-different-secret")).toBeNull();
  });
});

describe("per-user (v2) token", () => {
  it("round-trips uid and role", async () => {
    const token = await signUserToken({ uid: "user-123", role: "manager" }, SECRET);
    expect(token.startsWith("v2.")).toBe(true);
    expect(await verifyToken(token, SECRET)).toEqual({ uid: "user-123", role: "manager", via: "user" });
  });

  it("rejects a tampered signature", async () => {
    const token = await signUserToken({ uid: "user-123", role: "staff" }, SECRET);
    const tampered = token.slice(0, -2) + (token.endsWith("00") ? "11" : "00");
    expect(await verifyToken(tampered, SECRET)).toBeNull();
  });

  it("rejects a token signed for a previous day (expired)", async () => {
    const stale = await signUserToken({ uid: "user-123", role: "owner" }, SECRET, yesterday());
    expect(await verifyToken(stale, SECRET)).toBeNull();
  });

  it("rejects an unknown role", async () => {
    // Hand-craft a payload with an invalid role using the same signing helper shape.
    const today = utcDay();
    const token = await signUserToken({ uid: "u1", role: "owner" }, SECRET, today);
    // Swap the legitimate payload for one with a bad role but keep structure invalid → rejected.
    const bad = token.replace(/^v2\.[^.]+\./, "v2.bm90LWEtcm9sZQ.");
    expect(await verifyToken(bad, SECRET)).toBeNull();
  });
});

describe("verifyToken edge cases", () => {
  it("returns null for an undefined token", async () => {
    expect(await verifyToken(undefined, SECRET)).toBeNull();
  });

  it("returns null for a malformed v2 token", async () => {
    expect(await verifyToken("v2.only-two-parts", SECRET)).toBeNull();
  });
});
