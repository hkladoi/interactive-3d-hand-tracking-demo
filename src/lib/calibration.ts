import { CALIBRATION_CONFIG, DEFAULT_CALIBRATION_PROFILE } from "@/lib/constants";
import { clamp } from "@/lib/math";
import type {
  CalibrationProfile,
  CalibrationStep,
  HandLandmark,
  TrackedHand
} from "@/lib/types";

const WRIST_INDEX = 0;
const THUMB_TIP_INDEX = 4;
const INDEX_MCP_INDEX = 5;
const INDEX_TIP_INDEX = 8;
const MIDDLE_MCP_INDEX = 9;
const PINKY_MCP_INDEX = 17;

export type CalibrationSample = {
  palmSize: number;
  palmWidth: number;
  pinchDistance: number | null;
  screenAngle: number | null;
};

export type CalibrationSamples = Record<CalibrationStep, CalibrationSample[]>;

export function createEmptyCalibrationSamples(): CalibrationSamples {
  return {
    complete: [],
    intro: [],
    openHand: [],
    pinch: [],
    rotateLeft: [],
    rotateRight: []
  };
}

function getLandmarkDistance(a: HandLandmark, b: HandLandmark) {
  const deltaX = a.x - b.x;
  const deltaY = a.y - b.y;
  const deltaZ = (a.z ?? 0) - (b.z ?? 0);

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
}

function getAverage(values: readonly number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function getCalibrationSample(hand: TrackedHand): CalibrationSample | null {
  const wrist = hand.landmarks[WRIST_INDEX];
  const thumbTip = hand.landmarks[THUMB_TIP_INDEX];
  const indexMcp = hand.landmarks[INDEX_MCP_INDEX];
  const indexTip = hand.landmarks[INDEX_TIP_INDEX];
  const middleMcp = hand.landmarks[MIDDLE_MCP_INDEX];
  const pinkyMcp = hand.landmarks[PINKY_MCP_INDEX];

  if (!wrist || !indexMcp || !middleMcp || !pinkyMcp) {
    return null;
  }

  return {
    palmSize: getLandmarkDistance(wrist, middleMcp),
    palmWidth: getLandmarkDistance(indexMcp, pinkyMcp),
    pinchDistance: thumbTip && indexTip ? getLandmarkDistance(thumbTip, indexTip) : null,
    screenAngle: Math.atan2(pinkyMcp.y - indexMcp.y, (1 - pinkyMcp.x) - (1 - indexMcp.x))
  };
}

export function canCollectCalibrationStep(step: CalibrationStep) {
  return step !== "intro" && step !== "complete";
}

export function getNextCalibrationStep(step: CalibrationStep): CalibrationStep {
  switch (step) {
    case "intro":
      return "openHand";
    case "openHand":
      return "pinch";
    case "pinch":
      return "rotateLeft";
    case "rotateLeft":
      return "rotateRight";
    case "rotateRight":
      return "complete";
    case "complete":
    default:
      return "complete";
  }
}

export function createCalibrationProfile(samples: CalibrationSamples): CalibrationProfile {
  const openHandSamples = samples.openHand;
  const pinchSamples = samples.pinch.filter((sample) => sample.pinchDistance !== null);
  const rotateLeftAngles = samples.rotateLeft
    .map((sample) => sample.screenAngle)
    .filter((angle): angle is number => angle !== null);
  const rotateRightAngles = samples.rotateRight
    .map((sample) => sample.screenAngle)
    .filter((angle): angle is number => angle !== null);
  const averagePalmSize =
    getAverage(openHandSamples.map((sample) => sample.palmSize)) ||
    DEFAULT_CALIBRATION_PROFILE.averagePalmSize;
  const averagePinchDistance =
    getAverage(pinchSamples.map((sample) => sample.pinchDistance ?? 0)) ||
    averagePalmSize * DEFAULT_CALIBRATION_PROFILE.touchThresholdRatio;
  const rawTouchThreshold = averagePinchDistance / Math.max(averagePalmSize, 0.001) + 0.035;
  const touchThresholdRatio = clamp(
    rawTouchThreshold,
    CALIBRATION_CONFIG.minTouchThresholdRatio,
    CALIBRATION_CONFIG.maxTouchThresholdRatio
  );
  const releaseThresholdRatio = clamp(
    touchThresholdRatio + 0.08,
    CALIBRATION_CONFIG.minReleaseThresholdRatio,
    CALIBRATION_CONFIG.maxReleaseThresholdRatio
  );
  const angleRange = Math.abs(getAverage(rotateRightAngles) - getAverage(rotateLeftAngles));
  const rotationSensitivity = clamp(angleRange > 0 ? Math.PI / Math.max(angleRange, 0.2) : 1, 0.65, 1.7);

  return {
    averagePalmSize,
    createdAt: new Date().toISOString(),
    depthSensitivity: 1,
    minGestureConfidence: 0.28,
    mirrorMode: true,
    releaseThresholdRatio,
    rotationSensitivity,
    touchThresholdRatio,
    version: CALIBRATION_CONFIG.profileVersion
  };
}

export function getStepInstruction(step: CalibrationStep) {
  switch (step) {
    case "intro":
      return "We will calibrate your hand gestures. Keep your hand visible in the camera.";
    case "openHand":
      return "Open your hand in front of the camera and hold it steady.";
    case "pinch":
      return "Touch thumb and index finger together and hold the contact.";
    case "rotateLeft":
      return "Rotate your palm gently to the left.";
    case "rotateRight":
      return "Rotate your palm gently to the right.";
    case "complete":
    default:
      return "Calibration is ready. Review the profile and apply it.";
  }
}
