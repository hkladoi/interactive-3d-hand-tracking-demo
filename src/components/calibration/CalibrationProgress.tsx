"use client";

import { cn } from "@/lib/cn";
import type { CalibrationStep } from "@/lib/types";

type CalibrationProgressProps = {
  progress: number;
  step: CalibrationStep;
};

const steps: CalibrationStep[] = [
  "intro",
  "openHand",
  "pinch",
  "rotateLeft",
  "rotateRight",
  "complete"
];

function getStepLabel(step: CalibrationStep) {
  switch (step) {
    case "openHand":
      return "Open";
    case "pinch":
      return "Touch";
    case "rotateLeft":
      return "Left";
    case "rotateRight":
      return "Right";
    case "complete":
      return "Done";
    case "intro":
    default:
      return "Intro";
  }
}

export function CalibrationProgress({ progress, step }: CalibrationProgressProps) {
  const activeStepIndex = steps.indexOf(step);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        {steps.map((item, index) => (
          <div
            className={cn(
              "h-1.5 flex-1 rounded-full bg-white/10",
              index <= activeStepIndex && "bg-teal-300/80"
            )}
            key={item}
            title={getStepLabel(item)}
          />
        ))}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-300 to-amber-200 transition-all"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
