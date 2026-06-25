"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ARHeader } from "@/components/ar/ARHeader";
import { ARStatusBar } from "@/components/ar/ARStatusBar";
import { CameraPermissionState } from "@/components/ar/CameraPermissionState";
import { ObjectLibraryPanel } from "@/components/ar/ObjectLibraryPanel";
import { ObjectToolbar } from "@/components/ar/ObjectToolbar";
import { StartCameraScreen } from "@/components/ar/StartCameraScreen";
import { CameraOverlay } from "@/components/camera/CameraOverlay";
import { CameraView } from "@/components/camera/CameraView";
import { CalibrationWizard } from "@/components/calibration/CalibrationWizard";
import { CaptureControls } from "@/components/capture/CaptureControls";
import { CapturePreview } from "@/components/capture/CapturePreview";
import { RecordingIndicator } from "@/components/capture/RecordingIndicator";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { HandLandmarkOverlay } from "@/components/hand/HandLandmarkOverlay";
import { HandTrackingStatus } from "@/components/hand/HandTrackingStatus";
import { QualitySettingsPanel } from "@/components/settings/QualitySettingsPanel";
import { useCamera } from "@/hooks/useCamera";
import { useCalibration } from "@/hooks/useCalibration";
import { useClientReady } from "@/hooks/useClientReady";
import { useDepthGesture } from "@/hooks/useDepthGesture";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";
import { useGesture } from "@/hooks/useGesture";
import { useHandTracking } from "@/hooks/useHandTracking";
import { useHologramControl } from "@/hooks/useHologramControl";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useObjectRegistry } from "@/hooks/useObjectRegistry";
import { useObjectSelection } from "@/hooks/useObjectSelection";
import { usePerformanceMode } from "@/hooks/usePerformanceMode";
import { useScreenshot } from "@/hooks/useScreenshot";
import { useSystemResources } from "@/hooks/useSystemResources";
import { useTouchProjection } from "@/hooks/useTouchProjection";
import {
  DEFAULT_CAMERA_LAYER_VISIBILITY,
  TRACKING_UNAVAILABLE_OVERLAY_SNAPSHOT,
  type CameraLayerKey,
  type CameraLayerVisibility
} from "@/lib/camera";
import { getBrowserSupportState } from "@/lib/browserSupport";
import { loadHideHintsPreference, saveHideHintsPreference } from "@/lib/storage";
import type {
  BrowserSupportState,
  CameraFallbackStatus,
  CaptureResult,
  GestureState,
  TrackingStatus
} from "@/lib/types";

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
  const arStageRef = useRef<HTMLElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const isClientReady = useClientReady();
  const deviceCapabilities = useDeviceCapabilities();
  const { performanceConfig, qualityMode, setQualityMode } =
    usePerformanceMode(deviceCapabilities);
  const {
    errorMessage: handTrackingError,
    fps,
    hands,
    startTracking,
    status: trackingStatus,
    stopTracking
  } = useHandTracking(cameraVideoRef, {
    targetFps: performanceConfig.trackingFps
  });
  const calibration = useCalibration(hands);
  const rawGesture = useGesture(hands, calibration.activeProfile);
  const { depthState, resetDepthBaseline } = useDepthGesture(
    hands,
    calibration.activeProfile,
    true
  );
  const objectRegistry = useObjectRegistry();
  const objectTouch = useTouchProjection(
    rawGesture,
    objectRegistry.selectedObject?.transform ?? {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1
    },
    objectRegistry.objects
  );
  useObjectSelection({
    gesture: rawGesture,
    objectTouch,
    onSelectObject: objectRegistry.selectObject
  });
  const {
    isInteracting,
    resetTransform,
    transform: hologramTransform
  } = useHologramControl({
    depthState,
    gesture: rawGesture,
    objectTouch,
    onTransformChange: objectRegistry.updateObjectTransform,
    selectedObject: objectRegistry.selectedObject
  });
  const gesture = useMemo<GestureState>(() => {
    const isDragging =
      rawGesture.fingerTouch.isTouching &&
      objectTouch.isTouchingObject &&
      objectTouch.objectId === objectRegistry.selectedObjectId;

    return {
      ...rawGesture,
      isDragging,
      objectTouch,
      type: rawGesture.type === "touch" && isDragging ? "drag" : rawGesture.type
    };
  }, [objectRegistry.selectedObjectId, objectTouch, rawGesture]);
  const systemResources = useSystemResources();
  const { captureScreenshot, errorMessage: screenshotError, isCapturing } = useScreenshot();
  const mediaRecorder = useMediaRecorder({
    recordingFps: performanceConfig.maxRecordingFps
  });
  const [browserSupport, setBrowserSupport] = useState<BrowserSupportState>({
    camera: false,
    canvasCaptureStream: false,
    localStorage: false,
    mediaRecorder: false,
    wasm: false,
    webgl: false
  });
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(true);
  const [isLibraryOpen] = useState(true);
  const [lastCapture, setLastCapture] = useState<CaptureResult | null>(null);
  const [areHintsHidden, setAreHintsHidden] = useState(false);
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
    mediaRecorder.stopRecording();
    stopTracking();
    stopCamera();
  }, [mediaRecorder, stopCamera, stopTracking]);

  const toggleDebug = useCallback(() => {
    setIsDebugOpen((current) => !current);
  }, []);

  const handleScreenshot = useCallback(async () => {
    const result = await captureScreenshot(arStageRef.current);

    if (result) {
      setLastCapture(result);
    }
  }, [captureScreenshot]);

  const hideHints = useCallback(() => {
    setAreHintsHidden(true);
    saveHideHintsPreference(true);
  }, []);

  useEffect(() => {
    if (status !== "ready" || !stream) {
      stopTracking();
      return;
    }

    void startTracking();
  }, [startTracking, status, stopTracking, stream]);

  useEffect(() => {
    queueMicrotask(() => {
      setBrowserSupport(getBrowserSupportState());
      setAreHintsHidden(loadHideHintsPreference());
    });
  }, []);

  useEffect(() => {
    if (mediaRecorder.lastCapture) {
      queueMicrotask(() => setLastCapture(mediaRecorder.lastCapture));
    }
  }, [mediaRecorder.lastCapture]);

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
    <main className="relative min-h-dvh overflow-hidden bg-neutral-950 text-white" ref={arStageRef}>
      <CameraView className="z-0" stream={stream} videoRef={cameraVideoRef} />

      <DynamicThreeViewport
        className="z-10"
        interactingObjectId={isInteracting ? objectRegistry.selectedObjectId : null}
        isInteracting={isInteracting}
        objectTouch={gesture.objectTouch}
        objects={objectRegistry.objects}
        performanceConfig={performanceConfig}
        reducedMotion={deviceCapabilities.prefersReducedMotion}
        selectedObjectId={objectRegistry.selectedObjectId}
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
      <ObjectToolbar
        className="hidden lg:block"
        objects={objectRegistry.objects}
        onLockObject={objectRegistry.setObjectLocked}
        onResetAll={objectRegistry.resetAllObjects}
        onResetObject={objectRegistry.resetObject}
        onSelectObject={objectRegistry.selectObject}
        onToggleVisibility={objectRegistry.toggleObjectVisibility}
        selectedObjectId={objectRegistry.selectedObjectId}
      />
      {isLibraryOpen ? (
        <ObjectLibraryPanel
          className="fixed left-4 top-[33.5rem] z-30 hidden w-[min(22rem,calc(100vw-2rem))] lg:block"
          hasSelectedObject={Boolean(objectRegistry.selectedObject)}
          onAddPreset={objectRegistry.addObjectFromPreset}
          onReplaceSelected={objectRegistry.replaceSelectedObject}
          onSelectModel={objectRegistry.setSelectedModelUrl}
        />
      ) : null}
      <QualitySettingsPanel
        className="fixed bottom-24 left-[24rem] z-30 hidden w-80 xl:block"
        config={performanceConfig}
        onChange={setQualityMode}
        qualityMode={qualityMode}
      />
      <CaptureControls
        errorMessage={screenshotError ?? mediaRecorder.errorMessage}
        isCapturing={isCapturing}
        lastCapture={lastCapture}
        onScreenshot={handleScreenshot}
        onStartRecording={() => mediaRecorder.startRecording(arStageRef.current)}
        onStopRecording={mediaRecorder.stopRecording}
        recordingStatus={mediaRecorder.status}
      />
      <RecordingIndicator
        elapsedMs={mediaRecorder.elapsedMs}
        isRecording={mediaRecorder.status === "recording"}
      />
      <CapturePreview capture={lastCapture} onClose={() => setLastCapture(null)} />
      {!areHintsHidden ? (
        <div className="fixed left-1/2 top-20 z-30 hidden w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md border border-cyan-100/[0.12] bg-black/45 p-3 text-xs leading-5 text-neutral-200 backdrop-blur-2xl md:block">
          <button
            className="float-right ml-3 rounded-md border border-cyan-100/[0.12] px-2 py-1 text-cyan-50"
            onClick={hideHints}
            type="button"
          >
            Hide
          </button>
          Show your hand to the camera. Touch thumb and index on an object to drag. Use two hands
          to scale or rotate. Move your hand near or far for depth.
        </div>
      ) : null}
      <ARHeader
        cameraStatus={status}
        isDebugOpen={isDebugOpen}
        onCalibrate={() => setIsCalibrationOpen(true)}
        onReset={resetTransform}
        onStop={handleStopCamera}
        onToggleDebug={toggleDebug}
      />
      <DebugPanel
        cameraStatus={status}
        browserSupport={browserSupport}
        calibrationProfile={calibration.activeProfile}
        depthState={depthState}
        deviceCapabilities={deviceCapabilities}
        gesture={gesture}
        handTrackingError={handTrackingError}
        handsCount={hands.length}
        hologramTransform={hologramTransform}
        isOpen={isDebugOpen}
        isCalibrationLoaded={calibration.isProfileLoaded}
        layerVisibility={layerVisibility}
        objects={objectRegistry.objects}
        onResetTransform={resetTransform}
        onResetCalibration={calibration.resetCalibration}
        onResetDepthBaseline={resetDepthBaseline}
        onToggleLayer={toggleLayer}
        performanceConfig={performanceConfig}
        qualityMode={qualityMode}
        recordingStatus={mediaRecorder.status}
        selectedObject={objectRegistry.selectedObject}
        systemResources={systemResources}
        trackingFps={fps}
        trackingStatus={trackingStatus}
        stream={stream}
      />
      {layerVisibility.showStatusBar ? (
        <ARStatusBar
          cameraStatus={status}
          depthState={depthState}
          fps={fps}
          gesture={gesture}
          handsCount={hands.length}
          hologramTransform={hologramTransform}
          recordingStatus={mediaRecorder.status}
          systemResources={systemResources}
          trackingStatus={trackingStatus}
        />
      ) : null}
      {isCalibrationOpen ? (
        <CalibrationWizard
          activeProfile={calibration.activeProfile}
          cameraReady={status === "ready"}
          onApplyProfile={(profile) => {
            calibration.applyProfile(profile);
            setIsCalibrationOpen(false);
          }}
          onClose={() => {
            calibration.skipCalibration();
            setIsCalibrationOpen(false);
          }}
          onResetToDefault={() => {
            calibration.useDefaultCalibration();
            setIsCalibrationOpen(false);
          }}
          onStart={calibration.startCalibration}
          state={calibration.state}
        />
      ) : null}
    </main>
  );
}
