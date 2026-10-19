import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hotel and room photos are resized by the Unsplash CDN, not by Next.js.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  async redirects() {
    // The wishlist moved into the account area in phase 8.
    return [{ source: "/wishlist", destination: "/account/wishlist", permanent: true }];
  },
};

export default nextConfig;
