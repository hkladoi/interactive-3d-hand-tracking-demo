import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  isLoading?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const variantClasses = {
  primary:
    "bg-teal-300 text-neutral-950 shadow-glow hover:bg-teal-200 focus-visible:ring-teal-200",
  secondary:
    "border border-cyan-100/[0.16] bg-white/[0.08] text-white hover:bg-white/[0.13] focus-visible:ring-cyan-100/50",
  ghost: "text-neutral-100 hover:bg-white/10 focus-visible:ring-cyan-100/40",
  danger:
    "border border-red-300/35 bg-red-500/[0.16] text-red-50 hover:bg-red-500/25 focus-visible:ring-red-300"
} satisfies Record<ButtonVariant, string>;

const sizeClasses = {
  sm: "h-9 gap-2 px-3 text-sm",
  md: "h-11 gap-2.5 px-5 text-sm sm:text-base",
  icon: "h-10 w-10 p-0"
} satisfies Record<ButtonSize, string>;

export function Button({
  children,
  className,
  disabled,
  isLoading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold transition outline-none backdrop-blur-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:pointer-events-none disabled:opacity-55",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
