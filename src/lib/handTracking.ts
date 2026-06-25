import type {
  Category,
  FilesetResolver,
  HandLandmarker,
  HandLandmarkerResult,
  NormalizedLandmark
} from "@mediapipe/tasks-vision";

import type { HandLandmark, TrackedHand, TrackingStatus, StatusTone } from "@/lib/types";

export const HAND_TRACKING_WASM_PATH = "/mediapipe/wasm";
export const HAND_TRACKING_MODEL_PATH = "/mediapipe/models/hand_landmarker.task";
export const MAX_TRACKED_HANDS = 2;

export type MediaPipeVisionModule = typeof import("@mediapipe/tasks-vision");

export type HandLandmarkerInstance = HandLandmarker;

export type HandTrackingAssets = Readonly<{
  modelPath: string;
  wasmPath: string;
}>;

export const DEFAULT_HAND_TRACKING_ASSETS = {
  modelPath: HAND_TRACKING_MODEL_PATH,
  wasmPath: HAND_TRACKING_WASM_PATH
} satisfies HandTrackingAssets;

const SUPPRESSED_MEDIAPIPE_ERROR_LOGS = ["INFO: Created TensorFlow Lite XNNPACK delegate for CPU."];

function shouldSuppressMediaPipeErrorLog(values: readonly unknown[]) {
  return values.some(
    (value) =>
      typeof value === "string" &&
      SUPPRESSED_MEDIAPIPE_ERROR_LOGS.some((message) => value.includes(message))
  );
}

async function withMediaPipeErrorLogFilter<T>(task: () => Promise<T>) {
  const originalConsoleError = console.error;

  console.error = (...values: unknown[]) => {
    if (shouldSuppressMediaPipeErrorLog(values)) {
      return;
    }

    originalConsoleError(...values);
  };

  try {
    return await task();
  } finally {
    console.error = originalConsoleError;
  }
}

export function isHandTrackingSupported() {
  return (
    typeof window !== "undefined" &&
    typeof HTMLVideoElement !== "undefined" &&
    typeof WebAssembly !== "undefined" &&
    typeof requestAnimationFrame !== "undefined"
  );
}

export async function createHandLandmarker(assets = DEFAULT_HAND_TRACKING_ASSETS) {
  return withMediaPipeErrorLogFilter(async () => {
    const visionModule: MediaPipeVisionModule = await import("@mediapipe/tasks-vision");
    const filesetResolver: typeof FilesetResolver = visionModule.FilesetResolver;
    const handLandmarkerFactory: typeof HandLandmarker = visionModule.HandLandmarker;
    const vision = await filesetResolver.forVisionTasks(assets.wasmPath);

    return handLandmarkerFactory.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: assets.modelPath
      },
      minHandDetectionConfidence: 0.55,
      minHandPresenceConfidence: 0.55,
      minTrackingConfidence: 0.5,
      numHands: MAX_TRACKED_HANDS,
      runningMode: "VIDEO"
    });
  });
}

function normalizeHandedness(category: Category | undefined): TrackedHand["handedness"] {
  if (category?.categoryName === "Left" || category?.categoryName === "Right") {
    return category.categoryName;
  }

  return "Unknown";
}

function normalizeLandmark(landmark: NormalizedLandmark): HandLandmark {
  return {
    x: landmark.x,
    y: landmark.y,
    z: landmark.z
  };
}

export function normalizeHandLandmarkerResult(result: HandLandmarkerResult): TrackedHand[] {
  return result.landmarks.map((landmarks, index) => ({
    handedness: normalizeHandedness(result.handedness[index]?.[0] ?? result.handednesses[index]?.[0]),
    landmarks: landmarks.map(normalizeLandmark)
  }));
}

export function canTrackVideo(video: HTMLVideoElement | null): video is HTMLVideoElement {
  return Boolean(
    video &&
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      video.videoWidth > 0 &&
      video.videoHeight > 0
  );
}

export function getTrackingStatusTone(status: TrackingStatus): StatusTone {
  if (status === "tracking" || status === "ready") {
    return "success";
  }

  if (status === "loading" || status === "lost") {
    return "warning";
  }

  if (status === "unsupported" || status === "error") {
    return "danger";
  }

  return "neutral";
}

export function getTrackingStatusLabel(status: TrackingStatus) {
  const labels = {
    error: "Error",
    idle: "Idle",
    loading: "Loading",
    lost: "Lost",
    ready: "Ready",
    tracking: "Tracking",
    unsupported: "Unsupported"
  } satisfies Record<TrackingStatus, string>;

  return labels[status];
}
