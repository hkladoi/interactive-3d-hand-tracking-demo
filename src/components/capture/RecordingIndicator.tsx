"use client";

import { Circle } from "lucide-react";

import { cn } from "@/lib/cn";

type RecordingIndicatorProps = {
  className?: string;
  elapsedMs: number;
  isRecording: boolean;
};

function formatElapsed(elapsedMs: number) {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function RecordingIndicator({
  className,
  elapsedMs,
  isRecording
}: RecordingIndicatorProps) {
  if (!isRecording) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed left-1/2 top-20 z-40 flex -translate-x-1/2 items-center gap-2 rounded-md border border-red-300/35 bg-red-500/18 px-3 py-2 text-xs font-semibold text-red-50 backdrop-blur-2xl",
        className
      )}
    >
      <Circle aria-hidden="true" className="h-3 w-3 fill-current" />
      REC {formatElapsed(elapsedMs)}
    </div>
  );
}
