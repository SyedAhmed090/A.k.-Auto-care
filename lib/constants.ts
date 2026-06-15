// Backward-compatibility layer.
//
// Business config now lives in the `settings` table and is read via
// `getSettings()` (server) or `useSettings()` (client). These constants are
// derived from DEFAULT_SETTINGS so any module that still imports them keeps
// compiling and renders the default values. Prefer the settings APIs for
// anything that should reflect admin edits.

import { DEFAULT_SETTINGS, socialLinks } from "@/lib/settings";

// ── WhatsApp ────────────────────────────────────────────────
export const WHATSAPP_NUMBER = DEFAULT_SETTINGS.store.whatsapp;
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi! I'm interested in A.K. Auto Care products. Can you help me?"
);
/** Human-readable WhatsApp/phone number, e.g. "+92 300 0000000" */
export const WHATSAPP_DISPLAY = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 5)} ${WHATSAPP_NUMBER.slice(5)}`;

// ── Business / contact info ─────────────────────────────────
export const BUSINESS = {
  email: DEFAULT_SETTINGS.store.email,
  address: DEFAULT_SETTINGS.store.address,
  city: DEFAULT_SETTINGS.store.city,
  country: DEFAULT_SETTINGS.store.country,
  hours: DEFAULT_SETTINGS.store.hours,
  /** Used for the embedded map + "Get directions" link */
  mapQuery: DEFAULT_SETTINGS.store.mapQuery,
};
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.mapQuery)}&output=embed`;
export const MAP_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS.mapQuery)}`;

// ── Social links — only those with a real URL are rendered ──
export const SOCIAL_LINKS: { name: string; href: string }[] = socialLinks(DEFAULT_SETTINGS.social);

// ── Payment details ─────────────────────────────────────────
export const PAYMENT_DETAILS = DEFAULT_SETTINGS.payment;
