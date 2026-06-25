"use client";

import { useCallback, useMemo, useState } from "react";

import { createARObject, DEFAULT_AR_OBJECTS, DEFAULT_OBJECT_TRANSFORM } from "@/lib/objects";
import type { ARObject, ARObjectTransform, ARObjectType, ObjectPreset } from "@/lib/types";

function createUniqueObjectId(type: ARObjectType) {
  return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useObjectRegistry() {
  const [objects, setObjects] = useState<ARObject[]>(() => DEFAULT_AR_OBJECTS.map((object) => ({
    ...object,
    transform: {
      position: [...object.transform.position],
      rotation: [...object.transform.rotation],
      scale: object.transform.scale
    }
  })));
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(
    DEFAULT_AR_OBJECTS[0]?.id ?? null
  );

  const selectedObject = useMemo(
    () => objects.find((object) => object.id === selectedObjectId) ?? null,
    [objects, selectedObjectId]
  );

  const selectObject = useCallback((objectId: string | null) => {
    setSelectedObjectId(objectId);
  }, []);

  const updateObjectTransform = useCallback(
    (objectId: string, transform: ARObjectTransform) => {
      setObjects((currentObjects) =>
        currentObjects.map((object) =>
          object.id === objectId && !object.locked
            ? {
                ...object,
                transform
              }
            : object
        )
      );
    },
    []
  );

  const resetObject = useCallback((objectId: string) => {
    setObjects((currentObjects) =>
      currentObjects.map((object) =>
        object.id === objectId
          ? {
              ...object,
              transform: {
                position: [...DEFAULT_OBJECT_TRANSFORM.position],
                rotation: [...DEFAULT_OBJECT_TRANSFORM.rotation],
                scale: DEFAULT_OBJECT_TRANSFORM.scale
              }
            }
          : object
      )
    );
  }, []);

  const resetAllObjects = useCallback(() => {
    setObjects((currentObjects) =>
      currentObjects.map((object) => ({
        ...object,
        transform: {
          position: [...DEFAULT_OBJECT_TRANSFORM.position],
          rotation: [...DEFAULT_OBJECT_TRANSFORM.rotation],
          scale: object.id === "main-hologram" ? 1 : 0.78
        }
      }))
    );
  }, []);

  const toggleObjectVisibility = useCallback((objectId: string) => {
    setObjects((currentObjects) =>
      currentObjects.map((object) =>
        object.id === objectId
          ? {
              ...object,
              visible: !object.visible
            }
          : object
      )
    );
  }, []);

  const setObjectLocked = useCallback((objectId: string, locked: boolean) => {
    setObjects((currentObjects) =>
      currentObjects.map((object) =>
        object.id === objectId
          ? {
              ...object,
              locked
            }
          : object
      )
    );
  }, []);

  const addObjectFromPreset = useCallback((preset: ObjectPreset) => {
    const id = createUniqueObjectId(preset.type);
    const object = createARObject({
      id,
      modelUrl: preset.modelUrl,
      name: preset.name,
      position: [0, 0, -0.15],
      scale: preset.defaultScale,
      type: preset.type
    });

    setObjects((currentObjects) => [...currentObjects, object]);
    setSelectedObjectId(id);
  }, []);

  const replaceSelectedObject = useCallback(
    (preset: ObjectPreset) => {
      if (!selectedObjectId) {
        return;
      }

      setObjects((currentObjects) =>
        currentObjects.map((object) =>
          object.id === selectedObjectId
            ? {
                ...object,
                modelUrl: preset.modelUrl,
                name: preset.name,
                type: preset.type
              }
            : object
        )
      );
    },
    [selectedObjectId]
  );

  const setSelectedModelUrl = useCallback(
    (modelUrl: string) => {
      if (!selectedObjectId) {
        return;
      }

      setObjects((currentObjects) =>
        currentObjects.map((object) =>
          object.id === selectedObjectId
            ? {
                ...object,
                modelUrl,
                type: "model"
              }
            : object
        )
      );
    },
    [selectedObjectId]
  );

  return {
    addObjectFromPreset,
    objects,
    replaceSelectedObject,
    resetAllObjects,
    resetObject,
    selectObject,
    selectedObject,
    selectedObjectId,
    setObjectLocked,
    setSelectedModelUrl,
    toggleObjectVisibility,
    updateObjectTransform
  };
}
