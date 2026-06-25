"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import { DEPTH_CONFIG } from "@/lib/constants";
import { EMPTY_DEPTH_STATE } from "@/lib/depth";
import { clamp, normalizeAngle } from "@/lib/math";
import {
  getScreenSpaceObjectTouch,
  mapScreenPointToThree,
  mirrorNormalizedPoint
} from "@/lib/raycast";
import { smoothNumber, smoothTuple3 } from "@/lib/smoothing";
import type {
  ARObject,
  ARObjectTransform,
  DepthControlMode,
  DepthState,
  GestureState,
  ObjectTouchState
} from "@/lib/types";

export type HologramTransform = ARObjectTransform;

const POSITION_SMOOTHING = 0.2;
const SCALE_SMOOTHING = 0.2;
const ROTATION_SMOOTHING = 0.18;
const MIN_HOLOGRAM_SCALE = 0.5;
const MAX_HOLOGRAM_SCALE = 2.5;

type TouchDragSession = {
  objectId: string;
  startTouchPosition: [number, number, number];
  startTransformPosition: [number, number, number];
};

type TwoHandSession = {
  objectId: string;
  startAngle: number;
  startDistance: number;
  startRotation: [number, number, number];
  startScale: number;
};

type UseHologramControlOptions = {
  depthControlMode?: DepthControlMode;
  depthState?: DepthState;
  gesture: GestureState;
  objectTouch?: ObjectTouchState;
  onTransformChange: (objectId: string, transform: ARObjectTransform) => void;
  selectedObject: ARObject | null;
};

function createDefaultHologramTransform(): ARObjectTransform {
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
    session.startTransformPosition[2]
  ];
}

function applyDepth(
  transform: ARObjectTransform,
  depthState: DepthState,
  depthControlMode: DepthControlMode,
  isTwoHandActive: boolean
): ARObjectTransform {
  if (!depthState.isActive || depthState.normalizedDepth === null) {
    return transform;
  }

  const zDelta = -depthState.normalizedDepth * DEPTH_CONFIG.zSensitivity;
  const scaleDelta = -depthState.normalizedDepth * DEPTH_CONFIG.scaleSensitivity;
  const targetZ = clamp(transform.position[2] + zDelta, DEPTH_CONFIG.minZ, DEPTH_CONFIG.maxZ);
  const targetScale = clamp(
    transform.scale + (isTwoHandActive ? scaleDelta * 0.2 : scaleDelta),
    DEPTH_CONFIG.minScale,
    DEPTH_CONFIG.maxScale
  );

  return {
    position:
      depthControlMode === "scale"
        ? transform.position
        : smoothTuple3(transform.position, [transform.position[0], transform.position[1], targetZ], 0.12),
    rotation: transform.rotation,
    scale:
      depthControlMode === "positionZ"
        ? transform.scale
        : smoothNumber(transform.scale, targetScale, 0.08)
  };
}

function hasTransformChanged(a: ARObjectTransform, b: ARObjectTransform) {
  return (
    a.scale !== b.scale ||
    a.position.some((value, index) => Math.abs(value - b.position[index]) > 0.0001) ||
    a.rotation.some((value, index) => Math.abs(value - b.rotation[index]) > 0.0001)
  );
}

export function useHologramControl({
  depthControlMode = "both",
  depthState = EMPTY_DEPTH_STATE,
  gesture,
  objectTouch,
  onTransformChange,
  selectedObject
}: UseHologramControlOptions) {
  const touchSessionRef = useRef<TouchDragSession | null>(null);
  const twoHandSessionRef = useRef<TwoHandSession | null>(null);

  const resetTransform = useCallback(() => {
    touchSessionRef.current = null;
    twoHandSessionRef.current = null;

    if (selectedObject) {
      onTransformChange(selectedObject.id, createDefaultHologramTransform());
    }
  }, [onTransformChange, selectedObject]);

  useEffect(() => {
    if (!selectedObject || selectedObject.locked || !selectedObject.visible) {
      touchSessionRef.current = null;
      twoHandSessionRef.current = null;
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      let nextTransform = selectedObject.transform;

      if (
        gesture.isTwoHandActive &&
        gesture.twoHandDistance !== null &&
        gesture.twoHandAngle !== null
      ) {
        touchSessionRef.current = null;

        if (
          !twoHandSessionRef.current ||
          twoHandSessionRef.current.objectId !== selectedObject.id
        ) {
          twoHandSessionRef.current = {
            objectId: selectedObject.id,
            startAngle: gesture.twoHandAngle,
            startDistance: gesture.twoHandDistance,
            startRotation: selectedObject.transform.rotation,
            startScale: selectedObject.transform.scale
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

        nextTransform = {
          position: selectedObject.transform.position,
          rotation: smoothTuple3(selectedObject.transform.rotation, targetRotation, ROTATION_SMOOTHING),
          scale: smoothNumber(selectedObject.transform.scale, targetScale, SCALE_SMOOTHING)
        };
      } else {
        twoHandSessionRef.current = null;

        if (gesture.fingerTouch.isTouching && gesture.fingerTouch.touchPoint) {
          const touch =
            objectTouch ??
            getScreenSpaceObjectTouch(
              gesture.fingerTouch.touchPoint,
              selectedObject.transform,
              selectedObject.id
            );

          if (
            !touchSessionRef.current &&
            (!touch.isTouchingObject || touch.objectId !== selectedObject.id)
          ) {
            nextTransform = selectedObject.transform;
          } else {
            const currentTouchPosition = mapTouchPointToThreePosition(
              gesture.fingerTouch.touchPoint
            );

            if (!touchSessionRef.current) {
              touchSessionRef.current = {
                objectId: selectedObject.id,
                startTouchPosition: currentTouchPosition,
                startTransformPosition: selectedObject.transform.position
              };
            }

            const targetPosition = getTouchDragTarget(
              touchSessionRef.current,
              currentTouchPosition
            );
            const targetRotation: [number, number, number] = [
              targetPosition[1] * 0.18,
              targetPosition[0] * -0.2,
              selectedObject.transform.rotation[2]
            ];

            nextTransform = {
              position: smoothTuple3(
                selectedObject.transform.position,
                targetPosition,
                POSITION_SMOOTHING
              ),
              rotation: smoothTuple3(
                selectedObject.transform.rotation,
                targetRotation,
                ROTATION_SMOOTHING
              ),
              scale: selectedObject.transform.scale
            };
          }
        } else {
          touchSessionRef.current = null;

          if (gesture.type === "handRotate" && gesture.handRotation) {
            const targetRotation: [number, number, number] = [
              selectedObject.transform.rotation[0],
              selectedObject.transform.rotation[1] + gesture.handRotation.deltaAngle * 0.18,
              normalizeAngle(
                selectedObject.transform.rotation[2] -
                  gesture.handRotation.deltaAngle * 0.85
              )
            ];

            nextTransform = {
              position: selectedObject.transform.position,
              rotation: smoothTuple3(
                selectedObject.transform.rotation,
                targetRotation,
                ROTATION_SMOOTHING
              ),
              scale: selectedObject.transform.scale
            };
          }
        }
      }

      nextTransform = applyDepth(
        nextTransform,
        depthState,
        depthControlMode,
        gesture.isTwoHandActive
      );

      if (hasTransformChanged(nextTransform, selectedObject.transform)) {
        onTransformChange(selectedObject.id, nextTransform);
      }
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    depthControlMode,
    depthState,
    gesture,
    objectTouch,
    onTransformChange,
    selectedObject
  ]);

  const isInteracting = useMemo(
    () =>
      Boolean(
        selectedObject &&
          !selectedObject.locked &&
          (gesture.fingerTouch.isTouching ||
            gesture.isTwoHandActive ||
            gesture.type === "handRotate" ||
            depthState.isActive)
      ),
    [depthState.isActive, gesture, selectedObject]
  );

  return {
    isInteracting,
    resetTransform,
    transform: selectedObject?.transform ?? createDefaultHologramTransform()
  };
}
