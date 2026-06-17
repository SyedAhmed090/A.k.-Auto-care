"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingCart, Check, Layers } from "lucide-react";
import type { Product } from "@/data/products";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export interface SystemStepView {
  step: string;
  note: string;
  isCurrent: boolean;
  product: Product;
}

/**
 * "Complete the System" — a frequently-bought-together cross-sell that presents the
 * curated detailing workflow (cut → refine → protect) for the current product. Adds the
 * selected steps to the cart at their normal prices (totals are recomputed server-side
 * at checkout, so no client-side discount is applied here).
 */
export default function CompleteSystem({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: SystemStepView[];
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(steps.map((s) => [s.product.id, s.product.inStock]))
  );
  const [justAdded, setJustAdded] = useState(false);
  const [imgErr, setImgErr] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectedSteps = steps.filter(
    (s) => selected[s.product.id] && s.product.inStock
  );
  const total = selectedSteps.reduce(
    (sum, s) => sum + (s.product.variants[0]?.price ?? 0),
    0
  );
  const anyInStock = steps.some((s) => s.product.inStock);

  const addAll = () => {
    selectedSteps.forEach((s) => {
      const v = s.product.variants[0];
      if (v) addItem(s.product, v, 1);
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <section
      className="mt-16"
      style={{ borderTop: "1px solid var(--line)", paddingTop: "60px" }}
      aria-labelledby="complete-system-heading"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Layers className="w-5 h-5" style={{ color: "var(--accent)" }} aria-hidden="true" />
        <h2
          id="complete-system-heading"
          className="uppercase tracking-[.01em]"
          style={{ fontFamily: "var(--font-anton)", fontSize: "2rem" }}
        >
          {name}
        </h2>
      </div>
      <p className="text-sm mb-8 max-w-[640px]" style={{ color: "var(--muted)" }}>
        {description}
      </p>

      <div className="flex flex-col lg:flex-row lg:items-stretch gap-3">
        {/* Step cards with + connectors */}
        <div className="flex-1 flex flex-col sm:flex-row items-stretch gap-3">
          {steps.map((s, i) => {
            const v = s.product.variants[0];
            const priced = s.product.inStock && (v?.price ?? 0) > 0;
            const checked = !!selected[s.product.id] && s.product.inStock;
            const img = (!imgErr[s.product.id] && s.product.images[0]) || "/placeholder.svg";
            const checkboxId = `sys-step-${s.product.id}`;
            return (
              <div key={s.product.id} className="contents">
                <div
                  className="relative flex sm:flex-col gap-3 sm:gap-0 rounded-[14px] p-3 flex-1 min-w-0 transition-all"
                  style={{
                    background: "var(--surface)",
                    border: `1px solid ${checked ? "var(--accent)" : "var(--line)"}`,
                    opacity: s.product.inStock ? 1 : 0.62,
                  }}
                >
                  {/* Select checkbox */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <input
                      id={checkboxId}
                      type="checkbox"
                      checked={checked}
                      disabled={!s.product.inStock}
                      onChange={() => toggle(s.product.id)}
                      aria-label={`Include ${s.product.name} in the system`}
                      className="w-5 h-5 accent-[var(--accent)] cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>

                  <Link
                    href={`/products/${s.product.slug}`}
                    className="relative w-[84px] h-[84px] sm:w-full sm:h-auto sm:aspect-square rounded-[10px] overflow-hidden flex-shrink-0"
                    style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
                  >
                    <Image
                      src={img}
                      alt={s.product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 84px, 200px"
                      onError={() => setImgErr((p) => ({ ...p, [s.product.id]: true }))}
                    />
                  </Link>

                  <div className="flex-1 min-w-0 sm:mt-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className="text-[.66rem] uppercase tracking-[.1em] font-bold"
                        style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}
                      >
                        {s.step}
                      </span>
                      {s.isCurrent && (
                        <span className="text-[.6rem] uppercase tracking-[.08em]" style={{ color: "var(--muted)" }}>
                          · This item
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/products/${s.product.slug}`}
                      className="block text-[.92rem] font-semibold leading-snug line-clamp-2 transition-colors hover:text-[var(--accent)]"
                    >
                      {s.product.name}
                    </Link>
                    <p className="text-[.74rem] mt-1 line-clamp-2" style={{ color: "var(--muted)" }}>
                      {s.note}
                    </p>
                    <p className="text-[.92rem] font-bold mt-1.5" style={{ fontFamily: "var(--font-hanken)" }}>
                      {priced ? (
                        formatPrice(v!.price)
                      ) : (
                        <span style={{ color: "var(--muted)", fontWeight: 600 }}>Coming soon</span>
                      )}
                    </p>
                  </div>
                </div>

                {i < steps.length - 1 && (
                  <div className="hidden sm:flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <Plus className="w-5 h-5" style={{ color: "var(--muted)" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary / add-all */}
        <div
          className="lg:w-[230px] flex-shrink-0 rounded-[14px] p-4 flex flex-col justify-center gap-3"
          style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}
        >
          {anyInStock ? (
            <>
              <div>
                <p className="text-[.72rem] uppercase tracking-[.1em]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                  {selectedSteps.length} item{selectedSteps.length === 1 ? "" : "s"} selected
                </p>
                <p className="text-[1.4rem] font-bold" style={{ fontFamily: "var(--font-hanken)" }}>
                  {total > 0 ? formatPrice(total) : "—"}
                </p>
              </div>
              <button
                onClick={addAll}
                disabled={selectedSteps.length === 0}
                className="w-full px-4 py-3 rounded-[11px] font-semibold cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "var(--accent)", color: "var(--on-accent)" }}
              >
                {justAdded ? (
                  <><Check className="w-4 h-4" /> Added to cart</>
                ) : (
                  <><ShoppingCart className="w-4 h-4" /> Add system to cart</>
                )}
              </button>
            </>
          ) : (
            <p className="text-sm text-center" style={{ color: "var(--muted)" }}>
              This system is launching soon. Check back for the full kit.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
