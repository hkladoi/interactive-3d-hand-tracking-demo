import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";
import type { StatusTone } from "@/lib/types";

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: StatusTone;
};

const toneClasses = {
  neutral: "border-white/[0.12] bg-white/[0.07] text-neutral-200",
  success: "border-emerald-300/35 bg-emerald-400/[0.14] text-emerald-100",
  warning: "border-amber-300/35 bg-amber-400/[0.14] text-amber-100",
  danger: "border-red-300/35 bg-red-400/[0.14] text-red-100",
  info: "border-cyan-300/35 bg-cyan-400/[0.14] text-cyan-100"
} satisfies Record<StatusTone, string>;

export function Badge({ children, className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-md border px-2.5 py-1 text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
