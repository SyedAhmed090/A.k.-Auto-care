import { NextRequest, NextResponse } from "next/server";
import { PROMOS } from "@/lib/promos";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Rate limit: 10 attempts per IP per minute
  const ip = getIP(req.headers);
  if (!checkRateLimit(`promo:${ip}`, 10, 60_000)) {
    return NextResponse.json({ valid: false, reason: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  try {
    const { code, subtotal } = await req.json();
    const promo = PROMOS[String(code).toUpperCase().slice(0, 30)];

    // Return same generic message for invalid code AND minimum-spend failure
    // to prevent enumeration of valid codes via response differentiation.
    if (!promo || subtotal < promo.minSpend) {
      return NextResponse.json({ valid: false, reason: "This code is not valid for your order." });
    }

    return NextResponse.json({ valid: true, discount: promo.discount });
  } catch {
    return NextResponse.json({ valid: false, reason: "Something went wrong." }, { status: 400 });
  }
}
