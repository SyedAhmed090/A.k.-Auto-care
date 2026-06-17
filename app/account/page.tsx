import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Package } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { formatPrice } from "@/lib/utils";
import type { OrderItem } from "@/types/order";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account",
  robots: "noindex",
};

type OrderRow = {
  id: string;
  created_at: string;
  total: number;
  status: string;
  items: OrderItem[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#fb923c",
  confirmed: "#4ade80",
  processing: "#fb923c",
  shipped: "#38bdf8",
  delivered: "#4ade80",
  cancelled: "#ef4444",
  refunded: "#a78bfa",
};

export default async function AccountPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");

  const userEmail = user.email ?? "";
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  // Orders are RLS-locked to service role, so read them with the admin client,
  // scoped to this signed-in user's email.
  let orders: OrderRow[] = [];
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("orders")
      .select("id, created_at, total, status, items")
      .eq("email", userEmail)
      .order("created_at", { ascending: false });
    orders = (data as unknown as OrderRow[]) ?? [];
  } catch {
    orders = [];
  }

  const displayName = profile?.full_name || (user.user_metadata?.full_name as string) || user.email;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="pt-10 pb-10" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
              My Account
            </p>
            <h1 className="text-3xl sm:text-4xl font-black" style={{ color: "var(--text)", fontFamily: "var(--font-anton)" }}>
              Hi, {displayName}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Orders */}
        <div className="lg:col-span-3">
          <h2 className="uppercase mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-anton)", fontSize: "1.4rem", color: "var(--text)" }}>
            <Package className="w-5 h-5" style={{ color: "var(--accent)" }} /> Order History
          </h2>

          {orders.length === 0 ? (
            <div className="rounded-[16px] p-8 text-center" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>You haven&apos;t placed any orders yet.</p>
              <Link href="/shop" className="inline-block px-5 py-2.5 rounded-[12px] font-semibold text-sm" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => {
                const itemCount = Array.isArray(o.items) ? o.items.reduce((s, i) => s + (i.quantity || 0), 0) : 0;
                return (
                  <div key={o.id} className="rounded-[14px] p-5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="font-semibold" style={{ fontFamily: "var(--font-space-mono)", fontSize: ".8rem" }}>
                        #AK-{o.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[.7rem] font-bold uppercase px-2.5 py-1 rounded-full" style={{ color: STATUS_COLORS[o.status] ?? "var(--muted)", background: "var(--surface-2)", fontFamily: "var(--font-space-mono)" }}>
                        {o.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm" style={{ color: "var(--muted)" }}>
                      <span>{new Date(o.created_at).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })} · {itemCount} item{itemCount === 1 ? "" : "s"}</span>
                      <span className="font-bold" style={{ color: "var(--text)" }}>{formatPrice(o.total)}</span>
                    </div>
                    <Link href={`/order-tracking?order=${o.id}`} className="inline-block mt-3 text-xs font-semibold hover:text-[var(--accent)]" style={{ color: "var(--accent)" }}>
                      Track this order →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile / addresses / logout */}
        <div className="lg:col-span-2">
          <AccountClient
            email={user.email ?? ""}
            initialProfile={{
              full_name: profile?.full_name ?? (user.user_metadata?.full_name as string) ?? "",
              phone: profile?.phone ?? "",
              address: profile?.address ?? "",
              city: profile?.city ?? "",
              province: profile?.province ?? "",
              postcode: profile?.postcode ?? "",
              country: profile?.country ?? "PK",
            }}
            userId={user.id}
          />
        </div>
      </div>
    </div>
  );
}
