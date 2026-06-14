// ── WhatsApp ────────────────────────────────────────────────
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi! I'm interested in A.K. Auto Care products. Can you help me?"
);
/** Human-readable WhatsApp/phone number, e.g. "+92 300 0000000" */
export const WHATSAPP_DISPLAY = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 5)} ${WHATSAPP_NUMBER.slice(5)}`;

// ── Business / contact info ─────────────────────────────────
export const BUSINESS = {
  email:    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@akautocare.pk",
  address:  process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "Block 7, PECHS, Karachi — 75400",
  city:     "Karachi",
  country:  "Pakistan",
  hours:    process.env.NEXT_PUBLIC_BUSINESS_HOURS ?? "Mon–Sat · 10 AM – 8 PM",
  /** Used for the embedded map + "Get directions" link */
  mapQuery: process.env.NEXT_PUBLIC_BUSINESS_MAP_QUERY ?? "Block 7 PECHS Karachi Pakistan 75400",
};
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.mapQuery)}&output=embed`;
export const MAP_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS.mapQuery)}`;

// ── Social links — only those with a real URL are rendered ──
export const SOCIAL_LINKS: { name: string; href: string }[] = [
  { name: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/akautocare" },
  { name: "Facebook",  href: process.env.NEXT_PUBLIC_FACEBOOK_URL  ?? "https://facebook.com/akautocare" },
  { name: "TikTok",    href: process.env.NEXT_PUBLIC_TIKTOK_URL    ?? "https://tiktok.com/@akautocare" },
  { name: "YouTube",   href: process.env.NEXT_PUBLIC_YOUTUBE_URL   ?? "" },
].filter((s) => s.href && s.href !== "#");

// ── Payment details — set real values in .env.local ────────
export const PAYMENT_DETAILS = {
  jazzcash: {
    number: process.env.NEXT_PUBLIC_JAZZCASH_NUMBER ?? "0300-0000000",
    name:   process.env.NEXT_PUBLIC_JAZZCASH_NAME   ?? "A.K. Auto Care",
  },
  easypaisa: {
    number: process.env.NEXT_PUBLIC_EASYPAISA_NUMBER ?? "0300-0000000",
    name:   process.env.NEXT_PUBLIC_EASYPAISA_NAME   ?? "A.K. Auto Care",
  },
  bank: {
    bank:    process.env.NEXT_PUBLIC_BANK_NAME    ?? "HBL",
    account: process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? "0000-0000000-001",
    branch:  process.env.NEXT_PUBLIC_BANK_BRANCH  ?? "PECHS, Karachi",
    title:   process.env.NEXT_PUBLIC_BANK_TITLE   ?? "A.K. Auto Care",
  },
};
