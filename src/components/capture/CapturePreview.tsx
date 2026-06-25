"use client";

/* eslint-disable @next/next/no-img-element */

import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { downloadUrl } from "@/lib/download";
import type { CaptureResult } from "@/lib/types";

type CapturePreviewProps = {
  capture: CaptureResult | null;
  onClose: () => void;
};

export function CapturePreview({ capture, onClose }: CapturePreviewProps) {
  if (!capture) {
    return null;
  }

  return (
    <Card className="fixed bottom-24 right-4 z-40 w-[min(20rem,calc(100vw-2rem))] border-cyan-100/[0.16] bg-black/70 p-3 text-white sm:right-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">
          {capture.type === "image" ? "Screenshot ready" : "Recording ready"}
        </p>
        <Button aria-label="Close capture preview" onClick={onClose} size="icon" variant="ghost">
          <X aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
      {capture.type === "image" ? (
        <img
          alt="AR capture preview"
          className="aspect-video w-full rounded-md border border-cyan-100/[0.12] object-cover"
          src={capture.url}
        />
      ) : (
        <video
          className="aspect-video w-full rounded-md border border-cyan-100/[0.12]"
          controls
          src={capture.url}
        />
      )}
      <Button
        className="mt-3 w-full"
        onClick={() => downloadUrl(capture.url, capture.fileName)}
        variant="secondary"
      >
        <Download aria-hidden="true" className="h-4 w-4" />
        Download
      </Button>
    </Card>
  );
}
