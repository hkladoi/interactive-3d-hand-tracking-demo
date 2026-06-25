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

export type GestureType = "none" | "pinch" | "twoHandScale" | "twoHandRotate";

export type GestureState = {
  confidence: number;
  isPinching: boolean;
  isTwoHandActive: boolean;
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
