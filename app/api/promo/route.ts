import { NextRequest, NextResponse } from "next/server";
import { PROMOS } from "@/lib/promos";
import { rateLimit, getIP } from "@/lib/rateLimit";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkCsrf } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const ip = getIP(req.headers);
  if (!(await rateLimit(`promo:${ip}`, 10, 60_000))) {
    return NextResponse.json({ valid: false, reason: "Too many attempts. Please wait a moment." }, { status: 429 });
  }

  try {
    const { code, subtotal } = await req.json();
    const upperCode = String(code).toUpperCase().slice(0, 30);
    const invalid   = NextResponse.json({ valid: false, reason: "This code is not valid for your order." });

    // Try DB first (requires 002_promo_codes.sql migration)
    try {
      const supabase = createAdminClient();
      const { data: promo, error } = await supabase
        .from("promo_codes")
        .select("discount, min_spend, max_uses, uses, expires_at")
        .eq("code", upperCode)
        .eq("active", true)
        .single();

      if (!error && promo) {
        if (subtotal < promo.min_spend) return invalid;
        if (promo.max_uses !== null && promo.uses >= promo.max_uses) return invalid;
        if (promo.expires_at && new Date(promo.expires_at) < new Date()) return invalid;
        return NextResponse.json({ valid: true, discount: promo.discount });
      }
    } catch {
      // DB not available — fall through to hardcoded
    }

    // Fallback: hardcoded promos
    const promo = PROMOS[upperCode];
    if (!promo || subtotal < promo.minSpend) return invalid;
    return NextResponse.json({ valid: true, discount: promo.discount });
  } catch {
    return NextResponse.json({ valid: false, reason: "Something went wrong." }, { status: 400 });
  }
}
