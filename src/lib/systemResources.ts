import type { StatusTone, SystemResourceMetric, SystemResourceStats } from "@/lib/types";

export const SYSTEM_RESOURCE_REFRESH_MS = 2000;

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;
const UNSUPPORTED = "Unsupported";
const NOT_APPLICABLE = "N/A";

type BrowserNavigator = Navigator & {
  deviceMemory?: number;
};

type JsMemoryInfo = {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
};

type BrowserPerformance = Performance & {
  memory?: JsMemoryInfo;
};

type WebGLDebugRendererInfo = {
  UNMASKED_RENDERER_WEBGL: number;
  UNMASKED_VENDOR_WEBGL: number;
};

function createUnsupportedMetric(name: string, detail: string): SystemResourceMetric {
  return {
    detail,
    memory: UNSUPPORTED,
    name,
    status: "unsupported",
    usage: UNSUPPORTED
  };
}

export function createUnsupportedSystemResourceStats(): SystemResourceStats {
  return {
    cpu: createUnsupportedMetric(
      "CPU",
      "CPU name and usage are not exposed by browser APIs."
    ),
    gpu: createUnsupportedMetric(
      "GPU",
      "GPU usage and VRAM are not exposed by browser APIs."
    ),
    ram: createUnsupportedMetric(
      "RAM",
      "System RAM usage is not exposed by browser APIs."
    ),
    updatedAt: 0
  };
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "--";
  }

  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = value >= 10 || unitIndex === 0 ? 0 : 1;

  return `${value.toFixed(precision)} ${BYTE_UNITS[unitIndex]}`;
}

function formatGigabytes(gigabytes: number) {
  if (!Number.isFinite(gigabytes) || gigabytes <= 0) {
    return "--";
  }

  return `${gigabytes.toLocaleString("en-US", { maximumFractionDigits: 1 })} GB`;
}

function getPerformanceMemory(): JsMemoryInfo | null {
  if (typeof performance === "undefined") {
    return null;
  }

  return (performance as BrowserPerformance).memory ?? null;
}

export function readCpuMetric(): SystemResourceMetric {
  if (typeof navigator === "undefined") {
    return createUnsupportedMetric("CPU", "Navigator is unavailable.");
  }

  const cores = navigator.hardwareConcurrency;

  if (!cores) {
    return createUnsupportedMetric(
      "CPU",
      "Logical CPU core count is not exposed by this browser."
    );
  }

  return {
    detail: "Browser exposes logical core count only; CPU name and usage are unavailable.",
    memory: NOT_APPLICABLE,
    name: `${cores} cores`,
    status: "available",
    usage: UNSUPPORTED
  };
}

export function readRamMetric(): SystemResourceMetric {
  const browserNavigator =
    typeof navigator === "undefined" ? null : (navigator as BrowserNavigator);
  const deviceMemory = browserNavigator?.deviceMemory;
  const performanceMemory = getPerformanceMemory();
  const estimatedTotalBytes = deviceMemory ? deviceMemory * 1024 ** 3 : null;
  const heapLimitBytes = performanceMemory?.jsHeapSizeLimit ?? null;
  const usedHeapBytes = performanceMemory?.usedJSHeapSize ?? null;
  const totalBytes = estimatedTotalBytes ?? heapLimitBytes;

  if (!totalBytes && !usedHeapBytes) {
    return createUnsupportedMetric(
      "RAM",
      "RAM capacity and usage are not exposed by this browser."
    );
  }

  const usedLabel = usedHeapBytes ? formatBytes(usedHeapBytes) : "--";
  const totalLabel = totalBytes ? formatBytes(totalBytes) : "--";
  const deviceMemoryLabel = deviceMemory ? formatGigabytes(deviceMemory) : null;

  return {
    detail: deviceMemoryLabel
      ? `Total RAM is a browser estimate (${deviceMemoryLabel}); used value is JS heap.`
      : "Used and total values are JavaScript heap values, not full system RAM.",
    memory: `${usedLabel} / ${totalLabel}`,
    name: "Memory",
    status: "estimated",
    usage: usedHeapBytes && totalBytes ? `${Math.round((usedHeapBytes / totalBytes) * 100)}%` : UNSUPPORTED
  };
}

function isWebGLDebugRendererInfo(value: unknown): value is WebGLDebugRendererInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    "UNMASKED_RENDERER_WEBGL" in value &&
    "UNMASKED_VENDOR_WEBGL" in value
  );
}

export function readGpuMetric(): SystemResourceMetric {
  if (typeof document === "undefined") {
    return createUnsupportedMetric("GPU", "Document is unavailable.");
  }

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");

  if (!gl) {
    return createUnsupportedMetric("GPU", "WebGL is unavailable.");
  }

  const extension = gl.getExtension("WEBGL_debug_renderer_info");

  if (!isWebGLDebugRendererInfo(extension)) {
    return createUnsupportedMetric(
      "GPU",
      "GPU renderer is hidden by this browser; usage and VRAM are unavailable."
    );
  }

  const renderer = gl.getParameter(extension.UNMASKED_RENDERER_WEBGL);
  const vendor = gl.getParameter(extension.UNMASKED_VENDOR_WEBGL);
  const rendererLabel = typeof renderer === "string" ? renderer : "GPU";
  const vendorLabel = typeof vendor === "string" ? vendor : "Unknown vendor";

  return {
    detail: `${vendorLabel}. Browser exposes renderer name only; GPU usage and VRAM are unavailable.`,
    memory: UNSUPPORTED,
    name: rendererLabel,
    status: "available",
    usage: UNSUPPORTED
  };
}

export function readSystemResourceStats(): SystemResourceStats {
  return {
    cpu: readCpuMetric(),
    gpu: readGpuMetric(),
    ram: readRamMetric(),
    updatedAt: Date.now()
  };
}

export function areSystemResourceStatsEqual(
  current: SystemResourceStats,
  next: SystemResourceStats
) {
  return (
    current.cpu.detail === next.cpu.detail &&
    current.cpu.memory === next.cpu.memory &&
    current.cpu.name === next.cpu.name &&
    current.cpu.status === next.cpu.status &&
    current.cpu.usage === next.cpu.usage &&
    current.gpu.detail === next.gpu.detail &&
    current.gpu.memory === next.gpu.memory &&
    current.gpu.name === next.gpu.name &&
    current.gpu.status === next.gpu.status &&
    current.gpu.usage === next.gpu.usage &&
    current.ram.detail === next.ram.detail &&
    current.ram.memory === next.ram.memory &&
    current.ram.name === next.ram.name &&
    current.ram.status === next.ram.status &&
    current.ram.usage === next.ram.usage
  );
}

export function getSystemMetricTone(metric: SystemResourceMetric): StatusTone {
  if (metric.status === "available") {
    return "info";
  }

  if (metric.status === "estimated") {
    return "warning";
  }

  return "neutral";
}

export function getCompactSystemMetricValue(metric: SystemResourceMetric, preferredField: "memory" | "name" | "usage") {
  const value = metric[preferredField].replace(/\s+/g, " ").trim();

  if (value === UNSUPPORTED || value === NOT_APPLICABLE) {
    return metric.status === "unsupported" ? UNSUPPORTED : value;
  }

  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 9)}...`;
}

export function getSystemMetricAriaLabel(label: string, metric: SystemResourceMetric) {
  return `${label}: ${metric.name}; usage ${metric.usage}; memory ${metric.memory}; ${metric.detail}`;
}
