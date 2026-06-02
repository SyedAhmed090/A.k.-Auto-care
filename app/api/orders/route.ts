import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import products from "@/data/products";
import { getShippingOptions } from "@/lib/commerce";
import { PROMOS } from "@/lib/promos";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

const itemSchema = z.object({
  productId: z.string().max(20),
  variantSku: z.string().max(40),
  quantity: z.number().int().min(1).max(99),
});

const orderSchema = z.object({
  email: z.string().email().max(254),
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  address: z.string().min(5).max(300),
  city: z.string().min(2).max(100),
  postcode: z.string().min(3).max(20),
  country: z.string().min(2).max(2),
  shippingMethod: z.string().max(40),
  paymentMethod: z.enum(["cod", "jazzcash", "easypaisa", "bank"]).default("cod"),
  items: z.array(itemSchema).min(1).max(50),
  promoCode: z.string().max(30).nullable().optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 orders per IP per minute
  const ip = getIP(req.headers);
  if (!checkRateLimit(`orders:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid order data." }, { status: 400 });
    }
    const data = parsed.data;

    // Recompute line items and subtotal from authoritative server-side product data.
    // Client-supplied prices are ignored — prices are always read from the product catalogue.
    const lineItems: {
      productId: string;
      productName: string;
      variantLabel: string;
      variantSku: string;
      price: number;
      quantity: number;
      image: string;
    }[] = [];
    let subtotal = 0;

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || !product.inStock) {
        return NextResponse.json({ error: `Product ${item.productId} is unavailable.` }, { status: 400 });
      }
      const variant = product.variants.find((v) => v.sku === item.variantSku);
      if (!variant) {
        return NextResponse.json({ error: `Variant ${item.variantSku} not found.` }, { status: 400 });
      }
      const qty = Math.min(item.quantity, product.stock ?? 99);
      lineItems.push({
        productId: product.id,
        productName: product.name,
        variantLabel: variant.label,
        variantSku: variant.sku,
        price: variant.price,
        quantity: qty,
        image: product.images[0] ?? "",
      });
      subtotal = parseFloat((subtotal + variant.price * qty).toFixed(2));
    }

    // Re-validate promo code server-side (same source of truth as /api/promo).
    let discount = 0;
    const promoCode = data.promoCode ? data.promoCode.toUpperCase() : null;
    if (promoCode) {
      const promo = PROMOS[promoCode];
      if (promo && subtotal >= promo.minSpend) {
        discount = parseFloat((subtotal * promo.discount).toFixed(2));
      }
    }

    const afterDiscount = parseFloat((subtotal - discount).toFixed(2));

    // Compute shipping from the destination address, not from the client.
    const shippingOptions = getShippingOptions(data.country, afterDiscount);
    const selectedShipping =
      shippingOptions.find((o) => o.id === data.shippingMethod) ?? shippingOptions[0];
    const shippingCost = selectedShipping?.price ?? 0;

    const total = parseFloat((afterDiscount + shippingCost).toFixed(2));

    const supabase = createAdminClient();

    const { data: row, error } = await supabase
      .from("orders")
      .insert({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        address: data.address,
        city: data.city,
        postcode: data.postcode,
        country: data.country,
        shipping_method: selectedShipping?.label ?? "Standard",
        payment_method: data.paymentMethod,
        items: lineItems,
        subtotal,
        discount,
        shipping: shippingCost,
        total,
        promo_code: promoCode,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save order." }, { status: 500 });
    }

    return NextResponse.json({ orderId: row.id });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
