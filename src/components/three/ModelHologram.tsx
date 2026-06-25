"use client";

import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { useGLTF } from "@react-three/drei";
import {
  AdditiveBlending,
  Box3,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Vector3,
  type Material
} from "three";

type ModelHologramProps = {
  fallback?: ReactNode;
  isInteracting: boolean;
  url?: string;
};

type ModelErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type ModelErrorBoundaryState = {
  hasError: boolean;
};

type PreparedModelScenes = {
  solidScene: Object3D;
  wireScene: Object3D;
};

type ModelAvailability = "available" | "checking" | "unavailable";

const MODEL_TARGET_SIZE = 2.35;

class ModelLoadErrorBoundary extends Component<
  ModelErrorBoundaryProps,
  ModelErrorBoundaryState
> {
  state: ModelErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(): ModelErrorBoundaryState {
    return {
      hasError: true
    };
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }

    return this.props.children;
  }
}

function isMesh(object: Object3D): object is Mesh {
  return object instanceof Mesh;
}

function disposeMaterial(material: Material | Material[]) {
  if (Array.isArray(material)) {
    material.forEach((item) => item.dispose());
    return;
  }

  material.dispose();
}

function disposeSceneMaterials(scene: Object3D) {
  scene.traverse((object) => {
    if (isMesh(object)) {
      disposeMaterial(object.material);
    }
  });
}

function normalizeScene(scene: Object3D) {
  const box = new Box3().setFromObject(scene);
  const size = new Vector3();
  const center = new Vector3();

  box.getSize(size);
  box.getCenter(center);

  const maxDimension = Math.max(size.x, size.y, size.z, 0.001);
  const scale = MODEL_TARGET_SIZE / maxDimension;

  scene.position.sub(center);
  scene.scale.setScalar(scale);
}

function prepareSolidScene(scene: Object3D, isInteracting: boolean) {
  scene.traverse((object) => {
    if (!isMesh(object)) {
      return;
    }

    object.material = new MeshStandardMaterial({
      color: isInteracting ? "#a7f3d0" : "#5eead4",
      depthWrite: false,
      emissive: "#14b8a6",
      emissiveIntensity: isInteracting ? 1.45 : 0.82,
      metalness: 0.05,
      opacity: isInteracting ? 0.44 : 0.28,
      roughness: 0.25,
      transparent: true
    });
  });
}

function prepareWireScene(scene: Object3D, isInteracting: boolean) {
  scene.traverse((object) => {
    if (!isMesh(object)) {
      return;
    }

    object.material = new MeshBasicMaterial({
      blending: AdditiveBlending,
      color: isInteracting ? "#fef3c7" : "#67e8f9",
      depthWrite: false,
      opacity: isInteracting ? 0.68 : 0.42,
      transparent: true,
      wireframe: true
    });
  });
}

function prepareModelScenes(sourceScene: Group, isInteracting: boolean): PreparedModelScenes {
  const solidScene = sourceScene.clone(true);
  const wireScene = sourceScene.clone(true);

  normalizeScene(solidScene);
  normalizeScene(wireScene);
  prepareSolidScene(solidScene, isInteracting);
  prepareWireScene(wireScene, isInteracting);

  return {
    solidScene,
    wireScene
  };
}

function LoadedModelHologram({
  isInteracting,
  url
}: Required<Pick<ModelHologramProps, "isInteracting" | "url">>) {
  const { scene } = useGLTF(url);
  const preparedScenes = useMemo(
    () => prepareModelScenes(scene, isInteracting),
    [isInteracting, scene]
  );

  useEffect(() => {
    return () => {
      disposeSceneMaterials(preparedScenes.solidScene);
      disposeSceneMaterials(preparedScenes.wireScene);
    };
  }, [preparedScenes]);

  return (
    <group>
      <primitive object={preparedScenes.solidScene} />
      <primitive object={preparedScenes.wireScene} />
      <mesh scale={isInteracting ? 1.34 : 1.18}>
        <icosahedronGeometry args={[1.18, 1]} />
        <meshBasicMaterial
          blending={AdditiveBlending}
          color="#2dd4bf"
          depthWrite={false}
          opacity={isInteracting ? 0.14 : 0.07}
          transparent
        />
      </mesh>
    </group>
  );
}

function ModelAvailabilityGate({
  children,
  fallback,
  url
}: ModelErrorBoundaryProps & { url: string }) {
  const [availability, setAvailability] = useState<ModelAvailability>("checking");

  useEffect(() => {
    let isActive = true;

    void fetch(url, { method: "HEAD" })
      .then((response) => {
        if (isActive) {
          setAvailability(response.ok ? "available" : "unavailable");
        }
      })
      .catch(() => {
        if (isActive) {
          setAvailability("unavailable");
        }
      });

    return () => {
      isActive = false;
    };
  }, [url]);

  if (availability !== "available") {
    return <>{fallback}</>;
  }

  return children;
}

export function ModelHologram({ fallback = null, isInteracting, url }: ModelHologramProps) {
  if (!url) {
    return <>{fallback}</>;
  }

  return (
    <ModelAvailabilityGate fallback={fallback} key={url} url={url}>
      <ModelLoadErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <LoadedModelHologram isInteracting={isInteracting} url={url} />
        </Suspense>
      </ModelLoadErrorBoundary>
    </ModelAvailabilityGate>
  );
}
