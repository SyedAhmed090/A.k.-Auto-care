"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FlaskConical, X, CheckCircle } from "lucide-react";
import { MONTHLY_USAGE_OPTIONS } from "@/lib/sampleRequest";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  business_name: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  monthly_usage: z.enum(MONTHLY_USAGE_OPTIONS, { message: "Select your monthly usage" }),
});
type FormData = z.infer<typeof schema>;

type ProductInfo = { id: string; slug: string; name: string };

const inputCls = "w-full px-4 py-3 rounded-[11px] text-sm outline-none transition-all";
const inputStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line-2)",
  color: "var(--text)",
  fontFamily: "var(--font-hanken)",
};
const labelCls = "block text-[.72rem] tracking-[.14em] uppercase mb-2";
const labelStyle: React.CSSProperties = { fontFamily: "var(--font-space-mono)", color: "var(--muted)" };

export default function SampleRequestButton({
  product,
  variant = "detail",
}: {
  product: ProductInfo;
  variant?: "detail" | "card";
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => setMounted(true), []);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Some triggers live inside a product-card <Link>; stop the click from navigating.
  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setSent(false);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => { setSent(false); setError(""); reset(); }, 250);
  };

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await fetch("/api/sample-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          ...data,
        }),
      });
      const json = await res.json();
      if (json.ok) setSent(true);
      else setError(json.error ?? "Something went wrong. Please try again.");
    } catch {
      setError("Could not send your request. Please try again.");
    }
  };

  const trigger =
    variant === "card" ? (
      <button
        type="button"
        onClick={openModal}
        className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-xs font-semibold transition-all cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)]"
        style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--muted)" }}
      >
        <FlaskConical className="w-3.5 h-3.5" /> Order a Sample
      </button>
    ) : (
      <button
        type="button"
        onClick={openModal}
        className="w-full py-4 rounded-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:-translate-y-0.5"
        style={{ background: "rgba(79,168,230,.1)", border: "1px solid var(--accent)", color: "var(--accent)" }}
      >
        <FlaskConical className="w-[18px] h-[18px]" /> Order a Sample
      </button>
    );

  const modal = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.6)" }} onClick={close} />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[20px]"
        style={{ background: "var(--bg)", border: "1px solid var(--line)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-4" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[.72rem] tracking-[.14em] uppercase mb-1" style={{ fontFamily: "var(--font-space-mono)", color: "var(--accent)" }}>
              <FlaskConical className="w-3.5 h-3.5" /> Sample Request
            </div>
            <h3 className="text-[1.3rem] uppercase leading-tight" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
              {product.name}
            </h3>
          </div>
          <button onClick={close} aria-label="Close" className="p-2 -mr-2 rounded-[8px] transition-colors hover:bg-white/10 cursor-pointer flex-shrink-0" style={{ color: "var(--muted)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-14">
            <div className="w-16 h-16 rounded-full grid place-items-center mb-4" style={{ background: "rgba(79,168,230,.1)" }}>
              <CheckCircle className="w-8 h-8" style={{ color: "var(--accent)" }} />
            </div>
            <h4 className="text-[1.6rem] uppercase mb-2" style={{ fontFamily: "var(--font-anton)" }}>Request Received!</h4>
            <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
              Thanks — our team will reach out shortly to arrange your sample.
            </p>
            <button
              onClick={close}
              className="px-6 py-3 rounded-[12px] font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
              style={{ background: "var(--accent)", color: "#000" }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Request a small sample bucket. Tell us your usual monthly usage so we can prepare the right quantities for future orders.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={labelStyle}>Name *</label>
                <input {...register("name")} placeholder="Your name" className={inputCls} style={{ ...inputStyle, borderColor: errors.name ? "#ef4444" : "var(--line-2)" }} />
                {errors.name && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.name.message}</p>}
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Phone / WhatsApp *</label>
                <input {...register("phone")} placeholder="03xx xxxxxxx" className={inputCls} style={{ ...inputStyle, borderColor: errors.phone ? "#ef4444" : "var(--line-2)" }} />
                {errors.phone && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.phone.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={labelStyle}>Business / Shop (optional)</label>
                <input {...register("business_name")} placeholder="Business name" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Email (optional)</label>
                <input {...register("email")} type="email" placeholder="you@example.com" className={inputCls} style={{ ...inputStyle, borderColor: errors.email ? "#ef4444" : "var(--line-2)" }} />
                {errors.email && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={labelStyle}>City (optional)</label>
                <input {...register("city")} placeholder="e.g. Karachi" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Address (optional)</label>
                <input {...register("address")} placeholder="Shipping address" className={inputCls} style={inputStyle} />
              </div>
            </div>

            <div>
              <label className={labelCls} style={labelStyle}>How much do you use per month? *</label>
              <select
                {...register("monthly_usage")}
                defaultValue=""
                className={inputCls}
                style={{ ...inputStyle, borderColor: errors.monthly_usage ? "#ef4444" : "var(--line-2)" }}
              >
                <option value="" disabled>Select estimated monthly usage</option>
                {MONTHLY_USAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.monthly_usage && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.monthly_usage.message}</p>}
            </div>

            {error && (
              <p className="text-sm px-4 py-2 rounded-[11px]" style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-[13px] font-semibold transition-all cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ background: "var(--accent)", color: "#000" }}
            >
              {isSubmitting ? "Sending…" : "Submit Sample Request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      {trigger}
      {mounted && open && createPortal(modal, document.body)}
    </>
  );
}
