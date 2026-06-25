import { clamp, getPointDistance, lerpAngleRad, normalizeAngleRad } from "@/lib/math";
import type {
  HandLandmark,
  HandRotationDirection,
  HandRotationState,
  Point2D,
  TrackedHand
} from "@/lib/types";

const WRIST_INDEX = 0;
const INDEX_MCP_INDEX = 5;
const MIDDLE_MCP_INDEX = 9;
const PINKY_MCP_INDEX = 17;
const ROTATION_SMOOTHING = 0.36;
const ROTATION_DEAD_ZONE = 0.018;
const MIN_PALM_WIDTH = 0.035;

function toMirroredScreenPoint(landmark: HandLandmark): Point2D {
  return {
    x: 1 - landmark.x,
    y: landmark.y
  };
}

function getDirection(deltaAngle: number): HandRotationDirection {
  if (deltaAngle > ROTATION_DEAD_ZONE) {
    return "clockwise";
  }

  if (deltaAngle < -ROTATION_DEAD_ZONE) {
    return "counterClockwise";
  }

  return "neutral";
}

export function getHandRotationState(
  hand: TrackedHand,
  previousRotation: HandRotationState | null
): HandRotationState | null {
  const wrist = hand.landmarks[WRIST_INDEX];
  const indexMcp = hand.landmarks[INDEX_MCP_INDEX];
  const middleMcp = hand.landmarks[MIDDLE_MCP_INDEX];
  const pinkyMcp = hand.landmarks[PINKY_MCP_INDEX];

  if (!wrist || !indexMcp || !middleMcp || !pinkyMcp) {
    return null;
  }

  const indexScreen = toMirroredScreenPoint(indexMcp);
  const middleScreen = toMirroredScreenPoint(middleMcp);
  const pinkyScreen = toMirroredScreenPoint(pinkyMcp);
  const wristScreen = toMirroredScreenPoint(wrist);
  const palmWidth = getPointDistance(indexScreen, pinkyScreen);
  const palmHeight = getPointDistance(wristScreen, middleScreen);
  const rawScreenAngle = Math.atan2(
    pinkyScreen.y - indexScreen.y,
    pinkyScreen.x - indexScreen.x
  );
  const screenAngle = previousRotation
    ? lerpAngleRad(previousRotation.screenAngle, rawScreenAngle, ROTATION_SMOOTHING)
    : rawScreenAngle;
  const deltaAngle = previousRotation
    ? normalizeAngleRad(screenAngle - previousRotation.screenAngle)
    : 0;
  const zDelta = (pinkyMcp.z ?? 0) - (indexMcp.z ?? 0);

  return {
    confidence: clamp((palmWidth - MIN_PALM_WIDTH) / 0.18, 0, 1),
    deltaAngle,
    direction: getDirection(deltaAngle),
    pitch: Math.atan2(middleScreen.y - wristScreen.y, Math.max(palmHeight, 0.001)),
    roll: screenAngle,
    screenAngle,
    yaw: Math.atan2(zDelta, Math.max(palmWidth, 0.001))
  };
}
