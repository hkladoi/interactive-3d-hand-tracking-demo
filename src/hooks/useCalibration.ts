"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  canCollectCalibrationStep,
  createCalibrationProfile,
  createEmptyCalibrationSamples,
  getCalibrationSample,
  getNextCalibrationStep,
  type CalibrationSamples
} from "@/lib/calibration";
import { CALIBRATION_CONFIG, DEFAULT_CALIBRATION_PROFILE } from "@/lib/constants";
import {
  clearCalibrationProfile,
  loadCalibrationProfile,
  saveCalibrationProfile
} from "@/lib/storage";
import type {
  CalibrationProfile,
  CalibrationState,
  TrackedHand
} from "@/lib/types";

const INITIAL_CALIBRATION_STATE = {
  errorMessage: null,
  isCalibrating: false,
  profile: null,
  progress: 0,
  samplesCollected: 0,
  step: "intro"
} satisfies CalibrationState;

function isValidCalibrationProfile(profile: CalibrationProfile | null) {
  return Boolean(profile && profile.version === CALIBRATION_CONFIG.profileVersion);
}

function scheduleStateUpdate(update: () => void) {
  queueMicrotask(update);
}

export function useCalibration(hands: readonly TrackedHand[]) {
  const samplesRef = useRef<CalibrationSamples>(createEmptyCalibrationSamples());
  const [state, setState] = useState<CalibrationState>(INITIAL_CALIBRATION_STATE);
  const [profile, setProfile] = useState<CalibrationProfile | null>(null);

  useEffect(() => {
    const storedProfile = loadCalibrationProfile();

    if (isValidCalibrationProfile(storedProfile)) {
      scheduleStateUpdate(() => {
        setProfile(storedProfile);
        setState((current) => ({
          ...current,
          profile: storedProfile
        }));
      });
    }
  }, []);

  const activeProfile = useMemo(
    () => profile ?? DEFAULT_CALIBRATION_PROFILE,
    [profile]
  );

  const startCalibration = useCallback(() => {
    samplesRef.current = createEmptyCalibrationSamples();
    setState({
      ...INITIAL_CALIBRATION_STATE,
      isCalibrating: true,
      profile,
      step: "openHand"
    });
  }, [profile]);

  const skipCalibration = useCallback(() => {
    setState((current) => ({
      ...current,
      isCalibrating: false,
      step: "intro"
    }));
  }, []);

  const resetCalibration = useCallback(() => {
    clearCalibrationProfile();
    setProfile(null);
    samplesRef.current = createEmptyCalibrationSamples();
    setState({
      ...INITIAL_CALIBRATION_STATE,
      profile: null
    });
  }, []);

  const useDefaultCalibration = useCallback(() => {
    clearCalibrationProfile();
    setProfile(null);
    setState((current) => ({
      ...current,
      isCalibrating: false,
      profile: null,
      step: "intro"
    }));
  }, []);

  const applyProfile = useCallback((nextProfile: CalibrationProfile) => {
    saveCalibrationProfile(nextProfile);
    setProfile(nextProfile);
    setState((current) => ({
      ...current,
      isCalibrating: false,
      profile: nextProfile,
      progress: 1,
      step: "complete"
    }));
  }, []);

  const recalibrate = useCallback(() => {
    startCalibration();
  }, [startCalibration]);

  useEffect(() => {
    if (!state.isCalibrating || !canCollectCalibrationStep(state.step)) {
      return;
    }

    const hand = hands[0];

    if (!hand) {
      scheduleStateUpdate(() => {
        setState((current) => ({
          ...current,
          errorMessage: "Show your hand to the camera to collect calibration samples."
        }));
      });
      return;
    }

    const sample = getCalibrationSample(hand);

    if (!sample) {
      scheduleStateUpdate(() => {
        setState((current) => ({
          ...current,
          errorMessage: "Hand landmarks are incomplete. Keep your full hand visible."
        }));
      });
      return;
    }

    const stepSamples = samplesRef.current[state.step];

    if (stepSamples.length >= CALIBRATION_CONFIG.minSamples) {
      return;
    }

    stepSamples.push(sample);

    const samplesCollected = stepSamples.length;
    const progress = samplesCollected / CALIBRATION_CONFIG.minSamples;

    if (samplesCollected < CALIBRATION_CONFIG.minSamples) {
      scheduleStateUpdate(() => {
        setState((current) => ({
          ...current,
          errorMessage: null,
          progress,
          samplesCollected
        }));
      });
      return;
    }

    const nextStep = getNextCalibrationStep(state.step);

    if (nextStep === "complete") {
      const nextProfile = createCalibrationProfile(samplesRef.current);
      scheduleStateUpdate(() => {
        setState((current) => ({
          ...current,
          errorMessage: null,
          profile: nextProfile,
          progress: 1,
          samplesCollected,
          step: nextStep
        }));
      });
      return;
    }

    scheduleStateUpdate(() => {
      setState((current) => ({
        ...current,
        errorMessage: null,
        progress: 0,
        samplesCollected: 0,
        step: nextStep
      }));
    });
  }, [hands, state.isCalibrating, state.step]);

  return {
    activeProfile,
    applyProfile,
    isProfileLoaded: profile !== null,
    profile,
    recalibrate,
    resetCalibration,
    skipCalibration,
    startCalibration,
    state,
    useDefaultCalibration
  };
}
