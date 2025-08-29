import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  crossOrigin: 'anonymous',
  reactStrictMode: true,
  distDir: 'build',
  output: 'standalone',
};

export default nextConfig;
