"use client";

import { Clipboard } from "lucide-react";
import { useMemo, useState } from "react";

import { BrowserSupportPanel } from "@/components/diagnostics/BrowserSupportPanel";
import { Button } from "@/components/ui/Button";
import { APP_VERSION } from "@/lib/constants";
import { createDiagnosticsPayload } from "@/lib/diagnostics";
import type {
  BrowserSupportState,
  CameraStatus,
  RecordingStatus,
  TrackingStatus
} from "@/lib/types";

type DiagnosticsPanelProps = {
  browserSupport: BrowserSupportState;
  calibrationLoaded: boolean;
  cameraStatus: CameraStatus;
  fps: number;
  lastError: string | null;
  qualityMode: string;
  recordingStatus: RecordingStatus;
  selectedObjectId: string | null;
  trackingStatus: TrackingStatus;
};

export function DiagnosticsPanel(props: DiagnosticsPanelProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const payload = useMemo(() => createDiagnosticsPayload(props), [props]);

  const handleCopyDiagnostics = async () => {
    const text = JSON.stringify(payload, null, 2);

    if (!navigator.clipboard) {
      setCopyStatus("Clipboard is not supported.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied diagnostics JSON.");
    } catch {
      setCopyStatus("Could not copy diagnostics.");
    }
  };

  return (
    <div className="rounded-md border border-cyan-100/[0.12] bg-black/20 p-3 text-white">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Diagnostics</h2>
          <p className="text-xs text-cyan-100/55">Version {APP_VERSION}</p>
        </div>
        <Button onClick={handleCopyDiagnostics} size="sm" variant="secondary">
          <Clipboard aria-hidden="true" className="h-4 w-4" />
          Copy
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
        <span>Camera: {props.cameraStatus}</span>
        <span>Tracking: {props.trackingStatus}</span>
        <span>FPS: {props.fps || "--"}</span>
        <span>Quality: {props.qualityMode}</span>
        <span>Calibration: {props.calibrationLoaded ? "loaded" : "default"}</span>
        <span>Selected: {props.selectedObjectId ?? "--"}</span>
        <span>Recording: {props.recordingStatus}</span>
        <span>Last issue: {props.lastError ?? "--"}</span>
      </div>
      {copyStatus ? <p className="mt-2 text-xs text-teal-100">{copyStatus}</p> : null}
      <div className="mt-3">
        <BrowserSupportPanel support={props.browserSupport} />
      </div>
    </div>
  );
}
