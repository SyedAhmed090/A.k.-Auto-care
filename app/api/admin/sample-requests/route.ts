import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { sanitizeSearchTerm } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const sb = createAdminClient();
    let query = sb
      .from("sample_requests")
      .select("id, product_id, product_name, product_slug, name, phone, email, city, address, business_name, monthly_usage, status, created_at")
      .order("created_at", { ascending: false })
      .range(0, 999);

    if (status && status !== "all") query = query.eq("status", status);
    if (search) {
      const q = sanitizeSearchTerm(search);
      if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,business_name.ilike.%${q}%,product_name.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // New (unworked) count for the nav badge / summary, independent of the filter.
    const { count: newCount } = await sb
      .from("sample_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");

    return NextResponse.json({ requests: data ?? [], newCount: newCount ?? 0 });
  } catch (err) {
    console.error("Admin sample-requests GET error:", err);
    return NextResponse.json({ error: "Failed to fetch sample requests." }, { status: 500 });
  }
}
