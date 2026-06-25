"use client";

import { Activity, Camera, Hand, ScanSearch, TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { HologramTransform } from "@/hooks/useHologramControl";
import { CAMERA_STATUS_COPY } from "@/lib/constants";
import { getGestureLabel } from "@/lib/gestures";
import { getTrackingStatusLabel, getTrackingStatusTone } from "@/lib/handTracking";
import type { CameraStatus, GestureState, StatusTone, TrackingStatus } from "@/lib/types";

type ARStatusBarProps = {
  cameraStatus: CameraStatus;
  fps: number;
  gesture: GestureState;
  handsCount: number;
  hologramTransform: HologramTransform;
  trackingStatus: TrackingStatus;
};

type StatusItem = {
  icon: typeof Camera;
  label: string;
  tone: StatusTone;
  value: string;
};

export function ARStatusBar({
  cameraStatus,
  fps,
  gesture,
  handsCount,
  hologramTransform,
  trackingStatus
}: ARStatusBarProps) {
  const cameraCopy = CAMERA_STATUS_COPY[cameraStatus];
  const confidenceLabel = `${Math.round(gesture.confidence * 100)}%`;
  const rotationLabel = `${Math.round((hologramTransform.rotation[2] * 180) / Math.PI)}deg`;
  const items: StatusItem[] = [
    {
      icon: Camera,
      label: "Camera",
      tone: cameraCopy.tone,
      value: cameraCopy.shortLabel
    },
    {
      icon: Hand,
      label: "Tracking",
      tone: getTrackingStatusTone(trackingStatus),
      value: getTrackingStatusLabel(trackingStatus)
    },
    {
      icon: ScanSearch,
      label: "Hands",
      tone: handsCount > 0 ? "success" : "neutral",
      value: String(handsCount)
    },
    {
      icon: Activity,
      label: "Gesture",
      tone: gesture.isPinching || gesture.isTwoHandActive ? "success" : "neutral",
      value: getGestureLabel(gesture)
    },
    {
      icon: Activity,
      label: "Confidence",
      tone: gesture.confidence > 0.55 ? "success" : "neutral",
      value: confidenceLabel
    },
    {
      icon: ScanSearch,
      label: "Scale",
      tone: "info",
      value: `${hologramTransform.scale.toFixed(2)}x`
    },
    {
      icon: Activity,
      label: "Rotation",
      tone: "info",
      value: rotationLabel
    },
    {
      icon: TimerReset,
      label: "FPS",
      tone: "info",
      value: fps > 0 ? String(fps) : "--"
    }
  ];

  return (
    <footer
      aria-label="AR status bar"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-cyan-100/[0.12] bg-black/48 px-3 py-2 shadow-[0_-12px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:px-6 sm:py-3"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-1.5 sm:grid-cols-4 sm:gap-2 xl:grid-cols-8">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              aria-label={`${item.label}: ${item.value}`}
              className="flex min-w-0 flex-col items-start gap-1 rounded-md border border-cyan-100/[0.12] bg-white/[0.055] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-3"
              key={item.label}
            >
              <div className="flex min-w-0 items-center gap-2">
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-100/75" />
                <span className="hidden text-xs text-neutral-300 sm:inline">{item.label}</span>
              </div>
              <Badge className="min-h-6 shrink-0 px-2 py-0.5 text-[0.68rem]" tone={item.tone}>
                {item.value}
              </Badge>
            </div>
          );
        })}
      </div>
    </footer>
  );
}
