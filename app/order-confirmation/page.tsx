"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function Confirmation() {
  const params = useSearchParams();
  const orderId = params.get("order") ?? "AK-XXXXXX";
  const total = params.get("total") ?? "0.00";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="max-w-md w-full text-center">
        <div
          className="w-20 h-20 rounded-full grid place-items-center mx-auto mb-6"
          style={{ background: "rgba(216,255,53,.1)", border: "1px solid rgba(216,255,53,.2)" }}
        >
          <CheckCircle className="w-9 h-9" style={{ color: "var(--accent)" }} />
        </div>
        <h1
          className="uppercase tracking-[.01em] mb-2"
          style={{ fontFamily: "var(--font-anton)", fontSize: "2.2rem" }}
        >
          Order Confirmed!
        </h1>
        <p className="mb-8 text-[.97rem]" style={{ color: "var(--muted)" }}>
          Thank you. We&apos;ll send a confirmation to your email shortly.
        </p>

        <div
          className="rounded-[20px] p-6 mb-8 text-left w-full"
          style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
        >
          <div className="flex items-center gap-3 mb-4" style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1rem" }}>
            <Package className="w-[18px] h-[18px] flex-shrink-0" style={{ color: "var(--accent)" }} />
            <h2 className="uppercase" style={{ fontFamily: "var(--font-anton)", fontSize: "1.2rem" }}>Order Details</h2>
          </div>
          <div className="text-sm">
            {[
              { label: "Order Number", value: orderId, mono: true },
              { label: "Total", value: `£${total}` },
              { label: "Estimated Delivery", value: "3–5 business days" },
              { label: "Status", value: "Processing", accent: true },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--line)" }}>
                <span style={{ color: "var(--muted)" }}>{row.label}</span>
                <span
                  className="font-semibold text-right"
                  style={{
                    color: (row as any).accent ? "var(--accent)" : "var(--text)",
                    fontFamily: (row as any).mono ? "var(--font-space-mono)" : "inherit",
                    fontSize: (row as any).mono ? ".78rem" : "inherit",
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/shop"
          className="w-full py-4 rounded-[13px] font-semibold flex items-center justify-center gap-2.5 transition-all hover:-translate-y-0.5"
          style={{ background: "var(--accent)", color: "#000", display: "flex" }}
        >
          Continue Shopping <ArrowRight className="w-[18px] h-[18px]" />
        </Link>
        <Link href="/" className="block mt-3 text-sm transition-colors" style={{ color: "var(--muted)" }}>
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return <Suspense><Confirmation /></Suspense>;
}
