"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "gold" | "navy" | "ghost" | "danger" | "primary";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  gold: "gold-gradient text-navy-800 font-semibold shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:scale-[1.02] active:scale-[0.98]",
  navy: "bg-navy-800 text-slate-100 border border-gold/30 hover:border-gold/60 hover:bg-navy-700",
  ghost: "bg-transparent text-gold border border-gold/40 hover:border-gold hover:bg-gold/10",
  danger: "bg-red-900/60 text-red-200 border border-red-700/50 hover:bg-red-800/60",
  primary: "bg-[#1F2937] text-white font-semibold hover:bg-[#374151] active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "gold",
      size = "md",
      loading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center gap-2 transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
