import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Interactive 3D Hand Tracking",
  description: "A local browser AR demo foundation with camera, future hand tracking, and a 3D hologram layer."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-neutral-950 font-sans text-neutral-50 antialiased">
        {children}
      </body>
    </html>
  );
}
