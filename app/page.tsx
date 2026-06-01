"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { getFeaturedProducts } from "@/data/products";
import ProductCard from "@/components/product/ProductCard";

const MARQUEE_ITEMS = [
  "Surface Prep", "Paint Correction", "Ceramic Coatings",
  "Polish & Compound", "Wax & Sealant", "Microfiber", "Pro-Grade Chemistry",
];

export default function HomePage() {
  const featured = getFeaturedProducts();
  const glowRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Cursor glow effect
  useEffect(() => {
    const hero = heroRef.current;
    const glow = glowRef.current;
    if (!hero || !glow) return;
    const fn = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      glow.style.left = e.clientX - r.left + "px";
      glow.style.top = e.clientY - r.top + "px";
      glow.style.opacity = "1";
    };
    const hide = () => { glow.style.opacity = "0"; };
    hero.addEventListener("mousemove", fn);
    hero.addEventListener("mouseleave", hide);
    return () => { hero.removeEventListener("mousemove", fn); hero.removeEventListener("mouseleave", hide); };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    // Hero fires immediately
    document.querySelectorAll("#hero .reveal").forEach((el) =>
      requestAnimationFrame(() => el.classList.add("in"))
    );
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-between overflow-hidden pt-[120px] sm:pt-[140px] lg:pt-[160px]"
      >
        {/* Accent glow */}
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "1100px", height: "700px",
            background: "radial-gradient(ellipse at center, rgba(216,255,53,.10), transparent 60%)",
            filter: "blur(20px)",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 90% 70% at 50% 30%,#000 30%,transparent 75%)",
          }}
        />
        {/* Cursor glow */}
        <div
          ref={glowRef}
          className="absolute pointer-events-none rounded-full opacity-0 transition-opacity duration-300"
          style={{
            width: "380px", height: "380px",
            background: "radial-gradient(circle,rgba(216,255,53,.13),transparent 70%)",
            transform: "translate(-50%,-50%)",
            mixBlendMode: "screen",
            zIndex: 1,
          }}
        />

        {/* Hero content */}
        <div className="relative z-[2] max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div
            className="reveal flex items-center gap-2.5 mb-8"
            style={{ color: "var(--muted)" }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full"
              style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }}
            />
            <span
              className="text-[.72rem] tracking-[.14em] uppercase"
              style={{ fontFamily: "var(--font-space-mono)" }}
            >
              Pro-grade surface science
            </span>
          </div>

          <h1
            className="reveal uppercase leading-[.92] tracking-[.01em]"
            style={{
              fontFamily: "var(--font-anton)",
              fontSize: "clamp(3.4rem, 9.5vw, 9rem)",
            }}
            data-d="0"
          >
            <span className="block">FLAWLESS</span>
            <span
              className="block"
              style={{
                background: "linear-gradient(170deg,#fff 0%,#e7eaef 18%,#9aa0ab 46%,#fff 60%,#aeb4be 78%,#5b606b 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              FINISH,
            </span>
            <span
              className="block"
              style={{
                WebkitTextStroke: "1.4px #c5cad2",
                color: "transparent",
                WebkitTextFillColor: "transparent",
              }}
            >
              START
            </span>
            <span className="block">TO FINISH.</span>
          </h1>

          <p
            className="reveal mt-7 text-[1.12rem] max-w-[520px]"
            style={{ color: "var(--muted)" }}
          >
            Prep, correct, coat, protect. Engineered car care products trusted by
            detailers and obsessives who refuse to settle for &ldquo;good enough.&rdquo;
          </p>

          <div className="reveal flex flex-wrap gap-4 mt-9">
            <Link
              href="/shop"
              className="btn-accent inline-flex items-center gap-2.5 px-7 py-4 rounded-[13px] font-semibold text-[.97rem] transition-all duration-300 hover:-translate-y-0.5"
            >
              Shop the lineup <ArrowUpRight className="w-[18px] h-[18px]" />
            </Link>
            <Link
              href="/about"
              className="btn-ghost inline-flex items-center gap-2.5 px-7 py-4 rounded-[13px] font-semibold text-[.97rem] transition-all duration-300 hover:-translate-y-0.5"
            >
              See the process
            </Link>
          </div>
        </div>

        {/* Hero stage panel */}
        <div className="relative z-[2] max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full mt-14 reveal">
          {/* Reflective panel */}
          <div
            className="relative h-[330px] rounded-[26px] overflow-hidden"
            style={{
              background: "radial-gradient(120% 90% at 30% 0%,rgba(216,255,53,.10),transparent 55%), linear-gradient(178deg,#2a2f38 0%,#11141a 26%,transparent 40%,#0a0d12 58%,#1d222b 100%), #0a0c10",
              border: "1px solid var(--line-2)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), 0 40px 80px rgba(0,0,0,.6)",
            }}
          >
            {/* Light sweep */}
            <div
              className="absolute top-0 h-full w-[45%] pointer-events-none"
              style={{
                background: "linear-gradient(105deg,transparent,rgba(255,255,255,.16) 45%,rgba(255,255,255,.28) 50%,rgba(255,255,255,.10) 55%,transparent)",
                transform: "skewX(-18deg)",
                animation: "sweep 7s cubic-bezier(.22,1,.36,1) infinite",
              }}
            />
            {/* Horizon line */}
            <div
              className="absolute left-0 right-0 top-[38%] h-[2px]"
              style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)" }}
            />
            <Image
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80"
              alt="Luxury car"
              fill
              priority
              className="object-cover opacity-40"
            />


            <div className="absolute bottom-6 left-5 right-5 sm:left-7 sm:right-7 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-5 z-[2]">
              <div
                className="text-[clamp(1.6rem,3vw,2.6rem)] tracking-[.04em] uppercase"
                style={{
                  fontFamily: "var(--font-anton)",
                  background: "linear-gradient(170deg,#fff 0%,#e7eaef 18%,#9aa0ab 46%,#fff 60%,#aeb4be 78%,#5b606b 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                MIRROR-GRADE GLOSS
              </div>
              <div className="flex gap-2.5 flex-wrap">
                {["9H Hardness", "5-Yr Protection", "Streak-Free"].map((t) => (
                  <span
                    key={t}
                    className="text-[.72rem] tracking-[.14em] uppercase px-3.5 py-1.5 rounded-full"
                    style={{
                      border: "1px solid var(--line-2)",
                      background: "rgba(8,9,11,.4)",
                      backdropFilter: "blur(6px)",
                      fontFamily: "var(--font-space-mono)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4"
            style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
          >
            {[
              { n: "48K+", l: "Panels coated" },
              { n: "120+", l: "Pro detailers" },
              { n: "4.9", l: "Avg rating" },
              { n: "100%", l: "Lab tested", accent: true },
            ].map((s, i) => (
              <div
                key={s.l}
                className={`py-6 px-6 flex flex-col justify-center${
                  i === 0 ? " border-r border-b sm:border-b-0" :
                  i === 1 ? " sm:border-r border-b sm:border-b-0" :
                  i === 2 ? " border-r" :
                  ""
                }`}
                style={{ borderColor: "var(--line)" }}
              >
                <div
                  className="text-[2.2rem] tracking-[.02em]"
                  style={{
                    fontFamily: "var(--font-anton)",
                    ...(s.accent
                      ? { color: "var(--accent)" }
                      : {
                          background: "linear-gradient(170deg,#fff 0%,#e7eaef 18%,#9aa0ab 46%,#fff 60%,#aeb4be 78%,#5b606b 100%)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                        }),
                  }}
                >
                  {s.n}
                </div>
                <div className="text-[.72rem] tracking-[.14em] uppercase" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div
        className="overflow-hidden"
        style={{ borderBottom: "1px solid var(--line)", background: "var(--accent)" }}
      >
        <div className="flex items-center gap-[34px] py-[14px] whitespace-nowrap marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-[34px]">
              <span
                className="text-[.85rem] font-bold tracking-[.18em] uppercase"
                style={{ fontFamily: "var(--font-space-mono)", color: "#0a0b0d" }}
              >
                {item}
              </span>
              <span className="text-[.9rem] opacity-50" style={{ color: "#0a0b0d" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED PRODUCT SPOTLIGHT ── */}
      <section style={{ borderTop: "1px solid var(--line)" }} className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Stage */}
            <div
              className="reveal relative h-[540px] rounded-[24px] overflow-hidden grid place-items-center"
              style={{
                background: "radial-gradient(80% 70% at 50% 35%,#1a1e26,#0a0c10 70%)",
                border: "1px solid var(--line)",
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                alt="Ceramic coating product"
                fill
                className="object-cover opacity-30"
              />
              {/* CSS product bottle */}
              <div className="relative z-[2] flex flex-col items-center">
                <div
                  className="relative w-28 h-52 rounded-[20px] flex flex-col items-center justify-center gap-3"
                  style={{
                    background: "linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.03))",
                    border: "1px solid rgba(255,255,255,.18)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.28),0 40px 80px rgba(0,0,0,.6),0 0 80px rgba(216,255,53,.08)",
                  }}
                >
                  <div
                    className="absolute top-0 left-[22%] w-[14%] h-[55%] rounded-full pointer-events-none"
                    style={{ background: "linear-gradient(180deg,rgba(255,255,255,.35),transparent)" }}
                  />
                  <span className="text-[2.2rem] tracking-[.06em]" style={{ fontFamily: "var(--font-anton)", color: "var(--accent)" }}>9H</span>
                  <span className="text-[.55rem] tracking-[.22em] uppercase text-center px-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                    Ceramic<br />Pro Coat
                  </span>
                  <div className="w-8 h-[1px]" style={{ background: "var(--line-2)" }} />
                  <span className="text-[.5rem] tracking-[.16em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted-2)" }}>
                    A.K. Auto Care
                  </span>
                </div>
                <div
                  className="w-16 h-3 mt-1 rounded-full opacity-20"
                  style={{ background: "radial-gradient(ellipse,rgba(216,255,53,.7),transparent)" }}
                />
              </div>
              {/* Rings */}
              <div
                className="absolute w-[380px] h-[380px] rounded-full pointer-events-none"
                style={{ border: "1px solid var(--line-2)", boxShadow: "0 0 80px rgba(216,255,53,.06)" }}
              />
              <div
                className="absolute w-[520px] h-[520px] rounded-full pointer-events-none opacity-50"
                style={{ border: "1px solid var(--line-2)" }}
              />
              {/* Floating specs */}
              <div
                className="absolute top-[60px] right-[34px] rounded-[12px] px-4 py-3 z-[3]"
                style={{ background: "rgba(8,9,11,.7)", backdropFilter: "blur(8px)", border: "1px solid var(--line-2)" }}
              >
                <div
                  className="text-[1.3rem]"
                  style={{
                    fontFamily: "var(--font-anton)",
                    background: "linear-gradient(170deg,#fff 0%,#e7eaef 18%,#9aa0ab 46%,#fff 60%,#aeb4be 78%,#5b606b 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  9H
                </div>
                <div className="text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                  Hardness
                </div>
              </div>
              <div
                className="absolute bottom-[70px] left-[30px] rounded-[12px] px-4 py-3 z-[3]"
                style={{ background: "rgba(8,9,11,.7)", backdropFilter: "blur(8px)", border: "1px solid var(--line-2)" }}
              >
                <div className="text-[1.3rem]" style={{ fontFamily: "var(--font-anton)", color: "var(--accent)" }}>110°</div>
                <div className="text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                  Contact angle
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="reveal">
              <div
                className="flex items-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase"
                style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
              >
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                Hero Product
              </div>
              <h3
                className="uppercase leading-[.98] tracking-[.01em]"
                style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem,4vw,3.2rem)" }}
              >
                Ceramic<br />Pro 9H Coat
              </h3>
              <div
                className="text-[2.4rem] my-4"
                style={{
                  fontFamily: "var(--font-anton)",
                  background: "linear-gradient(170deg,#fff 0%,#e7eaef 18%,#9aa0ab 46%,#fff 60%,#aeb4be 78%,#5b606b 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  display: "inline-block",
                }}
              >
                £89.99
              </div>
              <p className="max-w-[440px] mb-7" style={{ color: "var(--muted)" }}>
                A single-layer nano-ceramic coating that locks in a deep, glassy gloss and shrugs off water, grime, and UV for years — not weeks.
              </p>
              <div style={{ borderTop: "1px solid var(--line)" }} className="mb-7">
                {[
                  { k: "Coverage", v: "Up to 2 vehicles" },
                  { k: "Durability", v: "5+ years" },
                  { k: "Cure time", v: "24 hrs" },
                  { k: "Finish", v: "High-gloss / hydrophobic" },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="flex justify-between py-3.5 text-sm"
                    style={{ borderBottom: "1px solid var(--line)" }}
                  >
                    <span style={{ color: "var(--muted)" }}>{row.k}</span>
                    <span className="font-semibold">{row.v}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/products/armour-ceramic-9h"
                className="btn-accent inline-flex items-center gap-2.5 px-7 py-4 rounded-[13px] font-semibold text-[.97rem] transition-all duration-300 hover:-translate-y-0.5"
              >
                View Product <ArrowUpRight className="w-[18px] h-[18px]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ── */}
      <section style={{ borderTop: "1px solid var(--line)" }} className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-7 mb-12 flex-wrap reveal">
            <div>
              <div
                className="flex items-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase"
                style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
              >
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                02 — Best Sellers
              </div>
              <h2
                className="uppercase leading-[.96] tracking-[.01em]"
                style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.2rem,5vw,4rem)" }}
              >
                Stock the<br />essentials
              </h2>
            </div>
            <Link
              href="/shop"
              className="btn-ghost inline-flex items-center gap-2.5 px-6 py-3 rounded-[13px] font-semibold text-[.97rem] transition-all duration-300 hover:-translate-y-0.5"
            >
              View all products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section style={{ borderTop: "1px solid var(--line)" }} className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-7 mb-0 flex-wrap reveal">
            <div>
              <div
                className="flex items-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase"
                style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
              >
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                03 — The System
              </div>
              <h2
                className="uppercase leading-[.96] tracking-[.01em]"
                style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.2rem,5vw,4rem)" }}
              >
                Four steps to<br />showroom shine
              </h2>
            </div>
            <p className="max-w-[360px] text-[.92rem]" style={{ color: "var(--muted)" }}>
              Follow the sequence detailers swear by. Each product hands off to the next.
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-12"
            style={{ borderTop: "1px solid var(--line)" }}
          >
            {[
              { n: "01", title: "Prep", body: "Strip contaminants and old protection so the surface is truly clean and decontaminated." },
              { n: "02", title: "Correct", body: "Cut and refine swirls, scratches, and oxidation back to a flat, defect-free finish." },
              { n: "03", title: "Coat", body: "Lay down nano-ceramic protection that bonds to the paint for a glass-like shell." },
              { n: "04", title: "Protect", body: "Maintain the gloss with toppers and washes designed to keep the coating alive." },
            ].map((step, i) => (
              <div
                key={step.n}
                className={`reveal py-8 px-6 first:pl-0 last:pr-0 border-b lg:border-b-0${
                  i < 3 ? " lg:border-r" : ""
                }`}
                style={{ borderColor: "var(--line)" }}
              >
                <div
                  className="text-[.8rem] mb-12"
                  style={{ fontFamily: "var(--font-space-mono)", color: "var(--accent)" }}
                >
                  / STEP {step.n}
                </div>
                <h4
                  className="uppercase tracking-[.02em] mb-2.5"
                  style={{ fontFamily: "var(--font-anton)", fontSize: "1.5rem" }}
                >
                  {step.title}
                </h4>
                <p className="text-[.95rem]" style={{ color: "var(--muted)" }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="reveal relative rounded-[28px] overflow-hidden py-14 px-6 sm:py-16 sm:px-12 lg:py-[72px] lg:px-[60px]"
            style={{
              background: "radial-gradient(120% 120% at 80% 0%,rgba(216,255,53,.10),transparent 50%), linear-gradient(160deg,var(--surface),var(--bg-2))",
              border: "1px solid var(--line-2)",
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&q=80"
              alt="Detailing"
              fill
              className="object-cover opacity-25"
            />
            <div className="relative z-[2] flex flex-col items-center text-center">
              <div
                className="flex items-center justify-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase"
                style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}
              >
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                Join the garage
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
              </div>
              <h2
                className="uppercase leading-[.96] tracking-[.01em] mb-4"
                style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.2rem,5vw,4.2rem)" }}
              >
                Detailing tips,<br />drops &amp; deals.
              </h2>
              <p className="max-w-[460px] mx-auto mb-8 text-[.97rem]" style={{ color: "var(--muted)" }}>
                Get early access to new products and pro how-tos. No spam — just gloss.
              </p>
              <div className="flex gap-3 max-w-[480px] mx-auto flex-wrap justify-center">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 min-w-[220px] px-5 py-4 rounded-[13px] text-[1rem] outline-none transition-all"
                  style={{
                    background: "rgba(8,9,11,.6)",
                    border: "1px solid var(--line-2)",
                    color: "var(--text)",
                    fontFamily: "var(--font-hanken)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--line-2)")}
                />
                <button
                  className="btn-accent px-7 py-4 rounded-[13px] font-semibold transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
