"use client";

import { useEffect, useRef, useState } from "react";

import {
  areSystemResourceStatsEqual,
  createUnsupportedSystemResourceStats,
  readCpuMetric,
  readGpuMetric,
  readRamMetric,
  SYSTEM_RESOURCE_REFRESH_MS
} from "@/lib/systemResources";
import type { SystemResourceMetric, SystemResourceStats } from "@/lib/types";

function createSystemResourceStats(
  cpu: SystemResourceMetric,
  gpu: SystemResourceMetric,
  ram: SystemResourceMetric
): SystemResourceStats {
  return {
    cpu,
    gpu,
    ram,
    updatedAt: Date.now()
  };
}

export function useSystemResources() {
  const staticMetricsRef = useRef<{
    cpu: SystemResourceMetric;
    gpu: SystemResourceMetric;
  } | null>(null);
  const [stats, setStats] = useState<SystemResourceStats>(createUnsupportedSystemResourceStats);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const readStats = () => {
      if (!staticMetricsRef.current) {
        staticMetricsRef.current = {
          cpu: readCpuMetric(),
          gpu: readGpuMetric()
        };
      }

      const nextStats = createSystemResourceStats(
        staticMetricsRef.current.cpu,
        staticMetricsRef.current.gpu,
        readRamMetric()
      );

      setStats((currentStats) =>
        areSystemResourceStatsEqual(currentStats, nextStats) ? currentStats : nextStats
      );
    };

    animationFrameId = window.requestAnimationFrame(readStats);
    const intervalId = window.setInterval(readStats, SYSTEM_RESOURCE_REFRESH_MS);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.clearInterval(intervalId);
    };
  }, []);

  return stats;
}
