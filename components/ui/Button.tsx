import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, style, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2.5 font-semibold cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap leading-none";

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
    };

    const variantClasses = {
      primary: "hover:brightness-90 hover:-translate-y-0.5",
      ghost: "hover:bg-white/[.07] hover:-translate-y-0.5",
      outline: "hover:bg-white/[.04] hover:-translate-y-0.5",
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
