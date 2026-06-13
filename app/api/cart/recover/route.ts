import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  let payload: { id: string; exp: number };
  try {
    payload = JSON.parse(Buffer.from(token, "base64url").toString());
  } catch {
    return NextResponse.json({ error: "Invalid token." }, { status: 400 });
  }

  if (!payload.id || !payload.exp || Date.now() > payload.exp) {
    return NextResponse.json({ error: "Link expired." }, { status: 410 });
  }

  const supabase = createAdminClient();
  const { data: cart, error } = await supabase
    .from("abandoned_carts")
    .select("id, cart_data")
    .eq("id", payload.id)
    .single();

  if (error || !cart) {
    return NextResponse.json({ error: "Cart not found." }, { status: 404 });
  }

  await supabase
    .from("abandoned_carts")
    .update({ recovered_at: new Date().toISOString() })
    .eq("id", cart.id);

  return NextResponse.json({ cartData: cart.cart_data });
}
