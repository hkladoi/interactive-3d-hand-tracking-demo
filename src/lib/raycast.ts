import type { HologramTransform } from "@/hooks/useHologramControl";
import { clamp, getPointDistance } from "@/lib/math";
import type { ObjectTouchState, Point2D } from "@/lib/types";

const SCREEN_TO_WORLD_X = 4.6;
const SCREEN_TO_WORLD_Y = 3.1;
const BASE_OBJECT_TOUCH_RADIUS = 0.19;
const MIN_OBJECT_TOUCH_RADIUS = 0.12;
const MAX_OBJECT_TOUCH_RADIUS = 0.36;

export const EMPTY_OBJECT_TOUCH_STATE = {
  isTouchingObject: false,
  localPoint: null,
  normal: null,
  screenPoint: null,
  worldPoint: null
} satisfies ObjectTouchState;

export function mirrorNormalizedPoint(point: Point2D): Point2D {
  return {
    x: 1 - point.x,
    y: point.y
  };
}

export function mapScreenPointToThree(point: Point2D, z = 0): [number, number, number] {
  return [
    clamp((point.x - 0.5) * SCREEN_TO_WORLD_X, -2.2, 2.2),
    clamp((0.5 - point.y) * SCREEN_TO_WORLD_Y, -1.45, 1.45),
    z
  ];
}

function getProjectedObjectCenter(transform: HologramTransform): Point2D {
  return {
    x: clamp(transform.position[0] / SCREEN_TO_WORLD_X + 0.5, 0, 1),
    y: clamp(0.5 - transform.position[1] / SCREEN_TO_WORLD_Y, 0, 1)
  };
}

function getObjectTouchRadius(transform: HologramTransform) {
  return clamp(
    BASE_OBJECT_TOUCH_RADIUS * transform.scale,
    MIN_OBJECT_TOUCH_RADIUS,
    MAX_OBJECT_TOUCH_RADIUS
  );
}

export function getScreenSpaceObjectTouch(
  normalizedTouchPoint: Point2D | null,
  transform: HologramTransform
): ObjectTouchState {
  if (!normalizedTouchPoint) {
    return EMPTY_OBJECT_TOUCH_STATE;
  }

  const screenPoint = mirrorNormalizedPoint(normalizedTouchPoint);
  const objectCenter = getProjectedObjectCenter(transform);
  const radius = getObjectTouchRadius(transform);
  const isTouchingObject = getPointDistance(screenPoint, objectCenter) <= radius;
  const worldPoint = mapScreenPointToThree(screenPoint, transform.position[2]);
  const inverseScale = 1 / Math.max(transform.scale, 0.001);

  return {
    isTouchingObject,
    localPoint: isTouchingObject
      ? [
          (worldPoint[0] - transform.position[0]) * inverseScale,
          (worldPoint[1] - transform.position[1]) * inverseScale,
          0
        ]
      : null,
    normal: isTouchingObject ? [0, 0, 1] : null,
    screenPoint,
    worldPoint: isTouchingObject ? worldPoint : null
  };
}
