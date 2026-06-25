"use client";

import { Badge } from "@/components/ui/Badge";
import type { BrowserSupportState, StatusTone } from "@/lib/types";

type BrowserSupportPanelProps = {
  support: BrowserSupportState;
};

type SupportRow = {
  key: keyof BrowserSupportState;
  label: string;
};

const rows: SupportRow[] = [
  { key: "camera", label: "Camera" },
  { key: "webgl", label: "WebGL" },
  { key: "mediaRecorder", label: "MediaRecorder" },
  { key: "canvasCaptureStream", label: "Capture stream" },
  { key: "localStorage", label: "LocalStorage" },
  { key: "wasm", label: "WebAssembly" }
];

function getTone(isSupported: boolean): StatusTone {
  return isSupported ? "success" : "warning";
}

export function BrowserSupportPanel({ support }: BrowserSupportPanelProps) {
  return (
    <div className="rounded-md border border-cyan-100/[0.12] bg-black/20 p-3">
      <h2 className="text-sm font-semibold text-white">Browser Support</h2>
      <div className="mt-3 grid gap-2">
        {rows.map((row) => {
          const isSupported = support[row.key];

          return (
            <div
              className="flex items-center justify-between rounded-md border border-cyan-100/[0.1] bg-white/[0.045] px-3 py-2 text-xs text-neutral-200"
              key={row.key}
            >
              <span>{row.label}</span>
              <Badge tone={getTone(isSupported)}>
                {isSupported ? "Supported" : "Not supported"}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
