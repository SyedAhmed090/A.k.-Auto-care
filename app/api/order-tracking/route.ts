import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rateLimit";
import { checkCsrf } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const ip = getIP(req.headers);
  if (!checkRateLimit("order-tracking:" + ip, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const orderId = String(body.orderId ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!orderId || !email) {
      return NextResponse.json({ error: "Order ID and email are required." }, { status: 400 });
    }

    const normalized = orderId.startsWith("AK-") ? orderId.slice(3).toLowerCase() : orderId.toLowerCase();

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("orders")
      .select("id, status, created_at, items, subtotal, discount, shipping, total, shipping_method, tracking_number, tracking_carrier, city, first_name")
      .ilike("email", email)
      .eq("id", normalized)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order: data });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
