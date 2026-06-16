import { describe, it, expect } from "vitest";
import { socialLinks, whatsappDisplay, mapEmbedUrl, mapDirectionsUrl, type SocialSettings, type StoreSettings } from "@/lib/settings";

describe("socialLinks", () => {
  const base: SocialSettings = {
    instagram: "https://instagram.com/akautocare",
    facebook: "https://facebook.com/akautocare",
    tiktok: "",
    youtube: "#",
  };

  it("includes only entries with a real URL (drops empty and '#')", () => {
    const links = socialLinks(base);
    expect(links.map((l) => l.name)).toEqual(["Instagram", "Facebook"]);
  });

  it("returns an empty list when nothing is configured", () => {
    expect(socialLinks({ instagram: "", facebook: "", tiktok: "", youtube: "" })).toEqual([]);
  });
});

describe("store display helpers", () => {
  const store: StoreSettings = {
    email: "hello@akautocare.pk",
    address: "Block 7, PECHS",
    city: "Karachi",
    country: "Pakistan",
    hours: "Mon–Sat",
    mapQuery: "Block 7 PECHS Karachi",
    whatsapp: "923000000000",
  };

  it("formats the WhatsApp number for display", () => {
    expect(whatsappDisplay(store)).toBe("+92 300 0000000");
  });

  it("URL-encodes the map query in embed and directions URLs", () => {
    expect(mapEmbedUrl(store)).toContain("Block%207%20PECHS%20Karachi");
    expect(mapDirectionsUrl(store)).toContain("query=Block%207%20PECHS%20Karachi");
  });
});
