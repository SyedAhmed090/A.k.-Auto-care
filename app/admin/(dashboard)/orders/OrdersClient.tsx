"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useTransition } from "react";
import { Search, Download, CheckCircle } from "lucide-react";
import Link from "next/link";

const STATUSES = ["all","pending","confirmed","processing","shipped","delivered","cancelled","refunded"];
const STATUS_COLORS: Record<string, string> = {
  pending:"#f59e0b", confirmed:"#3b82f6", processing:"#8b5cf6",
  shipped:"#06b6d4",  delivered:"#4ade80",  cancelled:"#ef4444", refunded:"#9ca3af",
};

export type AdminOrder = {
  id: string; first_name: string; last_name: string; email: string;
  phone: string | null; city: string; total: number; status: string;
  payment_method: string; shipping_method: string | null;
  created_at: string; tracking_number: string | null;
};

interface Props {
  orders: AdminOrder[];
  total: number;
  page: number;
  totalPages: number;
  filters: { status: string; search: string; dateFrom: string; dateTo: string };
}

export default function OrdersClient({ orders, total, page, totalPages, filters }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [searchVal, setSearchVal]  = useState(filters.search);
  const [selected, setSelected]    = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Auto-dismiss the success toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const pushParams = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    if (!("page" in updates)) p.delete("page");
    startTransition(() => router.push(`${pathname}?${p}`));
  }, [router, pathname]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchVal !== filters.search) pushParams({ search: searchVal });
    }, 400);
    return () => clearTimeout(t);
  }, [searchVal, filters.search, pushParams]);

  // Reset search state when URL changes externally
  useEffect(() => { setSearchVal(filters.search); }, [filters.search]);

  const allSelected = orders.length > 0 && orders.every(o => selected.has(o.id));
  const toggleAll   = () => setSelected(allSelected ? new Set() : new Set(orders.map(o => o.id)));
  const toggleOne   = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const handleBulk = async () => {
    if (!bulkStatus || !selected.size) return;
    setBulkLoading(true);
    const count = selected.size;
    const newStatus = bulkStatus;
    const res = await fetch("/api/admin/orders/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], status: bulkStatus }),
    });
    setBulkLoading(false);
    if (res.ok) {
      setSelected(new Set());
      setBulkStatus("");
      setToast(`${count} order${count > 1 ? "s" : ""} updated to "${newStatus}".`);
      startTransition(() => router.refresh());
    } else {
      setToast("Failed to update orders. Please try again.");
    }
  };

  const handleExport = () => {
    const p = new URLSearchParams();
    if (filters.status && filters.status !== "all") p.set("status", filters.status);
    if (filters.search)  p.set("search",  filters.search);
    if (filters.dateFrom) p.set("dateFrom", filters.dateFrom);
    if (filters.dateTo)   p.set("dateTo",   filters.dateTo);
    window.location.href = `/api/admin/orders/export?${p}`;
  };

  const inputSty = { background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-space-mono)" };
  const hasFilter = filters.search || filters.dateFrom || filters.dateTo;

  return (
    <div style={{ opacity: isPending ? 0.75 : 1, transition: "opacity 0.15s" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-[1.8rem] uppercase" style={{ fontFamily: "var(--font-anton)" }}>
          Orders <span style={{ color: "var(--muted)", fontFamily: "var(--font-hanken)", fontSize: "1rem" }}>({total})</span>
        </h1>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold cursor-pointer transition-opacity hover:opacity-75"
          style={{ background: "var(--surface)", border: "1px solid var(--line-2)", color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Search + dates */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 rounded-[10px] px-3 flex-1 min-w-[200px]" style={inputSty}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted)" }} />
          <input value={searchVal} onChange={e => setSearchVal(e.target.value)}
            placeholder="Search name, phone, email…"
            className="flex-1 py-2.5 text-sm outline-none bg-transparent"
            style={{ color: "var(--text)", fontFamily: "var(--font-hanken)" }} />
        </div>
        <input type="date" value={filters.dateFrom}
          onChange={e => pushParams({ dateFrom: e.target.value })}
          className="px-3 py-2 rounded-[10px] text-sm outline-none cursor-pointer"
          style={inputSty} />
        <input type="date" value={filters.dateTo}
          onChange={e => pushParams({ dateTo: e.target.value })}
          className="px-3 py-2 rounded-[10px] text-sm outline-none cursor-pointer"
          style={inputSty} />
        {hasFilter && (
          <button onClick={() => { setSearchVal(""); pushParams({ search: "", dateFrom: "", dateTo: "" }); }}
            className="px-3 py-2 rounded-[10px] text-sm cursor-pointer"
            style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)", border: "1px solid var(--line-2)" }}>
            Clear
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {STATUSES.map(s => (
          <button key={s} onClick={() => pushParams({ status: s })}
            className="px-3 py-1.5 rounded-[8px] text-[.72rem] font-semibold uppercase tracking-[.1em] transition-all cursor-pointer"
            style={{
              fontFamily: "var(--font-space-mono)",
              background: filters.status === s ? (STATUS_COLORS[s] ?? "var(--accent)") + "22" : "var(--surface)",
              color: filters.status === s ? (STATUS_COLORS[s] ?? "var(--accent)") : "var(--muted)",
              border: `1px solid ${filters.status === s ? (STATUS_COLORS[s] ?? "var(--accent)") + "44" : "var(--line-2)"}`,
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-[12px]"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <span className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
            {selected.size} selected
          </span>
          <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
            className="flex-1 max-w-[190px] px-3 py-1.5 rounded-[8px] text-sm outline-none cursor-pointer"
            style={inputSty}>
            <option value="">Change status to…</option>
            {STATUSES.filter(s => s !== "all").map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleBulk} disabled={!bulkStatus || bulkLoading}
            className="px-4 py-1.5 rounded-[8px] text-sm font-semibold btn-accent cursor-pointer disabled:opacity-50">
            {bulkLoading ? "Updating…" : "Apply"}
          </button>
          <button onClick={() => setSelected(new Set())} className="text-sm cursor-pointer" style={{ color: "var(--muted)" }}>
            Deselect all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-[16px] overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
        {orders.length === 0 ? (
          <p className="text-center py-16 text-sm" style={{ color: "var(--muted)" }}>No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      className="cursor-pointer w-4 h-4" style={{ accentColor: "var(--accent)" }} />
                  </th>
                  {["Order","Customer","City","Total","Payment","Status","Date",""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[.65rem] tracking-[.12em] uppercase font-semibold"
                      style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t hover:bg-white/[.015] transition-colors"
                    style={{ borderColor: "var(--line)", background: selected.has(o.id) ? "rgba(79, 168, 230,.08)" : undefined }}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOne(o.id)}
                        className="cursor-pointer w-4 h-4" style={{ accentColor: "var(--accent)" }} />
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[.75rem]" style={{ color: "var(--muted)" }}>
                      AK-{o.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold">{o.first_name} {o.last_name}</p>
                      <p className="text-[.72rem]" style={{ color: "var(--muted)" }}>{o.phone ?? o.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[.85rem]" style={{ color: "var(--muted)" }}>{o.city}</td>
                    <td className="px-4 py-3.5 font-bold" style={{ fontFamily: "var(--font-hanken)" }}>
                      Rs {Number(o.total).toLocaleString("en-PK")}
                    </td>
                    <td className="px-4 py-3.5 text-[.72rem] uppercase font-semibold"
                      style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                      {o.payment_method}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[.65rem] font-bold px-2 py-1 rounded-full uppercase"
                        style={{ background: `${STATUS_COLORS[o.status] ?? "#9ca3af"}22`, color: STATUS_COLORS[o.status] ?? "#9ca3af", fontFamily: "var(--font-space-mono)" }}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[.72rem]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      {new Date(o.created_at).toLocaleDateString("en-PK", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/orders/${o.id}`} className="text-[.72rem] font-semibold"
                        style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          {page > 1 && (
            <button onClick={() => pushParams({ page: String(page - 1) })}
              className="px-3 py-1.5 rounded-[8px] text-sm cursor-pointer"
              style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--line-2)", fontFamily: "var(--font-space-mono)" }}>
              ← Prev
            </button>
          )}
          <span className="text-sm px-2" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
            Page {page} of {totalPages} · {total} orders
          </span>
          {page < totalPages && (
            <button onClick={() => pushParams({ page: String(page + 1) })}
              className="px-3 py-1.5 rounded-[8px] text-sm cursor-pointer"
              style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--line-2)", fontFamily: "var(--font-space-mono)" }}>
              Next →
            </button>
          )}
        </div>
      )}

      {/* Bulk action toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-[12px] shadow-lg"
          style={{ background: "var(--surface)", border: "1px solid #4ade8055", boxShadow: "0 12px 30px rgba(0,0,0,.4)" }}
          role="status">
          <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#4ade80" }} />
          <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--text)" }}>{toast}</span>
        </div>
      )}
    </div>
  );
}
