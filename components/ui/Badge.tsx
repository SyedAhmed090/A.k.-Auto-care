import { cn } from "@/lib/utils";

type BadgeVariant = "accent" | "warning" | "danger" | "muted";
type BadgeSize = "sm" | "md";

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  accent: { background: "var(--accent)", color: "#000" },
  warning: { background: "#fb923c", color: "#000" },
  danger: { background: "#ef4444", color: "#fff" },
  muted: { background: "var(--line-2)", color: "var(--text)" },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2.5 py-1 text-[.6rem]",
  md: "px-3 py-1.5 text-[.7rem]",
};

export default function Badge({
  children,
  className,
  variant = "accent",
  size = "sm",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-bold tracking-[.12em] uppercase rounded-full leading-none",
        sizeClasses[size],
        className
      )}
      style={{ ...variantStyles[variant], fontFamily: "var(--font-space-mono)", ...style }}
    >
      {children}
    </span>
  );
}
