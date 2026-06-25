"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

import {
  canTrackVideo,
  createHandLandmarker,
  DEFAULT_HAND_TRACKING_ASSETS,
  isHandTrackingSupported,
  normalizeHandLandmarkerResult,
  type HandLandmarkerInstance,
  type HandTrackingAssets
} from "@/lib/handTracking";
import type { TrackedHand, TrackingStatus } from "@/lib/types";

type UseHandTrackingOptions = Readonly<{
  assets?: HandTrackingAssets;
  targetFps?: number;
}>;

type UseHandTrackingResult = Readonly<{
  errorMessage: string | null;
  fps: number;
  hands: TrackedHand[];
  startTracking: () => Promise<void>;
  status: TrackingStatus;
  stopTracking: () => void;
}>;

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Hand tracking failed to start.";
}

export function useHandTracking(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: UseHandTrackingOptions = {}
): UseHandTrackingResult {
  const assets = options.assets ?? DEFAULT_HAND_TRACKING_ASSETS;
  const targetFps = options.targetFps ?? 30;
  const [status, setStatus] = useState<TrackingStatus>("idle");
  const [hands, setHands] = useState<TrackedHand[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  const animationFrameRef = useRef<number | null>(null);
  const framesInWindowRef = useRef(0);
  const handsCountRef = useRef(0);
  const landmarkerRef = useRef<HandLandmarkerInstance | null>(null);
  const lastDetectedAtRef = useRef(0);
  const runIdRef = useRef(0);
  const statusRef = useRef<TrackingStatus>("idle");
  const trackingActiveRef = useRef(false);
  const windowStartedAtRef = useRef(0);

  const setTrackingStatus = useCallback((nextStatus: TrackingStatus) => {
    if (statusRef.current === nextStatus) {
      return;
    }

    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }, []);

  const clearHands = useCallback(() => {
    if (handsCountRef.current === 0) {
      return;
    }

    handsCountRef.current = 0;
    setHands([]);
  }, []);

  const cancelLoop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const stopTracking = useCallback(() => {
    runIdRef.current += 1;
    trackingActiveRef.current = false;
    cancelLoop();
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    framesInWindowRef.current = 0;
    handsCountRef.current = 0;
    windowStartedAtRef.current = 0;
    lastDetectedAtRef.current = 0;
    setHands([]);
    setFps(0);
    setErrorMessage(null);
    setTrackingStatus("idle");
  }, [cancelLoop, setTrackingStatus]);

  const scheduleDetection = useCallback(
    (runId: number) => {
      const detectFrame = () => {
        if (!trackingActiveRef.current || runIdRef.current !== runId) {
          return;
        }

        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        const frameStartedAt = performance.now();
        const minFrameInterval = 1000 / Math.max(targetFps, 1);

        if (!landmarker || !canTrackVideo(video)) {
          clearHands();
          setTrackingStatus(statusRef.current === "loading" ? "loading" : "lost");
          animationFrameRef.current = window.requestAnimationFrame(detectFrame);
          return;
        }

        if (frameStartedAt - lastDetectedAtRef.current < minFrameInterval) {
          animationFrameRef.current = window.requestAnimationFrame(detectFrame);
          return;
        }

        lastDetectedAtRef.current = frameStartedAt;

        try {
          const result = landmarker.detectForVideo(video, frameStartedAt);
          const nextHands = normalizeHandLandmarkerResult(result);

          if (nextHands.length > 0) {
            handsCountRef.current = nextHands.length;
            setHands(nextHands);
          } else {
            clearHands();
          }

          setTrackingStatus(nextHands.length > 0 ? "tracking" : "lost");

          framesInWindowRef.current += 1;
          const windowStartedAt = windowStartedAtRef.current || frameStartedAt;
          windowStartedAtRef.current = windowStartedAt;

          if (frameStartedAt - windowStartedAt >= 500) {
            const nextFps = Math.round(
              (framesInWindowRef.current * 1000) / (frameStartedAt - windowStartedAt)
            );

            setFps((current) => (current === nextFps ? current : nextFps));
            framesInWindowRef.current = 0;
            windowStartedAtRef.current = frameStartedAt;
          }

          animationFrameRef.current = window.requestAnimationFrame(detectFrame);
        } catch (error) {
          trackingActiveRef.current = false;
          cancelLoop();
          clearHands();
          setFps(0);
          setErrorMessage(getErrorMessage(error));
          setTrackingStatus("error");
        }
      };

      animationFrameRef.current = window.requestAnimationFrame(detectFrame);
    },
    [cancelLoop, clearHands, setTrackingStatus, targetFps, videoRef]
  );

  const startTracking = useCallback(async () => {
    if (trackingActiveRef.current) {
      return;
    }

    if (!isHandTrackingSupported()) {
      setTrackingStatus("unsupported");
      setErrorMessage("This browser does not support the APIs required by MediaPipe hand tracking.");
      return;
    }

    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    trackingActiveRef.current = true;
    setErrorMessage(null);
    handsCountRef.current = 0;
    setHands([]);
    setFps(0);
    setTrackingStatus("loading");

    try {
      const landmarker = await createHandLandmarker(assets);

      if (!trackingActiveRef.current || runIdRef.current !== runId) {
        landmarker.close();
        return;
      }

      landmarkerRef.current?.close();
      landmarkerRef.current = landmarker;
      setTrackingStatus("ready");
      scheduleDetection(runId);
    } catch (error) {
      if (runIdRef.current !== runId) {
        return;
      }

      trackingActiveRef.current = false;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      handsCountRef.current = 0;
      setHands([]);
      setFps(0);
      setErrorMessage(getErrorMessage(error));
      setTrackingStatus("error");
    }
  }, [assets, scheduleDetection, setTrackingStatus]);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    errorMessage,
    fps,
    hands,
    startTracking,
    status,
    stopTracking
  };
}
