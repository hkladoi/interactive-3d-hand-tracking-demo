"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createCaptureFileName, getPrimaryCanvas } from "@/lib/capture";
import type { CaptureResult, RecordingStatus } from "@/lib/types";

type UseMediaRecorderOptions = {
  maxDurationMs?: number;
  recordingFps?: number;
};

export function useMediaRecorder({
  maxDurationMs = 30000,
  recordingFps = 24
}: UseMediaRecorderOptions = {}) {
  const chunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastCapture, setLastCapture] = useState<CaptureResult | null>(null);
  const [status, setStatus] = useState<RecordingStatus>("idle");

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      setStatus("stopping");
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(
    (container: HTMLElement | null) => {
      if (typeof MediaRecorder === "undefined") {
        setErrorMessage("MediaRecorder is not supported in this browser.");
        setStatus("error");
        return;
      }

      const canvas = getPrimaryCanvas(container);
      const captureStream = canvas?.captureStream;

      if (!canvas || !captureStream) {
        setErrorMessage("Canvas recording is not supported in this browser.");
        setStatus("error");
        return;
      }

      const stream = canvas.captureStream(recordingFps);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm"
      });

      chunksRef.current = [];
      mediaRecorderRef.current = recorder;
      startedAtRef.current = performance.now();
      setElapsedMs(0);
      setErrorMessage(null);
      setStatus("recording");

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setErrorMessage("Recording failed.");
        setStatus("error");
      };

      recorder.onstop = () => {
        if (timerRef.current !== null) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setLastCapture({
          createdAt: new Date().toISOString(),
          fileName: createCaptureFileName("video"),
          type: "video",
          url
        });
        setStatus("ready");
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();

      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }

      timerRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startedAtRef.current;
        setElapsedMs(elapsed);

        if (elapsed >= maxDurationMs) {
          stopRecording();
        }
      }, 250);
    },
    [maxDurationMs, recordingFps, stopRecording]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    elapsedMs,
    errorMessage,
    lastCapture,
    startRecording,
    status,
    stopRecording
  };
}
