# Interactive 3D Hand Tracking

An interactive browser AR demo built with Next.js, MediaPipe hand tracking, and a transparent Three.js hologram layer. The app runs fully on the client: camera frames stay local in the browser, hand landmarks drive gestures, and the 3D object responds to pinch drag plus two-hand scale and rotate.

## Tech Stack

- Next.js App Router
- React
- TypeScript strict
- Tailwind CSS
- Three.js
- @react-three/fiber
- @react-three/drei
- @mediapipe/tasks-vision
- lucide-react
- ESLint

No backend, database, authentication, Redux, or external API calls are required.

## Folder Structure

```txt
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    ar/
      ARExperience.tsx
      ARHeader.tsx
      ARStatusBar.tsx
      CameraPermissionState.tsx
      StartCameraScreen.tsx
    camera/
      CameraOverlay.tsx
      CameraView.tsx
    debug/
      DebugPanel.tsx
    hand/
      HandLandmarkOverlay.tsx
      HandTrackingStatus.tsx
    three/
      HologramObject.tsx
      HologramRing.tsx
      ModelHologram.tsx
      ParticleField.tsx
      PlaceholderHologram.tsx
      ThreeViewport.tsx
    ui/
      Badge.tsx
      Button.tsx
      Card.tsx
  hooks/
    useCamera.ts
    useClientReady.ts
    useGesture.ts
    useHandTracking.ts
    useHologramControl.ts
    useVideoElement.ts
  lib/
    camera.ts
    cn.ts
    constants.ts
    gestures.ts
    handLandmarks.ts
    handTracking.ts
    math.ts
    smoothing.ts
    types.ts
public/
  mediapipe/
  models/
    README.md
```

MediaPipe runtime files live under `public/mediapipe/` so the model and wasm assets are loaded from the same app origin.

Custom `.glb` and `.gltf` files can be placed under `public/models/`.

## How To Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000` or `http://localhost:3000` in a browser with camera access.

## How To Build

```bash
npm run lint
npm run build
```

The app is designed so camera and MediaPipe logic run only in client components, avoiding build-time webcam access and SSR `window` errors.

## How To Use A Custom GLB Model

1. Put the model file in `public/models`.

```txt
public/models/tree.glb
```

2. Update `DEFAULT_MODEL_URL` in `src/lib/constants.ts`.

```ts
export const DEFAULT_MODEL_URL = "/models/tree.glb";
```

3. Run the app or build it.

```bash
npm run dev
npm run build
```

If `DEFAULT_MODEL_URL` is empty or the model fails to load, the app renders the built-in hologram fallback instead of crashing.

## Features

- Start camera screen with local privacy notice
- Camera permission fallback screens
- Client-side MediaPipe hand tracking
- Canvas hand landmark overlay
- Transparent Three.js AR layer
- Hologram object with wireframe, glow, particles, and rings
- Optional `.glb` or `.gltf` hologram model with built-in fallback
- Pinch drag for moving the hologram
- Two-hand scale and rotate
- Debug panel with layer toggles, gesture data, FPS, and reset
- Compact mobile status bar and collapsible debug UI
- Production hints for loading, no-hand, pinch, and two-hand gestures

## Gesture Guide

- Show your hand to the camera to activate tracking.
- Pinch thumb tip and index finger tip to move the hologram.
- Use two hands and move them farther apart or closer together to scale the hologram.
- Rotate two hands around each other to rotate the hologram.
- Use Reset hologram to restore position, rotation, and scale.
- Use Stop Camera to stop both the camera stream and tracking loop.

## Troubleshooting

### Camera permission denied

Allow camera access in the browser permission prompt. If access was previously blocked, open the site permissions for this page, enable camera access, then press Try Again.

### Browser does not support camera

Use a current Chromium-based browser or another browser that supports `navigator.mediaDevices.getUserMedia`. Camera and tracking require a secure browser context such as `localhost`, `127.0.0.1`, or HTTPS.

### MediaPipe does not load

Check that `public/mediapipe/wasm` and `public/mediapipe/models/hand_landmarker.task` exist. The debug panel and hand tracking status panel will show an error while keeping the camera and hologram UI usable.

### Custom model does not load

Check that the file exists under `public/models` and that `DEFAULT_MODEL_URL` starts with `/models/`. The model loader catches failures and falls back to the built-in hologram object.

### No hand detected

Move your hand into the camera view with good lighting. Keep the palm and fingers visible for the first detection, then try the pinch or two-hand gestures.

### Low performance

Close other camera or GPU-heavy apps, reduce browser tabs, and use a desktop Chromium browser when possible. The demo uses a lightweight particle field and avoids heavy external assets, but MediaPipe and WebGL still need enough CPU/GPU budget.
