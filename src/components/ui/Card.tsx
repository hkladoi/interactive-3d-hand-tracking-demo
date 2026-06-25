import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type CardProps = ComponentPropsWithoutRef<"div">;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-cyan-100/[0.12] bg-neutral-950/[0.64] shadow-panel backdrop-blur-2xl",
        className
      )}
      {...props}
    />
  );
}
