import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8320a] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          {
            "bg-[#e8320a] text-white hover:bg-[#c42a08] active:scale-[0.98]":
              variant === "primary",
            "bg-white text-[#0f0f0f] hover:bg-gray-100":
              variant === "secondary",
            "border-2 border-[#e8320a] text-[#e8320a] hover:bg-[#e8320a] hover:text-white":
              variant === "outline",
            "text-[#0f0f0f] hover:bg-gray-100": variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
          },
          {
            "px-4 py-2 text-sm rounded-md": size === "sm",
            "px-6 py-3 text-sm rounded-lg": size === "md",
            "px-8 py-4 text-base rounded-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
