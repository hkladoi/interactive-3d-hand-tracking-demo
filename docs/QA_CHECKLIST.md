# QA Checklist

## Environment

- [ ] `npm install` completes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `npm run start` serves the production build.

## Camera

- [ ] No camera device shows fallback UI.
- [ ] Permission denied shows fallback UI.
- [ ] Start/stop camera repeatedly does not leak streams.
- [ ] Mobile browser prompts for camera correctly.

## Tracking

- [ ] One hand visible shows landmarks.
- [ ] Two hands visible shows both hands.
- [ ] Lost hand state does not crash.
- [ ] MediaPipe load failure keeps app usable.

## Gestures

- [ ] Thumb/index touch is required before touch state.
- [ ] Touch outside object does not move it.
- [ ] Touch inside object selects it.
- [ ] Drag selected object works.
- [ ] Rotate hand clockwise rotates selected object.
- [ ] Rotate hand counter-clockwise rotates selected object.
- [ ] Two-hand scale works.
- [ ] Two-hand rotate works.
- [ ] Depth near/far affects z and scale smoothly.

## Calibration

- [ ] Calibration flow completes all steps.
- [ ] Calibration profile saves to localStorage.
- [ ] Reload reads calibration profile.
- [ ] Reset calibration returns to defaults.

## Objects

- [ ] Scene starts with Main Hologram, Crystal, and Energy Orb.
- [ ] Select object from toolbar works.
- [ ] Locked object ignores gestures.
- [ ] Toggle visibility works.
- [ ] Reset selected works.
- [ ] Reset all works.

## Object Library And Models

- [ ] Add object preset works.
- [ ] Replace selected preset works.
- [ ] Valid `/models/name.glb` URL applies.
- [ ] Invalid model URL shows error.
- [ ] Missing model falls back without crash.

## Capture

- [ ] Screenshot creates PNG.
- [ ] Recording creates WEBM when supported.
- [ ] Stop recording works.
- [ ] Auto-stop works after max duration.
- [ ] Download image/video works.
- [ ] Unsupported MediaRecorder shows fallback.

## Performance And Mobile

- [ ] Low quality mode lowers particles and tracking FPS.
- [ ] Medium/High/Ultra can be selected.
- [ ] Quality mode persists after reload.
- [ ] Mobile portrait layout is usable.
- [ ] Mobile landscape layout is usable.
- [ ] Reduced motion lowers animation intensity.

## Diagnostics

- [ ] BrowserSupportPanel reports supported APIs.
- [ ] DiagnosticsPanel displays current state.
- [ ] Copy Diagnostics works or fails gracefully.
