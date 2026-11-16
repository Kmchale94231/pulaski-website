import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Admin uploads (30s clip + cover, 2 MB each) go through a Server Action; Vercel caps requests at 4.5 MB.
  experimental: { serverActions: { bodySizeLimit: "4.4mb" } },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
