"use client";

import { useEffect } from "react";

import type { GestureState, ObjectTouchState } from "@/lib/types";

export function useObjectSelection({
  gesture,
  objectTouch,
  onSelectObject
}: {
  gesture: GestureState;
  objectTouch: ObjectTouchState;
  onSelectObject: (objectId: string) => void;
}) {
  useEffect(() => {
    if (
      gesture.fingerTouch.isTouching &&
      objectTouch.isTouchingObject &&
      objectTouch.objectId
    ) {
      onSelectObject(objectTouch.objectId);
    }
  }, [
    gesture.fingerTouch.isTouching,
    objectTouch.isTouchingObject,
    objectTouch.objectId,
    onSelectObject
  ]);
}
