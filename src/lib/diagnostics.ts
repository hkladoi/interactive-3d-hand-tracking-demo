import { APP_VERSION } from "@/lib/constants";
import type {
  AppErrorCode,
  BrowserSupportState,
  CameraStatus,
  RecordingStatus,
  TrackingStatus
} from "@/lib/types";

export function getAppErrorMessage(code: AppErrorCode) {
  switch (code) {
    case "camera_permission_denied":
      return "Camera permission was denied. Enable camera access for this site.";
    case "camera_not_supported":
      return "This browser does not support camera access.";
    case "camera_not_found":
      return "No camera device was found.";
    case "tracking_load_failed":
      return "MediaPipe hand tracking failed to load.";
    case "tracking_runtime_error":
      return "Hand tracking stopped because of a runtime error.";
    case "recording_not_supported":
      return "MediaRecorder is not supported in this browser.";
    case "capture_failed":
      return "Capture failed. Try again or use a supported Chromium browser.";
    case "model_load_failed":
      return "The custom model could not load, so the fallback object is shown.";
    case "unknown":
    default:
      return "Something went wrong, but the app kept running.";
  }
}

export function createDiagnosticsPayload({
  browserSupport,
  calibrationLoaded,
  cameraStatus,
  fps,
  lastError,
  qualityMode,
  recordingStatus,
  selectedObjectId,
  trackingStatus
}: {
  browserSupport: BrowserSupportState;
  calibrationLoaded: boolean;
  cameraStatus: CameraStatus;
  fps: number;
  lastError: string | null;
  qualityMode: string;
  recordingStatus: RecordingStatus;
  selectedObjectId: string | null;
  trackingStatus: TrackingStatus;
}) {
  return {
    appVersion: APP_VERSION,
    browserSupport,
    calibrationLoaded,
    cameraStatus,
    fps,
    lastError,
    qualityMode,
    recordingStatus,
    selectedObjectId,
    trackingStatus
  };
}
