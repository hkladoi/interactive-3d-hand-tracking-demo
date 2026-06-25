"use client";

import { Gauge } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { PerformanceConfig, QualityMode } from "@/lib/types";

type QualitySettingsPanelProps = {
  className?: string;
  config: PerformanceConfig;
  onChange: (mode: QualityMode) => void;
  qualityMode: QualityMode;
};

const modes: QualityMode[] = ["low", "medium", "high", "ultra"];

export function QualitySettingsPanel({
  className,
  config,
  onChange,
  qualityMode
}: QualitySettingsPanelProps) {
  return (
    <Card className={cn("border-cyan-100/[0.12] bg-black/45 p-3 text-white", className)}>
      <div className="mb-3 flex items-center gap-2">
        <Gauge aria-hidden="true" className="h-4 w-4 text-teal-100" />
        <h2 className="text-sm font-semibold">Quality</h2>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {modes.map((mode) => (
          <Button
            key={mode}
            onClick={() => onChange(mode)}
            size="sm"
            variant={mode === qualityMode ? "primary" : "secondary"}
          >
            {mode}
          </Button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-300">
        <span>Particles: {config.particleCount}</span>
        <span>Tracking: {config.trackingFps} fps</span>
        <span>Render: {config.renderScale}x</span>
        <span>Recording: {config.maxRecordingFps} fps</span>
      </div>
    </Card>
  );
}
