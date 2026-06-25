import type { CameraStatus, CameraStatusCopy } from "@/lib/types";

export const APP_NAME = "Interactive 3D Hand Tracking";

export const START_SUBTITLE =
  "Camera-based hand tracking foundation with a responsive 3D hologram layer.";

export const LOCAL_CAMERA_NOTICE = "Your camera stays local in the browser.";

export const GESTURE_STATUS_LABEL = "None";

export const DEFAULT_MODEL_URL = "";

export const CAMERA_STATUS_COPY = {
  idle: {
    label: "Camera idle",
    shortLabel: "Idle",
    title: "Start the camera",
    message: "Camera access has not been requested yet.",
    tone: "neutral"
  },
  requesting: {
    label: "Requesting camera",
    shortLabel: "Requesting",
    title: "Waiting for camera permission",
    message: "Approve camera access in the browser prompt to enter AR mode.",
    tone: "info"
  },
  ready: {
    label: "Camera ready",
    shortLabel: "Ready",
    title: "Camera ready",
    message: "The camera stream is active in the browser.",
    tone: "success"
  },
  denied: {
    label: "Camera denied",
    shortLabel: "Denied",
    title: "Camera permission denied",
    message: "Enable camera permission for this site, then try again.",
    tone: "danger"
  },
  unsupported: {
    label: "Camera unsupported",
    shortLabel: "Unsupported",
    title: "Camera is not supported",
    message: "This browser does not expose camera access through MediaDevices.",
    tone: "warning"
  },
  error: {
    label: "Camera error",
    shortLabel: "Error",
    title: "Camera could not start",
    message: "The browser could not open a camera stream.",
    tone: "danger"
  }
} satisfies Record<CameraStatus, CameraStatusCopy>;
