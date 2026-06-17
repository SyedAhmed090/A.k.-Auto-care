"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Package, CheckCircle } from "lucide-react";
import { useSettings } from "@/components/providers/SettingsProvider";

type Variant = { id: string; sku: string; label: string; price: number };
type Product = {
  id: string;
  name: string;
  slug: string;
  stock: number | null;
  in_stock: boolean;
  category_slug: string;
  product_variants: Variant[];
};

type RowState = { stock: number | null; in_stock: boolean };

const thStyle: React.CSSProperties = {
  color: "var(--muted)",
  fontFamily: "var(--font-space-mono)",
  fontSize: ".68rem",
  letterSpacing: ".14em",
};

function statusInfo(stock: number | null, in_stock: boolean, threshold: number) {
  if (!in_stock || stock === 0) return { dot: "#ef4444", label: "Out" };
  if (stock !== null && stock <= threshold) return { dot: "#eab308", label: "Low" };
  return { dot: "#22c55e", label: "OK" };
}

/** A product counts as "low" for filtering when it's out of stock or at/under the threshold. */
function isLow(stock: number | null, in_stock: boolean, threshold: number) {
  if (!in_stock || stock === 0) return true;
  return stock !== null && stock <= threshold;
}

function InventoryInner() {
  const { inventory } = useSettings();
  const threshold = inventory.lowStockThreshold;
  const searchParams = useSearchParams();
  const [lowOnly, setLowOnly] = useState(false);

  // Honor the ?lowstock=1 deep link from the dashboard widget / email digest.
  useEffect(() => {
    if (searchParams.get("lowstock") === "1") setLowOnly(true);
  }, [searchParams]);

  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/inventory");
    const json = await res.json();
    const prods: Product[] = json.products ?? [];
    setProducts(prods);
    const initial: Record<string, RowState> = {};
    for (const p of prods) initial[p.id] = { stock: p.stock, in_stock: p.in_stock };
    setRows(initial);
    setDirty(new Set());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-dismiss the saved confirmation.
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  const markDirty = (id: string, patch: Partial<RowState>) => {
    setRows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setDirty((prev) => new Set(prev).add(id));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = Array.from(dirty).map((id) => ({ id, ...rows[id] }));
    await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    setSaving(false);
    setSaved(true);
    setDirty(new Set());
  };

  const lowList = products.filter((p) => {
    const r = rows[p.id] ?? { stock: p.stock, in_stock: p.in_stock };
    return isLow(r.stock, r.in_stock, threshold);
  });
  const lowCount = lowList.length;
  const visible = lowOnly ? lowList : products;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Inventory</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
            {lowOnly ? `${lowCount} low / ${products.length} products` : `${products.length} products`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLowOnly((v) => !v)}
            className="px-3.5 py-2.5 rounded-[10px] text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: lowOnly ? "rgba(234,179,8,.12)" : "var(--surface)",
              border: `1px solid ${lowOnly ? "rgba(234,179,8,.4)" : "var(--line)"}`,
              color: lowOnly ? "#eab308" : "var(--muted)",
            }}
          >
            {lowOnly ? "Showing low stock" : "Low stock only"}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-[10px] uppercase tracking-[.06em]"
              style={{ background: "rgba(34,197,94,.18)", color: "#22c55e", border: "1px solid rgba(34,197,94,.4)", fontFamily: "var(--font-space-mono)" }}>
              <CheckCircle className="w-4 h-4" /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={dirty.size === 0 || saving}
            className="px-5 py-2.5 rounded-[12px] font-semibold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
            style={{ background: "var(--accent)", color: "var(--on-accent)" }}
          >
            {saving ? "Saving…" : `Save Changes${dirty.size > 0 ? ` (${dirty.size})` : ""}`}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
          <Package className="w-6 h-6 animate-pulse mr-3" /> Loading inventory…
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">{lowOnly ? "No low-stock products" : "No products found"}</p>
        </div>
      ) : (
        <div className="rounded-[14px] overflow-x-auto" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {["Product Name", "Category", "Variants", "Stock Qty", "In Stock", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 uppercase" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const row = rows[p.id] ?? { stock: p.stock, in_stock: p.in_stock };
                const status = statusInfo(row.stock, row.in_stock, threshold);
                const isDirty = dirty.has(p.id);
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid var(--line)",
                      background: isDirty ? "rgba(79, 168, 230,.12)" : undefined,
                      boxShadow: isDirty ? "inset 3px 0 0 0 var(--accent)" : undefined,
                    }}
                    className={isDirty ? "" : "transition-colors hover:bg-black/[.02]"}
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold flex items-center gap-2" style={{ color: "var(--text)" }}>
                        {p.name}
                        {isDirty && (
                          <span className="text-[.55rem] font-bold px-1.5 py-0.5 rounded-[4px] uppercase tracking-[.08em]"
                            style={{ background: "rgba(79, 168, 230,.18)", color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
                            Unsaved
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>/{p.slug}</div>
                    </td>
                    <td className="px-5 py-4 text-xs uppercase" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)", letterSpacing: ".08em" }}>
                      {p.category_slug.replace(/-/g, " ")}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {p.product_variants.map((v) => (
                          <span key={v.id} className="text-[.65rem] px-1.5 py-0.5 rounded-[4px]"
                            style={{ background: "var(--surface-2)", color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                            {v.label}
                          </span>
                        ))}
                        {p.product_variants.length === 0 && (
                          <span style={{ color: "var(--muted-2)", fontFamily: "var(--font-space-mono)", fontSize: ".65rem" }}>—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        value={row.stock ?? ""}

                        onChange={(e) => {
                          const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                          markDirty(p.id, { stock: isNaN(val as number) ? null : val });
                        }}
                        className="w-20 px-2.5 py-1.5 rounded-[8px] text-sm outline-none transition-all"
                        style={{
                          background: "var(--bg)",
                          border: "1px solid var(--line-2)",
                          color: "var(--text)",
                          fontFamily: "var(--font-hanken)",
                        }}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={row.in_stock}
                        aria-label={`${p.name} in stock`}
                        onClick={() => markDirty(p.id, { in_stock: !row.in_stock })}
                        className="relative w-11 h-6 rounded-full transition-all"
                        style={{ background: row.in_stock ? "var(--accent)" : "var(--line-2)" }}
                      >
                        <span
                          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all"
                          style={{ background: "#fff", transform: row.in_stock ? "translateX(20px)" : "translateX(0)" }}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: status.dot }} />
                        <span className="text-[.7rem] font-semibold" style={{ color: status.dot, fontFamily: "var(--font-space-mono)" }}>
                          {status.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense>
      <InventoryInner />
    </Suspense>
  );
}
