import { NextRequest, NextResponse } from "next/server";

// Server-side only — never exported to client
const PROMOS: Record<string, { discount: number; minSpend: number }> = {
  AKCARE10: { discount: 0.10, minSpend: 0 },
  DETAIL20: { discount: 0.20, minSpend: 50 },
  LAUNCH15: { discount: 0.15, minSpend: 0 },
};

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    const promo = PROMOS[String(code).toUpperCase()];
    if (!promo) {
      return NextResponse.json({ valid: false, reason: "Invalid promo code." });
    }
    if (subtotal < promo.minSpend) {
      return NextResponse.json({ valid: false, reason: `Minimum spend of £${promo.minSpend.toFixed(2)} required.` });
    }
    return NextResponse.json({ valid: true, discount: promo.discount });
  } catch {
    return NextResponse.json({ valid: false, reason: "Something went wrong." }, { status: 400 });
  }
}
