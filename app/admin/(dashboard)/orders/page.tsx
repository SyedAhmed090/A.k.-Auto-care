import { createAdminClient } from "@/utils/supabase/admin";
import OrdersClient, { AdminOrder } from "./OrdersClient";

const LIMIT = 25;

async function getOrders(opts: { status: string; search: string; dateFrom: string; dateTo: string; page: number }) {
  try {
    const supabase = createAdminClient();
    const offset = (opts.page - 1) * LIMIT;

    let query = supabase
      .from("orders")
      .select(
        "id, email, phone, first_name, last_name, city, total, status, payment_method, shipping_method, created_at, tracking_number",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + LIMIT - 1);

    if (opts.status && opts.status !== "all") query = query.eq("status", opts.status);

    if (opts.search) {
      const s = opts.search.replace(/[%_]/g, "\\$&");
      query = query.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`);
    }

    if (opts.dateFrom) query = query.gte("created_at", `${opts.dateFrom}T00:00:00`);
    if (opts.dateTo)   query = query.lte("created_at", `${opts.dateTo}T23:59:59`);

    const { data, count, error } = await query;
    if (error) throw error;
    return { orders: (data ?? []) as AdminOrder[], total: count ?? 0 };
  } catch {
    return { orders: [] as AdminOrder[], total: 0 };
  }
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp      = await searchParams;
  const status   = sp.status   ?? "all";
  const search   = sp.search   ?? "";
  const dateFrom = sp.dateFrom ?? "";
  const dateTo   = sp.dateTo   ?? "";
  const page     = Math.max(1, parseInt(sp.page ?? "1"));

  const { orders, total } = await getOrders({ status, search, dateFrom, dateTo, page });
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <OrdersClient
      orders={orders}
      total={total}
      page={page}
      totalPages={totalPages}
      filters={{ status, search, dateFrom, dateTo }}
    />
  );
}
