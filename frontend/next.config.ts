import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // unoptimized allows any external URL without whitelisting every domain
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],
  },
};

export default nextConfig;
