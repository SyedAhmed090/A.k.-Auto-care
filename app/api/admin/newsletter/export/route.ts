import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search")?.trim();

    const sb = createAdminClient();
    let query = sb
      .from("newsletter_subscribers")
      .select("email, source, created_at")
      .order("created_at", { ascending: false });

    if (search) {
      const q = search.replace(/[%_]/g, "\\$&");
      query = query.ilike("email", `%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    const subs = data ?? [];
    const esc = (v: unknown) => { const s = String(v ?? ""); const safe = /^[=+\-@|\t\r]/.test(s) ? "'" + s : s; return '"' + safe.replace(/"/g, '""') + '"'; };

    const cols = ["Email", "Source", "Signed Up"];
    const rows = subs.map(s => [
      s.email,
      s.source ?? "",
      new Date(s.created_at ?? "").toLocaleDateString("en-PK"),
    ].map(esc).join(","));

    const csv = [cols.map(esc).join(","), ...rows].join("\n");
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ak-newsletter-${date}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
