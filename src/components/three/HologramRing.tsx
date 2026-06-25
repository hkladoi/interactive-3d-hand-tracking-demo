"use client";

import { useMemo, useRef } from "react";
import { AdditiveBlending, type Group } from "three";
import { useFrame } from "@react-three/fiber";

type HologramRingProps = {
  isInteracting: boolean;
};

const TICK_COUNT = 36;

export function HologramRing({ isInteracting }: HologramRingProps) {
  const ringRef = useRef<Group>(null);
  const ticks = useMemo(
    () =>
      Array.from({ length: TICK_COUNT }, (_, index) => {
        const angle = (index / TICK_COUNT) * Math.PI * 2;

        return {
          angle,
          id: `ring-tick-${index}`,
          x: Math.cos(angle) * 1.62,
          z: Math.sin(angle) * 1.62
        };
      }),
    []
  );

  useFrame((_, delta) => {
    if (!ringRef.current) {
      return;
    }

    ringRef.current.rotation.y += delta * (isInteracting ? 0.46 : 0.18);
  });

  return (
    <group ref={ringRef} position={[0, -1.08, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.012, 8, 160]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={isInteracting ? "#a7f3d0" : "#2dd4bf"}
          opacity={isInteracting ? 0.72 : 0.42}
          transparent
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.006, 8, 128]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#67e8f9"
          opacity={isInteracting ? 0.48 : 0.28}
          transparent
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 1.86, 96]} />
        <meshBasicMaterial
          color="#2dd4bf"
          opacity={isInteracting ? 0.08 : 0.045}
          transparent
          wireframe
        />
      </mesh>

      {ticks.map((tick) => (
        <mesh
          key={tick.id}
          position={[tick.x, 0, tick.z]}
          rotation={[0, tick.angle, 0]}
          scale={[isInteracting ? 1.24 : 1, 1, 1]}
        >
          <boxGeometry args={[0.16, 0.012, 0.018]} />
          <meshBasicMaterial
            blending={AdditiveBlending}
            color={isInteracting ? "#fef3c7" : "#67e8f9"}
            opacity={isInteracting ? 0.62 : 0.34}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
