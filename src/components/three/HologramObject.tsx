"use client";

import { AdditiveBlending } from "three";

type HologramObjectProps = {
  isInteracting: boolean;
};

type TreeTier = {
  id: string;
  positionY: number;
  radius: number;
  height: number;
  rotationY: number;
};

const treeTiers: TreeTier[] = [
  { height: 0.78, id: "tier-base", positionY: -0.28, radius: 1.18, rotationY: Math.PI / 4 },
  { height: 0.68, id: "tier-mid", positionY: 0.18, radius: 0.88, rotationY: 0 },
  { height: 0.56, id: "tier-top", positionY: 0.58, radius: 0.58, rotationY: Math.PI / 4 }
];

export function HologramObject({ isInteracting }: HologramObjectProps) {
  const coreColor = isInteracting ? "#a7f3d0" : "#5eead4";
  const wireColor = isInteracting ? "#67e8f9" : "#2dd4bf";
  const glowOpacity = isInteracting ? 0.18 : 0.09;

  return (
    <group>
      <mesh position={[0, 0.05, 0]} scale={[1.18, 1.62, 1.18]}>
        <octahedronGeometry args={[0.92, 2]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#2dd4bf"
          depthWrite={false}
          opacity={glowOpacity}
          transparent
        />
      </mesh>

      <mesh position={[0, 0.04, 0]} scale={[0.46, 1.78, 0.46]}>
        <cylinderGeometry args={[0.08, 0.16, 1.72, 6, 1, true]} />
        <meshStandardMaterial
          color={coreColor}
          emissive="#14b8a6"
          emissiveIntensity={isInteracting ? 1.5 : 0.9}
          metalness={0.1}
          opacity={isInteracting ? 0.42 : 0.28}
          roughness={0.2}
          transparent
          wireframe
        />
      </mesh>

      {treeTiers.map((tier) => (
        <group key={tier.id} position={[0, tier.positionY, 0]} rotation={[0, tier.rotationY, 0]}>
          <mesh>
            <coneGeometry args={[tier.radius, tier.height, 4, 1, true]} />
            <meshStandardMaterial
              color={wireColor}
              emissive={wireColor}
              emissiveIntensity={isInteracting ? 1.25 : 0.72}
              opacity={isInteracting ? 0.72 : 0.52}
              roughness={0.28}
              transparent
              wireframe
            />
          </mesh>

          <mesh scale={[1.1, 1.08, 1.1]}>
            <coneGeometry args={[tier.radius, tier.height, 4, 1, true]} />
            <meshBasicMaterial
              blending={AdditiveBlending}
              color={isInteracting ? "#fef3c7" : "#67e8f9"}
              depthWrite={false}
              opacity={isInteracting ? 0.12 : 0.06}
              transparent
              wireframe
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 1.08, 0]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fbbf24"
          emissiveIntensity={isInteracting ? 1.55 : 0.9}
          opacity={isInteracting ? 0.72 : 0.5}
          transparent
          wireframe
        />
      </mesh>

      <mesh position={[0, -0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.012, 8, 96]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#fbbf24"
          opacity={isInteracting ? 0.72 : 0.42}
          transparent
        />
      </mesh>
    </group>
  );
}
