import { DEPTH_CONFIG, DEFAULT_CALIBRATION_PROFILE } from "@/lib/constants";
import { clamp, lerp } from "@/lib/math";
import type { CalibrationProfile, DepthState, HandLandmark, TrackedHand } from "@/lib/types";

const DEPTH_LANDMARK_INDEXES = [0, 5, 9, 17] as const;

export const EMPTY_DEPTH_STATE = {
  confidence: 0,
  delta: 0,
  direction: "stable",
  isActive: false,
  normalizedDepth: null,
  rawDepth: null
} satisfies DepthState;

function getAverageDepth(landmarks: readonly HandLandmark[]) {
  const depths = DEPTH_LANDMARK_INDEXES.map((index) => landmarks[index]?.z).filter(
    (z): z is number => typeof z === "number" && Number.isFinite(z)
  );

  if (depths.length === 0) {
    return null;
  }

  return depths.reduce((total, z) => total + z, 0) / depths.length;
}

function getDepthDirection(delta: number) {
  if (delta < -DEPTH_CONFIG.movementThreshold) {
    return "nearer";
  }

  if (delta > DEPTH_CONFIG.movementThreshold) {
    return "farther";
  }

  return "stable";
}

export function getTrackedHandDepth(hand: TrackedHand | null) {
  return hand ? getAverageDepth(hand.landmarks) : null;
}

export function createDepthState({
  baseline,
  calibrationProfile = DEFAULT_CALIBRATION_PROFILE,
  previousDepth,
  rawDepth
}: {
  baseline: number;
  calibrationProfile?: CalibrationProfile;
  previousDepth: number | null;
  rawDepth: number;
}): DepthState {
  const smoothedDepth =
    previousDepth === null ? rawDepth : lerp(previousDepth, rawDepth, DEPTH_CONFIG.smoothing);
  const normalizedDepth = (smoothedDepth - baseline) * calibrationProfile.depthSensitivity;
  const previousNormalizedDepth =
    previousDepth === null ? normalizedDepth : (previousDepth - baseline) * calibrationProfile.depthSensitivity;
  const delta = normalizedDepth - previousNormalizedDepth;

  return {
    confidence: clamp(Math.abs(delta) / 0.05, 0, 1),
    delta,
    direction: getDepthDirection(delta),
    isActive: true,
    normalizedDepth,
    rawDepth: smoothedDepth
  };
}
