// Server-side promo definitions — never imported on the client.
// Codes are validated via POST /api/promo and re-validated in POST /api/orders.
export const PROMOS: Record<string, { discount: number; minSpend: number }> = {
  AKCARE10: { discount: 0.10, minSpend: 0 },
  DETAIL20: { discount: 0.20, minSpend: 5000 }, // Rs 5,000 minimum spend
  LAUNCH15: { discount: 0.15, minSpend: 0 },
};
