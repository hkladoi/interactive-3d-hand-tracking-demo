import { EMPTY_OBJECT_TOUCH_STATE } from "@/lib/raycast";
import { EMPTY_FINGER_TOUCH_STATE, detectFingerTouch } from "@/lib/touchDetection";
import { getHandRotationState } from "@/lib/handPose";
import { clamp, getPointDistance, normalizeAngle } from "@/lib/math";
import type {
  GestureState,
  GestureType,
  HandLandmark,
  Point2D,
  TrackedHand
} from "@/lib/types";

const WRIST_INDEX = 0;
const INDEX_MCP_INDEX = 5;
const MIDDLE_MCP_INDEX = 9;
const PINKY_MCP_INDEX = 17;
const TWO_HAND_ROTATION_DEAD_ZONE = 0.025;
const TWO_HAND_SCALE_DEAD_ZONE = 0.015;
const HAND_ROTATION_MIN_CONFIDENCE = 0.28;

export const EMPTY_GESTURE_STATE = {
  confidence: 0,
  fingerTouch: EMPTY_FINGER_TOUCH_STATE,
  handRotation: null,
  isDragging: false,
  isPinching: false,
  isTwoHandActive: false,
  objectTouch: EMPTY_OBJECT_TOUCH_STATE,
  pinchDistance: null,
  pinchPoint: null,
  primaryHand: null,
  rotationDelta: 0,
  scaleDelta: 0,
  twoHandAngle: null,
  twoHandDistance: null,
  type: "none"
} satisfies GestureState;

type HandAnchor = Readonly<{
  center: Point2D;
  hand: TrackedHand;
  screenCenter: Point2D;
  scale: number;
}>;

export type GestureDetectionResult = Readonly<{
  gesture: GestureState;
  touchCandidateFrames: number;
}>;

export type TwoHandMetrics = Readonly<{
  angle: number;
  confidence: number;
  distance: number;
  rotationDelta: number;
  scaleDelta: number;
}>;

export function getLandmarkDistance(a: HandLandmark, b: HandLandmark) {
  const deltaX = a.x - b.x;
  const deltaY = a.y - b.y;
  const deltaZ = (a.z ?? 0) - (b.z ?? 0);

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
}

function getAveragePoint(landmarks: readonly HandLandmark[], landmarkIndexes: readonly number[]) {
  const points = landmarkIndexes
    .map((index) => landmarks[index])
    .filter((point): point is HandLandmark => Boolean(point));

  if (points.length === 0) {
    return null;
  }

  return {
    x: points.reduce((total, point) => total + point.x, 0) / points.length,
    y: points.reduce((total, point) => total + point.y, 0) / points.length
  };
}

function mirrorPoint(point: Point2D): Point2D {
  return {
    x: 1 - point.x,
    y: point.y
  };
}

export function getHandScale(landmarks: readonly HandLandmark[]) {
  const wrist = landmarks[WRIST_INDEX];
  const middleMcp = landmarks[MIDDLE_MCP_INDEX];

  if (!wrist || !middleMcp) {
    return null;
  }

  return Math.max(getLandmarkDistance(wrist, middleMcp), 0.001);
}

export function getPalmCenter(landmarks: readonly HandLandmark[]) {
  return getAveragePoint(landmarks, [
    WRIST_INDEX,
    INDEX_MCP_INDEX,
    MIDDLE_MCP_INDEX,
    PINKY_MCP_INDEX
  ]);
}

function getHandAnchor(hand: TrackedHand): HandAnchor | null {
  const center = getPalmCenter(hand.landmarks);
  const scale = getHandScale(hand.landmarks);

  if (!center || !scale) {
    return null;
  }

  return {
    center,
    hand,
    scale,
    screenCenter: mirrorPoint(center)
  };
}

export function getDominantTwoHandType(
  scaleDelta: number,
  rotationDelta: number,
  previousType: GestureType
): GestureType {
  const absoluteScaleDelta = Math.abs(scaleDelta);
  const absoluteRotationDelta = Math.abs(rotationDelta);

  if (
    absoluteRotationDelta > TWO_HAND_ROTATION_DEAD_ZONE &&
    absoluteRotationDelta > absoluteScaleDelta * 1.6
  ) {
    return "twoHandRotate";
  }

  if (absoluteScaleDelta > TWO_HAND_SCALE_DEAD_ZONE) {
    return "twoHandScale";
  }

  return previousType === "twoHandRotate" ? "twoHandRotate" : "twoHandScale";
}

export function getTwoHandMetrics(
  hands: readonly TrackedHand[],
  previousGesture: GestureState
): TwoHandMetrics | null {
  const anchors = hands
    .map(getHandAnchor)
    .filter((anchor): anchor is HandAnchor => Boolean(anchor))
    .sort((a, b) => b.scale - a.scale)
    .slice(0, 2)
    .sort((a, b) => a.screenCenter.x - b.screenCenter.x);

  if (anchors.length < 2) {
    return null;
  }

  const [leftAnchor, rightAnchor] = anchors;
  const deltaX = rightAnchor.screenCenter.x - leftAnchor.screenCenter.x;
  const deltaY = rightAnchor.screenCenter.y - leftAnchor.screenCenter.y;
  const distance = Math.max(getPointDistance(leftAnchor.screenCenter, rightAnchor.screenCenter), 0.001);
  const angle = Math.atan2(deltaY, deltaX);
  const scaleDelta =
    previousGesture.isTwoHandActive && previousGesture.twoHandDistance
      ? distance / previousGesture.twoHandDistance - 1
      : 0;
  const rotationDelta =
    previousGesture.isTwoHandActive && previousGesture.twoHandAngle !== null
      ? normalizeAngle(angle - previousGesture.twoHandAngle)
      : 0;

  return {
    angle,
    confidence: clamp((distance - 0.08) / 0.32, 0, 1),
    distance,
    rotationDelta,
    scaleDelta
  };
}

export function pickPrimaryHand(hands: readonly TrackedHand[]) {
  if (hands.length === 0) {
    return null;
  }

  return hands.reduce<TrackedHand | null>((current, hand) => {
    if (!current) {
      return hand;
    }

    const currentScale = getHandScale(current.landmarks) ?? 0;
    const nextScale = getHandScale(hand.landmarks) ?? 0;

    return nextScale > currentScale ? hand : current;
  }, null);
}

function getSingleHandGestureType(gesture: GestureState): GestureType {
  if (gesture.fingerTouch.isTouching) {
    return "touch";
  }

  if (
    gesture.handRotation &&
    gesture.handRotation.direction !== "neutral" &&
    gesture.handRotation.confidence >= HAND_ROTATION_MIN_CONFIDENCE
  ) {
    return "handRotate";
  }

  return "hover";
}

export function detectGesture(
  hands: readonly TrackedHand[],
  previousGesture: GestureState = EMPTY_GESTURE_STATE,
  previousTouchCandidateFrames = 0
): GestureDetectionResult {
  const primaryHand = pickPrimaryHand(hands);

  if (!primaryHand) {
    return {
      gesture: EMPTY_GESTURE_STATE,
      touchCandidateFrames: 0
    };
  }

  if (hands.length >= 2) {
    const twoHand = getTwoHandMetrics(hands, previousGesture);

    if (twoHand) {
      return {
        gesture: {
          ...EMPTY_GESTURE_STATE,
          confidence: twoHand.confidence,
          isTwoHandActive: true,
          primaryHand: primaryHand.handedness,
          rotationDelta: twoHand.rotationDelta,
          scaleDelta: twoHand.scaleDelta,
          twoHandAngle: twoHand.angle,
          twoHandDistance: twoHand.distance,
          type: getDominantTwoHandType(
            twoHand.scaleDelta,
            twoHand.rotationDelta,
            previousGesture.type
          )
        },
        touchCandidateFrames: 0
      };
    }
  }

  const touch = detectFingerTouch(
    primaryHand,
    previousGesture.fingerTouch,
    previousTouchCandidateFrames
  );
  const handRotation = getHandRotationState(primaryHand, previousGesture.handRotation);
  const confidence = Math.max(
    touch.state.confidence,
    handRotation ? handRotation.confidence * 0.72 : 0.18
  );
  const gesture: GestureState = {
    ...EMPTY_GESTURE_STATE,
    confidence,
    fingerTouch: touch.state,
    handRotation,
    isPinching: touch.state.isTouching,
    pinchDistance: Number.isFinite(touch.state.distance) ? touch.state.distance : null,
    pinchPoint: touch.state.touchPoint,
    primaryHand: primaryHand.handedness
  };

  return {
    gesture: {
      ...gesture,
      type: getSingleHandGestureType(gesture)
    },
    touchCandidateFrames: touch.candidateFrames
  };
}

export function getGestureLabel(gesture: GestureState) {
  switch (gesture.type) {
    case "drag":
      return "Drag";
    case "handRotate":
      return "Hand rotate";
    case "hover":
      return "Hover";
    case "touch":
      return "Touch";
    case "twoHandRotate":
      return "Two-hand rotate";
    case "twoHandScale":
      return "Two-hand scale";
    case "none":
    default:
      return "None";
  }
}
