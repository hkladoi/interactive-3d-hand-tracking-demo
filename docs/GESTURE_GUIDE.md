# Gesture Guide

## Show Hand

Start the camera, then keep one hand visible with the palm and fingers in frame. The tracking status changes when MediaPipe detects landmarks.

## Thumb/Index Touch

Touch the thumb tip and index fingertip together. The app uses calibration-aware thresholds and hysteresis, so near fingers are not treated as contact.

## Drag Object

Touch thumb and index together on top of an object. The hit object becomes selected, and only the selected unlocked object moves.

## Rotate Palm

With one hand visible and not touching, rotate your palm clockwise or counter-clockwise. The selected object rotates smoothly.

## Two Hands Scale/Rotate

Show two hands. Move them farther apart or closer together to scale the selected object. Rotate the vector between hands to rotate the object.

## Depth Near/Far

Move the primary hand closer to or farther from the camera. Depth affects object z position and scale lightly, while preserving drag and rotate controls.

## Reset

Use Reset in the header or Debug panel to reset the selected object. Use Reset all in the Object toolbar to reset every object.
