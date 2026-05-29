import type { MetadataRoute } from "next";

/**
 * Web App Manifest (Next.js file convention).
 *
 * Lives at /manifest.webmanifest and is auto-linked by Next from <head>.
 * Defines how JayField installs to home screen / app drawer.
 *
 * Icons referenced here must exist in /public:
 *   - /icon-192.png  (192x192, any purpose)
 *   - /icon-512.png  (512x512, any purpose)
 *   - /icon-maskable-192.png (192x192, masked safe-zone)
 *   - /icon-maskable-512.png (512x512, masked safe-zone)
 *
 * Shortcuts give users quick deep links from the app icon long-press menu.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JayField — Booking Lapangan Futsal",
    short_name: "JayField",
    description:
      "Booking lapangan futsal jadi lebih mudah. Pilih, pesan, dan main.",
    start_url: "/id",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0E7C3A",
    lang: "id",
    dir: "ltr",
    categories: ["sports", "lifestyle", "health"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Booking Sekarang",
        short_name: "Booking",
        description: "Booking lapangan futsal",
        url: "/id/booking",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Booking Saya",
        short_name: "Riwayat",
        description: "Lihat riwayat booking kamu",
        url: "/id/dashboard/bookings",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
