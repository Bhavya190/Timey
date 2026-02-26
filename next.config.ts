import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  // Optimize Prisma client bundling for standalone deploys
  transpilePackages: ['@prisma/client'],
};

export default nextConfig;
