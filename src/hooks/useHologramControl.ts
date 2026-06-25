"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { clamp, normalizeAngle } from "@/lib/math";
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

type PinchDragSession = {
  startPinchPosition: [number, number, number];
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

function mapPinchPointToThreePosition(point: { x: number; y: number }): [number, number, number] {
  const mirroredX = 1 - point.x;
  const mappedX = (mirroredX - 0.5) * 4.6;
  const mappedY = (0.5 - point.y) * 3.1;

  return [clamp(mappedX, -2.2, 2.2), clamp(mappedY, -1.45, 1.45), 0];
}

function getPinchDragTarget(
  session: PinchDragSession,
  currentPinchPosition: [number, number, number]
): [number, number, number] {
  return [
    clamp(
      session.startTransformPosition[0] +
        currentPinchPosition[0] -
        session.startPinchPosition[0],
      -2.2,
      2.2
    ),
    clamp(
      session.startTransformPosition[1] +
        currentPinchPosition[1] -
        session.startPinchPosition[1],
      -1.45,
      1.45
    ),
    0
  ];
}

export function useHologramControl(gesture: GestureState) {
  const pinchSessionRef = useRef<PinchDragSession | null>(null);
  const twoHandSessionRef = useRef<TwoHandSession | null>(null);
  const [transform, setTransform] = useState<HologramTransform>(createDefaultHologramTransform);

  const resetTransform = useCallback(() => {
    pinchSessionRef.current = null;
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
          pinchSessionRef.current = null;

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

        if (!gesture.isPinching || !gesture.pinchPoint) {
          pinchSessionRef.current = null;
          return current;
        }

        const currentPinchPosition = mapPinchPointToThreePosition(gesture.pinchPoint);

        if (!pinchSessionRef.current) {
          pinchSessionRef.current = {
            startPinchPosition: currentPinchPosition,
            startTransformPosition: current.position
          };
        }

        const targetPosition = getPinchDragTarget(pinchSessionRef.current, currentPinchPosition);
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
      });
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [gesture]);

  return {
    isInteracting: gesture.isPinching || gesture.isTwoHandActive,
    resetTransform,
    transform
  };
}
