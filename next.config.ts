import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // imagem Docker enxuta (VPS)
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  cacheComponents: true,
  partialPrefetching: true,
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
