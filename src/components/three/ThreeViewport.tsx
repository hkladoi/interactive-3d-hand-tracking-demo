"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Preload } from "@react-three/drei";

import { ObjectScene } from "@/components/three/ObjectScene";
import { PlaceholderHologram } from "@/components/three/PlaceholderHologram";
import { TouchPointMarker } from "@/components/three/TouchPointMarker";
import type { HologramTransform } from "@/hooks/useHologramControl";
import { cn } from "@/lib/cn";
import type { ARObject, ObjectTouchState, PerformanceConfig } from "@/lib/types";

type ThreeViewportProps = {
  className?: string;
  interactingObjectId?: string | null;
  isInteracting: boolean;
  objectTouch: ObjectTouchState;
  objects?: readonly ARObject[];
  performanceConfig?: PerformanceConfig;
  reducedMotion?: boolean;
  selectedObjectId?: string | null;
  transform: HologramTransform;
  visible: boolean;
};

export function ThreeViewport({
  className,
  interactingObjectId = null,
  isInteracting,
  objectTouch,
  objects,
  performanceConfig,
  reducedMotion = false,
  selectedObjectId = null,
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
        dpr={[
          Math.max(0.5, performanceConfig?.renderScale ?? 1),
          Math.min(2, (performanceConfig?.renderScale ?? 1) * 2)
        ]}
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
        {objects ? (
          <ObjectScene
            enableGlow={performanceConfig?.enableGlow ?? true}
            enableParticles={performanceConfig?.enableParticles ?? true}
            interactingObjectId={interactingObjectId}
            objects={objects}
            particleCount={performanceConfig?.particleCount}
            reducedMotion={reducedMotion}
            selectedObjectId={selectedObjectId}
          />
        ) : (
          <PlaceholderHologram isInteracting={isInteracting} transform={transform} />
        )}
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
