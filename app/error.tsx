"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="text-center max-w-md">
        <p
          className="text-[.72rem] tracking-[.14em] uppercase mb-4"
          style={{ fontFamily: "var(--font-space-mono)", color: "var(--accent)" }}
        >
          Something went wrong
        </p>
        <h2
          className="uppercase leading-none mb-6"
          style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2rem,5vw,3.5rem)" }}
        >
          Unexpected Error
        </h2>
        <p className="text-[.92rem] mb-8" style={{ color: "var(--muted)" }}>
          Something didn&apos;t load correctly. Try again or head back to the shop.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="btn-accent inline-flex items-center px-6 py-3 rounded-[12px] font-semibold text-[.9rem] cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/shop"
            className="btn-ghost inline-flex items-center px-6 py-3 rounded-[12px] font-semibold text-[.9rem]"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
