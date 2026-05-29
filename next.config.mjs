import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization — modern formats first; Next.js will negotiate
  // best supported format with the browser.
  images: {
    formats: ["image/avif", "image/webp"],
    // Locked-down list of upstream image hosts. Anything outside these
    // patterns falls through to the `<img>` fallback and won't be
    // proxied / optimized by next/image.
    remotePatterns: [
      // UploadThing (file uploads — court photos, location thumbs, avatars, payment proofs)
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.uploadthing.com" },
      { protocol: "https", hostname: "*.utfs.io" },
      // Unsplash fallbacks used in landing/seed data
      { protocol: "https", hostname: "images.unsplash.com" },
      // Google avatars (NextAuth Google OAuth)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
