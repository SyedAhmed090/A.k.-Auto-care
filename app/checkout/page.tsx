"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ChevronDown, ChevronUp, Banknote, Smartphone, Building } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { getShippingOptions, gstAmount } from "@/lib/commerce";
import { WHATSAPP_NUMBER, PAYMENT_DETAILS } from "@/lib/constants";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number").max(20, "Invalid number"),
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  address: z.string().min(5, "Enter your address"),
  city: z.string().min(2, "Required"),
  province: z.string().optional(),
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
  const { items, subtotal, promoDiscount, promoCode, clearCart } = useCartStore();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [shippingId, setShippingId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const router = useRouter();
  const submittingRef = useRef(false);

  const sub = subtotal();
  const discount = sub * promoDiscount;
  const afterDiscount = sub - discount;

  const { register, handleSubmit, formState: { errors }, control } = useForm<FormData>({ resolver: zodResolver(schema) });
  const country = useWatch({ control, name: "country", defaultValue: "" });

  const shippingOptions = getShippingOptions(country, sub);
  const resolvedShipping = shippingOptions.find((o) => o.id === shippingId) ?? shippingOptions[0];
  const shippingCost = resolvedShipping?.price ?? 0;
  const total = afterDiscount + shippingCost;
  const vat = gstAmount(total);

  // Reset shipping selection when country (and therefore options) changes
  useEffect(() => {
    const opts = getShippingOptions(country, sub);
    if (opts.length > 0) setShippingId(opts[0].id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  const onSubmit = async (data: FormData) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          phone: data.phone,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          city: data.city,
          province: data.province || null,
          postcode: data.postcode,
          country: data.country,
          shippingMethod: resolvedShipping?.id ?? shippingOptions[0]?.id ?? "pk-standard",
          paymentMethod,
          items: items.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            variantLabel: i.variant.label,
            variantSku: i.variant.sku,
            price: i.variant.price,
            quantity: i.quantity,
            image: i.product.images[0],
          })),
          subtotal: sub,
          discount,
          shipping: shippingCost,
          total,
          promoCode: promoCode || null,
        }),
      });

      if (!res.ok) throw new Error("Order failed");
      const { orderId } = await res.json();
      clearCart();
      router.push(`/order-confirmation?order=${orderId}`);
    } catch {
      setSubmitError("Something went wrong placing your order. Please try again.");
      setLoading(false);
      submittingRef.current = false;
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--muted)" }}>Your cart is empty.</p>
          <Link href="/shop" className="btn-accent inline-flex items-center gap-2 px-6 py-3 rounded-[13px] font-semibold">Shop Now</Link>
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
              <Field label="WhatsApp / Phone" error={errors.phone?.message}>
                <input {...register("phone")} type="tel" placeholder="+92 300 0000000" style={inputStyle(errors.phone?.message)} />
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
                    <input {...register("city")} placeholder="Karachi" style={inputStyle(errors.city?.message)} />
                  </Field>
                </div>
                <div>
                  <Field label="Province / State" error={errors.province?.message}>
                    <input {...register("province")} placeholder="Sindh" style={inputStyle(errors.province?.message)} />
                  </Field>
                </div>
                <div>
                  <Field label="Postcode" error={errors.postcode?.message}>
                    <input {...register("postcode")} placeholder="75400" style={inputStyle(errors.postcode?.message)} />
                  </Field>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Field label="Country" error={errors.country?.message}>
                    <select {...register("country")} style={{ ...inputStyle(errors.country?.message), cursor: "pointer" }}>
                      <option value="">Select country…</option>
                      <option value="PK">Pakistan</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* Shipping Method */}
            <SectionCard title="Shipping Method">
              {shippingOptions.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>Select a country above to see shipping options.</p>
              ) : (
                <div className="space-y-2.5">
                  {shippingOptions.map((opt) => {
                    const active = (resolvedShipping?.id ?? shippingOptions[0]?.id) === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className="flex items-center gap-3 p-4 rounded-[13px] cursor-pointer transition-all"
                        style={{
                          border: active ? "1px solid var(--accent)" : "1px solid var(--line-2)",
                          background: active ? "rgba(232,160,32,.06)" : "var(--bg-2)",
                        }}
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={opt.id}
                          checked={active}
                          onChange={() => setShippingId(opt.id)}
                          className="sr-only"
                        />
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0 border-2 grid place-items-center"
                          style={{ borderColor: active ? "var(--accent)" : "var(--line-2)" }}
                        >
                          {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold">{opt.label}</span>
                            <span
                              className="text-sm font-bold"
                              style={{ fontFamily: "var(--font-hanken)", color: opt.price === 0 ? "#4ade80" : "var(--text)" }}
                            >
                              {opt.price === 0 ? "FREE" : formatPrice(opt.price)}
                            </span>
                          </div>
                          <p className="text-[.78rem]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                            {opt.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Payment Method">
              <div className="space-y-2.5">
                  {[
                    { id: "cod", label: "Cash on Delivery (COD)", description: "Pay cash when your order arrives — no card needed", icon: Banknote },
                    { id: "jazzcash", label: "JazzCash", description: `Send to ${PAYMENT_DETAILS.jazzcash.number} · Share screenshot on WhatsApp after ordering`, icon: Smartphone },
                    { id: "easypaisa", label: "EasyPaisa", description: `Send to ${PAYMENT_DETAILS.easypaisa.number} · Share screenshot on WhatsApp after ordering`, icon: Smartphone },
                    { id: "bank", label: "Bank Transfer", description: `${PAYMENT_DETAILS.bank.bank} · A/C: ${PAYMENT_DETAILS.bank.account} · Branch: ${PAYMENT_DETAILS.bank.branch} · Share receipt on WhatsApp`, icon: Building },
                  ].map((method) => {
                    const active = paymentMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        className="flex items-center gap-3 p-4 rounded-[13px] cursor-pointer transition-all"
                        style={{
                          border: active ? "1px solid var(--accent)" : "1px solid var(--line-2)",
                          background: active ? "rgba(232,160,32,.06)" : "var(--bg-2)",
                        }}
                      >
                        <input type="radio" name="paymentMethod" value={method.id} checked={active} onChange={() => setPaymentMethod(method.id)} className="sr-only" />
                        <div className="w-4 h-4 rounded-full flex-shrink-0 border-2 grid place-items-center" style={{ borderColor: active ? "var(--accent)" : "var(--line-2)" }}>
                          {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />}
                        </div>
                        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: "var(--accent)" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{method.label}</p>
                          <p className="text-[.75rem]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{method.description}</p>
                        </div>
                      </label>
                    );
                  })}
              </div>
              {paymentMethod !== "cod" && (
                <p className="text-[.75rem] px-1 mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                  After placing your order, send your payment screenshot to our WhatsApp (+92 {WHATSAPP_NUMBER.slice(1, 4)} {WHATSAPP_NUMBER.slice(4)}). Your order will be confirmed once payment is verified.
                </p>
              )}
            </SectionCard>

            {submitError && (
              <p className="text-sm text-center py-2 px-4 rounded-[11px]" style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 btn-accent"
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
                <span className="flex items-center justify-center gap-2.5">
                  <Lock className="w-4 h-4" />
                  {paymentMethod === "cod" ? "Place Order — Pay on Delivery" : "Place Order — I'll Send Payment"} · {formatPrice(total)}
                </span>
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
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover opacity-70" onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }} />
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
                    ...(promoDiscount > 0 ? [{ l: `Discount (${promoCode})`, v: `-${formatPrice(discount)}`, accent: true }] : []),
                    {
                      l: resolvedShipping ? resolvedShipping.label : "Shipping",
                      v: shippingCost === 0 ? "FREE" : shippingOptions.length === 0 ? "—" : formatPrice(shippingCost),
                      green: shippingCost === 0,
                    },
                  ].map((row) => (
                    <div key={row.l} className="flex justify-between">
                      <span style={{ color: "var(--muted)" }}>{row.l}</span>
                      <span style={{ color: (row as any).accent ? "var(--accent)" : (row as any).green ? "#4ade80" : "var(--text)" }}>{row.v}</span>
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
                  <p className="text-right text-[.72rem]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                    Incl. GST (17%): {formatPrice(vat)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
