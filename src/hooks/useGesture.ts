"use client";

import { useEffect, useRef, useState } from "react";

import { detectGesture, EMPTY_GESTURE_STATE, getDominantTwoHandType } from "@/lib/gestures";
import { normalizeAngle } from "@/lib/math";
import { smoothAngle, smoothNumber, smoothPoint } from "@/lib/smoothing";
import type { FingerTouchState, GestureState, TrackedHand } from "@/lib/types";

const TOUCH_POINT_SMOOTHING = 0.45;
const CONFIDENCE_SMOOTHING = 0.38;
const TWO_HAND_DISTANCE_SMOOTHING = 0.28;
const TWO_HAND_ANGLE_SMOOTHING = 0.24;
const TOUCH_DISTANCE_SMOOTHING = 0.36;

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

function getSmoothedFingerTouch(
  rawGesture: GestureState,
  previousGesture: GestureState
): FingerTouchState {
  const rawTouch = rawGesture.fingerTouch;
  const previousTouch = previousGesture.fingerTouch;
  const previousDistance = Number.isFinite(previousTouch.distance)
    ? previousTouch.distance
    : rawTouch.distance;

  return {
    ...rawTouch,
    confidence: smoothNumber(previousTouch.confidence, rawTouch.confidence, CONFIDENCE_SMOOTHING),
    distance: Number.isFinite(rawTouch.distance)
      ? smoothNumber(previousDistance, rawTouch.distance, TOUCH_DISTANCE_SMOOTHING)
      : rawTouch.distance,
    indexTip: rawTouch.indexTip
      ? smoothPoint(previousTouch.indexTip, rawTouch.indexTip, TOUCH_POINT_SMOOTHING)
      : null,
    thumbTip: rawTouch.thumbTip
      ? smoothPoint(previousTouch.thumbTip, rawTouch.thumbTip, TOUCH_POINT_SMOOTHING)
      : null,
    touchPoint: rawTouch.touchPoint
      ? smoothPoint(previousTouch.touchPoint, rawTouch.touchPoint, TOUCH_POINT_SMOOTHING)
      : null
  };
}

export function useGesture(hands: readonly TrackedHand[]) {
  const previousGestureRef = useRef<GestureState>(EMPTY_GESTURE_STATE);
  const touchCandidateFramesRef = useRef(0);
  const [gesture, setGesture] = useState<GestureState>(EMPTY_GESTURE_STATE);

  useEffect(() => {
    const detection = detectGesture(
      hands,
      previousGestureRef.current,
      touchCandidateFramesRef.current
    );
    const rawGesture = detection.gesture;
    const previousGesture = previousGestureRef.current;
    const fingerTouch = getSmoothedFingerTouch(rawGesture, previousGesture);
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
      fingerTouch,
      isPinching: fingerTouch.isTouching,
      pinchDistance: Number.isFinite(fingerTouch.distance) ? fingerTouch.distance : null,
      pinchPoint: fingerTouch.touchPoint,
      rotationDelta,
      scaleDelta,
      twoHandAngle,
      twoHandDistance,
      type: rawGesture.isTwoHandActive
        ? getDominantTwoHandType(scaleDelta, rotationDelta, previousGesture.type)
        : rawGesture.type
    };

    touchCandidateFramesRef.current = detection.touchCandidateFrames;
    previousGestureRef.current = nextGesture;
    setGesture(nextGesture);
  }, [hands]);

  return gesture;
}
