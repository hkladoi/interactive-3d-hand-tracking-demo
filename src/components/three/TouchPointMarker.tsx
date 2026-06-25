"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, type Group } from "three";

import type { ObjectTouchState } from "@/lib/types";

type TouchPointMarkerProps = {
  objectTouch: ObjectTouchState;
};

export function TouchPointMarker({ objectTouch }: TouchPointMarkerProps) {
  const groupRef = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(clock.elapsedTime * 9) * 0.18;
    groupRef.current.scale.setScalar(pulse);
  });

  if (!objectTouch.isTouchingObject || !objectTouch.worldPoint) {
    return null;
  }

  return (
    <group position={objectTouch.worldPoint} ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.055, 18, 18]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#fef3c7"
          depthWrite={false}
          opacity={0.92}
          transparent
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.115, 0.006, 8, 48]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#67e8f9"
          depthWrite={false}
          opacity={0.86}
          transparent
        />
      </mesh>
    </group>
  );
}
