import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { rateLimit, getIP } from "@/lib/rateLimit";
import { checkCsrf } from "@/lib/csrf";

const schema = z.object({
  orderId: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(254),
});

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const ip = getIP(req.headers);
  if (!(await rateLimit("order-tracking:" + ip, 10, 60_000))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Order ID and a valid email are required." }, { status: 400 });
    }
    const { orderId, email } = parsed.data;

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
