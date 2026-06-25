export type CameraStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unsupported"
  | "error";

export type TrackingStatus =
  | "idle"
  | "loading"
  | "ready"
  | "tracking"
  | "lost"
  | "unsupported"
  | "error";

export type GestureType =
  | "none"
  | "hover"
  | "touch"
  | "drag"
  | "twoHandScale"
  | "twoHandRotate"
  | "handRotate";

export type FingerTouchState = {
  confidence: number;
  distance: number;
  indexTip: Point2D | null;
  isTouching: boolean;
  threshold: number;
  thumbTip: Point2D | null;
  touchPoint: Point2D | null;
};

export type HandRotationDirection = "clockwise" | "counterClockwise" | "neutral";

export type HandRotationState = {
  confidence: number;
  deltaAngle: number;
  direction: HandRotationDirection;
  pitch: number;
  roll: number;
  screenAngle: number;
  yaw: number;
};

export type ObjectTouchState = {
  isTouchingObject: boolean;
  localPoint: [number, number, number] | null;
  normal?: [number, number, number] | null;
  objectId?: string | null;
  screenPoint: Point2D | null;
  distance?: number | null;
  worldPoint: [number, number, number] | null;
};

export type GestureState = {
  confidence: number;
  fingerTouch: FingerTouchState;
  handRotation: HandRotationState | null;
  isDragging: boolean;
  isPinching: boolean;
  isTwoHandActive: boolean;
  objectTouch: ObjectTouchState;
  pinchDistance: number | null;
  pinchPoint: Point2D | null;
  primaryHand: "Left" | "Right" | "Unknown" | null;
  rotationDelta: number;
  scaleDelta: number;
  twoHandAngle: number | null;
  twoHandDistance: number | null;
  type: GestureType;
};

export type Point2D = {
  x: number;
  y: number;
};

export type HandLandmark = {
  x: number;
  y: number;
  z?: number;
};

export type TrackedHand = {
  handedness: "Left" | "Right" | "Unknown";
  landmarks: HandLandmark[];
};

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export type SystemMetricStatus = "available" | "estimated" | "unsupported";

export type SystemResourceMetric = {
  detail: string;
  memory: string;
  name: string;
  status: SystemMetricStatus;
  usage: string;
};

export type SystemResourceStats = {
  cpu: SystemResourceMetric;
  gpu: SystemResourceMetric;
  ram: SystemResourceMetric;
  updatedAt: number;
};

export type CameraFallbackStatus = Extract<CameraStatus, "denied" | "unsupported" | "error">;

export type CameraStatusCopy = {
  label: string;
  shortLabel: string;
  title: string;
  message: string;
  tone: StatusTone;
};

export type CalibrationStep =
  | "intro"
  | "openHand"
  | "pinch"
  | "rotateLeft"
  | "rotateRight"
  | "complete";

export type CalibrationProfile = {
  version: number;
  createdAt: string;
  averagePalmSize: number;
  touchThresholdRatio: number;
  releaseThresholdRatio: number;
  rotationSensitivity: number;
  depthSensitivity: number;
  mirrorMode: boolean;
  minGestureConfidence: number;
};

export type CalibrationState = {
  isCalibrating: boolean;
  step: CalibrationStep;
  progress: number;
  samplesCollected: number;
  profile: CalibrationProfile | null;
  errorMessage: string | null;
};

export type DepthState = {
  isActive: boolean;
  rawDepth: number | null;
  normalizedDepth: number | null;
  delta: number;
  direction: "nearer" | "farther" | "stable";
  confidence: number;
};

export type DepthControlMode = "positionZ" | "scale" | "both";

export type ARObjectType = "hologram" | "crystal" | "orb" | "ring" | "model";

export type ARObjectTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

export type ARObject = {
  id: string;
  name: string;
  type: ARObjectType;
  modelUrl?: string;
  transform: ARObjectTransform;
  visible: boolean;
  locked: boolean;
};

export type ObjectHitResult = {
  objectId: string;
  screenPoint: Point2D;
  worldPoint: [number, number, number] | null;
  localPoint: [number, number, number] | null;
  distance: number;
};

export type ObjectPresetCategory = "abstract" | "nature" | "tech" | "space" | "custom";

export type ObjectPreset = {
  id: string;
  name: string;
  category: ObjectPresetCategory;
  type: ARObjectType;
  description: string;
  defaultScale: number;
  modelUrl?: string;
};

export type RecordingStatus = "idle" | "recording" | "stopping" | "ready" | "error";

export type CaptureResult = {
  type: "image" | "video";
  url: string;
  fileName: string;
  createdAt: string;
};

export type QualityMode = "low" | "medium" | "high" | "ultra";

export type PerformanceConfig = {
  qualityMode: QualityMode;
  particleCount: number;
  trackingFps: number;
  renderScale: number;
  enableGlow: boolean;
  enableParticles: boolean;
  enableDebugOverlay: boolean;
  maxRecordingFps: number;
};

export type DeviceCapabilities = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  prefersReducedMotion: boolean;
  devicePixelRatio: number;
  hardwareConcurrency: number | null;
  hasTouch: boolean;
};

export type BrowserSupportState = {
  camera: boolean;
  canvasCaptureStream: boolean;
  localStorage: boolean;
  mediaRecorder: boolean;
  wasm: boolean;
  webgl: boolean;
};

export type AppErrorCode =
  | "camera_permission_denied"
  | "camera_not_supported"
  | "camera_not_found"
  | "tracking_load_failed"
  | "tracking_runtime_error"
  | "recording_not_supported"
  | "capture_failed"
  | "model_load_failed"
  | "unknown";
