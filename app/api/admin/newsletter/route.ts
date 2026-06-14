import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search")?.trim() ?? "";
    const sort = searchParams.get("sort") ?? "recent";

    const sb = createAdminClient();
    let query = sb
      .from("newsletter_subscribers")
      .select("id, email, source, created_at")
      .order("created_at", { ascending: sort === "oldest" })
      .range(0, 4999);

    if (search) {
      const q = search.replace(/[%_]/g, "\\$&");
      query = query.ilike("email", `%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ subscribers: data ?? [] });
  } catch (err) {
    console.error("Admin newsletter GET error:", err);
    return NextResponse.json({ error: "Failed to fetch subscribers." }, { status: 500 });
  }
}
