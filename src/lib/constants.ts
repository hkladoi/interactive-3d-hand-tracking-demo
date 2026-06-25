import type {
  CalibrationProfile,
  CameraStatus,
  CameraStatusCopy,
  PerformanceConfig,
  QualityMode
} from "@/lib/types";

export const APP_NAME = "Interactive 3D Hand Tracking";
export const APP_VERSION = "0.10.0";

export const START_SUBTITLE =
  "Camera-based hand tracking foundation with a responsive 3D hologram layer.";

export const LOCAL_CAMERA_NOTICE = "Your camera stays local in the browser.";

export const GESTURE_STATUS_LABEL = "None";

export const DEFAULT_MODEL_URL = "";

export const CALIBRATION_STORAGE_KEY = "ar-hand-tracking-calibration-profile";
export const QUALITY_STORAGE_KEY = "ar-hand-tracking-quality-mode";
export const HINTS_STORAGE_KEY = "ar-hand-tracking-hide-hints";

export const DEFAULT_CALIBRATION_PROFILE = {
  averagePalmSize: 0.22,
  createdAt: "default",
  depthSensitivity: 1,
  minGestureConfidence: 0.28,
  mirrorMode: true,
  releaseThresholdRatio: 0.3,
  rotationSensitivity: 1,
  touchThresholdRatio: 0.22,
  version: 1
} satisfies CalibrationProfile;

export const CALIBRATION_CONFIG = {
  maxReleaseThresholdRatio: 0.42,
  maxTouchThresholdRatio: 0.32,
  minReleaseThresholdRatio: 0.18,
  minSamples: 24,
  minTouchThresholdRatio: 0.1,
  profileVersion: 1
} as const;

export const DEPTH_CONFIG = {
  maxScale: 2.5,
  maxZ: 2,
  minScale: 0.5,
  minZ: -2,
  movementThreshold: 0.01,
  scaleSensitivity: 0.8,
  smoothing: 0.15,
  zSensitivity: 1.2
} as const;

export const QUALITY_CONFIG = {
  low: {
    enableDebugOverlay: false,
    enableGlow: false,
    enableParticles: true,
    maxRecordingFps: 15,
    particleCount: 80,
    qualityMode: "low",
    renderScale: 0.75,
    trackingFps: 15
  },
  medium: {
    enableDebugOverlay: true,
    enableGlow: true,
    enableParticles: true,
    maxRecordingFps: 24,
    particleCount: 200,
    qualityMode: "medium",
    renderScale: 1,
    trackingFps: 24
  },
  high: {
    enableDebugOverlay: true,
    enableGlow: true,
    enableParticles: true,
    maxRecordingFps: 30,
    particleCount: 400,
    qualityMode: "high",
    renderScale: 1,
    trackingFps: 30
  },
  ultra: {
    enableDebugOverlay: true,
    enableGlow: true,
    enableParticles: true,
    maxRecordingFps: 30,
    particleCount: 700,
    qualityMode: "ultra",
    renderScale: 1.25,
    trackingFps: 30
  }
} satisfies Record<QualityMode, PerformanceConfig>;

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
