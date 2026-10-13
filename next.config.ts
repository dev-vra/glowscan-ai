import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // imagem Docker enxuta (VPS)
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  cacheComponents: true,
  // nginx segura a resposta inteira por padrão; sem isto o esqueleto da página só chega junto com os dados.
  headers: async () => [{ source: "/:path*{/}?", headers: [{ key: "X-Accel-Buffering", value: "no" }] }],
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
