import type { DeviceCapabilities } from "@/lib/types";

export function getDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      devicePixelRatio: 1,
      hardwareConcurrency: null,
      hasTouch: false,
      isDesktop: true,
      isMobile: false,
      isTablet: false,
      prefersReducedMotion: false
    };
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const hasTouch = navigator.maxTouchPoints > 0;
  const isTablet = /ipad|tablet/.test(userAgent) || (hasTouch && window.innerWidth >= 768);
  const isMobile = !isTablet && (/iphone|android|mobile/.test(userAgent) || window.innerWidth < 768);

  return {
    devicePixelRatio: window.devicePixelRatio || 1,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    hasTouch,
    isDesktop: !isMobile && !isTablet,
    isMobile,
    isTablet,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };
}
