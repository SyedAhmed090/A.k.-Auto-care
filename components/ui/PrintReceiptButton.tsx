"use client";
import { Printer } from "lucide-react";

export default function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print w-full mt-3 py-3.5 rounded-[13px] font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 cursor-pointer"
      style={{ background: "var(--surface)", border: "1px solid var(--line-2)", color: "var(--text)" }}
    >
      <Printer className="w-[18px] h-[18px]" /> Print / Save Receipt
    </button>
  );
}
