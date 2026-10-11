import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hotel and room photos are resized by the Unsplash CDN, not by Next.js.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
};

export default nextConfig;
