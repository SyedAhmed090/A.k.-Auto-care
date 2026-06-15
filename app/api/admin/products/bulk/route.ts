import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireRole } from "@/lib/adminAuth";
import { checkCsrf } from "@/lib/csrf";
import type { Database } from "@/types/supabase";

type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

/**
 * Bulk operations on products.
 *
 * Prices in this schema live in TWO places:
 *   - products.price          (base / display price)
 *   - product_variants.price  (per-variant price)
 * A price adjustment is applied to BOTH so the listing price range and the
 * base price stay consistent. Resulting prices are rounded to whole integers
 * (the columns are int) and clamped to a minimum of 0 (no negative prices).
 */
const operationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("featured"), value: z.boolean() }),
  z.object({ type: z.literal("category"), category_slug: z.string().min(1).max(60) }),
  z.object({ type: z.literal("in_stock"), value: z.boolean() }),
  z.object({ type: z.literal("price_percent"), percent: z.number().gte(-100).lte(1000) }),
  z.object({ type: z.literal("price_fixed"), amount: z.number().int() }),
]);

const schema = z.object({
  ids: z.array(z.string().min(1).max(20)).min(1).max(200),
  operation: operationSchema,
});

const clampPrice = (n: number) => Math.max(0, Math.round(n));

export async function PATCH(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const { error: authError } = await requireRole(["owner", "manager"]);
  if (authError) return authError;

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data.", details: parsed.error.flatten() }, { status: 400 });
    }

    const { ids, operation } = parsed.data;
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Simple field updates — one batched UPDATE for all selected products.
    if (operation.type === "featured" || operation.type === "in_stock" || operation.type === "category") {
      const patch: ProductUpdate = { updated_at: now };
      if (operation.type === "featured") patch.featured = operation.value;
      else if (operation.type === "in_stock") patch.in_stock = operation.value;
      else patch.category_slug = operation.category_slug;

      const { error } = await supabase.from("products").update(patch).in("id", ids);
      if (error) throw error;
      return NextResponse.json({ updated: ids.length });
    }

    // Price adjustments — need current values to compute the new price, so we
    // read the affected products + their variants, then write per row.
    const factor = operation.type === "price_percent" ? 1 + operation.percent / 100 : 1;
    const delta = operation.type === "price_fixed" ? operation.amount : 0;
    const newPrice = (current: number) =>
      operation.type === "price_percent" ? clampPrice(current * factor) : clampPrice(current + delta);

    const { data: products, error: readErr } = await supabase
      .from("products")
      .select("id, price, product_variants(id, price)")
      .in("id", ids);
    if (readErr) throw readErr;

    type Row = { id: string; price: number; product_variants: { id: string; price: number }[] };
    const rows = (products ?? []) as Row[];

    // Update base price per product.
    await Promise.all(
      rows.map((p) =>
        supabase
          .from("products")
          .update({ price: newPrice(p.price), updated_at: now })
          .eq("id", p.id)
      )
    ).then((results) => {
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    });

    // Update each variant's price.
    const variants = rows.flatMap((p) => p.product_variants ?? []);
    await Promise.all(
      variants.map((v) =>
        supabase.from("product_variants").update({ price: newPrice(v.price) }).eq("id", v.id)
      )
    ).then((results) => {
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    });

    return NextResponse.json({ updated: rows.length, variantsUpdated: variants.length });
  } catch (err) {
    console.error("Admin products bulk PATCH error:", err);
    return NextResponse.json({ error: "Bulk update failed." }, { status: 500 });
  }
}
