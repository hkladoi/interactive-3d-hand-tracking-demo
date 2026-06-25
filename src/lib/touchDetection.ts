import { DEFAULT_CALIBRATION_PROFILE } from "@/lib/constants";
import { clamp } from "@/lib/math";
import type {
  CalibrationProfile,
  FingerTouchState,
  HandLandmark,
  Point2D,
  TrackedHand
} from "@/lib/types";

const WRIST_INDEX = 0;
const THUMB_TIP_INDEX = 4;
const INDEX_TIP_INDEX = 8;
const MIDDLE_MCP_INDEX = 9;
const TOUCH_CANDIDATE_FRAMES = 2;
const MIN_HAND_SCALE = 0.001;

export const EMPTY_FINGER_TOUCH_STATE = {
  confidence: 0,
  distance: Number.POSITIVE_INFINITY,
  indexTip: null,
  isTouching: false,
  threshold: DEFAULT_CALIBRATION_PROFILE.touchThresholdRatio,
  thumbTip: null,
  touchPoint: null
} satisfies FingerTouchState;

export type FingerTouchDetection = Readonly<{
  candidateFrames: number;
  state: FingerTouchState;
}>;

function getLandmarkDistance(a: HandLandmark, b: HandLandmark) {
  const deltaX = a.x - b.x;
  const deltaY = a.y - b.y;
  const deltaZ = (a.z ?? 0) - (b.z ?? 0);

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
}

function getPointBetween(a: HandLandmark, b: HandLandmark): Point2D {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}

function getHandScale(landmarks: readonly HandLandmark[]) {
  const wrist = landmarks[WRIST_INDEX];
  const middleMcp = landmarks[MIDDLE_MCP_INDEX];

  if (!wrist || !middleMcp) {
    return null;
  }

  return Math.max(getLandmarkDistance(wrist, middleMcp), MIN_HAND_SCALE);
}

function getTouchConfidence(
  normalizedDistance: number,
  touchThresholdRatio: number,
  releaseThresholdRatio: number
) {
  return clamp(
    (releaseThresholdRatio - normalizedDistance) /
      (releaseThresholdRatio - touchThresholdRatio),
    0,
    1
  );
}

export function detectFingerTouch(
  hand: TrackedHand,
  previousTouch: FingerTouchState = EMPTY_FINGER_TOUCH_STATE,
  previousCandidateFrames = 0,
  calibrationProfile: CalibrationProfile = DEFAULT_CALIBRATION_PROFILE
): FingerTouchDetection {
  const thumbTip = hand.landmarks[THUMB_TIP_INDEX];
  const indexTip = hand.landmarks[INDEX_TIP_INDEX];
  const handScale = getHandScale(hand.landmarks);

  if (!thumbTip || !indexTip || !handScale) {
    return {
      candidateFrames: 0,
      state: EMPTY_FINGER_TOUCH_STATE
    };
  }

  const distance = getLandmarkDistance(thumbTip, indexTip);
  const normalizedDistance = distance / handScale;
  const touchThresholdRatio = calibrationProfile.touchThresholdRatio;
  const releaseThresholdRatio = calibrationProfile.releaseThresholdRatio;
  const candidateFrames =
    normalizedDistance <= touchThresholdRatio
      ? Math.min(previousCandidateFrames + 1, TOUCH_CANDIDATE_FRAMES)
      : 0;
  const isTouching = previousTouch.isTouching
    ? normalizedDistance <= releaseThresholdRatio
    : candidateFrames >= TOUCH_CANDIDATE_FRAMES;

  return {
    candidateFrames,
    state: {
      confidence: getTouchConfidence(
        normalizedDistance,
        touchThresholdRatio,
        releaseThresholdRatio
      ),
      distance: normalizedDistance,
      indexTip: {
        x: indexTip.x,
        y: indexTip.y
      },
      isTouching,
      threshold: isTouching ? releaseThresholdRatio : touchThresholdRatio,
      thumbTip: {
        x: thumbTip.x,
        y: thumbTip.y
      },
      touchPoint: getPointBetween(thumbTip, indexTip)
    }
  };
}
