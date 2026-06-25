"use client";

import { Cpu, Crosshair, Hand, Layers3, PanelBottom, RotateCcw, Video } from "lucide-react";

import type { HologramTransform } from "@/hooks/useHologramControl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  getCameraResolutionLabel,
  type CameraLayerKey,
  type CameraLayerVisibility
} from "@/lib/camera";
import { CAMERA_STATUS_COPY } from "@/lib/constants";
import { getTrackingStatusLabel } from "@/lib/handTracking";
import type { CameraStatus, GestureState, TrackingStatus } from "@/lib/types";

type DebugPanelProps = {
  cameraStatus: CameraStatus;
  gesture: GestureState;
  handTrackingError: string | null;
  handsCount: number;
  hologramTransform: HologramTransform;
  isOpen: boolean;
  layerVisibility: CameraLayerVisibility;
  onResetTransform: () => void;
  onToggleLayer: (key: CameraLayerKey) => void;
  trackingFps: number;
  trackingStatus: TrackingStatus;
  stream: MediaStream | null;
};

type DebugRow = {
  icon: typeof Cpu;
  label: string;
  value: string;
};

type LayerToggle = {
  key: CameraLayerKey;
  label: string;
};

const layerToggles: LayerToggle[] = [
  { key: "showCameraOverlay", label: "Show camera overlay" },
  { key: "showHologram", label: "Show hologram" },
  { key: "showStatusBar", label: "Show status bar" }
];

function formatAngleRadians(angle: number | null) {
  if (angle === null) {
    return "--";
  }

  return `${Math.round((angle * 180) / Math.PI)}deg`;
}

export function DebugPanel({
  cameraStatus,
  gesture,
  handTrackingError,
  handsCount,
  hologramTransform,
  isOpen,
  layerVisibility,
  onResetTransform,
  onToggleLayer,
  trackingFps,
  trackingStatus,
  stream
}: DebugPanelProps) {
  if (!isOpen) {
    return null;
  }

  const rotationLabel = hologramTransform.rotation
    .map((value) => `${Math.round((value * 180) / Math.PI)}deg`)
    .join(", ");
  const rows: DebugRow[] = [
    {
      icon: Video,
      label: "Camera",
      value: CAMERA_STATUS_COPY[cameraStatus].shortLabel
    },
    {
      icon: Cpu,
      label: "Resolution",
      value: getCameraResolutionLabel(stream)
    },
    {
      icon: Layers3,
      label: "3D layer",
      value: layerVisibility.showHologram ? "Visible" : "Hidden"
    },
    {
      icon: Crosshair,
      label: "Tracking overlay",
      value: layerVisibility.showCameraOverlay ? getTrackingStatusLabel(trackingStatus) : "Hidden"
    },
    {
      icon: Crosshair,
      label: "Hands",
      value: String(handsCount)
    },
    {
      icon: Hand,
      label: "Primary hand",
      value: gesture.primaryHand ?? "--"
    },
    {
      icon: Cpu,
      label: "Tracking FPS",
      value: trackingFps > 0 ? String(trackingFps) : "--"
    },
    {
      icon: Crosshair,
      label: "Pinch active",
      value: gesture.isPinching ? "Yes" : "No"
    },
    {
      icon: Crosshair,
      label: "Pinch distance",
      value: gesture.pinchDistance === null ? "--" : gesture.pinchDistance.toFixed(3)
    },
    {
      icon: Crosshair,
      label: "Two hand active",
      value: gesture.isTwoHandActive ? "Yes" : "No"
    },
    {
      icon: Crosshair,
      label: "Two hand distance",
      value: gesture.twoHandDistance === null ? "--" : gesture.twoHandDistance.toFixed(3)
    },
    {
      icon: Crosshair,
      label: "Two hand angle",
      value: formatAngleRadians(gesture.twoHandAngle)
    },
    {
      icon: Layers3,
      label: "Object position",
      value: hologramTransform.position.map((value) => value.toFixed(2)).join(", ")
    },
    {
      icon: Layers3,
      label: "Scale",
      value: `${hologramTransform.scale.toFixed(2)}x`
    },
    {
      icon: Layers3,
      label: "Rotation",
      value: rotationLabel
    },
    {
      icon: PanelBottom,
      label: "Status bar",
      value: layerVisibility.showStatusBar ? "Visible" : "Hidden"
    }
  ];

  return (
    <aside className="fixed right-4 top-20 z-40 max-h-[calc(100dvh-18rem)] w-[min(21rem,calc(100vw-2rem))] overflow-y-auto sm:right-6 sm:max-h-[calc(100dvh-12rem)]">
      <Card className="border-cyan-100/[0.14] bg-black/45 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Debug</h2>
            <p className="text-xs text-cyan-100/55">Vision telemetry</p>
          </div>
          <span className="rounded-md border border-emerald-200/20 bg-emerald-300/[0.1] px-2 py-1 text-xs font-semibold text-emerald-100">
            Local only
          </span>
        </div>

        <div className="space-y-2">
          {rows.map((row) => {
            const Icon = row.icon;

            return (
              <div
                className="flex items-center justify-between gap-3 rounded-md border border-cyan-100/[0.1] bg-white/[0.045] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                key={row.label}
              >
                <div className="flex min-w-0 items-center gap-2 text-cyan-100/75">
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span className="truncate text-xs text-neutral-300">{row.label}</span>
                </div>
                <span className="shrink-0 text-xs font-semibold text-teal-100">{row.value}</span>
              </div>
            );
          })}
        </div>

        {handTrackingError ? (
          <p className="mt-4 rounded-md border border-red-300/25 bg-red-500/12 px-3 py-2 text-xs leading-5 text-red-100">
            {handTrackingError}
          </p>
        ) : null}

        <Button className="mt-4 w-full" onClick={onResetTransform} variant="secondary">
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Reset hologram
        </Button>

        <div className="mt-4 border-t border-cyan-100/[0.12] pt-4">
          <p className="mb-2 text-xs font-semibold uppercase text-cyan-100/45">Layer toggles</p>
          <div className="space-y-2">
            {layerToggles.map((toggle) => (
              <label
                className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-cyan-100/[0.1] bg-white/[0.04] px-3 py-2 text-xs text-neutral-200"
                key={toggle.key}
              >
                <span>{toggle.label}</span>
                <input
                  checked={layerVisibility[toggle.key]}
                  className="h-4 w-4 rounded border-white/20 bg-neutral-950 accent-teal-300"
                  onChange={() => onToggleLayer(toggle.key)}
                  type="checkbox"
                />
              </label>
            ))}
          </div>
        </div>
      </Card>
    </aside>
  );
}
