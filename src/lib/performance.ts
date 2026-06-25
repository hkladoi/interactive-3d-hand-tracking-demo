import { QUALITY_CONFIG } from "@/lib/constants";
import type { DeviceCapabilities, PerformanceConfig, QualityMode } from "@/lib/types";

export function getDefaultQualityMode(capabilities: DeviceCapabilities): QualityMode {
  if (capabilities.isMobile) {
    return "low";
  }

  if (capabilities.isTablet || (capabilities.hardwareConcurrency ?? 8) <= 4) {
    return "medium";
  }

  return "high";
}

export function getPerformanceConfig(mode: QualityMode): PerformanceConfig {
  return QUALITY_CONFIG[mode];
}

export function isQualityMode(value: string | null): value is QualityMode {
  return value === "low" || value === "medium" || value === "high" || value === "ultra";
}
