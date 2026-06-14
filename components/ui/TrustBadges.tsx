import { Banknote, Truck, ShieldCheck, RotateCcw } from "lucide-react";

const BADGES = [
  { icon: Banknote, title: "Cash on Delivery", sub: "Pay when it arrives" },
  { icon: Truck, title: "Fast Nationwide", sub: "TCS & Leopards courier" },
  { icon: ShieldCheck, title: "Secure Checkout", sub: "Your data is protected" },
  { icon: RotateCcw, title: "30-Day Returns", sub: "Hassle-free guarantee" },
];

/**
 * Trust-signal strip. `variant="compact"` renders a tighter inline row
 * (used on product pages near the buy button); default is the full grid.
 */
export default function TrustBadges({ variant = "full" }: { variant?: "full" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {BADGES.map(({ icon: Icon, title }) => (
          <div
            key={title}
            className="flex items-center gap-2 px-3 py-2.5 rounded-[11px]"
            style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
          >
            <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
            <span className="text-[.75rem] font-semibold leading-tight">{title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {BADGES.map(({ icon: Icon, title, sub }) => (
        <div key={title} className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[11px] grid place-items-center flex-shrink-0"
            style={{ background: "var(--surface)", border: "1px solid var(--line-2)" }}
          >
            <Icon className="w-[18px] h-[18px]" style={{ color: "var(--accent)" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">{title}</p>
            <p className="text-[.72rem]" style={{ color: "var(--muted)", fontFamily: "var(--font-space-mono)" }}>{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
