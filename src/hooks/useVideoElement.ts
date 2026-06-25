"use client";

import { useEffect, useRef, type RefObject } from "react";

type UseVideoElementResult = Readonly<{
  videoRef: RefObject<HTMLVideoElement | null>;
}>;

export function useVideoElement(
  stream: MediaStream | null,
  providedVideoRef?: RefObject<HTMLVideoElement | null>
): UseVideoElementResult {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = providedVideoRef ?? internalVideoRef;

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    if (!stream) {
      videoElement.pause();
      videoElement.srcObject = null;
      return;
    }

    videoElement.srcObject = stream;
    void videoElement.play().catch(() => undefined);

    return () => {
      if (videoElement.srcObject === stream) {
        videoElement.pause();
        videoElement.srcObject = null;
      }
    };
  }, [stream, videoRef]);

  return { videoRef };
}
