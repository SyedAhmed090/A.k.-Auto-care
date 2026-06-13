import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";

const variantSchema = z.object({
  label:      z.string().min(1).max(80),
  price:      z.number().int().min(0),
  sku:        z.string().min(1).max(60),
  sort_order: z.number().int().default(0),
});

const patchSchema = z.object({
  slug:         z.string().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  name:         z.string().min(1).max(120).optional(),
  category_slug: z.string().min(1).max(60).optional(),
  tagline:      z.string().min(1).max(200).optional(),
  badge:        z.string().max(40).nullable().optional(),
  description:  z.string().min(1).max(5000).optional(),
  how_to_use:   z.string().min(1).max(2000).optional(),
  specs:        z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  images:       z.array(z.string().url()).optional(),
  price:        z.number().int().min(0).optional(),
  stock:        z.number().int().min(0).nullable().optional(),
  in_stock:     z.boolean().optional(),
  featured:     z.boolean().optional(),
  sort_order:   z.number().int().optional(),
  variants:     z.array(variantSchema).min(1).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("products")
      .select("*, product_variants(id, label, price, sku, sort_order)")
      .eq("id", id)
      .order("sort_order", { referencedTable: "product_variants" })
      .single();
    if (error) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ product: data });
  } catch (err) {
    console.error("Admin product GET error:", err);
    return NextResponse.json({ error: "Failed to fetch product." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data.", details: parsed.error.flatten() }, { status: 400 });
    }
    const { variants, ...productData } = parsed.data;
    const sb = createAdminClient();

    if (Object.keys(productData).length > 0) {
      const { error } = await sb.from("products").update(productData).eq("id", id);
      if (error) throw error;
    }

    if (variants) {
      await sb.from("product_variants").delete().eq("product_id", id);
      const variantRows = variants.map((v, i) => ({
        product_id: id,
        label:      v.label,
        price:      v.price,
        sku:        v.sku,
        sort_order: v.sort_order ?? i,
      }));
      const { error } = await sb.from("product_variants").insert(variantRows);
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin product PATCH error:", err);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const sb = createAdminClient();
    const { error } = await sb.from("products").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin product DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
