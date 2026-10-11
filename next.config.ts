import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hotel and room photos in the seed data are served by Unsplash.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
