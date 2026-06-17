"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Package, Star, StarOff, Tag, Percent, CheckCircle2, XCircle, CheckCircle } from "lucide-react";
import ConfirmDialog from "@/app/admin/ConfirmDialog";

const CATEGORIES = [
  { slug: "surface-correction", label: "Surface Correction" },
  { slug: "refinement-polish",  label: "Refinement & Polish" },
  { slug: "automotive-utility", label: "Automotive Utility" },
];

type Variant = { id: string; label: string; price: number; sku: string };
type Product = {
  id: string; name: string; slug: string; category_slug: string;
  price: number; in_stock: boolean; featured: boolean; stock: number | null;
  badge: string | null; sort_order: number;
  product_variants: Variant[];
};

// Mirrors the operation shape accepted by /api/admin/products/bulk (PATCH).
type Operation =
  | { type: "featured"; value: boolean }
  | { type: "in_stock"; value: boolean }
  | { type: "category"; category_slug: string }
  | { type: "price_percent"; percent: number }
  | { type: "price_fixed"; amount: number };

type PendingAction = { operation: Operation; title: string; message: string; confirmLabel: string };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);

  // Bulk selection + actions
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [priceMode, setPriceMode] = useState<"percent" | "fixed">("percent");
  const [priceValue, setPriceValue] = useState("");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const json = await res.json();
    setProducts(json.products ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Auto-dismiss the success toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    const id = confirmTarget.id;
    setDeletingId(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeletingId(null);
    setConfirmTarget(null);
    await load();
  };

  const priceRange = (p: Product) => {
    const prices = p.product_variants.map((v) => v.price);
    if (!prices.length) return `Rs ${p.price.toLocaleString("en-PK")}`;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max
      ? `Rs ${min.toLocaleString("en-PK")}`
      : `Rs ${min.toLocaleString("en-PK")} – ${max.toLocaleString("en-PK")}`;
  };

  // ── Selection helpers ─────────────────────────────────────────────
  const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  const toggleOne = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  };

  // ── Bulk action triggers (open confirm dialog) ────────────────────
  const count = selected.size;
  const plural = count > 1 ? "s" : "";

  const requestFeatured = (value: boolean) => setPending({
    operation: { type: "featured", value },
    title: value ? "Feature Products" : "Unfeature Products",
    message: `${value ? "Feature" : "Unfeature"} ${count} product${plural}?`,
    confirmLabel: value ? "Feature" : "Unfeature",
  });

  const requestStock = (value: boolean) => setPending({
    operation: { type: "in_stock", value },
    title: value ? "Mark In Stock" : "Mark Out of Stock",
    message: `Mark ${count} product${plural} as ${value ? "in stock" : "out of stock"}?`,
    confirmLabel: value ? "In Stock" : "Out of Stock",
  });

  const requestCategory = () => {
    if (!bulkCategory) return;
    const label = CATEGORIES.find((c) => c.slug === bulkCategory)?.label ?? bulkCategory;
    setPending({
      operation: { type: "category", category_slug: bulkCategory },
      title: "Set Category",
      message: `Move ${count} product${plural} to "${label}"?`,
      confirmLabel: "Set Category",
    });
  };

  const requestPrice = () => {
    const v = Number(priceValue);
    if (!priceValue || Number.isNaN(v)) return;
    const operation: Operation = priceMode === "percent"
      ? { type: "price_percent", percent: v }
      : { type: "price_fixed", amount: Math.round(v) };
    const desc = priceMode === "percent"
      ? `${v > 0 ? "+" : ""}${v}%`
      : `${v > 0 ? "+" : ""}Rs ${Math.abs(Math.round(v)).toLocaleString("en-PK")}`;
    setPending({
      operation,
      title: "Adjust Price",
      message: `Adjust price of ${count} product${plural} by ${desc}? This updates base price and all variant prices (never below Rs 0).`,
      confirmLabel: "Adjust",
    });
  };

  const applyBulk = async () => {
    if (!pending || !selected.size) return;
    setBulkLoading(true);
    const n = selected.size;
    const res = await fetch("/api/admin/products/bulk", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [...selected], operation: pending.operation }),
    });
    setBulkLoading(false);
    setPending(null);
    if (res.ok) {
      setSelected(new Set());
      setBulkCategory("");
      setPriceValue("");
      setToast(`${n} product${n > 1 ? "s" : ""} updated.`);
      await load();
    } else {
      setToast("Bulk update failed. Please try again.");
    }
  };

  const thStyle = { color: "var(--muted)", fontFamily: "var(--font-space-mono)", fontSize: ".68rem", letterSpacing: ".14em" };
  const inputSty = { background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-space-mono)" };
  const barBtn = "flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[.78rem] font-semibold cursor-pointer transition-all disabled:opacity-40";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Products</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>{products.length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] font-semibold text-sm transition-all hover:-translate-y-0.5"
          style={{ background: "var(--accent)", color: "var(--on-accent)" }}
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Bulk-action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2.5 mb-4 px-4 py-3 rounded-[12px] flex-wrap"
          style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
          <span className="text-sm mr-1" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
            {selected.size} selected
          </span>

          <button onClick={() => requestFeatured(true)} className={barBtn}
            style={{ border: "1px solid var(--line-2)", color: "var(--accent)" }}>
            <Star className="w-3.5 h-3.5" /> Feature
          </button>
          <button onClick={() => requestFeatured(false)} className={barBtn}
            style={{ border: "1px solid var(--line-2)", color: "var(--muted)" }}>
            <StarOff className="w-3.5 h-3.5" /> Unfeature
          </button>
          <button onClick={() => requestStock(true)} className={barBtn}
            style={{ border: "1px solid var(--line-2)", color: "#22c55e" }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
          </button>
          <button onClick={() => requestStock(false)} className={barBtn}
            style={{ border: "1px solid var(--line-2)", color: "#ef4444" }}>
            <XCircle className="w-3.5 h-3.5" /> Out of Stock
          </button>

          {/* Set category */}
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" style={{ color: "var(--muted)" }} />
            <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-[8px] text-[.78rem] outline-none cursor-pointer" style={inputSty}>
              <option value="">Category…</option>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
            </select>
            <button onClick={requestCategory} disabled={!bulkCategory} className={barBtn}
              style={{ border: "1px solid var(--line-2)", color: "var(--text)" }}>
              Set
            </button>
          </div>

          {/* Adjust price */}
          <div className="flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5" style={{ color: "var(--muted)" }} />
            <select value={priceMode} onChange={(e) => setPriceMode(e.target.value as "percent" | "fixed")}
              className="px-2.5 py-1.5 rounded-[8px] text-[.78rem] outline-none cursor-pointer" style={inputSty}>
              <option value="percent">%</option>
              <option value="fixed">Rs</option>
            </select>
            <input type="number" value={priceValue} onChange={(e) => setPriceValue(e.target.value)}
              placeholder={priceMode === "percent" ? "e.g. -10" : "e.g. 500"}
              className="w-24 px-2.5 py-1.5 rounded-[8px] text-[.78rem] outline-none" style={inputSty} />
            <button onClick={requestPrice} disabled={!priceValue} className={barBtn}
              style={{ border: "1px solid var(--line-2)", color: "var(--text)" }}>
              Apply
            </button>
          </div>

          <button onClick={() => setSelected(new Set())}
            className="text-sm ml-auto cursor-pointer" style={{ color: "var(--muted)" }}>
            Deselect all
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--muted)" }}>
          <Package className="w-6 h-6 animate-pulse mr-3" /> Loading products…
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 rounded-[16px]" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold mb-2">No products yet</p>
          <Link href="/admin/products/new" className="text-sm" style={{ color: "var(--accent)" }}>Add your first product</Link>
        </div>
      ) : (
        <div className="rounded-[14px] overflow-hidden" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                <th className="px-5 py-3.5 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="cursor-pointer w-4 h-4" style={{ accentColor: "var(--accent)" }} />
                </th>
                {["Product", "Category", "Price", "Stock", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 uppercase" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--line)", background: selected.has(p.id) ? "rgba(79, 168, 230,.08)" : undefined }} className="transition-colors hover:bg-black/[.02]">
                  <td className="px-5 py-4">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)}
                      className="cursor-pointer w-4 h-4" style={{ accentColor: "var(--accent)" }} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold" style={{ color: "var(--text)" }}>{p.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                      /{p.slug}
                      {p.badge && <span className="ml-2 px-1.5 py-0.5 rounded-[4px] text-[.65rem]" style={{ background: "rgba(79, 168, 230,.15)", color: "var(--accent)" }}>{p.badge}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs uppercase" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)", letterSpacing: ".08em" }}>
                    {p.category_slug.replace(/-/g, " ")}
                  </td>
                  <td className="px-5 py-4 font-semibold whitespace-nowrap">{priceRange(p)}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                    {p.stock !== null ? p.stock : "∞"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      <span
                        className="text-[.7rem] px-2 py-0.5 rounded-full"
                        style={{
                          background: p.in_stock ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)",
                          color: p.in_stock ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {p.in_stock ? "In Stock" : "Out of Stock"}
                      </span>
                      {p.featured && (
                        <span className="text-[.7rem] px-2 py-0.5 rounded-full" style={{ background: "rgba(79, 168, 230,.1)", color: "var(--accent)" }}>
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="p-2 rounded-[8px] transition-all hover:bg-black/10 cursor-pointer"
                        style={{ color: "var(--muted)" }}
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setConfirmTarget({ id: p.id, name: p.name })}
                        disabled={deletingId === p.id}
                        className="p-2 rounded-[8px] transition-all hover:bg-red-500/10 cursor-pointer disabled:opacity-40"
                        style={{ color: "#ef4444" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmTarget}
        destructive
        title="Delete Product"
        message={`Delete "${confirmTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTarget(null)}
      />

      <ConfirmDialog
        open={!!pending}
        title={pending?.title ?? ""}
        message={pending?.message ?? ""}
        confirmLabel={pending?.confirmLabel ?? "Confirm"}
        loading={bulkLoading}
        onConfirm={applyBulk}
        onCancel={() => setPending(null)}
      />

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
