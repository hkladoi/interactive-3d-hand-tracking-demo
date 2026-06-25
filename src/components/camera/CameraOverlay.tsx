"use client";

import { useEffect, useRef } from "react";

import {
  MOCK_CAMERA_OVERLAY_SNAPSHOT,
  resolveCameraOverlayPoint,
  type CameraOverlaySnapshot
} from "@/lib/camera";
import { cn } from "@/lib/cn";

type CameraOverlayProps = {
  className?: string;
  snapshot?: CameraOverlaySnapshot;
};

function drawTrackingOverlay(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  snapshot: CameraOverlaySnapshot
) {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowBlur = 16;
  context.shadowColor = "rgba(45, 212, 191, 0.45)";

  const pointById = new Map(
    snapshot.landmarks.map((landmark) => [
      landmark.id,
      resolveCameraOverlayPoint(landmark, width, height)
    ])
  );

  context.strokeStyle = "rgba(45, 212, 191, 0.78)";
  context.lineWidth = Math.max(2, Math.min(width, height) * 0.004);

  snapshot.connections.forEach(([fromId, toId]) => {
    const from = pointById.get(fromId);
    const to = pointById.get(toId);

    if (!from || !to) {
      return;
    }

    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
  });

  const pointRadius = Math.max(5, Math.min(width, height) * 0.01);

  snapshot.landmarks.forEach((landmark) => {
    const point = pointById.get(landmark.id);

    if (!point) {
      return;
    }

    context.beginPath();
    context.fillStyle = landmark.id === "palm" ? "rgba(251, 191, 36, 0.94)" : "rgba(103, 232, 249, 0.92)";
    context.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.strokeStyle = "rgba(255, 255, 255, 0.72)";
    context.lineWidth = 1;
    context.arc(point.x, point.y, pointRadius + 4, 0, Math.PI * 2);
    context.stroke();
  });

  context.restore();
}

export function CameraOverlay({
  className,
  snapshot = MOCK_CAMERA_OVERLAY_SNAPSHOT
}: CameraOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    let animationFrameId = 0;
    const draw = () => {
      animationFrameId = window.requestAnimationFrame(() => {
        drawTrackingOverlay(canvas, context, snapshot);
      });
    };

    draw();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(draw);
      resizeObserver.observe(canvas);

      return () => {
        window.cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
      };
    }

    window.addEventListener("resize", draw);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", draw);
    };
  }, [snapshot]);

  return (
    <div
      aria-label="Mock hand tracking overlay"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <canvas className="h-full w-full" ref={canvasRef} />

      <div className="absolute left-1/2 top-24 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md border border-teal-200/25 bg-black/35 px-3 py-2 text-center text-xs font-medium text-teal-50 backdrop-blur-md sm:top-28">
        {snapshot.message}
      </div>
    </div>
  );
}
