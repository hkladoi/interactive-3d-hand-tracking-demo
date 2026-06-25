"use client";

import { useCallback, useEffect, useRef } from "react";

import { HAND_LANDMARK_CONNECTIONS, projectHandLandmark } from "@/lib/handLandmarks";
import { cn } from "@/lib/cn";
import { isFinitePoint, lerpPoint } from "@/lib/math";
import type { Point2D, TrackedHand } from "@/lib/types";

type HandLandmarkOverlayProps = {
  className?: string;
  hands: TrackedHand[];
  isMirrored?: boolean;
};

function resizeCanvasIfNeeded(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  const canvasWidth = Math.floor(width * pixelRatio);
  const canvasHeight = Math.floor(height * pixelRatio);

  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  return { height, pixelRatio, width };
}

function drawLabel(
  context: CanvasRenderingContext2D,
  handedness: TrackedHand["handedness"],
  points: readonly Point2D[]
) {
  const wrist = points[0];

  if (!wrist || !isFinitePoint(wrist)) {
    return;
  }

  context.save();
  context.font = "600 12px Inter, system-ui, sans-serif";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(2, 6, 23, 0.78)";
  context.strokeStyle = "rgba(45, 212, 191, 0.7)";
  context.lineWidth = 1;

  const label = handedness;
  const metrics = context.measureText(label);
  const boxWidth = metrics.width + 18;
  const boxHeight = 24;
  const x = wrist.x - boxWidth / 2;
  const y = wrist.y + 18;

  context.beginPath();
  context.roundRect(x, y, boxWidth, boxHeight, 6);
  context.fill();
  context.stroke();
  context.fillStyle = "rgba(236, 253, 245, 0.96)";
  context.fillText(label, x + 9, y + boxHeight / 2);
  context.restore();
}

function drawHand(
  context: CanvasRenderingContext2D,
  hand: TrackedHand,
  points: readonly Point2D[],
  handIndex: number
) {
  const accentColor = handIndex === 0 ? "45, 212, 191" : "251, 191, 36";

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowBlur = 14;
  context.shadowColor = `rgba(${accentColor}, 0.38)`;

  HAND_LANDMARK_CONNECTIONS.forEach(([fromIndex, toIndex]) => {
    const from = points[fromIndex];
    const to = points[toIndex];

    if (!from || !to || !isFinitePoint(from) || !isFinitePoint(to)) {
      return;
    }

    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.strokeStyle = `rgba(${accentColor}, 0.78)`;
    context.lineWidth = 4;
    context.stroke();

    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.strokeStyle = "rgba(255, 255, 255, 0.42)";
    context.lineWidth = 1.25;
    context.stroke();
  });

  points.forEach((point, landmarkIndex) => {
    if (!isFinitePoint(point)) {
      return;
    }

    const isWrist = landmarkIndex === 0;
    const radius = isWrist ? 7 : 5;

    context.beginPath();
    context.fillStyle = `rgba(${accentColor}, ${isWrist ? 0.98 : 0.9})`;
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.strokeStyle = "rgba(255, 255, 255, 0.78)";
    context.lineWidth = 1;
    context.arc(point.x, point.y, radius + 3, 0, Math.PI * 2);
    context.stroke();
  });

  drawLabel(context, hand.handedness, points);
  context.restore();
}

export function HandLandmarkOverlay({
  className,
  hands,
  isMirrored = true
}: HandLandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<readonly TrackedHand[]>(hands);
  const isMirroredRef = useRef(isMirrored);
  const animationFrameRef = useRef<number | null>(null);
  const smoothedPointsRef = useRef<Point2D[][]>([]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const { height, pixelRatio, width } = resizeCanvasIfNeeded(canvas);
    const currentHands = handsRef.current;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    if (currentHands.length === 0) {
      smoothedPointsRef.current = [];
      return;
    }

    currentHands.forEach((hand, handIndex) => {
      const previousPoints = smoothedPointsRef.current[handIndex] ?? [];
      const projectedPoints = hand.landmarks.map((landmark, landmarkIndex) => {
        const nextPoint = projectHandLandmark(landmark, width, height, isMirroredRef.current);
        const previousPoint = previousPoints[landmarkIndex];

        return previousPoint ? lerpPoint(previousPoint, nextPoint, 0.58) : nextPoint;
      });

      smoothedPointsRef.current[handIndex] = projectedPoints;
      drawHand(context, hand, projectedPoints, handIndex);
    });

    smoothedPointsRef.current = smoothedPointsRef.current.slice(0, currentHands.length);
  }, []);

  const requestDraw = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      draw();
    });
  }, [draw]);

  useEffect(() => {
    handsRef.current = hands;
    requestDraw();
  }, [hands, requestDraw]);

  useEffect(() => {
    isMirroredRef.current = isMirrored;
    requestDraw();
  }, [isMirrored, requestDraw]);

  useEffect(() => {
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(requestDraw);
      const canvas = canvasRef.current;

      if (canvas) {
        resizeObserver.observe(canvas);
      }

      requestDraw();

      return () => {
        if (animationFrameRef.current !== null) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }

        resizeObserver.disconnect();
      };
    }

    window.addEventListener("resize", requestDraw);
    requestDraw();

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      window.removeEventListener("resize", requestDraw);
    };
  }, [requestDraw]);

  return (
    <div
      aria-label="Hand landmark overlay"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <canvas className="h-full w-full" ref={canvasRef} />
    </div>
  );
}
