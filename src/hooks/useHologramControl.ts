"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { clamp, normalizeAngle } from "@/lib/math";
import {
  getScreenSpaceObjectTouch,
  mapScreenPointToThree,
  mirrorNormalizedPoint
} from "@/lib/raycast";
import { smoothNumber, smoothTuple3 } from "@/lib/smoothing";
import type { GestureState } from "@/lib/types";

export type HologramTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

const POSITION_SMOOTHING = 0.2;
const SCALE_SMOOTHING = 0.2;
const ROTATION_SMOOTHING = 0.18;
const MIN_HOLOGRAM_SCALE = 0.5;
const MAX_HOLOGRAM_SCALE = 2.5;

type TouchDragSession = {
  startTouchPosition: [number, number, number];
  startTransformPosition: [number, number, number];
};

type TwoHandSession = {
  startAngle: number;
  startDistance: number;
  startRotation: [number, number, number];
  startScale: number;
};

function createDefaultHologramTransform(): HologramTransform {
  return {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1
  };
}

function mapTouchPointToThreePosition(point: { x: number; y: number }): [number, number, number] {
  return mapScreenPointToThree(mirrorNormalizedPoint(point));
}

function getTouchDragTarget(
  session: TouchDragSession,
  currentTouchPosition: [number, number, number]
): [number, number, number] {
  return [
    clamp(
      session.startTransformPosition[0] +
        currentTouchPosition[0] -
        session.startTouchPosition[0],
      -2.2,
      2.2
    ),
    clamp(
      session.startTransformPosition[1] +
        currentTouchPosition[1] -
        session.startTouchPosition[1],
      -1.45,
      1.45
    ),
    0
  ];
}

export function useHologramControl(gesture: GestureState) {
  const touchSessionRef = useRef<TouchDragSession | null>(null);
  const twoHandSessionRef = useRef<TwoHandSession | null>(null);
  const [transform, setTransform] = useState<HologramTransform>(createDefaultHologramTransform);

  const resetTransform = useCallback(() => {
    touchSessionRef.current = null;
    twoHandSessionRef.current = null;
    setTransform(createDefaultHologramTransform());
  }, []);

  useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => {
      setTransform((current) => {
        if (
          gesture.isTwoHandActive &&
          gesture.twoHandDistance !== null &&
          gesture.twoHandAngle !== null
        ) {
          touchSessionRef.current = null;

          if (!twoHandSessionRef.current) {
            twoHandSessionRef.current = {
              startAngle: gesture.twoHandAngle,
              startDistance: gesture.twoHandDistance,
              startRotation: current.rotation,
              startScale: current.scale
            };
          }

          const session = twoHandSessionRef.current;
          const scaleRatio = gesture.twoHandDistance / session.startDistance;
          const targetScale = clamp(
            session.startScale * scaleRatio,
            MIN_HOLOGRAM_SCALE,
            MAX_HOLOGRAM_SCALE
          );
          const angleDelta = normalizeAngle(gesture.twoHandAngle - session.startAngle);
          const targetRotation: [number, number, number] = [
            session.startRotation[0],
            session.startRotation[1] - angleDelta * 0.25,
            session.startRotation[2] + angleDelta
          ];

          return {
            position: current.position,
            rotation: smoothTuple3(current.rotation, targetRotation, ROTATION_SMOOTHING),
            scale: smoothNumber(current.scale, targetScale, SCALE_SMOOTHING)
          };
        }

        twoHandSessionRef.current = null;

        if (gesture.fingerTouch.isTouching && gesture.fingerTouch.touchPoint) {
          const objectTouch = getScreenSpaceObjectTouch(gesture.fingerTouch.touchPoint, current);

          if (!touchSessionRef.current && !objectTouch.isTouchingObject) {
            return current;
          }

          const currentTouchPosition = mapTouchPointToThreePosition(gesture.fingerTouch.touchPoint);

          if (!touchSessionRef.current) {
            touchSessionRef.current = {
              startTouchPosition: currentTouchPosition,
              startTransformPosition: current.position
            };
          }

          const targetPosition = getTouchDragTarget(touchSessionRef.current, currentTouchPosition);
          const targetRotation: [number, number, number] = [
            targetPosition[1] * 0.18,
            targetPosition[0] * -0.2,
            current.rotation[2]
          ];

          return {
            position: smoothTuple3(current.position, targetPosition, POSITION_SMOOTHING),
            rotation: smoothTuple3(current.rotation, targetRotation, ROTATION_SMOOTHING),
            scale: current.scale
          };
        }

        touchSessionRef.current = null;

        if (gesture.type !== "handRotate" || !gesture.handRotation) {
          return current;
        }

        const targetRotation: [number, number, number] = [
          current.rotation[0],
          current.rotation[1] + gesture.handRotation.deltaAngle * 0.18,
          normalizeAngle(current.rotation[2] - gesture.handRotation.deltaAngle * 0.85)
        ];

        return {
          position: current.position,
          rotation: smoothTuple3(current.rotation, targetRotation, ROTATION_SMOOTHING),
          scale: current.scale
        };
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [gesture]);

  return {
    isInteracting:
      gesture.fingerTouch.isTouching || gesture.isTwoHandActive || gesture.type === "handRotate",
    resetTransform,
    transform
  };
}
