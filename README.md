# Interactive 3D Hand Tracking AR Demo

## Overview

A client-only browser AR demo built with Next.js, MediaPipe hand tracking, and a transparent Three.js layer. The app combines camera video, live hand landmarks, calibrated gestures, multi-object 3D interaction, custom model fallback, screenshot/recording tools, quality modes, and diagnostics.

Camera frames stay local in the browser. There is no backend, database, authentication, Redux, or external API call.

## Features

- Camera start/stop with permission fallback UI
- MediaPipe hand tracking from same-origin public assets
- Landmark overlay with thumb/index touch and object hit feedback
- Calibration flow stored in localStorage
- Thumb/index touch drag with object hit detection
- One-hand palm rotation
- Two-hand scale and rotate
- Depth control from MediaPipe hand z-axis
- Multi-object scene with selection, lock, visibility, reset selected, and reset all
- Preset object library and custom `/models/*.glb` or `/models/*.gltf` selector
- Hologram visuals with wireframe, glow, particles, rings, and model fallback
- Screenshot PNG capture and WEBM recording when browser APIs support it
- Low/Medium/High/Ultra quality modes
- Browser-safe CPU/RAM/GPU telemetry, browser support checks, and diagnostics copy
- Responsive dark cinematic UI

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

## Folder Structure

```txt
src/
  app/
  components/
    ar/
    calibration/
    camera/
    capture/
    debug/
    diagnostics/
    hand/
    settings/
    three/
    ui/
  hooks/
  lib/
docs/
public/
  mediapipe/
  models/
```

## Getting Started

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000` or `http://localhost:3000` in a browser with camera access.

## Development Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```

## Environment Requirements

- Current Chromium-based browser recommended
- Camera access through `navigator.mediaDevices.getUserMedia`
- WebGL support
- WebAssembly for MediaPipe
- HTTPS in production for camera access

## Gesture Guide

- Show your hand to the camera.
- Touch thumb and index finger together on an object to drag it.
- Rotate one palm to rotate the selected object.
- Use two hands to scale or rotate the selected object.
- Move the primary hand nearer/farther for depth control.

See [docs/GESTURE_GUIDE.md](docs/GESTURE_GUIDE.md).

## Calibration

Use the Calibrate button in the AR header. The wizard collects open-hand, thumb/index touch, rotate-left, and rotate-right samples, then stores a profile in localStorage.

Calibration controls:

- Use Calibration
- Recalibrate
- Reset to Default

The gesture layer uses calibrated touch thresholds, release thresholds, rotation sensitivity, depth sensitivity, and minimum confidence.

## Multi-object Interaction

The default scene includes:

- Main Hologram
- Crystal
- Energy Orb

Touching an object selects it. Only the selected unlocked object receives drag, rotate, scale, and depth transforms. Use the Object toolbar to select, show/hide, lock/unlock, reset selected, or reset all objects.

## Custom Models

Put `.glb` or `.gltf` files into `public/models`.

Example:

```txt
public/models/tree.glb
```

Then use:

```txt
/models/tree.glb
```

The model selector validates `/models/*.glb` and `/models/*.gltf`. Missing or invalid model files fall back to built-in hologram geometry.

## Screenshot & Recording

Use Capture controls in the AR screen:

- Screenshot creates `ar-hand-demo-screenshot-yyyyMMdd-HHmmss.png`.
- Record creates `ar-hand-demo-recording-yyyyMMdd-HHmmss.webm` when `MediaRecorder` and canvas capture are supported.
- Download Last Capture saves the latest image or video.

Unsupported recording APIs show a UI error and do not crash the app.

## Performance Modes

Quality modes are Low, Medium, High, and Ultra. The selected mode is stored in localStorage and controls:

- Particle count
- Tracking FPS throttle
- Render scale
- Glow/particle enablement
- Recording FPS

Mobile defaults to lower quality; desktop defaults higher.

## Mobile Support

The UI uses compact controls, responsive panels, large enough buttons, and reduced animation when `prefers-reduced-motion` is enabled. Use HTTPS on mobile devices in production.

## Browser Support

Diagnostics check:

- Camera
- WebGL
- MediaRecorder
- Canvas capture stream
- LocalStorage
- WebAssembly

Missing features disable or degrade only the related capability.

## Troubleshooting

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

Common issues:

- Camera permission denied: enable site camera permission.
- MediaPipe fails: verify `public/mediapipe` assets.
- Object does not move: touch thumb/index on top of the object.
- Recording unsupported: use a browser with `MediaRecorder` and `canvas.captureStream`.
- Custom model missing: check the file path under `public/models`.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Camera requires HTTPS in production. `localhost` and `127.0.0.1` work during development.

## QA Checklist

See [docs/QA_CHECKLIST.md](docs/QA_CHECKLIST.md).
