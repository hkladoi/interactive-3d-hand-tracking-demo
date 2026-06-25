"use client";

import { useMemo } from "react";

import {
  EMPTY_OBJECT_TOUCH_STATE,
  getScreenSpaceObjectTouch,
  getScreenSpaceObjectTouchFromObjects
} from "@/lib/raycast";
import type {
  ARObject,
  ARObjectTransform,
  GestureState,
  ObjectTouchState
} from "@/lib/types";

export function useTouchProjection(
  gesture: GestureState,
  transform: ARObjectTransform,
  objects?: readonly ARObject[]
): ObjectTouchState {
  return useMemo(() => {
    if (!gesture.fingerTouch.isTouching || !gesture.fingerTouch.touchPoint) {
      return EMPTY_OBJECT_TOUCH_STATE;
    }

    if (objects) {
      return getScreenSpaceObjectTouchFromObjects(gesture.fingerTouch.touchPoint, objects);
    }

    return getScreenSpaceObjectTouch(gesture.fingerTouch.touchPoint, transform);
  }, [gesture.fingerTouch.isTouching, gesture.fingerTouch.touchPoint, objects, transform]);
}
