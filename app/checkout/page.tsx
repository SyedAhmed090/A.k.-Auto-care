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
import { useSettings } from "@/components/providers/SettingsProvider";
import { trackInitiateCheckout } from "@/components/analytics/MetaPixel";
import { saveCartToServer } from "@/lib/cart-session";

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

const Field = ({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) => {
  const id = React.useId();
  const errId = `${id}-err`;
  // Tie the visible label to the control (htmlFor/id) and point the control at its
  // error message so screen readers announce both. The control is always a single element.
  const control = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<{ id?: string; "aria-describedby"?: string }>, {
        id,
        "aria-describedby": error ? errId : undefined,
      })
    : children;
  return (
    <div>
      <label htmlFor={id} className="block text-[.82rem] tracking-[.01em] font-medium mb-2" style={{ fontFamily: "var(--font-hanken)", color: "var(--muted)" }}>
        {label}
        {required && <span aria-hidden="true" style={{ color: "var(--accent)", marginLeft: "3px" }}>*</span>}
      </label>
      {control}
      {error && <p id={errId} role="alert" className="text-xs mt-1" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
};

const CheckoutSteps = () => {
  const steps = ["Cart", "Details", "Payment"];
  const current = 1; // Checkout page = Details/Payment step; "Cart" is complete
  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((step, i) => {
          const isComplete = i < current;
          const isCurrent = i === current;
          const active = isComplete || isCurrent;
          return (
            <li key={step} className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2" aria-current={isCurrent ? "step" : undefined}>
                <span
                  className="w-6 h-6 rounded-full grid place-items-center text-[.7rem] font-bold flex-shrink-0"
                  style={{
                    background: active ? "var(--accent)" : "var(--surface-2)",
                    color: active ? "#000" : "var(--muted)",
                    border: `1px solid ${active ? "var(--accent)" : "var(--line-2)"}`,
                    fontFamily: "var(--font-space-mono)",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-[.72rem] tracking-[.12em] uppercase"
                  style={{
                    fontFamily: "var(--font-space-mono)",
                    color: isCurrent ? "var(--text)" : active ? "var(--accent)" : "var(--muted)",
                    fontWeight: isCurrent ? 700 : 400,
                  }}
                >
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span className="w-5 sm:w-8 h-px flex-shrink-0" style={{ background: i < current ? "var(--accent)" : "var(--line-2)" }} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="w-full rounded-[20px] p-6 space-y-5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
    <h2 className="uppercase text-left" style={{ fontFamily: "var(--font-anton)", fontSize: "1.3rem" }}>{title}</h2>
    {children}
  </div>
);

export default function CheckoutPage() {
  const settings = useSettings();
  const { store: storeInfo, payment: paymentDetails, tax } = settings;
  const { items, subtotal, promoDiscount, promoCode, clearCart } = useCartStore();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [shippingId, setShippingId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const submittingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const sub = subtotal();
  const discount = sub * promoDiscount;
  const afterDiscount = sub - discount;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const { register, handleSubmit, formState: { errors }, control } = useForm<FormData>({ resolver: zodResolver(schema) });
  const country = useWatch({ control, name: "country", defaultValue: "" });
  const emailValue = useWatch({ control, name: "email", defaultValue: "" });

  const shippingOptions = getShippingOptions(country, afterDiscount, settings.shipping);
  const resolvedShipping = shippingOptions.find((o) => o.id === shippingId) ?? shippingOptions[0];
  const shippingCost = resolvedShipping?.price ?? 0;
  const total = afterDiscount + shippingCost;
  const vat = gstAmount(total, tax.gstRate);
  const gstPct = Math.round(tax.gstRate * 100);

  // Reset shipping selection when country (and therefore options) changes
  useEffect(() => {
    const opts = getShippingOptions(country, afterDiscount, settings.shipping);
    if (opts.length > 0) setShippingId(opts[0].id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  useEffect(() => {
    trackInitiateCheckout(sub, itemCount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) return;
    const t = setTimeout(() => {
      saveCartToServer(emailValue, items);
    }, 600);
    return () => clearTimeout(t);
  }, [emailValue, items]);

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

  // On validation failure, scroll to and focus the first field with an error.
  const onInvalid = () => {
    const el = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus({ preventScroll: true });
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

        <CheckoutSteps />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <form ref={formRef} onSubmit={handleSubmit(onSubmit, onInvalid)} className="lg:col-span-3 space-y-5">
            <SectionCard title="Contact">
              <Field label="Email" error={errors.email?.message} required>
                <input {...register("email")} type="email" aria-invalid={!!errors.email} style={inputStyle(errors.email?.message)} />
              </Field>
              <Field label="WhatsApp / Phone" error={errors.phone?.message} required>
                <input {...register("phone")} type="tel" aria-invalid={!!errors.phone} style={inputStyle(errors.phone?.message)} />
              </Field>
            </SectionCard>

            <SectionCard title="Shipping Address">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" error={errors.firstName?.message} required>
                  <input {...register("firstName")} aria-invalid={!!errors.firstName} style={inputStyle(errors.firstName?.message)} />
                </Field>
                <Field label="Last Name" error={errors.lastName?.message} required>
                  <input {...register("lastName")} aria-invalid={!!errors.lastName} style={inputStyle(errors.lastName?.message)} />
                </Field>
                <div className="col-span-1 sm:col-span-2">
                  <Field label="Address" error={errors.address?.message} required>
                    <input {...register("address")} aria-invalid={!!errors.address} style={inputStyle(errors.address?.message)} />
                  </Field>
                </div>
                <div>
                  <Field label="City" error={errors.city?.message} required>
                    <input {...register("city")} aria-invalid={!!errors.city} style={inputStyle(errors.city?.message)} />
                  </Field>
                </div>
                <div>
                  <Field label="Province / State" error={errors.province?.message}>
                    <input {...register("province")} aria-invalid={!!errors.province} style={inputStyle(errors.province?.message)} />
                  </Field>
                </div>
                <div>
                  <Field label="Postcode" error={errors.postcode?.message} required>
                    <input {...register("postcode")} aria-invalid={!!errors.postcode} style={inputStyle(errors.postcode?.message)} />
                  </Field>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <Field label="Country" error={errors.country?.message} required>
                    <select {...register("country")} aria-invalid={!!errors.country} style={{ ...inputStyle(errors.country?.message), cursor: "pointer" }}>
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
                          background: active ? "rgba(79, 168, 230,.06)" : "var(--bg-2)",
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
                    { id: "jazzcash", label: "JazzCash", description: `Send to ${paymentDetails.jazzcash.number} · Share screenshot on WhatsApp after ordering`, icon: Smartphone },
                    { id: "easypaisa", label: "EasyPaisa", description: `Send to ${paymentDetails.easypaisa.number} · Share screenshot on WhatsApp after ordering`, icon: Smartphone },
                    { id: "bank", label: "Bank Transfer", description: `${paymentDetails.bank.bank} · A/C: ${paymentDetails.bank.account} · Branch: ${paymentDetails.bank.branch} · Share receipt on WhatsApp`, icon: Building },
                  ].map((method) => {
                    const active = paymentMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        className="flex items-center gap-3 p-4 rounded-[13px] cursor-pointer transition-all"
                        style={{
                          border: active ? "1px solid var(--accent)" : "1px solid var(--line-2)",
                          background: active ? "rgba(79, 168, 230,.06)" : "var(--bg-2)",
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
                <div
                  className="rounded-[13px] p-4 flex gap-3"
                  style={{ background: "rgba(79, 168, 230,.08)", border: "1px solid rgba(79, 168, 230,.25)" }}
                >
                  <Smartphone className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      How to complete payment
                    </p>
                    <ol className="text-[.82rem] space-y-1 list-decimal pl-4" style={{ color: "var(--muted)", fontFamily: "var(--font-hanken)" }}>
                      <li>Place your order using the button below.</li>
                      <li>
                        Send the payment screenshot to our WhatsApp{" "}
                        <span className="font-semibold" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
                          +92 {storeInfo.whatsapp.slice(1, 4)} {storeInfo.whatsapp.slice(4)}
                        </span>
                        .
                      </li>
                      <li>Your order is confirmed once we verify the payment.</li>
                    </ol>
                  </div>
                </div>
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
                      <Image
                        src={imgErrors[`${item.product.id}-${item.variant.sku}`] ? "/placeholder.svg" : item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover opacity-70"
                        onError={() => setImgErrors((prev) => ({ ...prev, [`${item.product.id}-${item.variant.sku}`]: true }))}
                      />
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
                  {((): Array<{ l: string; v: string; accent?: boolean; green?: boolean }> => [
                    { l: "Subtotal", v: formatPrice(sub) },
                    ...(promoDiscount > 0 ? [{ l: `Discount (${promoCode})`, v: `-${formatPrice(discount)}`, accent: true }] : []),
                    {
                      l: resolvedShipping ? resolvedShipping.label : "Shipping",
                      v: shippingCost === 0 ? "FREE" : shippingOptions.length === 0 ? "—" : formatPrice(shippingCost),
                      green: shippingCost === 0,
                    },
                  ])().map((row) => (
                    <div key={row.l} className="flex justify-between">
                      <span style={{ color: "var(--muted)" }}>{row.l}</span>
                      <span style={{ color: row.accent ? "var(--accent)" : row.green ? "#4ade80" : "var(--text)" }}>{row.v}</span>
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
                    Incl. GST ({gstPct}%): {formatPrice(vat)}
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
