import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Using unoptimized in component for now; keep domains empty to avoid surprises.
    // If you want full optimization, add allowed domains or a remotePatterns list and remove `unoptimized`.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
