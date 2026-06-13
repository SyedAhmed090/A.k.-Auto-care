import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("products")
      .select("id, name, slug, stock, in_stock, category_slug, product_variants(id, sku, label, price)")
      .order("sort_order");
    if (error) throw error;
    return NextResponse.json({ products: data });
  } catch (err) {
    console.error("Admin inventory GET error:", err);
    return NextResponse.json({ error: "Failed to fetch inventory." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const updates: Array<{ id: string; stock: number | null; in_stock: boolean }> = body.updates ?? [];
    const sb = createAdminClient();
    for (const { id, stock, in_stock } of updates) {
      const { error } = await sb.from("products").update({ stock, in_stock }).eq("id", id);
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin inventory PATCH error:", err);
    return NextResponse.json({ error: "Failed to update inventory." }, { status: 500 });
  }
}
