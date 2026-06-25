import { isLocalStorageSupported } from "@/lib/storage";
import type { BrowserSupportState } from "@/lib/types";

function hasWebGL() {
  if (typeof document === "undefined") {
    return false;
  }

  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
}

export function getBrowserSupportState(): BrowserSupportState {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      camera: false,
      canvasCaptureStream: false,
      localStorage: false,
      mediaRecorder: false,
      wasm: false,
      webgl: false
    };
  }

  const canvas = document.createElement("canvas");

  return {
    camera: Boolean(navigator.mediaDevices?.getUserMedia),
    canvasCaptureStream: typeof canvas.captureStream === "function",
    localStorage: isLocalStorageSupported(),
    mediaRecorder: typeof MediaRecorder !== "undefined",
    wasm: typeof WebAssembly !== "undefined",
    webgl: hasWebGL()
  };
}
