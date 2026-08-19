import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'niharikartist.com' },
      { protocol: 'https', hostname: 'cuddlingupmybrush.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Supabase Storage — artist images bucket
      { protocol: 'https', hostname: 'epauoqhfzpjccvldxasa.supabase.co' },
    ],
  },
};

export default nextConfig;
