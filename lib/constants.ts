// ── WhatsApp ────────────────────────────────────────────────
export const WHATSAPP_NUMBER = "923000000000"; // TODO: replace with real business number
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi! I'm interested in A.K. Auto Care products. Can you help me?"
);

// ── Payment details ────────────────────────────────────────
export const PAYMENT_DETAILS = {
  jazzcash: { number: "0300-0000000", name: "A.K. Auto Care" },
  easypaisa: { number: "0300-0000000", name: "A.K. Auto Care" },
  bank: {
    bank: "HBL",
    account: "0000-0000000-001",
    branch: "PECHS, Karachi",
    title: "A.K. Auto Care",
  },
};
