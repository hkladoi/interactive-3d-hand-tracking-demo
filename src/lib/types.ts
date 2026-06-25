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
  screenPoint: Point2D | null;
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
