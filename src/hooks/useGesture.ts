"use client";

import { useEffect, useRef, useState } from "react";

import { detectGesture, EMPTY_GESTURE_STATE, getDominantTwoHandType } from "@/lib/gestures";
import { normalizeAngle } from "@/lib/math";
import { smoothAngle, smoothNumber, smoothPoint } from "@/lib/smoothing";
import type { GestureState, TrackedHand } from "@/lib/types";

const PINCH_POINT_SMOOTHING = 0.45;
const CONFIDENCE_SMOOTHING = 0.38;
const TWO_HAND_DISTANCE_SMOOTHING = 0.28;
const TWO_HAND_ANGLE_SMOOTHING = 0.24;

function getSmoothedTwoHandDistance(rawGesture: GestureState, previousGesture: GestureState) {
  if (!rawGesture.isTwoHandActive || rawGesture.twoHandDistance === null) {
    return null;
  }

  if (!previousGesture.isTwoHandActive || previousGesture.twoHandDistance === null) {
    return rawGesture.twoHandDistance;
  }

  return smoothNumber(
    previousGesture.twoHandDistance,
    rawGesture.twoHandDistance,
    TWO_HAND_DISTANCE_SMOOTHING
  );
}

function getSmoothedTwoHandAngle(rawGesture: GestureState, previousGesture: GestureState) {
  if (!rawGesture.isTwoHandActive || rawGesture.twoHandAngle === null) {
    return null;
  }

  if (!previousGesture.isTwoHandActive || previousGesture.twoHandAngle === null) {
    return rawGesture.twoHandAngle;
  }

  return smoothAngle(
    previousGesture.twoHandAngle,
    rawGesture.twoHandAngle,
    TWO_HAND_ANGLE_SMOOTHING
  );
}

export function useGesture(hands: readonly TrackedHand[]) {
  const previousGestureRef = useRef<GestureState>(EMPTY_GESTURE_STATE);
  const [gesture, setGesture] = useState<GestureState>(EMPTY_GESTURE_STATE);

  useEffect(() => {
    const rawGesture = detectGesture(hands, previousGestureRef.current);
    const previousGesture = previousGestureRef.current;
    const twoHandDistance = getSmoothedTwoHandDistance(rawGesture, previousGesture);
    const twoHandAngle = getSmoothedTwoHandAngle(rawGesture, previousGesture);
    const scaleDelta =
      rawGesture.isTwoHandActive && previousGesture.isTwoHandActive && previousGesture.twoHandDistance
        ? (twoHandDistance ?? previousGesture.twoHandDistance) / previousGesture.twoHandDistance - 1
        : 0;
    const rotationDelta =
      rawGesture.isTwoHandActive &&
      previousGesture.isTwoHandActive &&
      previousGesture.twoHandAngle !== null &&
      twoHandAngle !== null
        ? normalizeAngle(twoHandAngle - previousGesture.twoHandAngle)
        : 0;
    const nextGesture: GestureState = {
      ...rawGesture,
      confidence: smoothNumber(
        previousGesture.confidence,
        rawGesture.confidence,
        CONFIDENCE_SMOOTHING
      ),
      pinchPoint: rawGesture.pinchPoint
        ? smoothPoint(previousGesture.pinchPoint, rawGesture.pinchPoint, PINCH_POINT_SMOOTHING)
        : null,
      rotationDelta,
      scaleDelta,
      twoHandAngle,
      twoHandDistance,
      type: rawGesture.isTwoHandActive
        ? getDominantTwoHandType(scaleDelta, rotationDelta, previousGesture.type)
        : rawGesture.type
    };

    previousGestureRef.current = nextGesture;
    setGesture(nextGesture);
  }, [hands]);

  return gesture;
}
