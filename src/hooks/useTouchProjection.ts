"use client";

import { useMemo } from "react";

import type { HologramTransform } from "@/hooks/useHologramControl";
import { EMPTY_OBJECT_TOUCH_STATE, getScreenSpaceObjectTouch } from "@/lib/raycast";
import type { GestureState, ObjectTouchState } from "@/lib/types";

export function useTouchProjection(
  gesture: GestureState,
  transform: HologramTransform
): ObjectTouchState {
  return useMemo(() => {
    if (!gesture.fingerTouch.isTouching || !gesture.fingerTouch.touchPoint) {
      return EMPTY_OBJECT_TOUCH_STATE;
    }

    return getScreenSpaceObjectTouch(gesture.fingerTouch.touchPoint, transform);
  }, [gesture.fingerTouch.isTouching, gesture.fingerTouch.touchPoint, transform]);
}
