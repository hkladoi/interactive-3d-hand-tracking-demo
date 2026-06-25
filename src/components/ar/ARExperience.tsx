"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ARHeader } from "@/components/ar/ARHeader";
import { ARStatusBar } from "@/components/ar/ARStatusBar";
import { CameraPermissionState } from "@/components/ar/CameraPermissionState";
import { StartCameraScreen } from "@/components/ar/StartCameraScreen";
import { CameraOverlay } from "@/components/camera/CameraOverlay";
import { CameraView } from "@/components/camera/CameraView";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { HandLandmarkOverlay } from "@/components/hand/HandLandmarkOverlay";
import { HandTrackingStatus } from "@/components/hand/HandTrackingStatus";
import { useCamera } from "@/hooks/useCamera";
import { useClientReady } from "@/hooks/useClientReady";
import { useGesture } from "@/hooks/useGesture";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useHologramControl } from "@/hooks/useHologramControl";
import { useSystemResources } from "@/hooks/useSystemResources";
import { useTouchProjection } from "@/hooks/useTouchProjection";
import {
  DEFAULT_CAMERA_LAYER_VISIBILITY,
  TRACKING_UNAVAILABLE_OVERLAY_SNAPSHOT,
  type CameraLayerKey,
  type CameraLayerVisibility
} from "@/lib/camera";
import type { CameraFallbackStatus, GestureState, TrackingStatus } from "@/lib/types";

const DynamicThreeViewport = dynamic(
  () => import("@/components/three/ThreeViewport").then((module) => module.ThreeViewport),
  {
    loading: () => <div className="absolute inset-0 bg-transparent" />,
    ssr: false
  }
);

function isFallbackStatus(status: string): status is CameraFallbackStatus {
  return status === "denied" || status === "unsupported" || status === "error";
}

function shouldShowTrackingUnavailableOverlay(status: TrackingStatus) {
  return status === "error" || status === "unsupported";
}

export function ARExperience() {
  const { errorMessage, startCamera, status, stopCamera, stream } = useCamera();
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const isClientReady = useClientReady();
  const {
    errorMessage: handTrackingError,
    fps,
    hands,
    startTracking,
    status: trackingStatus,
    stopTracking
  } = useHandTracking(cameraVideoRef);
  const rawGesture = useGesture(hands);
  const {
    isInteracting,
    resetTransform,
    transform: hologramTransform
  } = useHologramControl(rawGesture);
  const objectTouch = useTouchProjection(rawGesture, hologramTransform);
  const gesture = useMemo<GestureState>(() => {
    const isDragging = rawGesture.fingerTouch.isTouching && objectTouch.isTouchingObject;

    return {
      ...rawGesture,
      isDragging,
      objectTouch,
      type: rawGesture.type === "touch" && isDragging ? "drag" : rawGesture.type
    };
  }, [objectTouch, rawGesture]);
  const systemResources = useSystemResources();
  const [isDebugOpen, setIsDebugOpen] = useState(true);
  const [layerVisibility, setLayerVisibility] = useState<CameraLayerVisibility>(
    DEFAULT_CAMERA_LAYER_VISIBILITY
  );

  const toggleLayer = useCallback((key: CameraLayerKey) => {
    setLayerVisibility((current) => ({
      ...current,
      [key]: !current[key]
    }));
  }, []);

  const handleStopCamera = useCallback(() => {
    stopTracking();
    stopCamera();
  }, [stopCamera, stopTracking]);

  const toggleDebug = useCallback(() => {
    setIsDebugOpen((current) => !current);
  }, []);

  useEffect(() => {
    if (status !== "ready" || !stream) {
      stopTracking();
      return;
    }

    void startTracking();
  }, [startTracking, status, stopTracking, stream]);

  if (isFallbackStatus(status)) {
    return (
      <CameraPermissionState
        errorMessage={errorMessage}
        onBack={handleStopCamera}
        onRetry={startCamera}
        status={status}
      />
    );
  }

  if (status !== "ready") {
    return (
      <StartCameraScreen
        isClientReady={isClientReady}
        isRequesting={status === "requesting"}
        onStartCamera={startCamera}
      />
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-neutral-950 text-white">
      <CameraView className="z-0" stream={stream} videoRef={cameraVideoRef} />

      <DynamicThreeViewport
        className="z-10"
        isInteracting={isInteracting}
        objectTouch={gesture.objectTouch}
        transform={hologramTransform}
        visible={layerVisibility.showHologram}
      />

      {layerVisibility.showCameraOverlay ? (
        shouldShowTrackingUnavailableOverlay(trackingStatus) ? (
          <CameraOverlay
            className="z-20"
            snapshot={TRACKING_UNAVAILABLE_OVERLAY_SNAPSHOT}
          />
        ) : (
          <HandLandmarkOverlay className="z-20" gesture={gesture} hands={hands} />
        )
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-20 z-20 mx-auto h-[54dvh] max-w-4xl border-y border-teal-200/[0.18] bg-gradient-to-b from-teal-200/5 via-transparent to-amber-200/5" />

      <HandTrackingStatus
        className={isDebugOpen ? "hidden sm:block" : undefined}
        errorMessage={handTrackingError}
        fps={fps}
        handsCount={hands.length}
        status={trackingStatus}
      />
      <ARHeader
        cameraStatus={status}
        isDebugOpen={isDebugOpen}
        onReset={resetTransform}
        onStop={handleStopCamera}
        onToggleDebug={toggleDebug}
      />
      <DebugPanel
        cameraStatus={status}
        gesture={gesture}
        handTrackingError={handTrackingError}
        handsCount={hands.length}
        hologramTransform={hologramTransform}
        isOpen={isDebugOpen}
        layerVisibility={layerVisibility}
        onResetTransform={resetTransform}
        onToggleLayer={toggleLayer}
        systemResources={systemResources}
        trackingFps={fps}
        trackingStatus={trackingStatus}
        stream={stream}
      />
      {layerVisibility.showStatusBar ? (
        <ARStatusBar
          cameraStatus={status}
          fps={fps}
          gesture={gesture}
          handsCount={hands.length}
          hologramTransform={hologramTransform}
          systemResources={systemResources}
          trackingStatus={trackingStatus}
        />
      ) : null}
    </main>
  );
}
