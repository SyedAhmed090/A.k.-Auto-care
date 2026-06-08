// ── WhatsApp ────────────────────────────────────────────────
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi! I'm interested in A.K. Auto Care products. Can you help me?"
);

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
