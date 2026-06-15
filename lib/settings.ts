// ── Settings: DB-backed business configuration ──────────────────────────────
// Shipping rates, tax, payment details, store info, and social links are stored
// in the `settings` table (key = group, value = JSON) and editable from the admin
// Settings page — no code change / redeploy required.
//
// DEFAULT_SETTINGS mirrors the previously-hardcoded values (and their env-var
// fallbacks) so that, when the table is seeded with these defaults, storefront
// behaviour — especially checkout pricing — is byte-for-byte identical.

import { createAdminClient } from "@/utils/supabase/admin";

// ── Types ────────────────────────────────────────────────────────────────────
export type ShippingSettings = {
  freeThreshold: number;
  domestic: { standard: number; express: number };
  international: { standard: number; express: number };
  etas: {
    domesticStandard: string;
    domesticExpress: string;
    intlStandard: string;
    intlExpress: string;
  };
};

export type TaxSettings = {
  gstRate: number;       // e.g. 0.17 for 17%
  gstInclusive: boolean; // true = displayed prices already include GST
};

export type PaymentSettings = {
  jazzcash: { number: string; name: string };
  easypaisa: { number: string; name: string };
  bank: { bank: string; account: string; branch: string; title: string };
};

export type StoreSettings = {
  email: string;
  address: string;
  city: string;
  country: string;
  hours: string;
  mapQuery: string;
  whatsapp: string; // digits only, e.g. "923000000000"
};

export type SocialSettings = {
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
};

export type Settings = {
  shipping: ShippingSettings;
  tax: TaxSettings;
  payment: PaymentSettings;
  store: StoreSettings;
  social: SocialSettings;
};

export type SettingsGroup = keyof Settings;

// ── Defaults (mirror the old constants + env fallbacks) ────────────────────────
export const DEFAULT_SETTINGS: Settings = {
  shipping: {
    freeThreshold: 5000,
    domestic: { standard: 199, express: 499 },
    international: { standard: 2499, express: 4999 },
    etas: {
      domesticStandard: "Karachi 1–2 days, other cities 3–5 days · TCS / Leopards",
      domesticExpress: "Karachi same/next day · other cities 2–3 days · order before 2pm",
      intlStandard: "10–20 business days",
      intlExpress: "5–7 business days",
    },
  },
  tax: {
    gstRate: 0.17,
    gstInclusive: true,
  },
  payment: {
    jazzcash: {
      number: process.env.NEXT_PUBLIC_JAZZCASH_NUMBER ?? "0300-0000000",
      name: process.env.NEXT_PUBLIC_JAZZCASH_NAME ?? "A.K. Auto Care",
    },
    easypaisa: {
      number: process.env.NEXT_PUBLIC_EASYPAISA_NUMBER ?? "0300-0000000",
      name: process.env.NEXT_PUBLIC_EASYPAISA_NAME ?? "A.K. Auto Care",
    },
    bank: {
      bank: process.env.NEXT_PUBLIC_BANK_NAME ?? "HBL",
      account: process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? "0000-0000000-001",
      branch: process.env.NEXT_PUBLIC_BANK_BRANCH ?? "PECHS, Karachi",
      title: process.env.NEXT_PUBLIC_BANK_TITLE ?? "A.K. Auto Care",
    },
  },
  store: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@akautocare.pk",
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "Block 7, PECHS, Karachi — 75400",
    city: "Karachi",
    country: "Pakistan",
    hours: process.env.NEXT_PUBLIC_BUSINESS_HOURS ?? "Mon–Sat · 10 AM – 8 PM",
    mapQuery: process.env.NEXT_PUBLIC_BUSINESS_MAP_QUERY ?? "Block 7 PECHS Karachi Pakistan 75400",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000",
  },
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/akautocare",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://facebook.com/akautocare",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://tiktok.com/@akautocare",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "",
  },
};

// ── Server-side cached reader ──────────────────────────────────────────────────
let cache: { value: Settings; at: number } | null = null;
const TTL_MS = 60_000;

/** Merge a stored group object over its defaults (shallow per group is sufficient
 *  because the admin PATCH always writes the full group object). */
function mergeGroup<K extends SettingsGroup>(group: K, stored: unknown): Settings[K] {
  if (!stored || typeof stored !== "object") return DEFAULT_SETTINGS[group];
  return { ...DEFAULT_SETTINGS[group], ...(stored as object) } as Settings[K];
}

/**
 * Returns the current settings, reading from the `settings` table with a short
 * in-memory cache. Falls back to DEFAULT_SETTINGS on any error or missing rows,
 * so the storefront never breaks if the table is empty or unreachable.
 */
export async function getSettings(): Promise<Settings> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.value;

  try {
    const sb = createAdminClient();
    const { data, error } = await sb.from("settings").select("key, value");
    if (error) throw error;

    const byKey = new Map((data ?? []).map((r) => [r.key as string, r.value]));
    const value: Settings = {
      shipping: mergeGroup("shipping", byKey.get("shipping")),
      tax: mergeGroup("tax", byKey.get("tax")),
      payment: mergeGroup("payment", byKey.get("payment")),
      store: mergeGroup("store", byKey.get("store")),
      social: mergeGroup("social", byKey.get("social")),
    };
    cache = { value, at: Date.now() };
    return value;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Invalidate the cache after a settings write so changes take effect immediately. */
export function invalidateSettingsCache() {
  cache = null;
}

/** Social links as a render-ready list (only entries with a real URL). */
export function socialLinks(social: SocialSettings): { name: string; href: string }[] {
  return [
    { name: "Instagram", href: social.instagram },
    { name: "Facebook", href: social.facebook },
    { name: "TikTok", href: social.tiktok },
    { name: "YouTube", href: social.youtube },
  ].filter((s) => s.href && s.href !== "#");
}

// ── Store / WhatsApp display helpers ───────────────────────────────────────────
export const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi! I'm interested in A.K. Auto Care products. Can you help me?"
);

export const whatsappLink = (store: StoreSettings) => `https://wa.me/${store.whatsapp}`;

/** Human-readable phone, e.g. "+92 300 0000000". */
export const whatsappDisplay = (store: StoreSettings) =>
  `+${store.whatsapp.slice(0, 2)} ${store.whatsapp.slice(2, 5)} ${store.whatsapp.slice(5)}`;

export const mapEmbedUrl = (store: StoreSettings) =>
  `https://www.google.com/maps?q=${encodeURIComponent(store.mapQuery)}&output=embed`;

export const mapDirectionsUrl = (store: StoreSettings) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.mapQuery)}`;
