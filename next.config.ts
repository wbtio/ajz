import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '127.0.0.1:3000',
        'localhost:3001',
        '127.0.0.1:3001',
        '127.0.0.1:62241',
        'localhost:62241',
        '127.0.0.1:61097',
        'localhost:61097',
        '127.0.0.1:62008',
        'localhost:62008',
        '127.0.0.1:61303',
        'localhost:61303'
      ],
      bodySizeLimit: '5mb',
    },
  },
  // Fix for "Cross origin request detected" which can cause 500 errors in some dev environments
  serverExternalPackages: [],
};

export default nextConfig;
