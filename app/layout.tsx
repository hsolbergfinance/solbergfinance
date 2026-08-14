import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "./service-worker-registration";

export const metadata: Metadata = {
  title: "Henrik Finance OS",
  description: "Academic, GMAT and investment banking command centre",
  applicationName: "Henrik Finance OS",
  appleWebApp: {
    capable: true,
    title: "Finance OS",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icon-192.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#07101e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
