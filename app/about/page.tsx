"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=1600&q=80" alt="About" fill className="object-cover opacity-25" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--bg) 50%, transparent)" }} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px)",
            backgroundSize: "64px 64px", opacity: .3,
          }}
        />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex items-center gap-2.5 mb-3 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
              <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
              Our Story
            </div>
            <h1 className="uppercase leading-[.96] tracking-[.01em]" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.5rem,6vw,5rem)" }}>
              About A.K.<br />Auto Care
            </h1>
          </div>
        </div>
      </div>

      {/* Story */}
      <section className="py-24" style={{ borderBottom: "1px solid var(--line)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
                <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
                Who We Are
              </div>
              <h2 className="uppercase leading-[.96] mb-6" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem,4vw,3rem)" }}>
                Born from a passion<br />for paint perfection.
              </h2>
              <div className="space-y-4 text-[.97rem] leading-relaxed" style={{ color: "var(--muted)" }}>
                <p>A.K. Auto Care was founded by a group of detailing obsessives who were tired of choosing between professional-grade results and products accessible to the everyday enthusiast.</p>
                <p>Every formula in our range is developed and tested in real-world conditions — on show cars, daily drivers, and everything in between. We don&apos;t launch a product until it outperforms what&apos;s already on the market.</p>
                <p>Today, A.K. Auto Care products are used by independent detailers, car clubs, and passionate owners across Pakistan and beyond.</p>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="relative h-[420px] rounded-[20px] overflow-hidden" style={{ border: "1px solid var(--line)" }}>
                <Image src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80" alt="Detailing" fill className="object-cover opacity-60" />
              </div>
              <div
                className="absolute bottom-4 left-4 sm:-bottom-4 sm:-left-4 rounded-[14px] px-5 py-4"
                style={{ background: "var(--accent)", color: "#000" }}
              >
                <div className="text-[2rem]" style={{ fontFamily: "var(--font-anton)" }}>4.9★</div>
                <div className="text-xs font-semibold opacity-70">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 mb-4 text-[.72rem] tracking-[.14em] uppercase" style={{ fontFamily: "var(--font-space-mono)", color: "var(--muted)" }}>
            <span className="w-7 h-[1px]" style={{ background: "var(--accent)" }} />
            Our Principles
          </div>
          <h2 className="uppercase leading-[.96] mb-12" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem,4vw,3.5rem)" }}>
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "01", title: "Proper Formulation", body: "Every product is chemically engineered for a specific job — never a jack-of-all-trades solution." },
              { n: "02", title: "Proven Performance", body: "We test on real paint in real conditions before anything reaches the shop." },
              { n: "03", title: "Community First", body: "Built with feedback from detailers of every experience level, beginner to pro." },
              { n: "04", title: "Fast Pakistan Delivery", body: "Orders dispatched same day when placed before 2 PM. Free delivery on orders over Rs 5,000 via TCS / Leopards." },
            ].map((v) => (
              <div key={v.n} className="p-6 rounded-[var(--r)]" style={{ border: "1px solid var(--line)", background: "var(--bg-2)" }}>
                <div className="text-[.72rem] mb-6" style={{ fontFamily: "var(--font-space-mono)", color: "var(--accent)" }}>/ {v.n}</div>
                <h3 className="uppercase tracking-[.02em] mb-2.5" style={{ fontFamily: "var(--font-anton)", fontSize: "1.3rem" }}>{v.title}</h3>
                <p className="text-sm" style={{ color: "var(--muted)" }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="uppercase leading-[.96] mb-4" style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem,4vw,3.5rem)" }}>
            Ready to experience<br />the difference?
          </h2>
          <p className="mb-8 text-[.97rem]" style={{ color: "var(--muted)" }}>Explore our full range of professional detailing products.</p>
          <Link
            href="/shop"
            className="btn-accent inline-flex items-center gap-2.5 px-7 py-4 rounded-[13px] font-semibold transition-all hover:-translate-y-0.5"
          >
            Shop Now <ArrowUpRight className="w-[18px] h-[18px]" />
          </Link>
        </div>
      </section>
    </div>
  );
}
