import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: process.env.CLOUDFLARE_ACCOUNT_ID 
          ? `${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
          : '**.cloudflare.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
