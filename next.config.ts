import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@hugeicons/react'],
  turbopack: {},
};

export default nextConfig;
