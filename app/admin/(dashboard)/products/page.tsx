"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import ConfirmDialog from "@/app/admin/ConfirmDialog";

type Variant = { id: string; label: string; price: number; sku: string };
type Product = {
  id: string; name: string; slug: string; category_slug: string;
  price: number; in_stock: boolean; featured: boolean; stock: number | null;
  badge: string | null; sort_order: number;
  product_variants: Variant[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; name: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    const json = await res.json();
    setProducts(json.products ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

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

  const thStyle = { color: "var(--muted)", fontFamily: "var(--font-space-mono)", fontSize: ".68rem", letterSpacing: ".14em" };

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
          style={{ background: "var(--accent)", color: "#000" }}
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

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
                {["Product", "Category", "Price", "Stock", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 uppercase" style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--line)" }} className="transition-colors hover:bg-white/[.02]">
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
                        className="p-2 rounded-[8px] transition-all hover:bg-white/10 cursor-pointer"
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
    </div>
  );
}
