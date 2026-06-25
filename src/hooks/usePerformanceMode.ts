"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getDefaultQualityMode, getPerformanceConfig, isQualityMode } from "@/lib/performance";
import { loadQualityMode, saveQualityMode } from "@/lib/storage";
import type { DeviceCapabilities, QualityMode } from "@/lib/types";

export function usePerformanceMode(capabilities: DeviceCapabilities) {
  const [qualityMode, setQualityModeState] = useState<QualityMode>(() =>
    getDefaultQualityMode(capabilities)
  );

  useEffect(() => {
    const storedMode = loadQualityMode();

    if (isQualityMode(storedMode)) {
      queueMicrotask(() => setQualityModeState(storedMode));
      return;
    }

    queueMicrotask(() => setQualityModeState(getDefaultQualityMode(capabilities)));
  }, [capabilities]);

  const setQualityMode = useCallback((mode: QualityMode) => {
    setQualityModeState(mode);
    saveQualityMode(mode);
  }, []);

  const performanceConfig = useMemo(
    () => getPerformanceConfig(qualityMode),
    [qualityMode]
  );

  return {
    performanceConfig,
    qualityMode,
    setQualityMode
  };
}
