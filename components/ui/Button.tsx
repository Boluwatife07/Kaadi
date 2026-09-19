// OWNER: SA
"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--kaadi-clay-700)] text-white hover:bg-[var(--kaadi-clay-600)] disabled:bg-[var(--kaadi-ink-500)]",
  secondary:
    "bg-white text-[var(--kaadi-ink-900)] border border-[var(--kaadi-border)] hover:bg-[var(--kaadi-clay-100)]",
  danger:
    "bg-white text-[var(--kaadi-alert-800)] border border-[var(--kaadi-alert-100)] hover:bg-[var(--kaadi-alert-100)]",
  ghost: "bg-transparent text-[var(--kaadi-ink-700)] hover:bg-[var(--kaadi-clay-100)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth, className = "", disabled, children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] px-[var(--space-4)]",
          "font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          "min-h-[var(--tap-min)]",
          fullWidth ? "w-full" : "",
          variantClasses[variant],
          className,
        ].join(" ")}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
