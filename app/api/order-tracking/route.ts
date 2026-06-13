import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!orderId || !email) {
      return NextResponse.json({ error: "Order ID and email are required." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("orders")
      .select("id, status, created_at, items, subtotal, discount, shipping, total, shipping_method, tracking_number, tracking_carrier, city, first_name")
      .ilike("email", email)
      .ilike("id::text", `${orderId}%`)
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order: data });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
