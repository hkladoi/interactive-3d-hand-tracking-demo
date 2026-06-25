"use client";

import { useMemo, useRef } from "react";
import { AdditiveBlending, type Points } from "three";
import { useFrame } from "@react-three/fiber";

type ParticleFieldProps = {
  enabled?: boolean;
  isInteracting: boolean;
  particleCount?: number;
  reducedMotion?: boolean;
};

function createParticlePositions(particleCount: number) {
  const positions = new Float32Array(particleCount * 3);

  for (let index = 0; index < particleCount; index += 1) {
    const radius = 0.85 + Math.random() * 2.25;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 2.65;
    const verticalPinch = 1 - Math.min(Math.abs(y) / 1.5, 0.58);
    const x = Math.cos(theta) * radius * verticalPinch;
    const z = Math.sin(theta) * radius * verticalPinch;
    const offset = index * 3;

    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
  }

  return positions;
}

export function ParticleField({
  enabled = true,
  isInteracting,
  particleCount = 360,
  reducedMotion = false
}: ParticleFieldProps) {
  const pointsRef = useRef<Points>(null);
  const positions = useMemo(() => createParticlePositions(particleCount), [particleCount]);

  useFrame(({ clock }, delta) => {
    if (!pointsRef.current) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    const speed = reducedMotion ? 0.08 : isInteracting ? 0.58 : 0.2;
    pointsRef.current.rotation.y += delta * speed;
    pointsRef.current.rotation.x = Math.sin(elapsed * 0.18) * 0.08;
    pointsRef.current.position.y =
      Math.sin(elapsed * (reducedMotion ? 0.35 : isInteracting ? 1.4 : 0.65)) * 0.035;
  });

  if (!enabled) {
    return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        blending={AdditiveBlending}
        color={isInteracting ? "#a7f3d0" : "#67e8f9"}
        depthWrite={false}
        opacity={isInteracting ? 0.72 : 0.38}
        size={isInteracting ? 0.035 : 0.024}
        sizeAttenuation
        transparent
      />
    </points>
  );
}
