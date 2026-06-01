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

    const variants = {
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

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-[10px]",
      md: "px-6 py-3 text-[.97rem] rounded-[13px]",
      lg: "px-7 py-4 text-[.97rem] rounded-[13px]",
    };

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], className)}
        style={{ ...variants[variant], ...style }}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
