import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/lib/adminAuth";
import { sanitizeSearchTerm } from "@/lib/utils";

// Win-back / nurture windows (days). Used to derive segments below.
const AT_RISK_DAYS = 90;
const NEW_WINDOW_DAYS = 30;
// "VIP" = top spenders: customers at/above this spend percentile of the result set.
const VIP_PERCENTILE = 0.8;

export type CustomerSegment = "vip" | "repeat" | "at-risk" | "new";

type SummaryRow = {
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  order_count: number;
  total_spend: number;
  average_order_value: number | null;
  first_order_at: string | null;
  last_order_at: string | null;
};

type ProfileRow = {
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postcode: string | null;
  country: string | null;
};

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.floor(ms / 86_400_000);
}

// 80th-percentile spend across the result set; customers at/above it are VIP.
function vipThreshold(spends: number[]): number {
  const positive = spends.filter((s) => s > 0).sort((a, b) => a - b);
  if (positive.length === 0) return Infinity;
  const idx = Math.min(positive.length - 1, Math.floor(positive.length * VIP_PERCENTILE));
  return positive[idx];
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search")?.trim() ?? "";
    const sort = searchParams.get("sort") ?? "spend";
    const segment = searchParams.get("segment") ?? "all";

    const sortColumn =
      sort === "orders" ? "order_count" :
      sort === "recent" ? "last_order_at" :
      "total_spend";

    const sb = createAdminClient();
    let query = (sb as any)
      .from("customer_summary")
      .select(
        "email, first_name, last_name, phone, city, order_count, total_spend, average_order_value, first_order_at, last_order_at"
      )
      .order(sortColumn, { ascending: false })
      .range(0, 499);

    if (search) {
      const q = sanitizeSearchTerm(search);
      if (q) {
        query = query.or(
          `email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%`
        );
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data ?? []) as SummaryRow[];

    // #4: pull saved profiles for the customers on this page and key them by email.
    const emails = rows.map((r) => r.email).filter(Boolean);
    const profiles = new Map<string, ProfileRow>();
    if (emails.length > 0) {
      const { data: profData, error: profErr } = await (sb as any)
        .from("customer_profiles")
        .select("email, full_name, phone, address, city, province, postcode, country")
        .in("email", emails);
      if (profErr) {
        // Non-fatal: profiles are supplementary. Log and continue with order data only.
        console.error("Admin customers: profile lookup failed:", profErr);
      } else {
        for (const p of (profData ?? []) as ProfileRow[]) profiles.set(p.email, p);
      }
    }

    // #11: derive segment flags. VIP threshold is computed over the full result set.
    const threshold = vipThreshold(rows.map((r) => r.total_spend ?? 0));

    const customers = rows.map((r) => {
      const profile = profiles.get(r.email) ?? null;
      const days = daysSince(r.last_order_at);
      const segments: CustomerSegment[] = [];
      if ((r.total_spend ?? 0) > 0 && (r.total_spend ?? 0) >= threshold) segments.push("vip");
      if (r.order_count > 1) segments.push("repeat");
      if (r.order_count >= 1 && days !== null && days > AT_RISK_DAYS) segments.push("at-risk");
      if (r.order_count === 1 && days !== null && days <= NEW_WINDOW_DAYS) segments.push("new");

      return {
        ...r,
        registered: profile !== null,
        profile,
        days_since_last_order: days,
        segments,
      };
    });

    // Segment counts over the unfiltered result set (for the chips).
    const counts: Record<string, number> = {
      all: customers.length,
      vip: 0,
      repeat: 0,
      "at-risk": 0,
      new: 0,
    };
    for (const c of customers) for (const s of c.segments) counts[s]++;

    const filtered =
      segment === "all"
        ? customers
        : customers.filter((c) => c.segments.includes(segment as CustomerSegment));

    return NextResponse.json({ customers: filtered, counts });
  } catch (err) {
    console.error("Admin customers GET error:", err);
    return NextResponse.json({ error: "Failed to fetch customers." }, { status: 500 });
  }
}
