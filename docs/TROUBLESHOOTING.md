# Troubleshooting

## Camera Permission Denied

Enable camera permission in the browser site settings, then press Try Again.

## Camera Not Found

Check that no other app is using the camera. On desktop, verify the device appears in browser camera settings.

## MediaPipe Failed To Load

Confirm `public/mediapipe/wasm` and `public/mediapipe/models/hand_landmarker.task` exist. The app keeps camera and 3D rendering usable when tracking fails.

## Low FPS

Switch Quality to Low or Medium, close GPU-heavy apps, and reduce browser tabs. Mobile devices should usually use Low or Medium.

## Object Does Not Move

Make sure the thumb/index touch point is over the object. Touch outside an object will not start drag.

## Touch Is Too Sensitive

Run Calibration and hold an open hand, touch, and rotate poses steadily. You can reset calibration from Debug.

## Touch Is Hard To Trigger

Recalibrate closer to your normal camera distance. Keep thumb and index visible during the pinch step.

## Video Recording Not Supported

Recording requires `MediaRecorder` and `canvas.captureStream`. Use a current Chromium-based browser if unavailable.

## Custom Model Does Not Load

Put `.glb` or `.gltf` files under `public/models` and use a URL like `/models/tree.glb`. Invalid or missing models fall back to built-in geometry.

## Mobile Browser Issues

Use HTTPS in production. Some mobile browsers block camera access on plain HTTP LAN URLs.
