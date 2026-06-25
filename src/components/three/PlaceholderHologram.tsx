"use client";

import { useRef } from "react";
import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

import { HologramObject } from "@/components/three/HologramObject";
import { HologramRing } from "@/components/three/HologramRing";
import { ModelHologram } from "@/components/three/ModelHologram";
import { ParticleField } from "@/components/three/ParticleField";
import type { HologramTransform } from "@/hooks/useHologramControl";
import { DEFAULT_MODEL_URL } from "@/lib/constants";

type PlaceholderHologramProps = {
  isInteracting: boolean;
  transform: HologramTransform;
};

export function PlaceholderHologram({ isInteracting, transform }: PlaceholderHologramProps) {
  const groupRef = useRef<Group>(null);
  const idleRotationRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    idleRotationRef.current += delta * (isInteracting ? 0.08 : 0.22);
    groupRef.current.position.set(...transform.position);
    groupRef.current.rotation.x = transform.rotation[0] + Math.sin(idleRotationRef.current) * 0.06;
    groupRef.current.rotation.y = transform.rotation[1] + idleRotationRef.current;
    groupRef.current.rotation.z = transform.rotation[2];
    groupRef.current.scale.setScalar(transform.scale);
  });

  return (
    <Float
      floatIntensity={isInteracting ? 0.2 : 0.42}
      rotationIntensity={isInteracting ? 0.06 : 0.16}
      speed={isInteracting ? 1.75 : 1.18}
    >
      <group ref={groupRef}>
        <ParticleField isInteracting={isInteracting} />
        <ModelHologram
          fallback={<HologramObject isInteracting={isInteracting} />}
          isInteracting={isInteracting}
          url={DEFAULT_MODEL_URL}
        />
        <HologramRing isInteracting={isInteracting} />
      </group>
    </Float>
  );
}
