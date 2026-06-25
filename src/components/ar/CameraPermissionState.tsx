"use client";

import { ArrowLeft, RefreshCw, ShieldAlert, VideoOff } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CAMERA_STATUS_COPY } from "@/lib/constants";
import type { CameraFallbackStatus } from "@/lib/types";

type CameraPermissionStateProps = {
  errorMessage: string | null;
  onBack: () => void;
  onRetry: () => Promise<void>;
  status: CameraFallbackStatus;
};

export function CameraPermissionState({
  errorMessage,
  onBack,
  onRetry,
  status
}: CameraPermissionStateProps) {
  const copy = CAMERA_STATUS_COPY[status];
  const Icon = status === "unsupported" ? VideoOff : ShieldAlert;
  const canRetry = status !== "unsupported";

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-[linear-gradient(135deg,#020302_0%,#0b0f0e_52%,#1d1408_100%)] px-5 py-10 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-24" />
      <Card className="relative z-10 w-full max-w-lg border-amber-100/[0.16] bg-black/45 p-6 sm:p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md border border-amber-200/30 bg-amber-300/[0.12] text-amber-100 shadow-[0_0_28px_rgba(251,191,36,0.12)]">
          <Icon aria-hidden="true" className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-semibold text-white sm:text-3xl">{copy.title}</h1>
        <p className="mt-3 leading-7 text-neutral-300">{copy.message}</p>

        {errorMessage ? (
          <p className="mt-4 rounded-md border border-amber-100/[0.16] bg-black/35 px-3 py-2 text-sm text-neutral-300">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {canRetry ? (
            <Button className="w-full sm:w-auto" onClick={onRetry}>
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Try Again
            </Button>
          ) : null}
          <Button className="w-full sm:w-auto" onClick={onBack} variant="secondary">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back
          </Button>
        </div>
      </Card>
    </main>
  );
}
