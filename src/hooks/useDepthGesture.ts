"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DEFAULT_CALIBRATION_PROFILE } from "@/lib/constants";
import { createDepthState, EMPTY_DEPTH_STATE, getTrackedHandDepth } from "@/lib/depth";
import { pickPrimaryHand } from "@/lib/gestures";
import type { CalibrationProfile, DepthState, TrackedHand } from "@/lib/types";

const LOST_TRACKING_COOLDOWN_MS = 800;

function scheduleDepthUpdate(update: () => void) {
  queueMicrotask(update);
}

export function useDepthGesture(
  hands: readonly TrackedHand[],
  calibrationProfile: CalibrationProfile = DEFAULT_CALIBRATION_PROFILE,
  enabled = true
) {
  const baselineRef = useRef<number | null>(null);
  const lastSeenAtRef = useRef(0);
  const previousDepthRef = useRef<number | null>(null);
  const [depthState, setDepthState] = useState<DepthState>(EMPTY_DEPTH_STATE);

  const resetDepthBaseline = useCallback(() => {
    baselineRef.current = null;
    previousDepthRef.current = null;
    setDepthState(EMPTY_DEPTH_STATE);
  }, []);

  useEffect(() => {
    if (!enabled) {
      scheduleDepthUpdate(() => setDepthState(EMPTY_DEPTH_STATE));
      return;
    }

    const primaryHand = pickPrimaryHand(hands);
    const rawDepth = getTrackedHandDepth(primaryHand);
    const now = performance.now();

    if (rawDepth === null) {
      if (now - lastSeenAtRef.current > LOST_TRACKING_COOLDOWN_MS) {
        scheduleDepthUpdate(() => {
          setDepthState((current) => (current.isActive ? { ...current, isActive: false } : current));
        });
      }

      return;
    }

    lastSeenAtRef.current = now;

    if (baselineRef.current === null) {
      baselineRef.current = rawDepth;
      previousDepthRef.current = rawDepth;
      scheduleDepthUpdate(() => {
        setDepthState({
          ...EMPTY_DEPTH_STATE,
          isActive: true,
          normalizedDepth: 0,
          rawDepth
        });
      });
      return;
    }

    const nextDepthState = createDepthState({
      baseline: baselineRef.current,
      calibrationProfile,
      previousDepth: previousDepthRef.current,
      rawDepth
    });

    previousDepthRef.current = nextDepthState.rawDepth;
    scheduleDepthUpdate(() => setDepthState(nextDepthState));
  }, [calibrationProfile, enabled, hands]);

  return {
    depthState,
    resetDepthBaseline
  };
}
