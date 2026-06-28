/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // API Routes & Middleware
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Experimental features (optional)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Transpile packages if needed (for external libraries)
  transpilePackages: ['@prisma/client'],

  // Output optimization
  output: 'standalone',

  // Environment variables (public)
  env: {
    NEXT_PUBLIC_APP_NAME: 'FinCoach AI',
  },
};

export default nextConfig;
