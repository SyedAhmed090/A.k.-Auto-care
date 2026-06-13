import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

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
  const ip = getIP(req.headers);
  if (!checkRateLimit(`reviews:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { product_id, user_name, user_email, rating, title, body: reviewBody } = body as Record<string, unknown>;

  if (
    typeof product_id !== "string" || product_id.trim().length < 1 ||
    typeof user_name !== "string" || user_name.trim().length < 2 ||
    typeof user_email !== "string" || !user_email.includes("@") ||
    typeof rating !== "number" || rating < 1 || rating > 5 || !Number.isInteger(rating) ||
    typeof title !== "string" || title.trim().length < 3 ||
    typeof reviewBody !== "string" || reviewBody.trim().length < 10
  ) {
    return NextResponse.json({ error: "Invalid or missing fields." }, { status: 400 });
  }

  try {
    const sb = createAdminClient();
    const { error } = await sb.from("reviews").insert({
      product_id: product_id.trim(),
      user_name: user_name.trim(),
      user_email: user_email.trim().toLowerCase(),
      rating,
      title: title.trim(),
      body: reviewBody.trim(),
      approved: false,
      verified: false,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Reviews POST error:", err);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
