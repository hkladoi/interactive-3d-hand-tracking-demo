"use client";

import { Camera, LockKeyhole, ScanLine } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { APP_NAME, LOCAL_CAMERA_NOTICE, START_SUBTITLE } from "@/lib/constants";

type StartCameraScreenProps = {
  isClientReady: boolean;
  isRequesting: boolean;
  onStartCamera: () => Promise<void>;
};

export function StartCameraScreen({
  isClientReady,
  isRequesting,
  onStartCamera
}: StartCameraScreenProps) {
  return (
    <main className="relative flex min-h-dvh overflow-hidden bg-[linear-gradient(135deg,#020302_0%,#080d0c_48%,#151208_100%)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(103,232,249,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-28" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12)_0%,rgba(0,0,0,0.72)_100%)]" />
      <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-cyan-100/30 to-transparent" />

      <section className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_25rem] lg:gap-14">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-cyan-100/[0.14] bg-white/[0.07] px-3 py-2 text-sm font-semibold text-teal-100 backdrop-blur-md">
            <ScanLine aria-hidden="true" className="h-4 w-4" />
            Browser AR demo
          </div>

          <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            {APP_NAME}
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-neutral-300 sm:text-lg">
            {START_SUBTITLE}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              className="w-full sm:w-auto"
              disabled={!isClientReady}
              isLoading={isRequesting}
              onClick={onStartCamera}
            >
              <Camera aria-hidden="true" className="h-5 w-5" />
              Start Camera
            </Button>
            <p className="inline-flex items-center justify-center gap-2 text-sm text-neutral-300 sm:justify-start">
              <LockKeyhole aria-hidden="true" className="h-4 w-4 text-teal-200" />
              {LOCAL_CAMERA_NOTICE}
            </p>
          </div>
        </div>

        <Card className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden border-cyan-100/[0.16] bg-black/40 p-5">
          <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-teal-200/80 to-transparent" />
          <div className="absolute inset-x-8 bottom-10 h-24 rounded-[50%] border border-teal-200/25 bg-teal-300/[0.04]" />
          <div className="absolute left-0 top-0 h-1/3 w-full animate-hologram-scan bg-gradient-to-b from-transparent via-teal-200/20 to-transparent" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-center justify-between text-xs uppercase text-cyan-100/55">
              <span>Preview</span>
              <span>Standby</span>
            </div>

            <div className="grid flex-1 place-items-center">
              <div className="relative h-48 w-48">
                <div className="absolute inset-4 animate-slow-spin rounded-full border border-teal-200/45" />
                <div className="absolute inset-10 rounded-full border border-amber-200/35" />
                <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-teal-100/55 bg-teal-300/10 shadow-glow" />
                <div className="absolute left-1/2 top-[44%] h-20 w-20 -translate-x-1/2 -translate-y-1/2 border border-cyan-100/45 bg-cyan-300/10" />
                <div className="absolute bottom-8 left-1/2 h-8 w-36 -translate-x-1/2 rounded-[50%] border border-amber-100/35 bg-amber-300/10" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="h-1.5 rounded-full bg-teal-200/70" />
              <div className="h-1.5 rounded-full bg-amber-200/60" />
              <div className="h-1.5 rounded-full bg-neutral-500/70" />
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}
