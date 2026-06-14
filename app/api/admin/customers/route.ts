import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search")?.trim() ?? "";
    const sort = searchParams.get("sort") ?? "spend";

    const sb = createAdminClient();
    const { data, error } = await sb
      .from("orders")
      .select("email, first_name, last_name, phone, city, total, created_at");
    if (error) throw error;

    const map = new Map<string, {
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      city: string;
      order_count: number;
      total_spend: number;
      last_order_at: string;
    }>();

    for (const row of data ?? []) {
      const key = row.email?.toLowerCase() ?? "";
      if (!key) continue;
      const existing = map.get(key);
      if (existing) {
        existing.order_count += 1;
        existing.total_spend += Number(row.total ?? 0);
        if (row.created_at > existing.last_order_at) existing.last_order_at = row.created_at;
      } else {
        map.set(key, {
          email: row.email,
          first_name: row.first_name ?? "",
          last_name: row.last_name ?? "",
          phone: row.phone ?? "",
          city: row.city ?? "",
          order_count: 1,
          total_spend: Number(row.total ?? 0),
          last_order_at: row.created_at,
        });
      }
    }

    let customers = Array.from(map.values());

    if (search) {
      const q = search.toLowerCase();
      customers = customers.filter(
        (c) =>
          c.email.toLowerCase().includes(q) ||
          c.first_name.toLowerCase().includes(q) ||
          c.last_name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      );
    }

    if (sort === "orders") {
      customers.sort((a, b) => b.order_count - a.order_count);
    } else if (sort === "recent") {
      customers.sort((a, b) => (a.last_order_at < b.last_order_at ? 1 : -1));
    } else {
      customers.sort((a, b) => b.total_spend - a.total_spend);
    }

    return NextResponse.json({ customers });
  } catch (err) {
    console.error("Admin customers GET error:", err);
    return NextResponse.json({ error: "Failed to fetch customers." }, { status: 500 });
  }
}
