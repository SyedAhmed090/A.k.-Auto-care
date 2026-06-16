"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import SocialLinks from "@/components/ui/SocialLinks";
import { useSettings } from "@/components/providers/SettingsProvider";
import { whatsappDisplay } from "@/lib/settings";

export default function Footer() {
  const { store } = useSettings();
  const [logoError, setLogoError] = useState(false);
  const [nlEmail, setNlEmail] = useState("");
  const [nlState, setNlState] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [nlError, setNlError] = useState("");

  // Auto-clear the success message so the signup form returns after a few seconds
  useEffect(() => {
    if (nlState !== "ok") return;
    const t = setTimeout(() => {
      setNlState("idle");
      setNlEmail("");
    }, 5000);
    return () => clearTimeout(t);
  }, [nlState]);

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
            {/* Full lockup at public/logo.png. Shown by default; if missing/404s the
                onError handler swaps in the text wordmark. Gating on onError (not onLoad)
                avoids the cached-image race that could leave the logo permanently hidden. */}
            {!logoError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/logo.png"
                alt="A.K. Auto Care"
                onError={() => setLogoError(true)}
                className="h-[58px] w-auto object-contain mb-4"
              />
            ) : (
              <div
                className="text-[1.8rem] tracking-[.06em] mb-4"
                style={{ fontFamily: "var(--font-anton)" }}
              >
                A<span style={{ color: "var(--accent)" }}>.</span>K AUTO CARE
              </div>
            )}
            <p className="text-[.92rem] max-w-[280px]" style={{ color: "var(--muted)" }}>
              Engineered car care for people who notice the details. Prep. Correct. Coat. Protect.
            </p>
            <div className="mt-5 space-y-2.5">
              <a href={`tel:+${store.whatsapp}`} className="flex items-center gap-2.5 text-[.88rem] transition-colors hover:text-[var(--accent)]" style={{ color: "var(--muted)" }}>
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} /> {whatsappDisplay(store)}
              </a>
              <a href={`mailto:${store.email}`} className="flex items-center gap-2.5 text-[.88rem] transition-colors hover:text-[var(--accent)]" style={{ color: "var(--muted)" }}>
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} /> {store.email}
              </a>
            </div>
            <SocialLinks className="mt-5" />
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
                { label: "Tips & Guides", href: "/blog" },
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
                { label: "Track Order", href: "/order-tracking" },
                { label: "FAQ", href: "/faq" },
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
          <span className="sm:text-right flex items-center gap-2">
            <Link href="/policies/privacy" className="hover:text-[var(--accent)] transition-colors">Privacy</Link>
            <span aria-hidden>·</span>
            <Link href="/policies/terms" className="hover:text-[var(--accent)] transition-colors">Terms</Link>
            <span aria-hidden>·</span>
            <span>Made with precision</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
