"use client";

import { InteractiveObject } from "@/components/three/InteractiveObject";
import type { ARObject } from "@/lib/types";

type ObjectSceneProps = {
  enableGlow?: boolean;
  enableParticles?: boolean;
  interactingObjectId: string | null;
  objects: readonly ARObject[];
  particleCount?: number;
  reducedMotion?: boolean;
  selectedObjectId: string | null;
};

export function ObjectScene({
  enableGlow,
  enableParticles,
  interactingObjectId,
  objects,
  particleCount,
  reducedMotion,
  selectedObjectId
}: ObjectSceneProps) {
  return (
    <group>
      {objects.map((object) => (
        <InteractiveObject
          enableGlow={enableGlow}
          enableParticles={enableParticles}
          isInteracting={object.id === interactingObjectId}
          isSelected={object.id === selectedObjectId}
          key={object.id}
          object={object}
          particleCount={particleCount}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}
