import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const approvedParam = req.nextUrl.searchParams.get("approved");
  const productId = req.nextUrl.searchParams.get("product_id");

  try {
    const sb = createAdminClient();
    let query = sb
      .from("reviews")
      .select("id, product_id, user_name, user_email, rating, title, body, verified, approved, created_at, products(name)")
      .order("created_at", { ascending: false });

    if (approvedParam === "true") {
      query = query.eq("approved", true);
    } else if (approvedParam === "false") {
      query = query.eq("approved", false);
    }

    if (productId) {
      query = query.eq("product_id", productId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ reviews: data });
  } catch (err) {
    console.error("Admin reviews GET error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  }
}
