import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

interface CartItem { productName?: string; price?: number; quantity?: number; image?: string; }

function cartValue(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0);
}

function itemCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = req.nextUrl;
    const filter = searchParams.get("filter") ?? "all"; // all | recovered | pending

    const sb = createAdminClient();
    const { data, error } = await sb
      .from("abandoned_carts")
      .select("id, email, cart_data, created_at, email_sent_at, recovered_at")
      .neq("cart_data", "[]")
      .order("created_at", { ascending: false })
      .range(0, 999);
    if (error) throw error;

    const all = (data ?? []).map((c) => {
      const items = (Array.isArray(c.cart_data) ? c.cart_data : []) as unknown as CartItem[];
      return {
        id: c.id,
        email: c.email,
        items,
        item_count: itemCount(items),
        value: cartValue(items),
        created_at: c.created_at,
        email_sent: !!c.email_sent_at,
        recovered: !!c.recovered_at,
      };
    });

    // Summary always reflects every abandoned cart, independent of the active filter.
    const summary = {
      abandoned: all.length,
      emailed: all.filter((c) => c.email_sent).length,
      recovered: all.filter((c) => c.recovered).length,
      recovered_value: all.filter((c) => c.recovered).reduce((s, c) => s + c.value, 0),
    };

    const carts =
      filter === "recovered" ? all.filter((c) => c.recovered) :
      filter === "pending"   ? all.filter((c) => !c.recovered) :
      all;

    return NextResponse.json({ carts, summary });
  } catch (err) {
    console.error("Admin abandoned-carts GET error:", err);
    return NextResponse.json({ error: "Failed to fetch abandoned carts." }, { status: 500 });
  }
}
