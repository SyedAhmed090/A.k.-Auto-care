"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Subject required"),
  message: z.string().min(10, "At least 10 characters"),
});
type FormData = z.infer<typeof schema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.ok) {
        setSent(true);
      } else {
        // show error in the form
        setError(json.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Could not send message. Please try again.");
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-[11px] text-sm outline-none transition-all";
  const inputStyle = { background: "var(--surface)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div className="pt-14 pb-16" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 mb-3 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
            <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
            Get in Touch
          </div>
          <h1 className="uppercase leading-[.96] tracking-[.01em]" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.5rem,6vw,5rem)" }}>
            Contact Us
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-14 items-start">
          <div>
            <h2 className="uppercase mb-4" style={{ fontFamily: "var(--font-anton)", fontSize: "1.6rem" }}>We&apos;re here<br />to help</h2>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--muted)" }}>
              Questions about products, orders, or detailing advice? Send us a message and we&apos;ll reply within 24 hours.
            </p>
            <div className="space-y-5">
              {[
                { icon: Mail, label: "Email", value: "hello@akautocare.pk", href: "mailto:hello@akautocare.pk" },
                { icon: Phone, label: "Phone", value: `+92 ${WHATSAPP_NUMBER.slice(1, 4)} ${WHATSAPP_NUMBER.slice(4)}`, href: `tel:+${WHATSAPP_NUMBER}` },
                { icon: MapPin, label: "Location", value: "Block 7, PECHS, Karachi — 75400", href: "#" },
              ].map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} className="flex items-center gap-4 group">
                  <div
                    className="w-10 h-10 rounded-[11px] grid place-items-center flex-shrink-0 transition-all group-hover:bg-[var(--accent)]"
                    style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
                  >
                    <Icon className="w-[18px] h-[18px] transition-colors group-hover:text-black" style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>{label}</p>
                    <p className="text-sm font-semibold group-hover:text-[var(--accent)] transition-colors truncate">{value}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {sent ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-center rounded-[20px]"
                style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
              >
                <div className="w-16 h-16 rounded-full grid place-items-center mb-4" style={{ background: "rgba(216,255,53,.1)" }}>
                  <CheckCircle className="w-8 h-8" style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-[1.8rem] uppercase mb-2" style={{ fontFamily: "var(--font-anton)" }}>Message Sent!</h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>We&apos;ll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="rounded-[20px] p-8 space-y-5"
                style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[.72rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Name</label>
                    <input {...register("name")} placeholder="Your name" className={inputCls} style={{ ...inputStyle, borderColor: errors.name ? "#ef4444" : "var(--line-2)" }} />
                    {errors.name && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[.72rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Email</label>
                    <input {...register("email")} type="email" placeholder="you@example.com" className={inputCls} style={{ ...inputStyle, borderColor: errors.email ? "#ef4444" : "var(--line-2)" }} />
                    {errors.email && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-[.72rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Subject</label>
                  <input {...register("subject")} placeholder="How can we help?" className={inputCls} style={{ ...inputStyle, borderColor: errors.subject ? "#ef4444" : "var(--line-2)" }} />
                  {errors.subject && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="block text-[.72rem] tracking-[.14em] uppercase mb-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Message</label>
                  <textarea {...register("message")} rows={5} placeholder="Tell us more…" className={inputCls} style={{ ...inputStyle, borderColor: errors.message ? "#ef4444" : "var(--line-2)", resize: "vertical" }} />
                  {errors.message && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.message.message}</p>}
                </div>
                {error && (
                  <p className="text-sm px-4 py-2 rounded-[11px]" style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-4 rounded-[13px] font-semibold transition-all cursor-pointer disabled:opacity-50 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  style={{ background: "var(--accent)", color: "#000" }}
                >
                  {isSubmitting ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
