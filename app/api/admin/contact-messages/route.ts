import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const sb = createAdminClient();
    let query = sb
      .from("contact_messages")
      .select("id, name, email, subject, message, status, created_at")
      .order("created_at", { ascending: false })
      .range(0, 999);

    if (status && status !== "all") query = query.eq("status", status);
    if (search) {
      const q = search.replace(/[%_]/g, "\\$&");
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,subject.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Unread (new) count for the nav badge / summary, independent of the active filter.
    const { count: newCount } = await sb
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");

    return NextResponse.json({ messages: data ?? [], newCount: newCount ?? 0 });
  } catch (err) {
    console.error("Admin contact-messages GET error:", err);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }
}
