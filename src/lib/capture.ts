import type { CaptureResult } from "@/lib/types";

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function createCaptureTimestamp(date = new Date()) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours()
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function createCaptureFileName(type: CaptureResult["type"]) {
  const timestamp = createCaptureTimestamp();

  return type === "image"
    ? `ar-hand-demo-screenshot-${timestamp}.png`
    : `ar-hand-demo-recording-${timestamp}.webm`;
}

export function getPrimaryCanvas(container: HTMLElement | null) {
  return container?.querySelector("canvas") ?? null;
}

export async function createScreenshotBlob(container: HTMLElement): Promise<Blob> {
  const rect = container.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  const width = Math.max(1, Math.floor(rect.width * pixelRatio));
  const height = Math.max(1, Math.floor(rect.height * pixelRatio));
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas screenshots are not supported in this browser.");
  }

  context.scale(pixelRatio, pixelRatio);
  context.fillStyle = "#020617";
  context.fillRect(0, 0, rect.width, rect.height);

  const video = container.querySelector("video");

  if (video && video.videoWidth > 0 && video.videoHeight > 0) {
    context.save();
    context.translate(rect.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, rect.width, rect.height);
    context.restore();
  }

  container.querySelectorAll("canvas").forEach((sourceCanvas) => {
    const sourceRect = sourceCanvas.getBoundingClientRect();
    context.drawImage(
      sourceCanvas,
      sourceRect.left - rect.left,
      sourceRect.top - rect.top,
      sourceRect.width,
      sourceRect.height
    );
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Screenshot capture failed."));
    }, "image/png");
  });
}
