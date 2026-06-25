import type { ARObject, ARObjectTransform, ARObjectType } from "@/lib/types";

export const DEFAULT_OBJECT_TRANSFORM = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 1
} satisfies ARObjectTransform;

export const DEFAULT_AR_OBJECTS = [
  {
    id: "main-hologram",
    locked: false,
    name: "Main Hologram",
    transform: DEFAULT_OBJECT_TRANSFORM,
    type: "hologram",
    visible: true
  },
  {
    id: "crystal-left",
    locked: false,
    name: "Crystal",
    transform: {
      position: [-1.45, -0.1, -0.35],
      rotation: [0, 0.45, 0],
      scale: 0.72
    },
    type: "crystal",
    visible: true
  },
  {
    id: "orb-right",
    locked: false,
    name: "Energy Orb",
    transform: {
      position: [1.45, 0.08, -0.2],
      rotation: [0, -0.35, 0],
      scale: 0.78
    },
    type: "orb",
    visible: true
  }
] satisfies ARObject[];

export function createARObject({
  id,
  modelUrl,
  name,
  position = [0, 0, 0],
  scale = 1,
  type
}: {
  id: string;
  modelUrl?: string;
  name: string;
  position?: [number, number, number];
  scale?: number;
  type: ARObjectType;
}): ARObject {
  return {
    id,
    locked: false,
    modelUrl,
    name,
    transform: {
      position,
      rotation: [0, 0, 0],
      scale
    },
    type,
    visible: true
  };
}
