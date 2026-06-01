"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ChevronDown, ChevronUp } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  address: z.string().min(5, "Enter your address"),
  city: z.string().min(2, "Required"),
  postcode: z.string().min(3, "Enter postcode"),
  country: z.string().min(2, "Required"),
});
type FormData = z.infer<typeof schema>;

const inputStyle = (err?: string) => ({
  width: "100%",
  background: "var(--surface)",
  border: `1px solid ${err ? "#ef4444" : "var(--line-2)"}`,
  color: "var(--text)",
  fontFamily: "var(--font-hanken)",
  borderRadius: "11px",
  padding: "12px 16px",
  fontSize: ".9rem",
  outline: "none",
});

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[.72rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
      {label}
    </label>
    {children}
    {error && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{error}</p>}
  </div>
);

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="w-full rounded-[20px] p-6 space-y-5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
    <h2 className="uppercase text-left" style={{ fontFamily: "var(--font-anton)", fontSize: "1.3rem" }}>{title}</h2>
    {children}
  </div>
);

export default function CheckoutPage() {
  const { items, subtotal, promoDiscount, clearCart } = useCartStore();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const sub = subtotal();
  const discount = sub * promoDiscount;
  const shipping = sub >= 75 ? 0 : 4.99;
  const total = sub - discount + shipping;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    const orderId = "AK-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    clearCart();
    window.location.href = `/order-confirmation?order=${orderId}&total=${total.toFixed(2)}`;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--muted)" }}>Your cart is empty.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-[13px] font-semibold" style={{ background: "var(--accent)", color: "#000" }}>Shop Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Link href="/cart" className="text-sm mb-8 inline-flex items-center gap-1.5 transition-colors hover:text-[var(--accent)]" style={{ color: "var(--muted)" }}>
          ← Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-5">
            <SectionCard title="Contact">
              <Field label="Email" error={errors.email?.message}>
                <input {...register("email")} type="email" placeholder="you@example.com" style={inputStyle(errors.email?.message)} />
              </Field>
            </SectionCard>

            <SectionCard title="Shipping Address">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" error={errors.firstName?.message}>
                  <input {...register("firstName")} placeholder="John" style={inputStyle(errors.firstName?.message)} />
                </Field>
                <Field label="Last Name" error={errors.lastName?.message}>
                  <input {...register("lastName")} placeholder="Smith" style={inputStyle(errors.lastName?.message)} />
                </Field>
                <div className="col-span-1 sm:col-span-2">
                  <Field label="Address" error={errors.address?.message}>
                    <input {...register("address")} placeholder="123 Main Street" style={inputStyle(errors.address?.message)} />
                  </Field>
                </div>
                <div>
                  <Field label="City" error={errors.city?.message}>
                    <input {...register("city")} placeholder="Birmingham" style={inputStyle(errors.city?.message)} />
                  </Field>
                </div>
                <div>
                  <Field label="Postcode" error={errors.postcode?.message}>
                    <input {...register("postcode")} placeholder="B1 1AA" style={inputStyle(errors.postcode?.message)} />
                  </Field>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Field label="Country" error={errors.country?.message}>
                    <select {...register("country")} style={{ ...inputStyle(errors.country?.message), cursor: "pointer" }}>
                      <option value="">Select country…</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
                  </Field>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Payment">
              <div className="flex items-center justify-end -mt-1">
                <div className="flex items-center gap-1.5 text-[.72rem]" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                  <Lock className="w-3.5 h-3.5" /> Secured by Stripe
                </div>
              </div>
              <div
                className="rounded-[12px] p-5 flex items-center gap-4"
                style={{ border: "1px solid var(--line-2)", background: "rgba(255,255,255,.03)" }}
              >
                <div
                  className="w-10 h-10 rounded-full grid place-items-center flex-shrink-0"
                  style={{ background: "rgba(216,255,53,.1)", border: "1px solid rgba(216,255,53,.2)" }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" style={{ color: "var(--accent)" }}>
                    <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 9h16" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[.88rem] font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-hanken)" }}>
                    Secure payment coming soon
                  </p>
                  <p className="text-[.78rem] mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                    Stripe integration in progress — card details are never stored here
                  </p>
                </div>
              </div>
            </SectionCard>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 hover:-translate-y-0.5"
              style={{ background: "var(--accent)", color: "#000" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
                  </svg>
                  Processing…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2.5"><Lock className="w-4 h-4" /> Pay {formatPrice(total)}</span>
              )}
            </button>
          </form>

          {/* Summary */}
          <div className="lg:col-span-2 w-full">
            <div className="rounded-[20px] p-6 sticky top-28 w-full" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
              <button
                onClick={() => setSummaryOpen(!summaryOpen)}
                className="flex items-center justify-between w-full lg:cursor-default"
              >
                <h3 className="uppercase" style={{ fontFamily: "var(--font-anton)", fontSize: "1.3rem" }}>Order Summary</h3>
                <span className="lg:hidden" style={{ color: "var(--muted)" }}>
                  {summaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              <div className={`mt-5 space-y-3 ${summaryOpen || "hidden lg:block"}`}>
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.variant.sku}`} className="flex gap-3">
                    <div className="relative w-12 h-12 rounded-[8px] overflow-hidden flex-shrink-0" style={{ background: "var(--surface-2)" }}>
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover opacity-70" />
                      <span
                        className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full text-[.6rem] font-bold grid place-items-center"
                        style={{ background: "var(--muted)", color: "var(--bg)", fontFamily: "var(--font-space-mono)" }}
                      >
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold line-clamp-1">{item.product.name}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{item.variant.label}</p>
                    </div>
                    <span className="text-xs font-bold whitespace-nowrap" style={{ fontFamily: "var(--font-space-mono)" }}>
                      {formatPrice(item.variant.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="pt-3 space-y-2 text-sm" style={{ borderTop: "1px solid var(--line)" }}>
                  {[
                    { l: "Subtotal", v: formatPrice(sub) },
                    ...(promoDiscount > 0 ? [{ l: "Discount", v: `-${formatPrice(discount)}`, accent: true }] : []),
                    { l: "Shipping", v: shipping === 0 ? "FREE" : formatPrice(shipping) },
                  ].map((row) => (
                    <div key={row.l} className="flex justify-between">
                      <span style={{ color: "var(--muted)" }}>{row.l}</span>
                      <span style={{ color: (row as any).accent ? "var(--accent)" : "var(--text)" }}>{row.v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2" style={{ borderTop: "1px solid var(--line)" }}>
                    <span className="font-semibold">Total</span>
                    <span
                      className="text-[1.4rem]"
                      style={{
                        fontFamily: "var(--font-hanken)",
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
