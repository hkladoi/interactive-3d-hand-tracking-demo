"use client";

import { PanelRightClose, PanelRightOpen, RotateCcw, SlidersHorizontal, Square } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { APP_NAME, CAMERA_STATUS_COPY } from "@/lib/constants";
import type { CameraStatus } from "@/lib/types";

type ARHeaderProps = {
  cameraStatus: CameraStatus;
  isDebugOpen: boolean;
  onCalibrate: () => void;
  onReset: () => void;
  onStop: () => void;
  onToggleDebug: () => void;
};

export function ARHeader({
  cameraStatus,
  isDebugOpen,
  onCalibrate,
  onReset,
  onStop,
  onToggleDebug
}: ARHeaderProps) {
  const cameraCopy = CAMERA_STATUS_COPY[cameraStatus];
  const DebugIcon = isDebugOpen ? PanelRightClose : PanelRightOpen;

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-cyan-100/[0.12] bg-black/45 px-4 py-3 text-white shadow-[0_12px_40px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0 border-l border-teal-200/45 pl-3">
          <p className="truncate text-sm font-semibold text-white sm:text-base">{APP_NAME}</p>
          <p className="text-xs text-cyan-100/70">AR stage / local vision</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge className="hidden sm:inline-flex" tone={cameraCopy.tone}>
            {cameraCopy.shortLabel}
          </Badge>
          <Button aria-label="Open calibration" onClick={onCalibrate} size="icon" variant="secondary">
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            aria-label={isDebugOpen ? "Hide debug panel" : "Show debug panel"}
            onClick={onToggleDebug}
            size="icon"
            variant="secondary"
          >
            <DebugIcon aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button aria-label="Reset hologram" onClick={onReset} size="icon" variant="secondary">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button aria-label="Stop camera" onClick={onStop} variant="danger">
            <Square aria-hidden="true" className="h-4 w-4 fill-current" />
            Stop
          </Button>
        </div>
      </div>
    </header>
  );
}
