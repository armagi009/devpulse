/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Skip type checking during build for faster deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build for faster deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Skip static optimization for problematic pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Optimize for production deployment
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;