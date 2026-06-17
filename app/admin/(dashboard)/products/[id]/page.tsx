"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { use } from "react";
import ProductForm, { FormValues } from "../ProductForm";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [defaultValues, setDefaultValues] = useState<Partial<FormValues> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/products/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.product) { setError("Product not found."); return; }
        const p = json.product;
        setDefaultValues({
          id:           p.id,
          name:         p.name,
          slug:         p.slug,
          category_slug: p.category_slug,
          tagline:      p.tagline,
          badge:        p.badge ?? "",
          description:  p.description,
          how_to_use:   p.how_to_use,
          price:        p.price,
          sample_price: p.sample_price ?? null,
          stock:        p.stock,
          in_stock:     p.in_stock,
          featured:     p.featured,
          sort_order:   p.sort_order ?? 0,
          specs:        p.specs ?? [],
          images:       (p.images ?? []).map((url: string) => ({ url })),
          variants:     (p.product_variants ?? []).map((v: { label: string; price: number; sku: string; sort_order: number }) => ({
            label:      v.label,
            price:      v.price,
            sku:        v.sku,
            sort_order: v.sort_order,
          })),
        });
      })
      .catch(() => setError("Failed to load product."));
  }, [id]);

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="p-2 rounded-[8px] transition-all hover:bg-black/10" style={{ color: "var(--muted)" }}>
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="uppercase text-[1.8rem]" style={{ fontFamily: "var(--font-anton)" }}>Edit Product</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>ID: {id}</p>
        </div>
      </div>

      {error && (
        <p className="text-sm px-4 py-3 rounded-[10px] mb-6" style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>
          {error}
        </p>
      )}

      {!defaultValues && !error && (
        <div className="flex items-center gap-3 py-20" style={{ color: "var(--muted)" }}>
          <Loader2 className="w-5 h-5 animate-spin" /> Loading product…
        </div>
      )}

      {defaultValues && (
        <ProductForm defaultValues={defaultValues} productId={id} />
      )}
    </div>
  );
}
