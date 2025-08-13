import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NODE_ENV === 'production' ? '/ragdocumenthub' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/ragdocumenthub' : '',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  output: 'standalone',
};

export default nextConfig;
