import type { Point2D } from "@/lib/types";
import { normalizeAngle } from "@/lib/math";

export function smoothNumber(previous: number, next: number, amount: number) {
  return previous + (next - previous) * amount;
}

export function smoothAngle(previous: number, next: number, amount: number) {
  return previous + normalizeAngle(next - previous) * amount;
}

export function smoothPoint(previous: Point2D | null, next: Point2D, amount: number): Point2D {
  if (!previous) {
    return next;
  }

  return {
    x: smoothNumber(previous.x, next.x, amount),
    y: smoothNumber(previous.y, next.y, amount)
  };
}

export function smoothTuple3(
  previous: [number, number, number],
  next: [number, number, number],
  amount: number
): [number, number, number] {
  return [
    smoothNumber(previous[0], next[0], amount),
    smoothNumber(previous[1], next[1], amount),
    smoothNumber(previous[2], next[2], amount)
  ];
}
