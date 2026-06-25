"use client";

import { useEffect, useRef, useState } from "react";

export function useFpsMonitor(enabled = true) {
  const framesRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    if (!enabled) {
      queueMicrotask(() => setFps(0));
      return;
    }

    const tick = (timestamp: number) => {
      if (startedAtRef.current === 0) {
        startedAtRef.current = timestamp;
      }

      framesRef.current += 1;

      if (timestamp - startedAtRef.current >= 1000) {
        setFps(framesRef.current);
        framesRef.current = 0;
        startedAtRef.current = timestamp;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled]);

  return fps;
}
