import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Henrik Finance OS",
    short_name: "Finance OS",
    description: "Academic, GMAT and investment banking command centre",
    start_url: "/",
    display: "standalone",
    background_color: "#07101e",
    theme_color: "#07101e",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
