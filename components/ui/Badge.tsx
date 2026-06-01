import { cn } from "@/lib/utils";

export default function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center justify-center px-2.5 py-1 text-[.6rem] font-bold tracking-[.12em] uppercase rounded-full leading-none", className)}
      style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-space-mono)" }}
    >
      {children}
    </span>
  );
}
