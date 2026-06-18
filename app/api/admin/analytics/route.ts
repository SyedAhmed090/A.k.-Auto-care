import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";

const EXCLUDED = ["cancelled", "refunded"];

type LineItem = {
  productId?: string;
  productName?: string;
  variantSku?: string;
  price?: number;
  quantity?: number;
};

type OrderRow = {
  email: string;
  total: number | null;
  status: string | null;
  created_at: string | null;
  items: unknown;
};

function startOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 1)).toISOString();
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const supabase = createAdminClient();

    // D-05: Default to the last 90 days to avoid unbounded table scans.
    // PostgREST silently caps at 1000 rows without a .limit() — analytics would
    // be silently wrong once orders exceeds 1000 rows. Cap at 10 000 rows
    // which is well above any realistic single-year order volume for this store.
    const DEFAULT_DAYS = 90;
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - DEFAULT_DAYS);
    const sinceIso = since.toISOString();

    const [ordersRes, productsRes] = await Promise.all([
      supabase
        .from("orders")
        .select("email, total, status, created_at, items")
        .gte("created_at", sinceIso)
        .order("created_at", { ascending: true })
        .limit(10000),
      supabase.from("products").select("id, name, category_slug"),
    ]);

    if (ordersRes.error) throw ordersRes.error;

    const orders = (ordersRes.data ?? []) as OrderRow[];
    const products = productsRes.data ?? [];

    // product id -> category slug, and product name -> category slug (fallback
    // when a line item lacks productId, e.g. legacy orders).
    const categoryByProduct = new Map<string, string>();
    const categoryByName = new Map<string, string>();
    for (const p of products) {
      if (p.id) categoryByProduct.set(p.id, p.category_slug ?? "uncategorized");
      if (p.name) categoryByName.set(p.name.toLowerCase(), p.category_slug ?? "uncategorized");
    }

    // Only count revenue-bearing orders (exclude cancelled/refunded)
    const validOrders = orders.filter(
      (o) => !EXCLUDED.includes(o.status ?? "")
    );

    // ---- AOV & total revenue ----
    const totalRevenue = validOrders.reduce(
      (acc, o) => acc + Number(o.total ?? 0),
      0
    );
    const aov = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    // ---- Best-selling products (qty + revenue) from items JSONB ----
    const productAgg = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();
    const categoryAgg = new Map<string, number>();

    for (const o of validOrders) {
      const items = Array.isArray(o.items) ? (o.items as LineItem[]) : [];
      for (const it of items) {
        const qty = Number(it.quantity ?? 0);
        const lineRevenue = Number(it.price ?? 0) * qty;
        const key = it.productId ?? it.variantSku ?? it.productName ?? "unknown";
        const name = it.productName ?? "Unknown product";

        const prev = productAgg.get(key) ?? { name, quantity: 0, revenue: 0 };
        prev.quantity += qty;
        prev.revenue += lineRevenue;
        prev.name = name;
        productAgg.set(key, prev);

        // category mapping via product id, falling back to product name
        const cat =
          (it.productId && categoryByProduct.get(it.productId)) ||
          (it.productName && categoryByName.get(it.productName.toLowerCase())) ||
          "uncategorized";
        categoryAgg.set(cat, (categoryAgg.get(cat) ?? 0) + lineRevenue);
      }
    }

    const productList = Array.from(productAgg.entries()).map(([id, v]) => ({
      productId: id,
      name: v.name,
      quantity: v.quantity,
      revenue: v.revenue,
    }));

    const topByQuantity = [...productList]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    const topByRevenue = [...productList]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const revenueByCategory = Array.from(categoryAgg.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // ---- Repeat-customer rate (keyed by email) ----
    const ordersPerEmail = new Map<string, number>();
    for (const o of validOrders) {
      const email = (o.email ?? "").toLowerCase().trim();
      if (!email) continue;
      ordersPerEmail.set(email, (ordersPerEmail.get(email) ?? 0) + 1);
    }
    const totalCustomers = ordersPerEmail.size;
    const repeatCustomers = Array.from(ordersPerEmail.values()).filter(
      (c) => c > 1
    ).length;
    const repeatCustomerRate =
      totalCustomers > 0 ? repeatCustomers / totalCustomers : 0;

    // ---- Revenue this month vs last month ----
    const now = new Date();
    const thisMonthStart = startOfMonth(
      now.getUTCFullYear(),
      now.getUTCMonth()
    );
    const lastMonthStart = startOfMonth(
      now.getUTCFullYear(),
      now.getUTCMonth() - 1
    );

    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;
    let thisMonthOrders = 0;
    let lastMonthOrders = 0;
    for (const o of validOrders) {
      const ts = o.created_at ?? "";
      if (ts >= thisMonthStart) {
        thisMonthRevenue += Number(o.total ?? 0);
        thisMonthOrders += 1;
      } else if (ts >= lastMonthStart && ts < thisMonthStart) {
        lastMonthRevenue += Number(o.total ?? 0);
        lastMonthOrders += 1;
      }
    }
    const monthChangePct =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : thisMonthRevenue > 0
        ? 100
        : 0;

    // ---- New vs returning (this month) ----
    // Walk orders in chronological order; a customer's order this month counts
    // as "returning" if we've already seen that email earlier, else "new".
    let newCustomers = 0;
    let returningCustomers = 0;
    const seenEmails = new Set<string>();
    for (const o of validOrders) {
      const email = (o.email ?? "").toLowerCase().trim();
      if (!email) continue;
      const ts = o.created_at ?? "";
      if (ts >= thisMonthStart) {
        if (seenEmails.has(email)) returningCustomers += 1;
        else newCustomers += 1;
      }
      seenEmails.add(email);
    }

    const roundProducts = (
      list: { productId: string; name: string; quantity: number; revenue: number }[]
    ) => list.map((p) => ({ ...p, revenue: Math.round(p.revenue) }));

    return NextResponse.json({
      aov: Math.round(aov),
      totalRevenue: Math.round(totalRevenue),
      validOrderCount: validOrders.length,
      topProducts: {
        byQuantity: roundProducts(topByQuantity),
        byRevenue: roundProducts(topByRevenue),
      },
      revenueByCategory: revenueByCategory.map((c) => ({
        ...c,
        revenue: Math.round(c.revenue),
      })),
      repeatCustomers: {
        totalCustomers,
        repeatCustomers,
        rate: Number((repeatCustomerRate * 100).toFixed(1)),
      },
      monthComparison: {
        thisMonthRevenue: Math.round(thisMonthRevenue),
        lastMonthRevenue: Math.round(lastMonthRevenue),
        thisMonthOrders,
        lastMonthOrders,
        changePct: Number(monthChangePct.toFixed(1)),
      },
      newVsReturning: {
        newCustomers,
        returningCustomers,
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics." },
      { status: 500 }
    );
  }
}
