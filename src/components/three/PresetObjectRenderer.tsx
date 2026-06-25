"use client";

import { AdditiveBlending } from "three";

import { HologramObject } from "@/components/three/HologramObject";
import { HologramRing } from "@/components/three/HologramRing";
import { ModelHologram } from "@/components/three/ModelHologram";
import { ParticleField } from "@/components/three/ParticleField";
import type { ARObjectType } from "@/lib/types";

type PresetObjectRendererProps = {
  enableGlow?: boolean;
  enableParticles?: boolean;
  isInteracting: boolean;
  modelUrl?: string;
  particleCount?: number;
  reducedMotion?: boolean;
  type: ARObjectType;
};

function CrystalObject({ isInteracting }: { isInteracting: boolean }) {
  return (
    <group>
      <mesh>
        <octahedronGeometry args={[0.78, 2]} />
        <meshStandardMaterial
          color={isInteracting ? "#a7f3d0" : "#67e8f9"}
          emissive="#14b8a6"
          emissiveIntensity={isInteracting ? 1.5 : 0.8}
          opacity={isInteracting ? 0.58 : 0.34}
          transparent
          wireframe
        />
      </mesh>
      <mesh scale={1.22}>
        <octahedronGeometry args={[0.78, 1]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#fef3c7"
          depthWrite={false}
          opacity={isInteracting ? 0.16 : 0.08}
          transparent
          wireframe
        />
      </mesh>
    </group>
  );
}

function OrbObject({ isInteracting }: { isInteracting: boolean }) {
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.72, 3]} />
        <meshStandardMaterial
          color={isInteracting ? "#fef3c7" : "#5eead4"}
          emissive={isInteracting ? "#fbbf24" : "#14b8a6"}
          emissiveIntensity={isInteracting ? 1.7 : 0.92}
          opacity={isInteracting ? 0.52 : 0.36}
          transparent
          wireframe
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.86, 0.012, 8, 96]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#67e8f9"
          depthWrite={false}
          opacity={isInteracting ? 0.82 : 0.45}
          transparent
        />
      </mesh>
    </group>
  );
}

function RingObject({ isInteracting }: { isInteracting: boolean }) {
  return (
    <group rotation={[Math.PI / 2.6, 0, 0]}>
      <mesh>
        <torusKnotGeometry args={[0.58, 0.055, 128, 10]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#22d3ee"
          emissiveIntensity={isInteracting ? 1.7 : 0.9}
          opacity={isInteracting ? 0.66 : 0.44}
          transparent
          wireframe
        />
      </mesh>
    </group>
  );
}

export function PresetObjectRenderer({
  enableGlow = true,
  enableParticles = true,
  isInteracting,
  modelUrl,
  particleCount = 260,
  reducedMotion = false,
  type
}: PresetObjectRendererProps) {
  if (type === "model") {
    return (
      <ModelHologram
        fallback={<HologramObject isInteracting={isInteracting} />}
        isInteracting={isInteracting}
        url={modelUrl}
      />
    );
  }

  return (
    <group>
      <ParticleField
        enabled={enableParticles}
        isInteracting={isInteracting}
        particleCount={Math.max(40, Math.floor(particleCount / 2))}
        reducedMotion={reducedMotion}
      />
      {type === "crystal" ? <CrystalObject isInteracting={isInteracting} /> : null}
      {type === "orb" ? <OrbObject isInteracting={isInteracting} /> : null}
      {type === "ring" ? <RingObject isInteracting={isInteracting} /> : null}
      {type === "hologram" ? <HologramObject isInteracting={isInteracting} /> : null}
      {enableGlow ? <HologramRing isInteracting={isInteracting} /> : null}
    </group>
  );
}
