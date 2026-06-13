"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Truck, RotateCcw, Shield, MessageCircle } from "lucide-react";
import type { Product } from "@/data/products";
import categories from "@/data/categories";
import ProductCard from "@/components/product/ProductCard";

const MARQUEE_ITEMS = [
  "Surface Prep", "Paint Correction", "Ceramic Coatings",
  "Polish & Compound", "Wax & Sealant", "Microfiber", "Pro-Grade Chemistry",
];

export default function HomeClient({ featured }: { featured: Product[] }) {
  const heroRef = useRef<HTMLElement>(null);
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

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    document.querySelectorAll("#hero .reveal").forEach((el) =>
      requestAnimationFrame(() => el.classList.add("in"))
    );
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section id="hero" ref={heroRef} className="flex flex-col">

        {/* ── VIDEO BLOCK ── */}
        <div
          className="relative overflow-hidden min-h-[85vh] flex flex-col justify-end pt-[120px] sm:pt-[140px] lg:pt-[160px] pb-20"
          style={{ background: "radial-gradient(120% 100% at 50% 40%, #221e15, var(--bg))" }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover hidden md:block"
            style={{ zIndex: 0 }}
            src="/mixkit-close-up-of-a-man-polishing-a-newly-polished-car-47833-hd-ready.mp4"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 1,
              background: "linear-gradient(180deg, rgba(12,11,8,.65) 0%, rgba(12,11,8,.45) 40%, rgba(12,11,8,.80) 100%)",
            }}
          />
          <div
            className="absolute top-[-10%] left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              zIndex: 1,
              width: "1100px", height: "700px",
              background: "radial-gradient(ellipse at center, rgba(232,160,32,.10), transparent 60%)",
              filter: "blur(20px)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              zIndex: 1,
              backgroundImage: "linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(ellipse 90% 70% at 50% 30%,#000 30%,transparent 75%)",
            }}
          />

          <div className="relative z-[3] max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="reveal flex items-center gap-2.5 mb-8" style={{ color: "var(--muted)" }}>
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent)" }} />
              <span className="text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)" }}>
                Pro-grade surface science
              </span>
            </div>

            <p className="reveal text-[1.15rem] mb-5" style={{ fontFamily: "serif", color: "var(--accent)", direction: "rtl" }}>
              پاکستان کا بہترین کار کیئر برانڈ
            </p>

            <h1
              className="reveal uppercase leading-[.92] tracking-[.01em]"
              style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(3.4rem, 9.5vw, 9rem)" }}
              data-d="0"
            >
              <span className="block">FLAWLESS</span>
              <span className="block" style={{ background: "linear-gradient(170deg,#fff 0%,#e7eaef 18%,#9aa0ab 46%,#fff 60%,#aeb4be 78%,#5b606b 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                FINISH,
              </span>
              <span className="block" style={{ WebkitTextStroke: "1.4px #c5cad2", color: "transparent", WebkitTextFillColor: "transparent" }}>
                START
              </span>
              <span className="block">TO FINISH.</span>
            </h1>

            <p className="reveal mt-7 text-[1.12rem] max-w-[520px]" style={{ color: "var(--muted)" }}>
              Prep, correct, coat, protect. Engineered car care products trusted by detailers and obsessives who refuse to settle for &ldquo;good enough.&rdquo;
            </p>

            <div className="reveal flex flex-wrap gap-4 mt-9">
              <Link href="/shop" className="btn-accent inline-flex items-center gap-2.5 px-7 py-4 rounded-[13px] font-semibold text-[.97rem] transition-all duration-300 hover:-translate-y-0.5">
                Shop the lineup <ArrowUpRight className="w-[18px] h-[18px]" />
              </Link>
              <Link href="/about" className="btn-ghost inline-flex items-center gap-2.5 px-7 py-4 rounded-[13px] font-semibold text-[.97rem] transition-all duration-300 hover:-translate-y-0.5">
                See the process
              </Link>
            </div>
          </div>
        </div>

        {/* ── STAGE PANEL ── */}
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 w-full mt-14 reveal">
          <div
            className="relative h-[330px] rounded-[26px] overflow-hidden"
            style={{
              background: "radial-gradient(120% 90% at 30% 0%,rgba(232,160,32,.12),transparent 55%), linear-gradient(178deg,#2a251a 0%,#131009 26%,transparent 40%,#0c0a07 58%,#1f1b12 100%), #0c0a07",
              border: "1px solid var(--line-2)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), 0 40px 80px rgba(0,0,0,.6)",
            }}
          >
            <div
              className="absolute top-0 h-full w-[45%] pointer-events-none"
              style={{
                background: "linear-gradient(105deg,transparent,rgba(255,255,255,.16) 45%,rgba(255,255,255,.28) 50%,rgba(255,255,255,.10) 55%,transparent)",
                transform: "skewX(-18deg)",
                animation: "sweep 7s cubic-bezier(.22,1,.36,1) infinite",
              }}
            />
            <div className="absolute left-0 right-0 top-[38%] h-[2px]" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)" }} />

            <div className="absolute bottom-6 left-5 right-5 sm:left-7 sm:right-7 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-5 z-[2]">
              <div className="text-[clamp(1.6rem,3vw,2.6rem)] tracking-[.04em] uppercase" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
                MIRROR-GRADE GLOSS
              </div>
              <div className="flex gap-2.5 flex-wrap">
                {["9H Hardness", "5-Yr Protection", "Streak-Free"].map((t) => (
                  <span key={t} className="text-[.72rem] tracking-[.14em] uppercase px-3.5 py-1.5 rounded-full" style={{ border: "1px solid var(--line-2)", background: "rgba(12,11,8,.4)", backdropFilter: "blur(6px)", fontFamily: "var(--font-space-mono)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            {[
              { n: "48K+", l: "Panels coated" },
              { n: "120+", l: "Pro detailers" },
              { n: "4.9", l: "Avg rating" },
              { n: "100%", l: "Lab tested", accent: true },
            ].map((s, i) => (
              <div
                key={s.l}
                className={`py-6 px-6 flex flex-col justify-center${i === 0 ? " border-r border-b sm:border-b-0" : i === 1 ? " sm:border-r border-b sm:border-b-0" : i === 2 ? " border-r" : ""}`}
                style={{ borderColor: "var(--line)" }}
              >
                <div className="text-[2.2rem] tracking-[.02em]" style={{ fontFamily: "var(--font-hanken)", fontWeight: 700, color: s.accent ? "var(--accent)" : "var(--text)" }}>
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

      {/* ── TRUST BAR ── */}
      <div style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {[
              { icon: Truck,         label: "Free Delivery",    sub: "Orders over Rs 5,000" },
              { icon: RotateCcw,     label: "30-Day Returns",   sub: "Hassle-free policy" },
              { icon: Shield,        label: "100% Genuine",     sub: "Lab-tested formulas" },
              { icon: MessageCircle, label: "WhatsApp Support", sub: "Reply in minutes" },
            ].map(({ icon: Icon, label, sub }, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 py-4 px-5${i % 2 === 0 ? " border-r" : ""}${i < 2 ? " border-b sm:border-b-0" : ""}${i < 3 && i % 2 !== 0 ? " sm:border-r" : ""}`}
                style={{ borderColor: "var(--line)" }}
              >
                <div className="w-8 h-8 rounded-[8px] grid place-items-center flex-shrink-0" style={{ background: "rgba(232,160,32,.1)" }}>
                  <Icon className="w-4 h-4" style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p className="text-[.78rem] font-semibold leading-tight">{label}</p>
                  <p className="text-[.68rem] mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MARQUEE ── */}
      <div className="overflow-hidden opacity-40" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="flex items-center gap-[34px] py-[12px] whitespace-nowrap marquee-track" style={{ animationDuration: "80s" }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-[34px]">
              <span className="text-[.68rem] tracking-[.18em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>{item}</span>
              <span className="text-[.7rem] opacity-40" style={{ color: "var(--muted)" }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED PRODUCT SPOTLIGHT ── */}
      <section style={{ borderTop: "1px solid var(--line)", background: "var(--bg-2)" }} className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div
              className="reveal relative h-[540px] rounded-[24px] overflow-hidden grid place-items-center"
              style={{ background: "radial-gradient(80% 70% at 50% 35%,#221e15,#0c0a07 70%)", border: "1px solid var(--line)" }}
            >
              <div className="relative z-[2] flex flex-col items-center">
                <div
                  className="relative w-28 h-52 rounded-[20px] flex flex-col items-center justify-center gap-3"
                  style={{
                    background: "linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.03))",
                    border: "1px solid rgba(255,255,255,.18)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,.28),0 40px 80px rgba(0,0,0,.6),0 0 80px rgba(232,160,32,.10)",
                  }}
                >
                  <div className="absolute top-0 left-[22%] w-[14%] h-[55%] rounded-full pointer-events-none" style={{ background: "linear-gradient(180deg,rgba(255,255,255,.35),transparent)" }} />
                  <span className="text-[2.2rem] tracking-[.06em]" style={{ fontFamily: "var(--font-anton)", color: "var(--accent)" }}>9H</span>
                  <span className="text-[.55rem] tracking-[.22em] uppercase text-center px-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Ceramic<br />Pro Coat</span>
                  <div className="w-8 h-[1px]" style={{ background: "var(--line-2)" }} />
                  <span className="text-[.5rem] tracking-[.16em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted-2)" }}>A.K. Auto Care</span>
                </div>
                <div className="w-16 h-3 mt-1 rounded-full opacity-20" style={{ background: "radial-gradient(ellipse,rgba(232,160,32,.6),transparent)" }} />
              </div>
              <div className="absolute w-[380px] h-[380px] rounded-full pointer-events-none" style={{ border: "1px solid var(--line-2)", boxShadow: "0 0 80px rgba(232,160,32,.08)" }} />
              <div className="absolute w-[520px] h-[520px] rounded-full pointer-events-none opacity-50" style={{ border: "1px solid var(--line-2)" }} />
              <div className="absolute top-[60px] right-[34px] rounded-[12px] px-4 py-3 z-[3]" style={{ background: "rgba(12,11,8,.7)", backdropFilter: "blur(8px)", border: "1px solid var(--line-2)" }}>
                <div className="text-[1.3rem]" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>9H</div>
                <div className="text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Hardness</div>
              </div>
              <div className="absolute bottom-[70px] left-[30px] rounded-[12px] px-4 py-3 z-[3]" style={{ background: "rgba(12,11,8,.7)", backdropFilter: "blur(8px)", border: "1px solid var(--line-2)" }}>
                <div className="text-[1.3rem]" style={{ fontFamily: "var(--font-anton)", color: "var(--accent)" }}>110°</div>
                <div className="text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>Contact angle</div>
              </div>
            </div>

            <div className="reveal">
              <div className="flex items-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                Hero Product
              </div>
              <h3 className="uppercase leading-[.98] tracking-[.01em]" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem,4vw,3.2rem)" }}>
                Ceramic<br />Pro 9H Coat
              </h3>
              <div className="text-[2.4rem] my-4" style={{ fontFamily: "var(--font-hanken)", fontWeight: 700, color: "var(--text)", display: "inline-block" }}>
                Rs 32,999
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
                  <div key={row.k} className="flex justify-between py-3.5 text-sm" style={{ borderBottom: "1px solid var(--line)" }}>
                    <span style={{ color: "var(--muted)" }}>{row.k}</span>
                    <span className="font-semibold">{row.v}</span>
                  </div>
                ))}
              </div>
              <Link href="/products/armour-ceramic-9h" className="btn-accent inline-flex items-center gap-2.5 px-7 py-4 rounded-[13px] font-semibold text-[.97rem] transition-all duration-300 hover:-translate-y-0.5">
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
              <div className="flex items-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                02 — Best Sellers
              </div>
              <h2 className="uppercase leading-[.96] tracking-[.01em]" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.2rem,5vw,4rem)" }}>
                Stock the<br />essentials
              </h2>
            </div>
            <Link href="/shop" className="btn-ghost inline-flex items-center gap-2.5 px-6 py-3 rounded-[13px] font-semibold text-[.97rem] transition-all duration-300 hover:-translate-y-0.5">
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

      {/* ── CATEGORY SHOWCASE ── */}
      <section style={{ borderTop: "1px solid var(--line)", background: "var(--bg-2)" }} className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-7 mb-12 flex-wrap reveal">
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                Shop by Category
              </div>
              <h2 className="uppercase leading-[.96] tracking-[.01em]" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.2rem,5vw,4rem)" }}>
                Every product<br />in its place
              </h2>
            </div>
            <Link href="/shop" className="btn-ghost inline-flex items-center gap-2.5 px-6 py-3 rounded-[13px] font-semibold text-[.97rem] transition-all duration-300 hover:-translate-y-0.5">
              All products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} className="category-card group reveal rounded-[var(--r-lg)] p-6 flex flex-col justify-between min-h-[170px] transition-all hover:-translate-y-0.5">
                <div className="text-[.68rem] tracking-[.18em] uppercase mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                  <span className="w-4 h-[1px]" style={{ background: "var(--accent)" }} />
                  {cat.slug.replace(/-/g, " ")}
                </div>
                <div>
                  <h3 className="uppercase leading-[.96] tracking-[.01em] mb-2 transition-colors group-hover:text-[var(--accent)]" style={{ fontFamily: "var(--font-anton)", fontSize: "1.5rem" }}>
                    {cat.name}
                  </h3>
                  <p className="text-[.85rem] line-clamp-2 mb-4" style={{ color: "var(--muted)" }}>{cat.description}</p>
                </div>
                <div className="flex items-center gap-1 text-[.75rem] font-semibold" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
                  Shop now <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ── */}
      <section style={{ borderTop: "1px solid var(--line)" }} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal">
              <div className="flex items-center gap-2.5 mb-6 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                Our Standard
              </div>
              <h2 className="uppercase leading-[.96] tracking-[.01em] mb-6" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>
                Engineered for<br />people who notice
              </h2>
              <p className="text-[.96rem] leading-relaxed mb-4" style={{ color: "var(--muted)" }}>
                Every formula in the A.K. lineup is developed for one outcome: a finish so clean it reflects the sky. We don&apos;t do approximate. We don&apos;t do &ldquo;good enough.&rdquo; We engineer surface chemistry for detailers who can see the difference between 70% and 100%.
              </p>
              <p className="text-[.96rem] leading-relaxed mb-8" style={{ color: "var(--muted)" }}>
                Formulated and distributed from Karachi. Tested on everything from daily commuters to concours-level restorations — in Pakistan&apos;s heat, dust, and monsoon.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 text-[.88rem] font-semibold transition-colors" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
                Our story <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="reveal grid grid-cols-2 gap-4">
              {[
                { stat: "2019", label: "Founded" },
                { stat: "40+", label: "Formulas tested" },
                { stat: "14", label: "Products in range" },
                { stat: "100%", label: "Pakistan made" },
              ].map((item) => (
                <div key={item.stat} className="rounded-[14px] p-6 flex flex-col gap-2" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
                  <span className="text-[2.4rem] leading-none font-bold" style={{ fontFamily: "var(--font-hanken)", color: "var(--text)" }}>{item.stat}</span>
                  <span className="text-[.72rem] tracking-[.12em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ borderTop: "1px solid var(--line)", background: "var(--surface)" }} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <div className="flex items-center justify-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
              <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
              Verified Reviews
              <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
            </div>
            <h2 className="uppercase leading-[.96] tracking-[.01em]" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>
              What detailers say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Ahmed K.", role: "Car Enthusiast, Karachi", text: "My Civic was looking terrible after monsoon season — the ceramic coating completely transformed it. Six months later, rainwater still beads off perfectly. Best product I've found in Pakistan.", rating: 5 },
              { name: "Hassan M.", role: "Professional Detailer, Lahore", text: "In Punjab's summers, paint gets destroyed by UV and dust. The Armour 9H Ceramic is the only coating I've found that actually holds up through a Pakistani summer without fading or water spotting.", rating: 5 },
              { name: "Sana R.", role: "Detailing Studio Owner, Islamabad", text: "We detail 20+ cars a month. A.K.'s compound and polish combo gives consistent, world-class results every time — and the WhatsApp support is fast and genuinely helpful.", rating: 5 },
            ].map((review) => (
              <div key={review.name} className="reveal rounded-[16px] p-7 flex flex-col gap-4" style={{ border: "1px solid var(--line-2)", background: "rgba(255,255,255,.025)" }}>
                <div className="flex gap-0.5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4" viewBox="0 0 16 16" fill="#fbbf24">
                      <path d="M8 1l1.85 3.75L14 5.5l-3 2.9.7 4.1L8 10.5l-3.7 1.95L5 8.4 2 5.5l4.15-.75L8 1z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[.92rem] leading-relaxed flex-1" style={{ color: "var(--muted)" }}>&ldquo;{review.text}&rdquo;</p>
                <div>
                  <div className="text-[.88rem] font-semibold" style={{ color: "var(--text)", fontFamily: "var(--font-hanken)" }}>{review.name}</div>
                  <div className="text-[.72rem] tracking-[.08em] mt-0.5" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>{review.role}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 reveal">
            <div className="inline-flex items-center gap-3 text-[.78rem]" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
              <span style={{ color: "#fbbf24" }}>★ 4.9 / 5</span>
              <span style={{ color: "var(--line-2)" }}>|</span>
              Based on 200+ verified purchases
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS ── */}
      <section style={{ borderTop: "1px solid var(--line)" }} className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6 mb-12 flex-wrap reveal">
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                The Difference
              </div>
              <h2 className="uppercase leading-[.96] tracking-[.01em]" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>
                Before &amp; After
              </h2>
            </div>
            <p className="max-w-[340px] text-[.92rem]" style={{ color: "var(--muted)" }}>Real results, real cars. No filters — just chemistry doing its job.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {["Paint Correction", "Ceramic Coat", "Full Detail"].map((label) => (
              <div key={label} className="reveal rounded-[16px] overflow-hidden relative" style={{ border: "1px solid var(--line)", background: "var(--surface)", aspectRatio: "4/3" }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full grid place-items-center" style={{ border: "1px solid var(--line-2)", background: "rgba(255,255,255,.04)" }}>
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" style={{ color: "var(--muted)" }}>
                      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="7.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2 13l4-3 3 2.5 3-4 4 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[.72rem] tracking-[.12em] uppercase text-center" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>{label}<br />Photos coming soon</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-5 py-4" style={{ background: "linear-gradient(to top, rgba(12,11,8,.9), transparent)" }}>
                  <span className="text-[.78rem] font-semibold" style={{ fontFamily: "var(--font-space-mono)", color: "var(--accent)" }}>{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section style={{ borderTop: "1px solid var(--line)", background: "var(--bg-2)" }} className="py-[120px]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-7 mb-0 flex-wrap reveal">
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                03 — The System
              </div>
              <h2 className="uppercase leading-[.96] tracking-[.01em]" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.2rem,5vw,4rem)" }}>
                Four steps to<br />showroom shine
              </h2>
            </div>
            <p className="max-w-[360px] text-[.92rem]" style={{ color: "var(--muted)" }}>Follow the sequence detailers swear by. Each product hands off to the next.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-12" style={{ borderTop: "1px solid var(--line)" }}>
            {[
              { n: "01", title: "Prep", body: "Strip contaminants and old protection so the surface is truly clean and decontaminated." },
              { n: "02", title: "Correct", body: "Cut and refine swirls, scratches, and oxidation back to a flat, defect-free finish." },
              { n: "03", title: "Coat", body: "Lay down nano-ceramic protection that bonds to the paint for a glass-like shell." },
              { n: "04", title: "Protect", body: "Maintain the gloss with toppers and washes designed to keep the coating alive." },
            ].map((step, i) => (
              <div key={step.n} className={`reveal py-8 px-6 first:pl-0 last:pr-0 border-b lg:border-b-0${i < 3 ? " lg:border-r" : ""}`} style={{ borderColor: "var(--line)" }}>
                <div className="text-[.72rem] mb-4" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>/ STEP {step.n}</div>
                <h4 className="uppercase tracking-[.02em] mb-2.5" style={{ fontFamily: "var(--font-anton)", fontSize: "1.5rem" }}>{step.title}</h4>
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
            className="reveal rounded-[28px] py-14 px-6 sm:py-16 sm:px-12 lg:py-[72px] lg:px-[60px]"
            style={{
              background: "radial-gradient(120% 120% at 80% 0%,rgba(232,160,32,.14),transparent 50%), linear-gradient(160deg,var(--surface),var(--bg-2))",
              border: "1px solid var(--line-2)",
            }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                Join the garage
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
              </div>
              <h2 className="uppercase leading-[.96] tracking-[.01em] mb-4" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.2rem,5vw,4.2rem)" }}>
                Detailing tips,<br />drops &amp; deals.
              </h2>
              <p className="max-w-[460px] mx-auto mb-8 text-[.97rem]" style={{ color: "var(--muted)" }}>
                Get early access to new products and pro how-tos. No spam — just gloss.
              </p>
              {nlState === "ok" ? (
                <p className="text-[1rem] font-semibold" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
                  You&apos;re on the list. Welcome to the garage.
                </p>
              ) : (
                <div className="w-full max-w-[480px] mx-auto">
                  <div className="flex gap-3 flex-wrap justify-center">
                    <input
                      type="email"
                      value={nlEmail}
                      onChange={(e) => { setNlEmail(e.target.value); if (nlState === "error") setNlState("idle"); }}
                      onKeyDown={(e) => e.key === "Enter" && handleNewsletter()}
                      placeholder="your@email.com"
                      className="flex-1 min-w-[220px] px-5 py-4 rounded-[13px] text-[1rem] outline-none transition-all"
                      style={{ background: "rgba(12,11,8,.6)", border: `1px solid ${nlState === "error" ? "#ef4444" : "var(--line-2)"}`, color: "var(--text)", fontFamily: "var(--font-hanken)" }}
                    />
                    <button
                      onClick={handleNewsletter}
                      disabled={nlState === "submitting"}
                      className="btn-accent px-7 py-4 rounded-[13px] font-semibold transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
                    >
                      {nlState === "submitting" ? "…" : "Subscribe"}
                    </button>
                  </div>
                  {nlState === "error" && (
                    <p className="mt-2 text-sm text-center" style={{ color: "#ef4444" }}>{nlError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
