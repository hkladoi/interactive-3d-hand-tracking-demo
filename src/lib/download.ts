export function downloadUrl(url: string, fileName: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function downloadBlob(blob: Blob, fileName: string): string | null {
  if (typeof URL === "undefined") {
    return null;
  }

  const url = URL.createObjectURL(blob);
  downloadUrl(url, fileName);
  return url;
}

export function revokeObjectUrl(url: string | null) {
  if (url && typeof URL !== "undefined") {
    URL.revokeObjectURL(url);
  }
}
