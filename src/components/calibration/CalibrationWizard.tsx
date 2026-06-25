"use client";

import { X } from "lucide-react";

import { CalibrationProgress } from "@/components/calibration/CalibrationProgress";
import { CalibrationResultPanel } from "@/components/calibration/CalibrationResultPanel";
import { CalibrationStepCard } from "@/components/calibration/CalibrationStepCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { CalibrationProfile, CalibrationState } from "@/lib/types";

type CalibrationWizardProps = {
  activeProfile: CalibrationProfile;
  cameraReady: boolean;
  onApplyProfile: (profile: CalibrationProfile) => void;
  onClose: () => void;
  onResetToDefault: () => void;
  onStart: () => void;
  state: CalibrationState;
};

export function CalibrationWizard({
  activeProfile,
  cameraReady,
  onApplyProfile,
  onClose,
  onResetToDefault,
  onStart,
  state
}: CalibrationWizardProps) {
  const resultProfile = state.profile ?? activeProfile;
  const showResult = state.step === "complete" && state.profile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/62 p-4 text-white backdrop-blur-xl">
      <Card className="w-full max-w-2xl border-cyan-100/[0.16] bg-neutral-950/82 p-5">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/45">
              Gesture calibration
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">Tune this camera setup</h2>
          </div>
          <Button aria-label="Close calibration" onClick={onClose} size="icon" variant="secondary">
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>

        {!cameraReady ? (
          <Card className="border-amber-200/25 bg-amber-300/10 p-4">
            <p className="text-sm leading-6 text-amber-50">
              Start the camera before calibration so the app can collect hand samples.
            </p>
          </Card>
        ) : null}

        {state.step === "intro" ? (
          <Card className="border-teal-200/20 bg-white/[0.045] p-4">
            <p className="text-sm leading-6 text-neutral-200">
              We will calibrate your hand gestures. Keep your hand visible in the camera and follow
              each short step.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button disabled={!cameraReady} onClick={onStart}>
                Start Calibration
              </Button>
              <Button onClick={onClose} variant="secondary">
                Skip
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <CalibrationProgress progress={state.progress} step={state.step} />
            <CalibrationStepCard
              errorMessage={state.errorMessage}
              samplesCollected={state.samplesCollected}
              step={state.step}
            />
            {showResult ? (
              <CalibrationResultPanel
                onRecalibrate={onStart}
                onResetToDefault={onResetToDefault}
                onUseCalibration={() => onApplyProfile(resultProfile)}
                profile={resultProfile}
              />
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}
