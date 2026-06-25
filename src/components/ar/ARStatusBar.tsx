"use client";

import { Activity, Camera, Cpu, Hand, ScanSearch, TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import type { HologramTransform } from "@/hooks/useHologramControl";
import { CAMERA_STATUS_COPY } from "@/lib/constants";
import { getGestureLabel } from "@/lib/gestures";
import { getTrackingStatusLabel, getTrackingStatusTone } from "@/lib/handTracking";
import {
  getCompactSystemMetricValue,
  getSystemMetricAriaLabel,
  getSystemMetricTone
} from "@/lib/systemResources";
import type {
  CameraStatus,
  GestureState,
  StatusTone,
  SystemResourceStats,
  TrackingStatus
} from "@/lib/types";

type ARStatusBarProps = {
  cameraStatus: CameraStatus;
  fps: number;
  gesture: GestureState;
  handsCount: number;
  hologramTransform: HologramTransform;
  systemResources: SystemResourceStats;
  trackingStatus: TrackingStatus;
};

type StatusItem = {
  ariaLabel?: string;
  icon: typeof Camera;
  label: string;
  title?: string;
  tone: StatusTone;
  value: string;
};

function getHandRotationLabel(gesture: GestureState) {
  if (!gesture.handRotation || gesture.handRotation.direction === "neutral") {
    return "Neutral";
  }

  return gesture.handRotation.direction === "clockwise" ? "Clockwise" : "Counter";
}

export function ARStatusBar({
  cameraStatus,
  fps,
  gesture,
  handsCount,
  hologramTransform,
  systemResources,
  trackingStatus
}: ARStatusBarProps) {
  const cameraCopy = CAMERA_STATUS_COPY[cameraStatus];
  const touchLabel = gesture.fingerTouch.isTouching
    ? `${Math.round(gesture.fingerTouch.confidence * 100)}%`
    : "Open";
  const handRotationLabel = getHandRotationLabel(gesture);
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
      tone:
        gesture.isDragging ||
        gesture.fingerTouch.isTouching ||
        gesture.isTwoHandActive ||
        gesture.type === "handRotate"
          ? "success"
          : "neutral",
      value: getGestureLabel(gesture)
    },
    {
      icon: Activity,
      label: "Touch",
      tone: gesture.fingerTouch.isTouching ? "success" : "neutral",
      value: touchLabel
    },
    {
      icon: ScanSearch,
      label: "Object",
      tone: gesture.objectTouch.isTouchingObject ? "success" : "neutral",
      value: gesture.objectTouch.isTouchingObject ? "Hit" : "--"
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
      icon: Activity,
      label: "Hand rot",
      tone: gesture.type === "handRotate" ? "success" : "neutral",
      value: handRotationLabel
    },
    {
      icon: TimerReset,
      label: "FPS",
      tone: "info",
      value: fps > 0 ? String(fps) : "--"
    },
    {
      ariaLabel: getSystemMetricAriaLabel("CPU", systemResources.cpu),
      icon: Cpu,
      label: "CPU",
      title: systemResources.cpu.detail,
      tone: getSystemMetricTone(systemResources.cpu),
      value: getCompactSystemMetricValue(systemResources.cpu, "name")
    },
    {
      ariaLabel: getSystemMetricAriaLabel("RAM", systemResources.ram),
      icon: Activity,
      label: "RAM",
      title: systemResources.ram.detail,
      tone: getSystemMetricTone(systemResources.ram),
      value: getCompactSystemMetricValue(systemResources.ram, "memory")
    },
    {
      ariaLabel: getSystemMetricAriaLabel("GPU", systemResources.gpu),
      icon: ScanSearch,
      label: "GPU",
      title: systemResources.gpu.detail,
      tone: getSystemMetricTone(systemResources.gpu),
      value: getCompactSystemMetricValue(systemResources.gpu, "name")
    }
  ];

  return (
    <footer
      aria-label="AR status bar"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-cyan-100/[0.12] bg-black/48 px-3 py-2 shadow-[0_-12px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:px-6 sm:py-3"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-1.5 sm:grid-cols-4 sm:gap-2 xl:grid-cols-[repeat(13,minmax(0,1fr))]">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              aria-label={item.ariaLabel ?? `${item.label}: ${item.value}`}
              className="flex min-w-0 flex-col items-start gap-1 rounded-md border border-cyan-100/[0.12] bg-white/[0.055] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:px-3"
              key={item.label}
              title={item.title}
            >
              <div className="flex min-w-0 items-center gap-2">
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-cyan-100/75" />
                <span className="hidden text-xs text-neutral-300 sm:inline">{item.label}</span>
              </div>
              <Badge
                className="min-h-6 max-w-full shrink-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-0.5 text-[0.68rem]"
                tone={item.tone}
              >
                {item.value}
              </Badge>
            </div>
          );
        })}
      </div>
    </footer>
  );
}
