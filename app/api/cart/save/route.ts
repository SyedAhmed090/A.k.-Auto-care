import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, email, cartData } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ ok: false, error: "sessionId is required." }, { status: 400 });
    }
    if (!Array.isArray(cartData) || cartData.length > 50) {
      return NextResponse.json({ ok: false, error: "cartData must be an array with at most 50 items." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("abandoned_carts")
      .upsert(
        {
          session_id: sessionId,
          email: typeof email === "string" ? email : "",
          cart_data: cartData,
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
