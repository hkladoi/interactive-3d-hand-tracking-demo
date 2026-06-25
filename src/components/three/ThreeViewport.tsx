"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Preload } from "@react-three/drei";

import { PlaceholderHologram } from "@/components/three/PlaceholderHologram";
import { TouchPointMarker } from "@/components/three/TouchPointMarker";
import type { HologramTransform } from "@/hooks/useHologramControl";
import { cn } from "@/lib/cn";
import type { ObjectTouchState } from "@/lib/types";

type ThreeViewportProps = {
  className?: string;
  isInteracting: boolean;
  objectTouch: ObjectTouchState;
  transform: HologramTransform;
  visible: boolean;
};

export function ThreeViewport({
  className,
  isInteracting,
  objectTouch,
  transform,
  visible
}: ThreeViewportProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className={cn("absolute inset-0", className)} aria-label="3D hologram viewport">
      <Canvas
        className="h-full w-full"
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.setClearAlpha(0);
        }}
      >
        <PerspectiveCamera makeDefault fov={40} position={[0, 0.2, 5.2]} />
        <ambientLight intensity={0.58} />
        <pointLight color="#67e8f9" intensity={42} position={[2.8, 2.4, 3.8]} />
        <pointLight color="#2dd4bf" intensity={26} position={[-2.6, 1.2, 2.6]} />
        <pointLight color="#fbbf24" intensity={14} position={[-3, -1.4, 2]} />
        <PlaceholderHologram isInteracting={isInteracting} transform={transform} />
        <TouchPointMarker objectTouch={objectTouch} />
        <OrbitControls
          enableDamping
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 1.65}
          minPolarAngle={Math.PI / 3.2}
        />
        <Preload all />
      </Canvas>
    </div>
  );
}
