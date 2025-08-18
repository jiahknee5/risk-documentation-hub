import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '',
  assetPrefix: '',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
