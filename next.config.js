/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./prisma/**', './data/**'],
      '/**/*': ['./prisma/**', './data/**'],
    },
  },
};

module.exports = nextConfig;
