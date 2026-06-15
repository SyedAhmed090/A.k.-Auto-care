import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireRole } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  // Activity log is visible to owners and managers.
  const { error: authErr } = await requireRole(["owner", "manager"]);
  if (authErr) return authErr;

  try {
    const { searchParams } = req.nextUrl;
    const action = searchParams.get("action")?.trim();
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "200", 10) || 200, 500);

    const sb = createAdminClient();
    let query = (sb as any)
      .from("audit_log")
      .select("id, admin_user_id, admin_via, action, entity, entity_id, meta, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (action) query = query.ilike("action", `%${action}%`);

    const { data: entries, error } = await query;
    if (error) throw error;

    // Resolve admin_user_id -> email for display (small set).
    const ids = [...new Set((entries ?? []).map((e: { admin_user_id: string | null }) => e.admin_user_id).filter(Boolean))];
    const emails = new Map<string, string>();
    if (ids.length > 0) {
      const { data: users } = await (sb as any).from("admin_users").select("id, email").in("id", ids);
      for (const u of (users ?? []) as { id: string; email: string }[]) emails.set(u.id, u.email);
    }

    const rows = (entries ?? []).map((e: { admin_user_id: string | null; admin_via: string }) => ({
      ...e,
      actor: e.admin_user_id ? emails.get(e.admin_user_id) ?? "unknown user" : e.admin_via === "secret" ? "Owner (shared key)" : "system",
    }));

    return NextResponse.json({ entries: rows });
  } catch (err) {
    console.error("Admin audit-log GET error:", err);
    return NextResponse.json({ error: "Failed to load activity log." }, { status: 500 });
  }
}
