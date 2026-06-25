"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CameraStatus } from "@/lib/types";

type UseCameraResult = {
  status: CameraStatus;
  stream: MediaStream | null;
  errorMessage: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
};

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: "user",
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
};

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => {
    track.stop();
  });
}

function getCameraErrorMessage(error: unknown) {
  if (error instanceof DOMException && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown camera error.";
}

function getCameraErrorStatus(error: unknown): CameraStatus {
  if (!(error instanceof DOMException)) {
    return "error";
  }

  if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
    return "denied";
  }

  return "error";
}

export function useCamera(): UseCameraResult {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const stopCamera = useCallback(() => {
    requestIdRef.current += 1;
    stopStream(activeStreamRef.current);
    activeStreamRef.current = null;
    setStream(null);
    setErrorMessage(null);
    setStatus("idle");
  }, []);

  const startCamera = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStream(null);
      setErrorMessage("Camera access is unavailable in this browser.");
      setStatus("unsupported");
      return;
    }

    setStatus("requesting");
    setErrorMessage(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);

      if (!isMountedRef.current || requestIdRef.current !== requestId) {
        stopStream(mediaStream);
        return;
      }

      stopStream(activeStreamRef.current);
      activeStreamRef.current = mediaStream;
      setStream(mediaStream);
      setStatus("ready");
    } catch (error) {
      if (!isMountedRef.current || requestIdRef.current !== requestId) {
        return;
      }

      stopStream(activeStreamRef.current);
      activeStreamRef.current = null;
      setStream(null);
      setErrorMessage(getCameraErrorMessage(error));
      setStatus(getCameraErrorStatus(error));
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
      stopStream(activeStreamRef.current);
      activeStreamRef.current = null;
    };
  }, []);

  return {
    status,
    stream,
    errorMessage,
    startCamera,
    stopCamera
  };
}
