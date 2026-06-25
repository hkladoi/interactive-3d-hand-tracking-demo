import { clamp, getPointDistance } from "@/lib/math";
import type { ARObject, ARObjectTransform, ObjectHitResult, ObjectTouchState, Point2D } from "@/lib/types";

const SCREEN_TO_WORLD_X = 4.6;
const SCREEN_TO_WORLD_Y = 3.1;
const BASE_OBJECT_TOUCH_RADIUS = 0.19;
const MIN_OBJECT_TOUCH_RADIUS = 0.12;
const MAX_OBJECT_TOUCH_RADIUS = 0.36;

export const EMPTY_OBJECT_TOUCH_STATE = {
  isTouchingObject: false,
  distance: null,
  localPoint: null,
  normal: null,
  objectId: null,
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

function getProjectedObjectCenter(transform: ARObjectTransform): Point2D {
  return {
    x: clamp(transform.position[0] / SCREEN_TO_WORLD_X + 0.5, 0, 1),
    y: clamp(0.5 - transform.position[1] / SCREEN_TO_WORLD_Y, 0, 1)
  };
}

function getObjectTouchRadius(transform: ARObjectTransform) {
  return clamp(
    BASE_OBJECT_TOUCH_RADIUS * transform.scale,
    MIN_OBJECT_TOUCH_RADIUS,
    MAX_OBJECT_TOUCH_RADIUS
  );
}

export function getScreenSpaceObjectTouch(
  normalizedTouchPoint: Point2D | null,
  transform: ARObjectTransform,
  objectId?: string
): ObjectTouchState {
  if (!normalizedTouchPoint) {
    return EMPTY_OBJECT_TOUCH_STATE;
  }

  const screenPoint = mirrorNormalizedPoint(normalizedTouchPoint);
  const objectCenter = getProjectedObjectCenter(transform);
  const radius = getObjectTouchRadius(transform);
  const distance = getPointDistance(screenPoint, objectCenter);
  const isTouchingObject = distance <= radius;
  const worldPoint = mapScreenPointToThree(screenPoint, transform.position[2]);
  const inverseScale = 1 / Math.max(transform.scale, 0.001);

  return {
    isTouchingObject,
    distance,
    localPoint: isTouchingObject
      ? [
          (worldPoint[0] - transform.position[0]) * inverseScale,
          (worldPoint[1] - transform.position[1]) * inverseScale,
          0
        ]
      : null,
    normal: isTouchingObject ? [0, 0, 1] : null,
    objectId: isTouchingObject ? objectId ?? null : null,
    screenPoint,
    worldPoint: isTouchingObject ? worldPoint : null
  };
}

export function getObjectHitResult(
  normalizedTouchPoint: Point2D | null,
  objects: readonly ARObject[]
): ObjectHitResult | null {
  if (!normalizedTouchPoint) {
    return null;
  }

  const screenPoint = mirrorNormalizedPoint(normalizedTouchPoint);
  const hits = objects
    .filter((object) => object.visible)
    .map((object): ObjectHitResult | null => {
      const center = getProjectedObjectCenter(object.transform);
      const radius = getObjectTouchRadius(object.transform);
      const distance = getPointDistance(screenPoint, center);

      if (distance > radius) {
        return null;
      }

      const worldPoint = mapScreenPointToThree(screenPoint, object.transform.position[2]);
      const inverseScale = 1 / Math.max(object.transform.scale, 0.001);

      return {
        distance,
        localPoint: [
          (worldPoint[0] - object.transform.position[0]) * inverseScale,
          (worldPoint[1] - object.transform.position[1]) * inverseScale,
          0
        ] satisfies [number, number, number],
        objectId: object.id,
        screenPoint,
        worldPoint
      } satisfies ObjectHitResult;
    })
    .filter((hit): hit is ObjectHitResult => Boolean(hit))
    .sort((a, b) => a.distance - b.distance);

  return hits[0] ?? null;
}

export function getScreenSpaceObjectTouchFromObjects(
  normalizedTouchPoint: Point2D | null,
  objects: readonly ARObject[]
): ObjectTouchState {
  const hit = getObjectHitResult(normalizedTouchPoint, objects);

  if (!hit) {
    return normalizedTouchPoint
      ? {
          ...EMPTY_OBJECT_TOUCH_STATE,
          screenPoint: mirrorNormalizedPoint(normalizedTouchPoint)
        }
      : EMPTY_OBJECT_TOUCH_STATE;
  }

  return {
    distance: hit.distance,
    isTouchingObject: true,
    localPoint: hit.localPoint,
    normal: [0, 0, 1],
    objectId: hit.objectId,
    screenPoint: hit.screenPoint,
    worldPoint: hit.worldPoint
  };
}
