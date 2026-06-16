"use client";
import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({
  value, onChange, min = 1, max = 99,
}: {
  value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-[9px] overflow-hidden flex-shrink-0" style={{ border: "1px solid var(--line-2)" }}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
        style={{ color: "var(--muted)" }}
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-10 text-center text-sm font-bold tabular-nums leading-none select-none" style={{ fontFamily: "var(--font-space-mono)" }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]"
        style={{ color: "var(--muted)" }}
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
