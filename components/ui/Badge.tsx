import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "accent" | "green" | "blue" | "gold" | "dark";
  className?: string;
}

export default function Badge({ children, variant = "accent", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-0.5 text-[11px] font-bold tracking-widest uppercase rounded-sm",
        {
          "bg-[#e8320a] text-white": variant === "accent",
          "bg-emerald-500 text-white": variant === "green",
          "bg-blue-600 text-white": variant === "blue",
          "bg-amber-500 text-white": variant === "gold",
          "bg-[#0f0f0f] text-white": variant === "dark",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
