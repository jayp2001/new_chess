import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Turbopack (default in Next.js 16)
  turbopack: {
    // Turbopack handles workers automatically
  },
  // Keep webpack config for --webpack flag compatibility
  webpack: (config, { isServer }) => {
    // Configure webpack for worker files (when using --webpack flag)
    if (!isServer) {
      config.output.globalObject = 'self';
    }
    return config;
  },
};

export default nextConfig;
