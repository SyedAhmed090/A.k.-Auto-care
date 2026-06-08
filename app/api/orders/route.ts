import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import products from "@/data/products";
import { getShippingOptions } from "@/lib/commerce";
import { PROMOS } from "@/lib/promos";
import { createAdminClient } from "@/utils/supabase/admin";
import { checkRateLimit, getIP } from "@/lib/rateLimit";
import { checkCsrf } from "@/lib/csrf";
import { buildOrderConfirmationHtml } from "@/lib/email";

const itemSchema = z.object({
  productId:  z.string().max(20),
  variantSku: z.string().max(40),
  quantity:   z.number().int().min(1).max(99),
});

const orderSchema = z.object({
  email:          z.string().email().max(254),
  phone:          z.string().min(10).max(20),
  firstName:      z.string().min(2).max(80),
  lastName:       z.string().min(2).max(80),
  address:        z.string().min(5).max(300),
  city:           z.string().min(2).max(100),
  province:       z.string().max(100).optional(),
  postcode:       z.string().min(3).max(20),
  country:        z.string().min(2).max(2),
  shippingMethod: z.string().max(40),
  paymentMethod:  z.enum(["cod","jazzcash","easypaisa","bank"]).default("cod"),
  items:          z.array(itemSchema).min(1).max(50),
  promoCode:      z.string().max(30).nullable().optional(),
});

export async function POST(req: NextRequest) {
  const csrfError = checkCsrf(req);
  if (csrfError) return csrfError;

  const ip = getIP(req.headers);
  if (!checkRateLimit(`orders:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  try {
    const body   = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid order data." }, { status: 400 });
    const data = parsed.data;

    // Load reserved quantities from DB to calculate true available stock
    const supabase = createAdminClient();
    const productIds = data.items.map(i => i.productId);
    const { data: reservedRows } = await supabase
      .from("product_stock")
      .select("product_id, reserved")
      .in("product_id", productIds);
    const reservedMap = new Map(
      (reservedRows ?? []).map(r => [r.product_id as string, r.reserved as number])
    );

    // Server-side price computation — never trust client prices
    const lineItems: {
      productId: string; productName: string; variantLabel: string;
      variantSku: string; price: number; quantity: number; image: string;
    }[] = [];
    let subtotal = 0;

    for (const item of data.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || !product.inStock) {
        return NextResponse.json({ error: `Product ${item.productId} is unavailable.` }, { status: 400 });
      }
      const variant = product.variants.find(v => v.sku === item.variantSku);
      if (!variant) {
        return NextResponse.json({ error: `Variant ${item.variantSku} not found.` }, { status: 400 });
      }
      const reserved = reservedMap.get(product.id) ?? 0;
      const available = (product.stock ?? 99) - reserved;
      if (available <= 0) {
        return NextResponse.json({ error: `${product.name} is out of stock.` }, { status: 400 });
      }
      const qty = Math.min(item.quantity, available);
      lineItems.push({
        productId: product.id, productName: product.name,
        variantLabel: variant.label, variantSku: variant.sku,
        price: variant.price, quantity: qty, image: product.images[0] ?? "",
      });
      subtotal = parseFloat((subtotal + variant.price * qty).toFixed(2));
    }

    // Re-validate promo server-side — try DB first, fall back to hardcoded
    let discount  = 0;
    let promoUsed: { id: string } | null = null;
    let dbAttempted = false;
    const promoCode = data.promoCode ? data.promoCode.toUpperCase() : null;

    if (promoCode) {
      try {
        const { data: p, error } = await supabase
          .from("promo_codes")
          .select("id, discount, min_spend, max_uses, uses, expires_at")
          .eq("code", promoCode)
          .eq("active", true)
          .single();

        dbAttempted = true;

        if (!error && p && subtotal >= p.min_spend) {
          const notExpired  = !p.expires_at || new Date(p.expires_at) >= new Date();
          const notExhausted = p.max_uses === null || p.uses < p.max_uses;
          if (notExpired && notExhausted) {
            discount  = parseFloat((subtotal * p.discount).toFixed(2));
            promoUsed = { id: p.id };
          }
        }
      } catch {
        // DB unavailable — fall through to hardcoded fallback
      }

      // Fall back to hardcoded only if the DB was not reachable (not if DB rejected the code)
      if (!dbAttempted) {
        const p = PROMOS[promoCode];
        if (p && subtotal >= p.minSpend) {
          discount = parseFloat((subtotal * p.discount).toFixed(2));
        }
      }
    }

    const afterDiscount = parseFloat((subtotal - discount).toFixed(2));
    const shippingOptions = getShippingOptions(data.country, subtotal);
    const selectedShipping = shippingOptions.find(o => o.id === data.shippingMethod) ?? shippingOptions[0];
    const shippingCost = selectedShipping?.price ?? 0;
    const total = parseFloat((afterDiscount + shippingCost).toFixed(2));

    const { data: row, error } = await supabase
      .from("orders")
      .insert({
        email: data.email, phone: data.phone,
        first_name: data.firstName, last_name: data.lastName,
        address: data.address, city: data.city, province: data.province ?? null, postcode: data.postcode, country: data.country,
        shipping_method: selectedShipping?.label ?? "Standard",
        payment_method: data.paymentMethod,
        items: lineItems, subtotal, discount, shipping: shippingCost, total,
        promo_code: promoCode, status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save order." }, { status: 500 });
    }

    // Atomic promo increment — requires 003_stock_functions.sql migration
    if (promoUsed) {
      try {
        await supabase.rpc("increment_promo_uses", { promo_id: promoUsed.id });
      } catch {
        // RPC not yet migrated — fall back to non-atomic update
        const { data: cur } = await supabase.from("promo_codes").select("uses").eq("id", promoUsed.id).single();
        if (cur) await supabase.from("promo_codes").update({ uses: cur.uses + 1 }).eq("id", promoUsed.id);
      }
    }

    // Reserve stock — requires 003_stock_functions.sql migration (best-effort)
    try {
      await Promise.all(
        lineItems.map((item) =>
          supabase.rpc("reserve_stock", { p_product_id: item.productId, qty: item.quantity })
        )
      );
    } catch {
      // Migration not yet run — stock tracking unavailable
    }

    // Send order confirmation email via Resend (requires RESEND_API_KEY in .env.local)
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.CONTACT_EMAIL_FROM ?? "noreply@akautocare.pk",
            to: data.email,
            subject: `Order Confirmed — #${row.id.slice(0, 8).toUpperCase()}`,
            html: buildOrderConfirmationHtml({
              orderId: row.id,
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              items: lineItems,
              subtotal,
              discount,
              shipping: shippingCost,
              total,
              shippingMethod: selectedShipping?.label ?? "Standard",
              paymentMethod: data.paymentMethod,
              city: data.city,
              address: data.address,
            }),
          }),
        });
      } catch {
        // Non-fatal — order is saved, email is best-effort
      }
    }

    return NextResponse.json({ orderId: row.id });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
