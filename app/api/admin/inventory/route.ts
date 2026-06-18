import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { checkCsrf } from "@/lib/csrf";

const patchSchema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().min(1).max(64),
        stock: z.number().int().min(0).max(1_000_000).nullable(),
        in_stock: z.boolean(),
      })
    )
    .max(500),
});

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

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
  // A-08: Auth must run before CSRF so an unauthenticated caller receives 401
  // rather than 403 (CSRF), preventing endpoint-existence enumeration via error
  // code differences. All other admin mutating routes follow auth-first order.
  const authError = await requireAdmin();
  if (authError) return authError;

  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid inventory data." }, { status: 400 });
    }
    const { updates } = parsed.data;
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
