"use client";

import { useEffect, useState } from "react";

import { getDeviceCapabilities } from "@/lib/device";
import type { DeviceCapabilities } from "@/lib/types";

const DEFAULT_CAPABILITIES = getDeviceCapabilities();

export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(DEFAULT_CAPABILITIES);

  useEffect(() => {
    const updateCapabilities = () => setCapabilities(getDeviceCapabilities());

    queueMicrotask(updateCapabilities);
    window.addEventListener("resize", updateCapabilities);

    return () => {
      window.removeEventListener("resize", updateCapabilities);
    };
  }, []);

  return capabilities;
}
