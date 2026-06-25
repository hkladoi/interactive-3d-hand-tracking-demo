"use client";

import { useCallback, useState } from "react";

import { createCaptureFileName, createScreenshotBlob } from "@/lib/capture";
import type { CaptureResult } from "@/lib/types";

export function useScreenshot() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = useCallback(async (container: HTMLElement | null) => {
    if (!container) {
      setErrorMessage("AR container is not ready.");
      return null;
    }

    setIsCapturing(true);
    setErrorMessage(null);

    try {
      const blob = await createScreenshotBlob(container);
      const url = URL.createObjectURL(blob);
      const result: CaptureResult = {
        createdAt: new Date().toISOString(),
        fileName: createCaptureFileName("image"),
        type: "image",
        url
      };

      return result;
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Screenshot failed.");
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return {
    captureScreenshot,
    errorMessage,
    isCapturing
  };
}
