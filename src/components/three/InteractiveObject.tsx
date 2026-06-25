"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

import { ObjectSelectionMarker } from "@/components/three/ObjectSelectionMarker";
import { PresetObjectRenderer } from "@/components/three/PresetObjectRenderer";
import type { ARObject } from "@/lib/types";

type InteractiveObjectProps = {
  enableGlow?: boolean;
  enableParticles?: boolean;
  isInteracting: boolean;
  isSelected: boolean;
  object: ARObject;
  particleCount?: number;
  reducedMotion?: boolean;
};

export function InteractiveObject({
  enableGlow,
  enableParticles,
  isInteracting,
  isSelected,
  object,
  particleCount,
  reducedMotion
}: InteractiveObjectProps) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const idleOffset = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.9 + object.id.length) * 0.035;
    groupRef.current.position.set(
      object.transform.position[0],
      object.transform.position[1] + idleOffset,
      object.transform.position[2]
    );
    groupRef.current.rotation.set(...object.transform.rotation);
    groupRef.current.scale.setScalar(object.transform.scale * (isSelected ? 1.04 : 1));
  });

  if (!object.visible) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <PresetObjectRenderer
        enableGlow={enableGlow}
        enableParticles={enableParticles}
        isInteracting={isInteracting || isSelected}
        modelUrl={object.modelUrl}
        particleCount={particleCount}
        reducedMotion={reducedMotion}
        type={object.type}
      />
      <ObjectSelectionMarker
        isLocked={object.locked}
        isSelected={isSelected}
        label={object.name}
      />
    </group>
  );
}
