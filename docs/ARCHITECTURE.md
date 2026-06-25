# Architecture

This project is a client-only Next.js AR demo. Camera frames, MediaPipe hand tracking, gesture detection, object control, capture, and diagnostics all run in the browser.

## Camera Layer

- `useCamera` owns `getUserMedia`, permission states, stream cleanup, and fallback errors.
- `CameraView` renders the mirrored video element only on the client.

## Hand Tracking Layer

- `useHandTracking` loads MediaPipe Tasks Vision from `public/mediapipe`.
- Detection is throttled by the active quality mode.
- `HandLandmarkOverlay` draws landmarks, touch state, and object hit feedback.

## Gesture Layer

- `touchDetection.ts` detects real thumb/index contact using calibration-aware thresholds.
- `handPose.ts` computes palm rotation for one-hand rotate.
- `depth.ts` computes hand z-axis movement with a baseline.
- `useGesture` smooths gesture state without UI logic.

## Object Interaction Layer

- `useObjectRegistry` stores all AR objects and selected object state.
- `useTouchProjection` performs screen-space object hit detection.
- `useHologramControl` applies drag, rotate, two-hand scale/rotate, and depth to the selected unlocked object.

## Three.js Render Layer

- `ThreeViewport` renders a transparent `@react-three/fiber` canvas over the camera.
- `ObjectScene` renders all visible objects.
- `PresetObjectRenderer` renders geometry presets or a GLB/GLTF model with fallback.

## Capture Layer

- `useScreenshot` composites camera and canvas layers into a PNG.
- `useMediaRecorder` records the primary canvas stream to WEBM when supported.

## UI Layer

- AR controls live in `components/ar`.
- Debug, diagnostics, calibration, capture, and settings panels are separate feature folders.
- Browser support checks and diagnostics are safe when APIs are unavailable.
