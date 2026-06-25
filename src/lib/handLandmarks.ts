import type { HandLandmark, Point2D } from "@/lib/types";

export const HAND_LANDMARK_COUNT = 21;

export const HAND_LANDMARK_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17]
] as const satisfies readonly (readonly [number, number])[];

export function projectHandLandmark(
  landmark: HandLandmark,
  width: number,
  height: number,
  isMirrored = true
): Point2D {
  return {
    x: (isMirrored ? 1 - landmark.x : landmark.x) * width,
    y: landmark.y * height
  };
}

export function hasCompleteHandLandmarks(landmarks: readonly HandLandmark[]) {
  return landmarks.length === HAND_LANDMARK_COUNT;
}
