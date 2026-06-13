import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nook — quarto virtual de estudos",
    short_name: "Nook",
    description:
      "Um quarto virtual de estudos: organização acadêmica que acontece como consequência do aconchego.",
    start_url: "/",
    display: "standalone",
    orientation: "landscape",
    background_color: "#0b0e14",
    theme_color: "#11151f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
