"use client";

import { Camera, Download, Square, Video } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { downloadUrl } from "@/lib/download";
import type { CaptureResult, RecordingStatus } from "@/lib/types";

type CaptureControlsProps = {
  errorMessage: string | null;
  isCapturing: boolean;
  lastCapture: CaptureResult | null;
  onScreenshot: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  recordingStatus: RecordingStatus;
};

export function CaptureControls({
  errorMessage,
  isCapturing,
  lastCapture,
  onScreenshot,
  onStartRecording,
  onStopRecording,
  recordingStatus
}: CaptureControlsProps) {
  const isRecording = recordingStatus === "recording";

  return (
    <Card className="fixed bottom-24 left-4 z-30 w-[min(22rem,calc(100vw-2rem))] border-cyan-100/[0.12] bg-black/45 p-3 text-white sm:left-6">
      <div className="grid grid-cols-2 gap-2">
        <Button isLoading={isCapturing} onClick={onScreenshot} size="sm" variant="secondary">
          <Camera aria-hidden="true" className="h-4 w-4" />
          Screenshot
        </Button>
        {isRecording ? (
          <Button onClick={onStopRecording} size="sm" variant="danger">
            <Square aria-hidden="true" className="h-4 w-4 fill-current" />
            Stop
          </Button>
        ) : (
          <Button onClick={onStartRecording} size="sm" variant="secondary">
            <Video aria-hidden="true" className="h-4 w-4" />
            Record
          </Button>
        )}
        <Button
          className="col-span-2"
          disabled={!lastCapture}
          onClick={() => {
            if (lastCapture) {
              downloadUrl(lastCapture.url, lastCapture.fileName);
            }
          }}
          size="sm"
          variant="secondary"
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Download Last Capture
        </Button>
      </div>
      {errorMessage ? (
        <p className="mt-2 rounded-md border border-amber-200/25 bg-amber-300/10 px-2 py-1.5 text-xs text-amber-100">
          {errorMessage}
        </p>
      ) : null}
    </Card>
  );
}
