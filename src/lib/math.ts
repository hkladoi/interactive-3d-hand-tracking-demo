import type { Point2D } from "@/lib/types";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

export function lerpPoint(start: Point2D, end: Point2D, amount: number): Point2D {
  return {
    x: lerp(start.x, end.x, amount),
    y: lerp(start.y, end.y, amount)
  };
}

export function getPointDistance(a: Point2D, b: Point2D) {
  const deltaX = a.x - b.x;
  const deltaY = a.y - b.y;

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

export function isFinitePoint(point: Point2D) {
  return Number.isFinite(point.x) && Number.isFinite(point.y);
}

export function normalizeAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function normalizeAngleRad(angle: number) {
  return normalizeAngle(angle);
}

export function lerpAngleRad(from: number, to: number, factor: number) {
  return from + normalizeAngleRad(to - from) * factor;
}
