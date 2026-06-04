"use client";
import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [nlEmail, setNlEmail] = useState("");
  const [nlState, setNlState] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [nlError, setNlError] = useState("");

  const handleNewsletter = async () => {
    if (!nlEmail.trim() || nlState === "submitting") return;
    setNlState("submitting");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: nlEmail }),
      });
      const data = await res.json();
      if (data.ok) {
        setNlState("ok");
      } else {
        setNlError(data.error ?? "Something went wrong.");
        setNlState("error");
      }
    } catch {
      setNlError("Network error. Please try again.");
      setNlState("error");
    }
  };

  return (
    <footer style={{ borderTop: "1px solid var(--line)" }} className="pt-20 pb-9">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div
              className="text-[1.8rem] tracking-[.06em] mb-4"
              style={{ fontFamily: "var(--font-anton)" }}
            >
              A<span style={{ color: "var(--accent)" }}>.</span>K AUTO CARE
            </div>
            <p className="text-[.92rem] max-w-[280px]" style={{ color: "var(--muted)" }}>
              Engineered car care for people who notice the details. Prep. Correct. Coat. Protect.
            </p>
          </div>

          {/* Shop */}
          <div className="flex flex-col">
            <h5
              className="text-[.72rem] tracking-[.14em] uppercase mb-5"
              style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
            >
              Shop
            </h5>
            <ul className="flex flex-col gap-3">
              {[
                { label: "All Products", href: "/shop" },
                { label: "New Arrivals", href: "/shop?sort=newest" },
                { label: "Best Sellers", href: "/shop?sort=featured" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[.92rem] opacity-80 hover:opacity-100 transition-opacity hover:text-[var(--accent)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="flex flex-col">
            <h5
              className="text-[.72rem] tracking-[.14em] uppercase mb-5"
              style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
            >
              Company
            </h5>
            <ul className="flex flex-col gap-3">
              {[
                { label: "About", href: "/about" },
                { label: "The Process", href: "/about#system" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[.92rem] opacity-80 hover:opacity-100 transition-opacity hover:text-[var(--accent)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col">
            <h5
              className="text-[.72rem] tracking-[.14em] uppercase mb-5"
              style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
            >
              Support
            </h5>
            <ul className="flex flex-col gap-3">
              {[
                { label: "Shipping & Returns", href: "/policies/shipping-returns" },
                { label: "Privacy Policy", href: "/policies/privacy" },
                { label: "Terms of Service", href: "/policies/terms" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[.92rem] opacity-80 hover:opacity-100 transition-opacity hover:text-[var(--accent)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col">
            <h5
              className="text-[.72rem] tracking-[.14em] uppercase mb-5"
              style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
            >
              Get Updates
            </h5>
            {nlState === "ok" ? (
              <p className="text-sm" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
                You&apos;re on the list.
              </p>
            ) : (
              <>
                <p className="text-[.82rem] mb-3" style={{ color: "var(--muted)" }}>
                  Detailing tips, drops &amp; deals.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={nlEmail}
                    onChange={(e) => { setNlEmail(e.target.value); if (nlState === "error") setNlState("idle"); }}
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-[9px] text-xs outline-none"
                    style={{ background: "var(--bg)", border: "1px solid var(--line-2)", color: "var(--text)", fontFamily: "var(--font-hanken)" }}
                    onKeyDown={(e) => e.key === "Enter" && handleNewsletter()}
                  />
                  <button
                    onClick={handleNewsletter}
                    disabled={nlState === "submitting"}
                    className="flex-shrink-0 px-3.5 py-2.5 rounded-[9px] text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
                    style={{ background: "var(--accent)", color: "#000" }}
                  >
                    {nlState === "submitting" ? "…" : "Join"}
                  </button>
                </div>
                {nlState === "error" && (
                  <p className="text-[.65rem] mt-1" style={{ color: "#ef4444" }}>{nlError}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between pt-7 gap-3 text-[.72rem] tracking-[.14em] uppercase text-center sm:text-left"
          style={{ borderTop: "1px solid var(--line)", fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
        >
          <span>© {new Date().getFullYear()} A.K. Auto Care — All rights reserved</span>
          <span className="sm:text-right">Privacy · Terms · Made with precision</span>
        </div>
      </div>
    </footer>
  );
}
