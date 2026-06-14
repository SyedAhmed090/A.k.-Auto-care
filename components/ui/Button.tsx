import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, style, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2.5 font-semibold cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:brightness-100 whitespace-nowrap leading-none outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]";

    const variantStyles = {
      primary: {
        background: "var(--accent)",
        color: "#0a0b0d",
        border: "1px solid transparent",
      },
      ghost: {
        background: "rgba(255,255,255,.02)",
        color: "var(--text)",
        border: "1px solid var(--line-2)",
      },
      outline: {
        background: "transparent",
        color: "var(--text)",
        border: "1px solid var(--line-2)",
      },
      danger: {
        background: "#ef4444",
        color: "#fff",
        border: "1px solid transparent",
      },
    };

    const variantClasses = {
      primary: "hover:brightness-90 hover:-translate-y-0.5",
      ghost: "hover:bg-white/[.07] hover:-translate-y-0.5",
      outline: "hover:bg-white/[.04] hover:-translate-y-0.5",
      danger: "hover:brightness-110 hover:-translate-y-0.5 focus-visible:ring-[#ef4444]",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-[var(--r-sm)]",
      md: "px-6 py-3 text-[.97rem] rounded-[var(--r-md)]",
      lg: "px-7 py-4 text-[.97rem] rounded-[var(--r-md)]",
    };

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], variantClasses[variant], className)}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
