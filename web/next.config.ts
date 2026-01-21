import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/songguoxs/**',
      },
      {
        protocol: 'https',
        hostname: 'cms-assets.youmind.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
