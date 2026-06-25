"use client";

import { RotateCcw, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CalibrationProfile } from "@/lib/types";

type CalibrationResultPanelProps = {
  onRecalibrate: () => void;
  onResetToDefault: () => void;
  onUseCalibration: () => void;
  profile: CalibrationProfile;
};

type ResultRow = {
  label: string;
  value: string;
};

export function CalibrationResultPanel({
  onRecalibrate,
  onResetToDefault,
  onUseCalibration,
  profile
}: CalibrationResultPanelProps) {
  const rows: ResultRow[] = [
    { label: "Palm size", value: profile.averagePalmSize.toFixed(3) },
    { label: "Touch threshold", value: profile.touchThresholdRatio.toFixed(3) },
    { label: "Release threshold", value: profile.releaseThresholdRatio.toFixed(3) },
    { label: "Rotation sensitivity", value: `${profile.rotationSensitivity.toFixed(2)}x` },
    { label: "Confidence baseline", value: `${Math.round(profile.minGestureConfidence * 100)}%` }
  ];

  return (
    <Card className="border-emerald-200/20 bg-emerald-300/[0.08] p-4">
      <h3 className="text-sm font-semibold text-white">Calibration result</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            className="rounded-md border border-cyan-100/[0.12] bg-black/25 px-3 py-2"
            key={row.label}
          >
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-cyan-100/45">
              {row.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-teal-100">{row.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Button onClick={onUseCalibration} size="sm">
          <Save aria-hidden="true" className="h-4 w-4" />
          Use
        </Button>
        <Button onClick={onRecalibrate} size="sm" variant="secondary">
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Recalibrate
        </Button>
        <Button onClick={onResetToDefault} size="sm" variant="danger">
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          Default
        </Button>
      </div>
    </Card>
  );
}
