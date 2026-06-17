import type { Metadata } from "next";
import Link from "next/link";
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from "@/lib/constants";
import { FAQS, FREE_SHIPPING_THRESHOLD_LABEL } from "@/lib/faq-data";

export const metadata: Metadata = {
  title: "FAQ — Orders, Delivery, Payments & Products",
  description:
    "Answers to common questions about A.K. Auto Care: Cash on Delivery, JazzCash & EasyPaisa payments, nationwide shipping via TCS & Leopards, returns, and how to use our car care products.",
  alternates: { canonical: "/faq" },
  twitter: {
    card: "summary",
    title: "FAQ — Orders, Delivery, Payments & Products | A.K. Auto Care",
    description: "Answers to common questions about A.K. Auto Care: payments, nationwide shipping, returns, and how to use our car care products.",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
        <div className="pt-10 pb-14" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)", fontFamily: "var(--font-space-mono)" }}>
              Help Centre
            </p>
            <h1 className="text-4xl sm:text-5xl font-black" style={{ color: "var(--text)", fontFamily: "var(--font-anton)" }}>
              Frequently Asked Questions
            </h1>
            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
              Free delivery on orders over {FREE_SHIPPING_THRESHOLD_LABEL}. Can&apos;t find your answer? Message us on WhatsApp.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-3">
          {FAQS.map((f, i) => (
            <details
              key={i}
              className="group rounded-[14px] overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
            >
              <summary
                className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 select-none"
                style={{ color: "var(--text)" }}
              >
                <span className="font-semibold text-[.98rem]">{f.q}</span>
                <span
                  className="flex-shrink-0 transition-transform group-open:rotate-45 text-xl leading-none"
                  style={{ color: "var(--accent)" }}
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {f.a}
              </div>
            </details>
          ))}

          <div
            className="mt-10 rounded-[16px] p-6 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
          >
            <h2 className="text-xl font-black mb-2" style={{ fontFamily: "var(--font-anton)", color: "var(--text)" }}>
              Still have questions?
            </h2>
            <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
              Our team replies within minutes during business hours.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-[13px] font-semibold"
                style={{ background: "#25D366", color: "#fff" }}
              >
                Chat on WhatsApp
              </a>
              <Link
                href="/contact"
                className="px-6 py-3 rounded-[13px] font-semibold"
                style={{ background: "var(--accent)", color: "var(--on-accent)" }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
