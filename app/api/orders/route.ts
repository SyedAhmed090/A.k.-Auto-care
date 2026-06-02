import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from("orders")
      .insert({
        email: body.email,
        first_name: body.firstName,
        last_name: body.lastName,
        address: body.address,
        city: body.city,
        postcode: body.postcode,
        country: body.country,
        items: body.items,
        subtotal: body.subtotal,
        discount: body.discount,
        shipping: body.shipping,
        total: body.total,
        promo_code: body.promoCode ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
    }

    return NextResponse.json({ orderId: data.id });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
