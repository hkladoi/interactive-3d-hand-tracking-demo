"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getStepInstruction } from "@/lib/calibration";
import type { CalibrationStep } from "@/lib/types";

type CalibrationStepCardProps = {
  errorMessage: string | null;
  samplesCollected: number;
  step: CalibrationStep;
};

function getStepTitle(step: CalibrationStep) {
  switch (step) {
    case "openHand":
      return "Open hand";
    case "pinch":
      return "Thumb/index touch";
    case "rotateLeft":
      return "Rotate left";
    case "rotateRight":
      return "Rotate right";
    case "complete":
      return "Complete";
    case "intro":
    default:
      return "Calibration";
  }
}

export function CalibrationStepCard({
  errorMessage,
  samplesCollected,
  step
}: CalibrationStepCardProps) {
  return (
    <Card className="border-teal-200/20 bg-black/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/45">
            Step
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">{getStepTitle(step)}</h3>
        </div>
        <Badge tone={step === "complete" ? "success" : "info"}>
          {step === "complete" ? "Ready" : `${samplesCollected} samples`}
        </Badge>
      </div>

      <p className="mt-4 text-sm leading-6 text-neutral-200">{getStepInstruction(step)}</p>

      {errorMessage ? (
        <p className="mt-4 rounded-md border border-amber-200/25 bg-amber-300/10 px-3 py-2 text-xs leading-5 text-amber-100">
          {errorMessage}
        </p>
      ) : null}
    </Card>
  );
}
