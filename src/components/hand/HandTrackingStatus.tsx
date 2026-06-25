"use client";

import { AlertTriangle, Hand, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { getTrackingStatusLabel, getTrackingStatusTone } from "@/lib/handTracking";
import { cn } from "@/lib/cn";
import type { TrackingStatus } from "@/lib/types";

type HandTrackingStatusProps = {
  className?: string;
  errorMessage: string | null;
  fps: number;
  handsCount: number;
  status: TrackingStatus;
};

function getGuidanceMessage(status: TrackingStatus, handsCount: number, errorMessage: string | null) {
  if (errorMessage || status === "error") {
    return "Hand tracking is unavailable. Camera and hologram controls remain usable.";
  }

  if (status === "unsupported") {
    return "This browser cannot run hand tracking. Try a current Chromium-based browser.";
  }

  if (status === "loading") {
    return "Loading MediaPipe hand tracker...";
  }

  if (status === "ready" || status === "lost" || handsCount === 0) {
    return "Show your hand to the camera.";
  }

  return "Touch thumb and index on the hologram to move. Use two hands to scale or rotate.";
}

export function HandTrackingStatus({
  className,
  errorMessage,
  fps,
  handsCount,
  status
}: HandTrackingStatusProps) {
  const isLoading = status === "loading";
  const isError = status === "error" || status === "unsupported";
  const Icon = isError ? AlertTriangle : isLoading ? Loader2 : Hand;
  const guidanceMessage = getGuidanceMessage(status, handsCount, errorMessage);

  return (
    <aside
      aria-label="Hand tracking status"
      className={cn(
        "fixed left-4 top-20 z-30 w-[min(22rem,calc(100vw-2rem))] rounded-md border border-cyan-100/[0.12] bg-black/45 p-3 text-white shadow-panel backdrop-blur-2xl sm:left-6",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Icon
            aria-hidden="true"
            className={cn("h-4 w-4 shrink-0 text-teal-100", isLoading && "animate-spin")}
          />
          <span className="truncate text-xs font-semibold text-neutral-200">Hand tracking</span>
        </div>
        <Badge tone={getTrackingStatusTone(status)}>{getTrackingStatusLabel(status)}</Badge>
      </div>

      <p className="mt-3 rounded-md border border-cyan-100/[0.1] bg-white/[0.045] px-2 py-2 text-xs leading-5 text-neutral-200">
        {guidanceMessage}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-cyan-100/[0.1] bg-white/[0.055] px-2 py-1.5">
          <span className="text-neutral-400">Hands</span>
          <span className="ml-2 font-semibold text-teal-100">{handsCount}</span>
        </div>
        <div className="rounded-md border border-cyan-100/[0.1] bg-white/[0.055] px-2 py-1.5">
          <span className="text-neutral-400">FPS</span>
          <span className="ml-2 font-semibold text-teal-100">{fps > 0 ? fps : "--"}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 text-[0.68rem] font-semibold text-cyan-50">
        <span className="rounded-md border border-cyan-100/[0.12] bg-cyan-300/[0.08] px-2 py-1">
          Show your hand
        </span>
        <span className="rounded-md border border-cyan-100/[0.12] bg-cyan-300/[0.08] px-2 py-1">
          Touch object to move
        </span>
        <span className="rounded-md border border-cyan-100/[0.12] bg-cyan-300/[0.08] px-2 py-1">
          Two hands scale/rotate
        </span>
      </div>

      {errorMessage ? (
        <p className="mt-3 rounded-md border border-red-300/20 bg-red-500/10 px-2 py-1.5 text-xs leading-5 text-red-100">
          {errorMessage}
        </p>
      ) : null}
    </aside>
  );
}
