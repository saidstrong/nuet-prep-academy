/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://prep-academy.netlify.app',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'nuet-prep-academy-secret-key-2024',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client', 'prisma');
    }
    return config;
  },
}

module.exports = nextConfig
