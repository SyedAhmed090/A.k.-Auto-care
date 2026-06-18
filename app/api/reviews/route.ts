import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { rateLimit, getIP } from "@/lib/rateLimit";
import { checkCsrf } from "@/lib/csrf";

const reviewSchema = z.object({
  product_id: z.string().min(1).max(50),
  user_name: z.string().min(2).max(100),
  user_email: z.string().email().max(254).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(200),
  body: z.string().min(10).max(2000),
});

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("product_id");
  if (!productId) {
    return NextResponse.json({ error: "product_id is required." }, { status: 400 });
  }
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("reviews")
      .select("id, product_id, user_name, rating, title, body, verified, created_at")
      .eq("product_id", productId)
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ reviews: data });
  } catch (err) {
    console.error("Reviews GET error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const ip = getIP(req.headers);
  if (!(await rateLimit(`reviews:${ip}`, 3, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid fields." }, { status: 400 });

  const { product_id, user_name, user_email, rating, title, body: reviewBody } = parsed.data;
  const emailStr = user_email ? user_email.trim().toLowerCase() : "";

  try {
    const sb = createAdminClient();

    // If an email was provided, check whether it matches an order for this product.
    let verified = false;
    if (emailStr.length > 0) {
      const { data: orderMatch } = await sb
        .from("orders")
        .select("id")
        .eq("email", emailStr)
        .contains("items", [{ productId: product_id.trim() }])
        .limit(1)
        .maybeSingle();
      verified = orderMatch !== null;
    }

    const { error } = await sb.from("reviews").insert({
      product_id: product_id.trim(),
      user_name: user_name.trim(),
      user_email: emailStr,
      rating,
      title: title.trim(),
      body: reviewBody.trim(),
      approved: false,
      verified,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Reviews POST error:", err);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
