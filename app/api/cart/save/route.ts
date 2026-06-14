import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rateLimit";
import { checkCsrf } from "@/lib/csrf";

const cartItemSchema = z.object({
  productId: z.string().max(36),
  variantSku: z.string().max(60),
  quantity: z.number().int().min(1).max(99),
});

const cartDataSchema = z.array(cartItemSchema).max(50);

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const ip = getIP(req.headers);
  if (!checkRateLimit(`cart-save:${ip}`, 20, 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please slow down." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { sessionId, email, cartData } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ ok: false, error: "sessionId is required." }, { status: 400 });
    }

    const cartDataResult = cartDataSchema.safeParse(cartData);
    if (!cartDataResult.success) {
      return NextResponse.json({ ok: false, error: "Invalid cartData." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("abandoned_carts")
      .upsert(
        {
          session_id: sessionId,
          email: typeof email === "string" ? email : "",
          cart_data: cartDataResult.data,
          updated_at: new Date().toISOString(),
          email_sent_at: null,
        },
        { onConflict: "session_id" }
      );

    if (error) {
      return NextResponse.json({ ok: false, error: "Failed to save cart." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
