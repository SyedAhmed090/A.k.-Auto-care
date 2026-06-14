import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

function verifyCartToken(token: string): { id: string; exp: number } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigHex] = parts;
  let payload: { id: string; exp: number };
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
  } catch {
    return null;
  }
  if (!payload.id || !payload.exp) return null;
  const secret = process.env.CART_RECOVERY_SECRET;
  if (!secret) return null;
  const expected = createHmac("sha256", secret)
    .update(`${payload.id}:${payload.exp}`)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  let sigBuf: Buffer;
  try {
    sigBuf = Buffer.from(sigHex, "hex");
  } catch {
    return null;
  }
  if (expectedBuf.length !== sigBuf.length) return null;
  if (!timingSafeEqual(expectedBuf, sigBuf)) return null;
  return payload;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  const payload = verifyCartToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token." }, { status: 400 });
  }

  if (Date.now() > payload.exp) {
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
