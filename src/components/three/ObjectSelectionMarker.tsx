"use client";

import { Html } from "@react-three/drei";
import { AdditiveBlending } from "three";

type ObjectSelectionMarkerProps = {
  isLocked: boolean;
  isSelected: boolean;
  label: string;
};

export function ObjectSelectionMarker({
  isLocked,
  isSelected,
  label
}: ObjectSelectionMarkerProps) {
  if (!isSelected) {
    return null;
  }

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.18, 0.01, 8, 96]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color={isLocked ? "#fca5a5" : "#fef3c7"}
          depthWrite={false}
          opacity={0.9}
          transparent
        />
      </mesh>
      <Html center distanceFactor={8} position={[0, 1.35, 0]}>
        <span className="rounded-md border border-cyan-100/20 bg-black/70 px-2 py-1 text-[0.65rem] font-semibold text-cyan-50 shadow-panel backdrop-blur-md">
          {label}
          {isLocked ? " / Locked" : ""}
        </span>
      </Html>
    </group>
  );
}
