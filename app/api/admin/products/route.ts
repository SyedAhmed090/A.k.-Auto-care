import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { checkCsrf } from "@/lib/csrf";

const variantSchema = z.object({
  label:      z.string().min(1).max(80),
  price:      z.number().int().min(0),
  sku:        z.string().min(1).max(60),
  sort_order: z.number().int().default(0),
});

const productSchema = z.object({
  id:           z.string().min(1).max(20).optional(),
  slug:         z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  name:         z.string().min(1).max(120),
  category_slug: z.string().min(1).max(60),
  tagline:      z.string().min(1).max(200),
  badge:        z.string().max(40).nullable().optional(),
  description:  z.string().min(1).max(5000),
  how_to_use:   z.string().min(1).max(2000),
  specs:        z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  images:       z.array(z.string().url()).default([]),
  price:        z.number().int().min(0),
  stock:        z.number().int().min(0).nullable().optional(),
  in_stock:     z.boolean().default(true),
  featured:     z.boolean().default(false),
  sort_order:   z.number().int().default(0),
  variants:     z.array(variantSchema).min(1),
});

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const sb = createAdminClient();
    const { data, error } = await sb
      .from("products")
      .select("*, product_variants(id, label, price, sku, sort_order)")
      .order("sort_order")
      .order("sort_order", { referencedTable: "product_variants" });
    if (error) throw error;
    return NextResponse.json({ products: data });
  } catch (err) {
    console.error("Admin products GET error:", err);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data.", details: parsed.error.flatten() }, { status: 400 });
    }
    const { variants, id, ...productData } = parsed.data;

    const sb = createAdminClient();
    const insertData = id ? { id, ...productData } : productData;
    const { data: product, error: productError } = await sb
      .from("products")
      .insert(insertData as any)
      .select("id")
      .single();
    if (productError) throw productError;

    const variantRows = variants.map((v, i) => ({
      product_id: product.id,
      label:      v.label,
      price:      v.price,
      sku:        v.sku,
      sort_order: v.sort_order ?? i,
    }));
    const { error: variantError } = await sb.from("product_variants").insert(variantRows);
    if (variantError) throw variantError;

    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (err) {
    console.error("Admin products POST error:", err);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
