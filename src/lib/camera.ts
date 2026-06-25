export type CameraLandmark = Readonly<{
  confidence: number;
  id: string;
  label: string;
  x: number;
  y: number;
}>;

export type CameraLandmarkConnection = readonly [fromId: string, toId: string];

export type CameraOverlaySnapshot = Readonly<{
  connections: readonly CameraLandmarkConnection[];
  landmarks: readonly CameraLandmark[];
  message: string;
  trackingState: "mock" | "live";
}>;

export type CameraLayerVisibility = Readonly<{
  showCameraOverlay: boolean;
  showHologram: boolean;
  showStatusBar: boolean;
}>;

export type CameraLayerKey = keyof CameraLayerVisibility;

export const DEFAULT_CAMERA_LAYER_VISIBILITY = {
  showCameraOverlay: true,
  showHologram: true,
  showStatusBar: true
} satisfies CameraLayerVisibility;

export const MOCK_CAMERA_LANDMARKS = [
  { confidence: 0.96, id: "wrist", label: "Wrist", x: 0.5, y: 0.62 },
  { confidence: 0.93, id: "thumb", label: "Thumb", x: 0.42, y: 0.53 },
  { confidence: 0.94, id: "index", label: "Index", x: 0.48, y: 0.43 },
  { confidence: 0.92, id: "middle", label: "Middle", x: 0.55, y: 0.4 },
  { confidence: 0.9, id: "ring", label: "Ring", x: 0.61, y: 0.46 },
  { confidence: 0.91, id: "pinky", label: "Pinky", x: 0.64, y: 0.55 },
  { confidence: 0.95, id: "palm", label: "Palm", x: 0.53, y: 0.53 }
] satisfies readonly CameraLandmark[];

export const MOCK_CAMERA_CONNECTIONS = [
  ["wrist", "thumb"],
  ["wrist", "palm"],
  ["palm", "index"],
  ["palm", "middle"],
  ["palm", "ring"],
  ["palm", "pinky"],
  ["thumb", "index"],
  ["index", "middle"],
  ["middle", "ring"],
  ["ring", "pinky"]
] satisfies readonly CameraLandmarkConnection[];

export const MOCK_CAMERA_OVERLAY_SNAPSHOT = {
  connections: MOCK_CAMERA_CONNECTIONS,
  landmarks: MOCK_CAMERA_LANDMARKS,
  message: "Tracking diagnostic overlay standby.",
  trackingState: "mock"
} satisfies CameraOverlaySnapshot;

export const TRACKING_UNAVAILABLE_OVERLAY_SNAPSHOT = {
  connections: [],
  landmarks: [],
  message: "Hand tracking is unavailable. Camera and hologram remain active.",
  trackingState: "live"
} satisfies CameraOverlaySnapshot;

export function getCameraResolutionLabel(stream: MediaStream | null) {
  const settings = stream?.getVideoTracks()[0]?.getSettings();

  if (!settings?.width || !settings.height) {
    return "Adaptive";
  }

  return `${settings.width} x ${settings.height}`;
}

export function resolveCameraOverlayPoint(
  landmark: CameraLandmark,
  width: number,
  height: number
) {
  return {
    x: landmark.x * width,
    y: landmark.y * height
  };
}
