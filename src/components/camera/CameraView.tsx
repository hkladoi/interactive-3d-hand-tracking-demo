"use client";

import type { RefObject } from "react";
import { VideoOff } from "lucide-react";

import { useVideoElement } from "@/hooks/useVideoElement";
import { cn } from "@/lib/cn";

type CameraViewProps = {
  className?: string;
  stream: MediaStream | null;
  videoRef?: RefObject<HTMLVideoElement | null>;
};

export function CameraView({ className, stream, videoRef: providedVideoRef }: CameraViewProps) {
  const { videoRef } = useVideoElement(stream, providedVideoRef);

  return (
    <section
      aria-label="Camera video layer"
      className={cn("absolute inset-0 overflow-hidden bg-neutral-950", className)}
    >
      {stream ? (
        <video
          aria-label="Camera preview"
          autoPlay
          className="absolute inset-0 h-full w-full scale-x-[-1] object-cover opacity-[0.82]"
          muted
          playsInline
          ref={videoRef}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#020202_0%,#101410_55%,#031f1d_100%)] text-neutral-300">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-md border border-white/10 bg-white/[0.06]">
              <VideoOff aria-hidden="true" className="h-6 w-6 text-neutral-400" />
            </div>
            <p className="text-sm">Camera preview inactive</p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:54px_54px] opacity-[0.15]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(20,184,166,0.16),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.55)_100%)]" />
    </section>
  );
}
