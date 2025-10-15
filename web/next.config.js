/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the main configuration for Next.js
  // reactStrictMode helps catch bugs during development
  reactStrictMode: true,

  // We'll keep TypeScript checking off since we're using plain JavaScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // We'll also ignore ESLint errors for now to focus on learning
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;